-- Create Admin User for Adamson Debate Society Admin Panel
-- Email: auds@adamson.edu.ph
-- Password: 2025-2026_AdUDebSoc!

-- This script should be run in Supabase SQL Editor or via API

-- First, insert the user into auth.users table
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
    '{"name": "ADUS Admin", "role": "admin"}',
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

-- Insert admin profile
INSERT INTO public.admin_profiles (user_id, email, name, role, permissions)
SELECT
    id,
    'auds@adamson.edu.ph',
    'ADUS Admin',
    'super_admin',
    '{"events": true, "news": true, "training": true, "resources": true, "users": true}'::jsonb
FROM auth.users
WHERE email = 'auds@adamson.edu.ph'
ON CONFLICT (email) DO UPDATE SET
    updated_at = NOW();

-- Enable Row Level Security
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admin profiles are viewable by authenticated users" ON public.admin_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin profiles are insertable by service role" ON public.admin_profiles
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admin profiles are updatable by service role" ON public.admin_profiles
    FOR UPDATE USING (auth.role() = 'service_role');

-- Create function to check admin access
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

-- Update existing tables to allow admin access
-- Grant permissions for admin operations on all tables
GRANT ALL ON public.events TO service_role;
GRANT ALL ON public.news_community TO service_role;
GRANT ALL ON public.news_training TO service_role;
GRANT ALL ON public.news_tournaments TO service_role;
GRANT ALL ON public.training_sessions TO service_role;
GRANT ALL ON public.resources TO service_role;

-- Create updated_at trigger for admin_profiles
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_admin_profiles_updated_at
    BEFORE UPDATE ON public.admin_profiles
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- Verify the admin user was created
SELECT
    u.email,
    u.email_confirmed_at,
    u.created_at,
    ap.role,
    ap.permissions
FROM auth.users u
LEFT JOIN public.admin_profiles ap ON u.id = ap.user_id
WHERE u.email = 'auds@adamson.edu.ph';