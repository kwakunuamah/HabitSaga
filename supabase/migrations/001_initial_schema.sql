-- Habit Saga MVP - Initial Database Schema
-- This migration creates all core tables, enums, indexes, and foreign keys

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Subscription tiers
CREATE TYPE subscription_tier AS ENUM ('free', 'plus', 'premium');

-- Goal status
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'archived');

-- Chapter outcome
CREATE TYPE chapter_outcome AS ENUM ('origin', 'completed', 'partial', 'missed');

-- Subscription platform
CREATE TYPE subscription_platform AS ENUM ('ios', 'android');

-- Subscription status
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'expired');

-- Theme types
CREATE TYPE theme_type AS ENUM ('superhero', 'fantasy', 'sci-fi', 'anime', 'custom');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    subscription_tier subscription_tier NOT NULL DEFAULT 'free',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    notifications_enabled BOOLEAN NOT NULL DEFAULT false,
    expo_push_token TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Goals table (stories/sagas)
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    cadence JSONB NOT NULL, -- { type: 'daily' | '3x_week' | 'custom', details?: string }
    theme theme_type NOT NULL,
    hero_profile TEXT, -- AI-generated from selfie + Q&A
    theme_profile TEXT, -- AI-generated theme description
    saga_summary_short TEXT, -- Rolling story summary (updated per chapter)
    last_chapter_summary TEXT, -- Summary of most recent chapter
    status goal_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chapters table (check-ins/story chapters)
CREATE TABLE public.chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    chapter_index INTEGER NOT NULL,
    date DATE NOT NULL,
    outcome chapter_outcome NOT NULL,
    note TEXT,
    chapter_title TEXT, -- AI-generated
    chapter_text TEXT, -- AI-generated narrative
    image_url TEXT, -- Supabase Storage path (nullable)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique chapter_index per goal
    UNIQUE(goal_id, chapter_index)
);

-- Usage panels table (quota tracking for AI image generation)
CREATE TABLE public.usage_panels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions table (App Store/Play Store receipts)
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    platform subscription_platform NOT NULL,
    product_id TEXT NOT NULL,
    status subscription_status NOT NULL,
    renewal_date TIMESTAMPTZ,
    raw_receipt JSONB, -- Store full receipt metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- One active subscription per user per platform
    UNIQUE(user_id, platform, product_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_subscription_tier ON public.users(subscription_tier);
CREATE INDEX idx_users_notifications_enabled ON public.users(notifications_enabled) WHERE notifications_enabled = true;

-- Goals indexes
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_status ON public.goals(status);
CREATE INDEX idx_goals_user_status ON public.goals(user_id, status);

-- Chapters indexes
CREATE INDEX idx_chapters_goal_id ON public.chapters(goal_id);
CREATE INDEX idx_chapters_user_id ON public.chapters(user_id);
CREATE INDEX idx_chapters_date ON public.chapters(date);
CREATE INDEX idx_chapters_goal_date ON public.chapters(goal_id, date DESC);

-- Usage panels indexes (for monthly quota queries)
CREATE INDEX idx_usage_panels_user_id ON public.usage_panels(user_id);
CREATE INDEX idx_usage_panels_user_created ON public.usage_panels(user_id, created_at DESC);
CREATE INDEX idx_usage_panels_goal_id ON public.usage_panels(goal_id);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status) WHERE status = 'active';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.users IS 'Extends auth.users with app-specific user data';
COMMENT ON TABLE public.goals IS 'User goals/stories that become comic sagas';
COMMENT ON TABLE public.chapters IS 'Individual check-ins/chapters for each goal';
COMMENT ON TABLE public.usage_panels IS 'Tracks AI image panel generation for quota enforcement';
COMMENT ON TABLE public.subscriptions IS 'App Store/Play Store subscription receipts and status';

COMMENT ON COLUMN public.goals.cadence IS 'JSONB: { type: "daily" | "3x_week" | "custom", details?: string }';
COMMENT ON COLUMN public.goals.hero_profile IS 'AI-generated short description of the hero character';
COMMENT ON COLUMN public.goals.theme_profile IS 'AI-generated description of the theme/world';
COMMENT ON COLUMN public.goals.saga_summary_short IS 'Rolling summary of the entire saga (updated per chapter)';
COMMENT ON COLUMN public.goals.last_chapter_summary IS 'Summary of the most recent chapter';
COMMENT ON COLUMN public.chapters.outcome IS 'origin = first chapter, completed/partial/missed = check-in results';
COMMENT ON COLUMN public.chapters.image_url IS 'Supabase Storage path to comic panel image (nullable)';
COMMENT ON COLUMN public.usage_panels.created_at IS 'Used to calculate monthly panel usage per user';


