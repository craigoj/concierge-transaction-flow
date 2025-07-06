-- Add admin role to user_role enum and fix role column type
-- This is required for admin users to authenticate and access the system

-- First, check if the profiles table is using the user_role enum or TEXT
-- If it's using TEXT with CHECK constraint, we don't need to change it
-- If it's using the user_role enum, we need to add 'admin' to the enum

-- Add 'admin' to the user_role enum if it exists
DO $$ 
BEGIN
    -- Check if user_role enum exists and add admin if it doesn't have it
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

-- Ensure the profiles table role column allows admin, coordinator, and agent
-- This handles both enum and CHECK constraint scenarios
DO $$
BEGIN
    -- If the column is using TEXT with CHECK constraint, update the constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role' 
        AND data_type = 'text'
    ) THEN
        -- Drop existing check constraint if it exists
        ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
        
        -- Add new check constraint that includes admin
        ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('admin', 'coordinator', 'agent'));
    END IF;
END $$;

-- Create test admin user profile
-- This will only work if RLS policies allow it or if we're running as superuser
INSERT INTO public.profiles (id, email, role, first_name, last_name, created_at, updated_at) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'admin@demo.com', 
    'admin', 
    'Admin', 
    'User', 
    NOW(), 
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    email = 'admin@demo.com',
    first_name = 'Admin',
    last_name = 'User',
    updated_at = NOW();