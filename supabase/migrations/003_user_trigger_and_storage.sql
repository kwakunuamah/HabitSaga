-- Habit Saga MVP - User Creation Trigger and Storage Buckets
-- This migration adds:
-- 1. Trigger to auto-create public.users row when auth.users row is created
-- 2. Storage buckets for avatars and panels
-- 3. Storage policies for authenticated access

-- ============================================================================
-- USER CREATION TRIGGER
-- ============================================================================

-- Function to create public.users row when a new auth.users row is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, subscription_tier, timezone, notifications_enabled)
    VALUES (
        NEW.id,
        NEW.email,
        'free',
        COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC'),
        false
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create storage buckets for user content
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('panels', 'panels', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Avatars bucket policies

-- Users can upload their own avatars
CREATE POLICY "Users can upload their own avatars"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can update their own avatars
CREATE POLICY "Users can update their own avatars"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'avatars' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can delete their own avatars
CREATE POLICY "Users can delete their own avatars"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'avatars');

-- Panels bucket policies

-- Only service role can insert panels (Edge Functions)
-- Users cannot directly upload panels
CREATE POLICY "Service role can insert panels"
    ON storage.objects
    FOR INSERT
    TO service_role
    WITH CHECK (bucket_id = 'panels');

-- Users can view their own panels
CREATE POLICY "Users can view their own panels"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'panels' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Anyone can view panels (for sharing feature)
CREATE POLICY "Anyone can view panels"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'panels');

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.handle_new_user() IS 
    'Creates a public.users row when a new user signs up via Supabase Auth';

-- Note: Cannot comment on trigger in auth schema (permission issue)
-- Trigger: on_auth_user_created on auth.users automatically creates public.users row on signup

