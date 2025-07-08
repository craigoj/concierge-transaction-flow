# 🏠 Concierge Transaction Flow

**A comprehensive real estate transaction management system built with Claude Code**

## 🎯 Project Overview

The Concierge Transaction Flow is a modern real estate transaction management platform that streamlines agent workflows, automates client communications, and provides differentiated service tiers. Built using Claude Code's single-platform development approach with full DevOps integration.

### Key Features
- **Multi-tier Service System**: Core, Elite, and White Glove service levels
- **Agent Concierge Workflows**: Digitized intake, vendor management, and offer processing
- **Automation Engine**: Rule-based workflows for communications and task management
- **Real-time Dashboard**: Transaction tracking, metrics, and progress monitoring
- **Document Management**: Secure file storage and automated document workflows

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** + **shadcn/ui** components
- **React Router** for navigation
- **Tanstack Query** for data fetching

### Backend
- **Supabase** (PostgreSQL + Auth + Real-time)
- **Row Level Security** for data protection
- **Database Functions** for business logic
- **Real-time subscriptions** for live updates

### Development & DevOps
- **Claude Code** for complete development pipeline
- **Docker** for containerization
- **GitHub Actions** for CI/CD
- **Sentry** for error monitoring
- **Vitest** + **Playwright** for testing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase CLI (optional, for local development)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd concierge-transaction-flow

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Configure your Supabase credentials
3. Set up authentication providers
4. Configure monitoring and analytics

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run unit tests
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run E2E tests

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm run format       # Format code with Prettier

# Database
npx supabase start   # Start local Supabase
npx supabase stop    # Stop local Supabase
npx supabase db reset # Reset local database
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── forms/          # Form components
│   └── workflows/      # Workflow components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── services/           # API services
├── types/              # TypeScript types
└── integrations/       # Third-party integrations
    └── supabase/       # Supabase integration

supabase/
├── migrations/         # Database migrations
├── functions/          # Edge functions
└── config/            # Supabase configuration
```

## 🔧 Development Workflow

This project follows a **Claude Code single-platform strategy** for complete development lifecycle:

1. **Plan & Design**: Feature architecture and database schema
2. **Develop & Test**: Component development with comprehensive testing
3. **Integrate & Validate**: End-to-end testing and validation
4. **Deploy & Monitor**: Automated deployment with monitoring

## 📊 Current Status

- ✅ **Phase 1**: Agent Concierge Integration - Complete
- 🔄 **Phase 2**: DevOps Infrastructure - In Progress
- 📋 **Phase 3**: Offer Drafting System - Planned
- 📋 **Phase 4**: Service Tier Enhancement - Planned
- 📋 **Phase 5**: Dashboard Enhancement - Planned

## 🤝 Contributing

This project is developed using Claude Code's integrated development environment. All development, testing, and deployment processes are managed through the Claude Code platform.

### Development Process
1. Plan features with comprehensive documentation
2. Develop and test in containerized local environment
3. Validate quality through automated testing pipeline
4. Deploy automatically through CI/CD to production
5. Monitor and iterate based on production metrics

## 📚 Documentation

Detailed documentation is available in the `/docs` directory:
- **CLAUDE.md**: Complete project documentation and instructions
- **DEVELOPMENT.md**: Development guidelines and workflows
- **DEPLOYMENT.md**: Deployment procedures and configuration
- **TROUBLESHOOTING.md**: Common issues and solutions

## 🛡️ Security

This project implements comprehensive security measures:
- Row Level Security (RLS) for all database operations
- Authentication and authorization via Supabase Auth
- Input validation and sanitization
- Secure environment variable management
- Regular security audits and updates

## 📄 License

This project is developed for the Concierge Transaction Flow platform. All rights reserved.

---

**🎯 Current Focus**: Implementing complete DevOps infrastructure for production-ready deployment with Phase 3 Offer Drafting System development.

For questions or support, please refer to the comprehensive documentation in `CLAUDE.md`.
