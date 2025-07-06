# Infrastructure as Code for Concierge Transaction Flow
# Terraform configuration for automated infrastructure provisioning

terraform {
  required_version = ">= 1.0"
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.15"
    }
    github = {
      source  = "integrations/github"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
  
  backend "remote" {
    # Configure your remote backend here
    # organization = "your-organization"
    # workspaces {
    #   name = "concierge-transaction-flow"
    # }
  }
}

# Variables
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "concierge-transaction-flow"
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "concierge-transaction-flow.com"
}

variable "environment" {
  description = "Environment (production, staging, development)"
  type        = string
  default     = "production"
}

variable "github_owner" {
  description = "GitHub repository owner"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = "concierge-transaction-flow"
}

variable "vercel_team_id" {
  description = "Vercel team ID"
  type        = string
  sensitive   = true
}

variable "supabase_project_id" {
  description = "Supabase project ID"
  type        = string
  sensitive   = true
}

variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
  sensitive   = true
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID"
  type        = string
  sensitive   = true
}

# Data sources
data "github_repository" "main" {
  full_name = "${var.github_owner}/${var.github_repo}"
}

# Vercel Project
resource "vercel_project" "main" {
  name      = var.project_name
  team_id   = var.vercel_team_id
  framework = "vite"
  
  git_repository = {
    type = "github"
    repo = "${var.github_owner}/${var.github_repo}"
  }
  
  build_command    = "npm run build"
  output_directory = "dist"
  install_command  = "npm install"
  dev_command      = "npm run dev"
  
  environment = [
    {
      key    = "VITE_SUPABASE_URL"
      value  = var.supabase_url
      target = ["production", "preview"]
    },
    {
      key    = "VITE_SUPABASE_ANON_KEY"
      value  = var.supabase_anon_key
      target = ["production", "preview"]
    },
    {
      key    = "VITE_ENVIRONMENT"
      value  = var.environment
      target = ["production"]
    },
    {
      key    = "VITE_ENVIRONMENT"
      value  = "preview"
      target = ["preview"]
    }
  ]
  
  # Security headers
  headers = [
    {
      source = "/(.*)"
      headers = [
        {
          key   = "X-Content-Type-Options"
          value = "nosniff"
        },
        {
          key   = "X-Frame-Options"
          value = "DENY"
        },
        {
          key   = "X-XSS-Protection"
          value = "1; mode=block"
        },
        {
          key   = "Referrer-Policy"
          value = "strict-origin-when-cross-origin"
        },
        {
          key   = "Permissions-Policy"
          value = "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      source = "/static/(.*)"
      headers = [
        {
          key   = "Cache-Control"
          value = "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
  
  # Redirects
  redirects = [
    {
      source      = "/health"
      destination = "/api/health"
      permanent   = false
    }
  ]
}

# Blue Environment
resource "vercel_project" "blue" {
  name      = "${var.project_name}-blue"
  team_id   = var.vercel_team_id
  framework = "vite"
  
  git_repository = {
    type = "github"
    repo = "${var.github_owner}/${var.github_repo}"
  }
  
  build_command    = "npm run build"
  output_directory = "dist"
  install_command  = "npm install"
  dev_command      = "npm run dev"
  
  environment = [
    {
      key    = "VITE_SUPABASE_URL"
      value  = var.supabase_url
      target = ["production"]
    },
    {
      key    = "VITE_SUPABASE_ANON_KEY"
      value  = var.supabase_anon_key
      target = ["production"]
    },
    {
      key    = "VITE_ENVIRONMENT"
      value  = "production"
      target = ["production"]
    }
  ]
}

# Green Environment
resource "vercel_project" "green" {
  name      = "${var.project_name}-green"
  team_id   = var.vercel_team_id
  framework = "vite"
  
  git_repository = {
    type = "github"
    repo = "${var.github_owner}/${var.github_repo}"
  }
  
  build_command    = "npm run build"
  output_directory = "dist"
  install_command  = "npm install"
  dev_command      = "npm run dev"
  
  environment = [
    {
      key    = "VITE_SUPABASE_URL"
      value  = var.supabase_url
      target = ["production"]
    },
    {
      key    = "VITE_SUPABASE_ANON_KEY"
      value  = var.supabase_anon_key
      target = ["production"]
    },
    {
      key    = "VITE_ENVIRONMENT"
      value  = "production"
      target = ["production"]
    }
  ]
}

# Domain Configuration
resource "vercel_project_domain" "main" {
  project_id = vercel_project.main.id
  domain     = var.domain_name
  team_id    = var.vercel_team_id
}

resource "vercel_project_domain" "blue" {
  project_id = vercel_project.blue.id
  domain     = "blue.${var.domain_name}"
  team_id    = var.vercel_team_id
}

resource "vercel_project_domain" "green" {
  project_id = vercel_project.green.id
  domain     = "green.${var.domain_name}"
  team_id    = var.vercel_team_id
}

# Cloudflare DNS Records
resource "cloudflare_record" "main" {
  zone_id = var.cloudflare_zone_id
  name    = "@"
  value   = "cname.vercel-dns.com"
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

resource "cloudflare_record" "blue" {
  zone_id = var.cloudflare_zone_id
  name    = "blue"
  value   = "cname.vercel-dns.com"
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

resource "cloudflare_record" "green" {
  zone_id = var.cloudflare_zone_id
  name    = "green"
  value   = "cname.vercel-dns.com"
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

# Cloudflare Page Rules for Security
resource "cloudflare_page_rule" "security" {
  zone_id  = var.cloudflare_zone_id
  target   = "${var.domain_name}/*"
  priority = 1
  
  actions {
    security_level = "medium"
    ssl           = "strict"
    
    # Cache settings
    cache_level = "standard"
    
    # Security headers
    security_headers = {
      enabled = true
    }
  }
}

# Cloudflare Page Rule for Static Assets
resource "cloudflare_page_rule" "static_assets" {
  zone_id  = var.cloudflare_zone_id
  target   = "${var.domain_name}/static/*"
  priority = 2
  
  actions {
    cache_level = "cache_everything"
    edge_cache_ttl = 31536000  # 1 year
    browser_cache_ttl = 31536000  # 1 year
  }
}

# GitHub Repository Settings
resource "github_repository_environment" "production" {
  repository  = data.github_repository.main.name
  environment = "production"
  
  reviewers {
    users = [var.github_owner]
  }
  
  deployment_branch_policy {
    protected_branches     = true
    custom_branch_policies = false
  }
}

resource "github_repository_environment" "staging" {
  repository  = data.github_repository.main.name
  environment = "staging"
  
  deployment_branch_policy {
    protected_branches     = false
    custom_branch_policies = true
  }
}

# GitHub Actions Secrets
resource "github_actions_secret" "vercel_token" {
  repository      = data.github_repository.main.name
  secret_name     = "VERCEL_TOKEN"
  plaintext_value = var.vercel_token
}

resource "github_actions_secret" "vercel_org_id" {
  repository      = data.github_repository.main.name
  secret_name     = "VERCEL_ORG_ID"
  plaintext_value = var.vercel_team_id
}

resource "github_actions_secret" "vercel_project_id" {
  repository      = data.github_repository.main.name
  secret_name     = "VERCEL_PROJECT_ID"
  plaintext_value = vercel_project.main.id
}

resource "github_actions_secret" "supabase_url" {
  repository      = data.github_repository.main.name
  secret_name     = "VITE_SUPABASE_URL"
  plaintext_value = var.supabase_url
}

resource "github_actions_secret" "supabase_anon_key" {
  repository      = data.github_repository.main.name
  secret_name     = "VITE_SUPABASE_ANON_KEY"
  plaintext_value = var.supabase_anon_key
}

# Additional variables for complete configuration
variable "vercel_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

# Outputs
output "main_project_url" {
  description = "Main project URL"
  value       = "https://${var.domain_name}"
}

output "blue_project_url" {
  description = "Blue environment URL"
  value       = "https://blue.${var.domain_name}"
}

output "green_project_url" {
  description = "Green environment URL"
  value       = "https://green.${var.domain_name}"
}

output "vercel_project_ids" {
  description = "Vercel project IDs"
  value = {
    main  = vercel_project.main.id
    blue  = vercel_project.blue.id
    green = vercel_project.green.id
  }
}

output "dns_records" {
  description = "DNS record configurations"
  value = {
    main  = cloudflare_record.main.hostname
    blue  = cloudflare_record.blue.hostname
    green = cloudflare_record.green.hostname
  }
}