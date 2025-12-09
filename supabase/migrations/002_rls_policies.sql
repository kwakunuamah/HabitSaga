-- Habit Saga MVP - Row Level Security Policies
-- This migration enables RLS and creates security policies for all tables

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can select their own record
CREATE POLICY "Users can select their own profile"
    ON public.users
    FOR SELECT
    USING (id = auth.uid());

-- Users can update their own record
CREATE POLICY "Users can update their own profile"
    ON public.users
    FOR UPDATE
    USING (id = auth.uid());

-- Note: INSERT is handled by Supabase Auth triggers (auth.users -> public.users)
-- Edge Functions with service role can insert/update for system operations

-- ============================================================================
-- GOALS TABLE POLICIES
-- ============================================================================

-- Users can select their own goals
CREATE POLICY "Users can select their own goals"
    ON public.goals
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can insert their own goals
CREATE POLICY "Users can insert their own goals"
    ON public.goals
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own goals
CREATE POLICY "Users can update their own goals"
    ON public.goals
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own goals
CREATE POLICY "Users can delete their own goals"
    ON public.goals
    FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- CHAPTERS TABLE POLICIES
-- ============================================================================

-- Users can select their own chapters
CREATE POLICY "Users can select their own chapters"
    ON public.chapters
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can insert their own chapters
-- Note: Edge Functions may also insert chapters, but they verify user_id matches auth.uid()
CREATE POLICY "Users can insert their own chapters"
    ON public.chapters
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own chapters
CREATE POLICY "Users can update their own chapters"
    ON public.chapters
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own chapters
CREATE POLICY "Users can delete their own chapters"
    ON public.chapters
    FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- USAGE_PANELS TABLE POLICIES
-- ============================================================================

-- Users can select their own usage records
CREATE POLICY "Users can select their own usage panels"
    ON public.usage_panels
    FOR SELECT
    USING (user_id = auth.uid());

-- Note: INSERT is typically done by Edge Functions with service role for quota enforcement
-- Users cannot directly insert usage_panels (prevents quota manipulation)
-- Edge Functions will verify user_id matches the authenticated user before inserting

-- ============================================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- ============================================================================

-- Users can select their own subscriptions
CREATE POLICY "Users can select their own subscriptions"
    ON public.subscriptions
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can update their own subscriptions
-- Note: INSERT is typically done by webhook handlers (service role)
CREATE POLICY "Users can update their own subscriptions"
    ON public.subscriptions
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can select their own profile" ON public.users IS 
    'Authenticated users can only view their own user record';

COMMENT ON POLICY "Users can update their own profile" ON public.users IS 
    'Authenticated users can only update their own user record';

COMMENT ON POLICY "Users can select their own goals" ON public.goals IS 
    'Users can only view goals they own (user_id = auth.uid())';

COMMENT ON POLICY "Users can insert their own goals" ON public.goals IS 
    'Users can create new goals, but user_id must match their auth.uid()';

COMMENT ON POLICY "Users can update their own goals" ON public.goals IS 
    'Users can only update goals they own';

COMMENT ON POLICY "Users can delete their own goals" ON public.goals IS 
    'Users can only delete goals they own (cascades to chapters)';

COMMENT ON POLICY "Users can select their own chapters" ON public.chapters IS 
    'Users can only view chapters for goals they own';

COMMENT ON POLICY "Users can insert their own chapters" ON public.chapters IS 
    'Users can create chapters, but user_id must match auth.uid() (Edge Functions also insert)';

COMMENT ON POLICY "Users can update their own chapters" ON public.chapters IS 
    'Users can only update chapters they own';

COMMENT ON POLICY "Users can delete their own chapters" ON public.chapters IS 
    'Users can only delete chapters they own';

COMMENT ON POLICY "Users can select their own usage panels" ON public.usage_panels IS 
    'Users can view their own panel usage records for quota tracking';

COMMENT ON POLICY "Users can select their own subscriptions" ON public.subscriptions IS 
    'Users can view their own subscription records';

COMMENT ON POLICY "Users can update their own subscriptions" ON public.subscriptions IS 
    'Users can update their own subscription records (typically done via webhooks)';


