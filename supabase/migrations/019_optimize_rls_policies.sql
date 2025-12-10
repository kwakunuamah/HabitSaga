-- Optimize RLS Policies for Performance
-- This migration addresses Supabase performance lint warnings:
-- 1. Wraps auth.uid() calls in (select ...) to prevent per-row re-evaluation
-- 2. Removes duplicate SELECT policy on users table

-- ============================================================================
-- USERS TABLE - Fix duplicate policies and optimize
-- ============================================================================

-- Drop both duplicate SELECT policies
DROP POLICY IF EXISTS "Users can select their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;

-- Drop other policies to recreate with optimization
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Recreate with (select auth.uid()) optimization
CREATE POLICY "Users can read their own profile"
ON public.users FOR SELECT TO authenticated
USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert their own profile"
ON public.users FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE TO authenticated
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- GOALS TABLE - Optimize all policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can select their own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.goals;

CREATE POLICY "Users can select their own goals"
ON public.goals FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own goals"
ON public.goals FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own goals"
ON public.goals FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own goals"
ON public.goals FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id);

-- ============================================================================
-- CHAPTERS TABLE - Optimize all policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can select their own chapters" ON public.chapters;
DROP POLICY IF EXISTS "Users can insert their own chapters" ON public.chapters;
DROP POLICY IF EXISTS "Users can update their own chapters" ON public.chapters;
DROP POLICY IF EXISTS "Users can delete their own chapters" ON public.chapters;

CREATE POLICY "Users can select their own chapters"
ON public.chapters FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own chapters"
ON public.chapters FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own chapters"
ON public.chapters FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own chapters"
ON public.chapters FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id);

-- ============================================================================
-- USAGE_PANELS TABLE - Optimize SELECT policy
-- ============================================================================

DROP POLICY IF EXISTS "Users can select their own usage panels" ON public.usage_panels;

CREATE POLICY "Users can select their own usage panels"
ON public.usage_panels FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

-- ============================================================================
-- SUBSCRIPTIONS TABLE - Optimize all policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can select their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can select their own subscriptions"
ON public.subscriptions FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own subscriptions"
ON public.subscriptions FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);
