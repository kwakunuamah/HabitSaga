-- Migration: Fix function search_path security
-- Addresses Supabase database linter warning: function_search_path_mutable
-- Setting search_path prevents potential search_path injection attacks

-- ============================================================================
-- FIX SEARCH_PATH ON ALL SECURITY DEFINER FUNCTIONS
-- ============================================================================

-- 1. update_updated_at_column - trigger function for timestamps
-- This function is called on every UPDATE to users, goals, and subscriptions
ALTER FUNCTION public.update_updated_at_column() 
SET search_path = public;

-- 2. handle_new_user - auth trigger that creates public.users row on signup
-- Needs access to auth schema for auth.users lookup
ALTER FUNCTION public.handle_new_user() 
SET search_path = public, auth;

-- 3. delete_user_account - RPC for iOS App Store account deletion compliance
-- Needs access to auth schema for auth.uid() check
ALTER FUNCTION public.delete_user_account(UUID) 
SET search_path = public, auth;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.update_updated_at_column() IS 
    'Trigger function to auto-update updated_at column. search_path secured.';

COMMENT ON FUNCTION public.handle_new_user() IS 
    'Auth trigger to create public.users row on signup. search_path secured.';

COMMENT ON FUNCTION public.delete_user_account(UUID) IS 
    'Securely deletes user account for iOS compliance. search_path secured.';
