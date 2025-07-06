# Database Setup Guide for Admin Delete Functionality

## 🚨 **Critical Issue Identified**

The delete functionality is not working because the database is missing essential components:

1. **No users exist** in the profiles table
2. **No transactions exist** to test delete functionality  
3. **Admin role may not be in user_role enum**
4. **RLS policies prevent direct user creation**

## 📋 **Required Database Changes**

### **Step 1: Add Admin to user_role Enum**

Execute in Supabase SQL Editor:

```sql
-- Add admin to the user_role enum if it doesn't exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        -- Check if admin is already in the enum
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role') 
            AND enumlabel = 'admin'
        ) THEN
            -- Add admin to the enum
            ALTER TYPE user_role ADD VALUE 'admin';
        END IF;
    END IF;
END $$;
```

### **Step 2: Apply Admin RLS Policies**

Execute the contents of `/supabase/migrations/20250705000000_fix_admin_transaction_access.sql`:

```sql
-- Admin access to transactions table
CREATE POLICY "Admins have full access to all transactions" ON public.transactions
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- (Continue with all other admin policies from the migration file)
```

### **Step 3: Create Admin User Profile**

**IMPORTANT**: This requires the user to be authenticated in Supabase first.

1. **Sign up admin@demo.com in your app's authentication**
2. **Note the user ID from auth.users table**
3. **Create profile manually or via function**:

```sql
-- Replace USER_ID_FROM_AUTH with actual UUID from auth.users
INSERT INTO public.profiles (id, email, role, first_name, last_name) 
VALUES (
    'USER_ID_FROM_AUTH', 
    'admin@demo.com', 
    'admin', 
    'Admin', 
    'User'
);
```

### **Step 4: Create Test Transaction Data**

Execute the contents of `/supabase/seed.sql`:

```sql
-- Insert test transaction (using admin user ID)
INSERT INTO public.transactions (id, user_id, agent_id, property_address, city, state, zip_code, purchase_price, closing_date, status, transaction_type, service_tier, created_at, updated_at) VALUES
  ('78a6fba6-7d71-4744-8a39-cd6897a1f4c0', 'USER_ID_FROM_AUTH', 'USER_ID_FROM_AUTH', '123 Main St', 'Hampton', 'VA', '23666', 450000, '2024-08-15', 'active', 'purchase', 'core', NOW(), NOW());
```

## 🔧 **Frontend Debug Steps**

With the enhanced logging now in place:

1. **Open browser console** (F12)
2. **Navigate to transaction details page**
3. **Click Delete button**
4. **Check console output** for detailed error information

Expected error messages:
- `"new row violates row-level security policy"` - RLS policies not applied
- `"invalid input value for enum user_role: 'admin'"` - Enum missing admin
- `"relation does not exist"` - Missing tables/data

## 🎯 **Verification Steps**

### **Test Database Setup**

```sql
-- Check if admin enum value exists
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role');

-- Check if admin user exists
SELECT id, email, role FROM profiles WHERE email = 'admin@demo.com';

-- Check if test transaction exists  
SELECT id, property_address FROM transactions WHERE id = '78a6fba6-7d71-4744-8a39-cd6897a1f4c0';

-- Check admin RLS policies exist
SELECT schemaname, tablename, policyname FROM pg_policies 
WHERE tablename = 'transactions' AND policyname LIKE '%admin%';
```

### **Test Delete Functionality**

1. **Authenticate as admin@demo.com**
2. **Navigate to transaction details**
3. **Click Delete button**  
4. **Confirm in dialog**
5. **Check console for success/error**

## 🚨 **Common Issues & Solutions**

| Issue | Solution |
|-------|----------|
| `enum value 'admin' does not exist` | Run Step 1 (Add admin to enum) |
| `row violates row-level security policy` | Run Step 2 (Apply RLS policies) |
| `No admin user found` | Complete Step 3 (Create admin user) |
| `Transaction not found` | Run Step 4 (Create test data) |
| `Delete button not visible` | Check frontend role logic |

## 📁 **Required Files**

- `/supabase/migrations/20250705000000_fix_admin_transaction_access.sql` - RLS policies
- `/supabase/migrations/20250705000001_add_admin_to_user_role_enum.sql` - Enum fix  
- `/supabase/seed.sql` - Test data
- `/src/pages/TransactionDetail.tsx` - Enhanced with debug logging

## ⚡ **Quick Fix Order**

1. **Add admin to enum** (Step 1)
2. **Apply RLS policies** (Step 2) 
3. **Create admin user** (Step 3)
4. **Add test data** (Step 4)
5. **Test delete functionality**

After completing these steps, the delete functionality should work properly for admin users.