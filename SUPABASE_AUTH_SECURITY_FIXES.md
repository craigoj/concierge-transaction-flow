# 🔐 Supabase Auth Security Fixes Guide

**Project:** Concierge Transaction Flow  
**Issue:** Supabase Security Linting Warnings  
**Date:** December 29, 2024

---

## 🚨 Security Issues to Fix

### 1. **Auth OTP Long Expiry** ⚠️ HIGH PRIORITY
**Issue:** OTP expiry is set to more than 1 hour  
**Risk:** Extended exposure window for compromised OTP codes  
**Recommendation:** Set to less than 1 hour (recommended: 15-30 minutes)

### 2. **Leaked Password Protection Disabled** ⚠️ MEDIUM PRIORITY
**Issue:** HaveIBeenPwned password checking is disabled  
**Risk:** Users can set compromised passwords  
**Recommendation:** Enable leaked password protection

---

## 🛠️ How to Fix These Issues

### **Method 1: Supabase Dashboard (Recommended)**

#### **Step 1: Fix OTP Expiry**
1. **Go to Supabase Dashboard**
   - Navigate to your project: `https://supabase.com/dashboard/project/[your-project-id]`
   - Click on **Authentication** in the left sidebar

2. **Access Settings**
   - Click on **Settings** tab in Authentication
   - Look for **Email** provider configuration

3. **Update OTP Expiry**
   - Find "OTP Expiry" setting
   - Change from current value to **1800** seconds (30 minutes)
   - Or set to **900** seconds (15 minutes) for higher security
   - Click **Save**

#### **Step 2: Enable Leaked Password Protection**
1. **In Authentication Settings**
   - Look for **Password Settings** section
   - Find "Leaked Password Protection" option

2. **Enable Protection**
   - Toggle **ON** the "Check against HaveIBeenPwned" option
   - This will prevent users from setting passwords that appear in known data breaches
   - Click **Save**

### **Method 2: Supabase CLI (Alternative)**

If you prefer using the CLI, you can update these settings via configuration:

#### **Step 1: Update Supabase Config**
```bash
# Navigate to your project directory
cd /home/craigj/concierge-transaction-flow

# Update supabase/config.toml
```

#### **Step 2: Add/Update Auth Configuration**
Add this to your `supabase/config.toml`:

```toml
[auth]
# Enable leaked password protection
enable_password_breach_protection = true

[auth.email]
# Set OTP expiry to 30 minutes (1800 seconds)
otp_expiry = 1800
# Or 15 minutes (900 seconds) for higher security
# otp_expiry = 900

[auth.password]
# Minimum password length
min_length = 8
# Require special characters
require_special = true
# Require numbers
require_numbers = true
# Require uppercase
require_uppercase = true
# Require lowercase  
require_lowercase = true
```

#### **Step 3: Apply Changes**
```bash
# Push configuration changes
supabase db push

# Or if using remote project
supabase link --project-ref [your-project-ref]
supabase db push
```

---

## 🔍 Database Function Security Fixes

### **Issue Fixed:** Function Search Path Mutable
All database functions now include explicit `SET search_path = public` to prevent search path injection attacks.

### **Applied Migration:** `20241229000001_security_fixes.sql`

**Functions Fixed:**
- ✅ `get_agent_primary_vendor` - Agent vendor lookup
- ✅ `get_service_tier_features` - Service tier features
- ✅ `trigger_offer_request_automation` - Offer automation trigger
- ✅ `handle_intake_completion` - Agent onboarding completion
- ✅ `update_offer_requests_updated_at` - Timestamp updates
- ✅ `validate_offer_request_date` - Date validation
- ✅ `update_transaction_service_details_updated_at` - Service updates
- ✅ `apply_task_template` - Task template application
- ✅ `handle_task_completion` - Task completion handling
- ✅ `apply_workflow_template` - Workflow template application
- ✅ `get_my_role` - Current user role
- ✅ `handle_new_user` - New user creation
- ✅ `get_user_role` - User role lookup

---

## ✅ Verification Steps

### **1. Verify Database Functions**
After applying the migration, run this query to check function security:

```sql
-- Check that all functions have proper search_path
SELECT 
    proname as function_name,
    prosecdef as security_definer,
    proconfig as config_settings
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN (
    'get_agent_primary_vendor',
    'get_service_tier_features', 
    'trigger_offer_request_automation',
    'handle_intake_completion',
    'update_offer_requests_updated_at',
    'validate_offer_request_date',
    'update_transaction_service_details_updated_at',
    'apply_task_template',
    'handle_task_completion',
    'apply_workflow_template',
    'get_my_role',
    'handle_new_user',
    'get_user_role'
);
```

**Expected Result:** All functions should show `{search_path=public}` in config_settings.

### **2. Verify Auth Settings**
1. **Check OTP Expiry**
   - Go to Supabase Dashboard > Authentication > Settings
   - Confirm OTP expiry is ≤ 3600 seconds (1 hour)

2. **Check Password Protection**
   - Confirm "Leaked Password Protection" is enabled
   - Test by trying to create an account with a common password like "password123"

### **3. Run Security Linter Again**
```bash
# If using Supabase CLI
supabase inspect db --lint

# Or check in Dashboard
# Go to Database > Database Health Check
```

---

## 🎯 Expected Outcomes

After applying these fixes:

### **✅ Security Improvements**
- **Function Search Path**: All functions secured against path injection
- **OTP Security**: Reduced exposure window for one-time passwords  
- **Password Security**: Protection against known compromised passwords

### **✅ Compliance Benefits**
- **Production Ready**: Meets Supabase production security standards
- **Security Best Practices**: Follows recommended security configurations
- **Audit Trail**: All security changes documented and tracked

### **📊 Linting Results**
- **Before**: 12 security warnings
- **After**: 0 security warnings (expected)

---

## 🚀 Lovable.dev Integration Notes

### **No Code Changes Required**
These security fixes are infrastructure-level and don't require any changes to your Lovable.dev application code.

### **Benefits for Development**
- **Enhanced Security**: Production-grade security from development
- **Team Confidence**: No security warnings blocking deployment
- **Best Practices**: Following Supabase security recommendations

### **Testing in Lovable.dev**
1. **Function Testing**: All database functions continue to work normally
2. **Auth Testing**: User registration and login work with enhanced security
3. **Performance**: No impact on application performance

---

## 📋 Implementation Checklist

### **Database Security Fixes**
- [ ] Apply migration `20241229000001_security_fixes.sql`
- [ ] Verify all functions have proper search_path
- [ ] Test critical functions (auth, offer submission, vendor lookup)

### **Auth Configuration Fixes**
- [ ] Set OTP expiry to ≤ 1800 seconds (30 minutes)
- [ ] Enable leaked password protection
- [ ] Test user registration with common passwords (should fail)
- [ ] Test OTP functionality with new timeout

### **Verification**
- [ ] Run Supabase security linter
- [ ] Confirm 0 security warnings
- [ ] Test all major application flows
- [ ] Document security improvements

---

**🎯 Result**: Production-ready security configuration that meets Supabase best practices and eliminates all security linting warnings.