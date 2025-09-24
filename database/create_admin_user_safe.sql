-- Safe Admin User Creation Script for Adamson Debate Society
-- Email: auds@adamson.edu.ph
-- Password: 2025-2026_AdUDebSoc!

-- This script handles existing users and policies gracefully

-- Delete existing user if exists (to avoid conflicts)
DELETE FROM auth.users WHERE email = 'auds@adamson.edu.ph';

-- Create the admin user
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'auds@adamson.edu.ph',
    crypt('2025-2026_AdUDebSoc!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "AUDS Admin", "role": "admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Create admin profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB DEFAULT '{"events": true, "news": true, "training": true, "resources": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert or update admin profile
INSERT INTO public.admin_profiles (user_id, email, name, role, permissions)
SELECT
    id,
    'auds@adamson.edu.ph',
    'AUDS Admin',
    'super_admin',
    '{"events": true, "news": true, "training": true, "resources": true, "users": true}'::jsonb
FROM auth.users
WHERE email = 'auds@adamson.edu.ph'
ON CONFLICT (email) DO UPDATE SET
    name = 'AUDS Admin',
    role = 'super_admin',
    permissions = '{"events": true, "news": true, "training": true, "resources": true, "users": true}'::jsonb,
    updated_at = NOW();

-- Enable Row Level Security (only if not already enabled)
DO $$
BEGIN
    ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    -- Table already has RLS enabled
    NULL;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin profiles are viewable by authenticated users" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admin profiles are insertable by service role" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admin profiles are updatable by service role" ON public.admin_profiles;

-- Create policies
CREATE POLICY "Admin profiles are viewable by authenticated users" ON public.admin_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin profiles are insertable by service role" ON public.admin_profiles
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admin profiles are updatable by service role" ON public.admin_profiles
    FOR UPDATE USING (auth.role() = 'service_role');

-- Drop and recreate the admin check function
DROP FUNCTION IF EXISTS public.is_admin(TEXT);

CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_count INTEGER;
    check_email TEXT;
BEGIN
    -- Use provided email or current user's email
    IF user_email IS NULL THEN
        SELECT auth.email() INTO check_email;
    ELSE
        check_email := user_email;
    END IF;

    -- Check if user exists in admin_profiles
    SELECT COUNT(*)
    INTO admin_count
    FROM public.admin_profiles
    WHERE email = check_email;

    RETURN admin_count > 0;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.admin_profiles TO authenticated;
GRANT ALL ON public.admin_profiles TO service_role;

-- Grant permissions for admin operations on all tables
GRANT ALL ON public.events TO service_role;
GRANT ALL ON public.news_community TO service_role;
GRANT ALL ON public.news_training TO service_role;
GRANT ALL ON public.news_tournaments TO service_role;

-- Grant permissions on training_sessions and resources tables (create if needed)
DO $$
BEGIN
    GRANT ALL ON public.training_sessions TO service_role;
EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, create it
    CREATE TABLE public.training_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        session_date TIMESTAMP WITH TIME ZONE,
        instructor VARCHAR(255),
        duration INTEGER,
        level VARCHAR(50),
        max_participants INTEGER,
        materials TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    GRANT ALL ON public.training_sessions TO service_role;
END $$;

DO $$
BEGIN
    GRANT ALL ON public.resources TO service_role;
EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, create it
    CREATE TABLE public.resources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50),
        category VARCHAR(100),
        access_level VARCHAR(50) DEFAULT 'public',
        file_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    GRANT ALL ON public.resources TO service_role;
END $$;

-- Drop and recreate the updated_at trigger function
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers for all tables
DROP TRIGGER IF EXISTS handle_admin_profiles_updated_at ON public.admin_profiles;
CREATE TRIGGER handle_admin_profiles_updated_at
    BEFORE UPDATE ON public.admin_profiles
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- Add triggers to other tables if they don't exist
DO $$
BEGIN
    CREATE TRIGGER handle_training_sessions_updated_at
        BEFORE UPDATE ON public.training_sessions
        FOR EACH ROW
        EXECUTE PROCEDURE public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$
BEGIN
    CREATE TRIGGER handle_resources_updated_at
        BEFORE UPDATE ON public.resources
        FOR EACH ROW
        EXECUTE PROCEDURE public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Verify the admin user was created successfully
SELECT
    u.email,
    u.email_confirmed_at,
    u.created_at,
    ap.role,
    ap.permissions
FROM auth.users u
LEFT JOIN public.admin_profiles ap ON u.id = ap.user_id
WHERE u.email = 'auds@adamson.edu.ph';