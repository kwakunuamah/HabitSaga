-- Migration: 004_onboarding_updates.sql
-- Description: Adds fields for onboarding flow and updates theme enum.

-- 1. Update users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS age_range TEXT, -- e.g. '18-24'
ADD COLUMN IF NOT EXISTS primary_focus_area TEXT;

-- 2. Update goals table
ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS context_current_frequency TEXT,
ADD COLUMN IF NOT EXISTS context_biggest_blocker TEXT,
ADD COLUMN IF NOT EXISTS context_notes TEXT,
ADD COLUMN IF NOT EXISTS context_past_efforts TEXT;

-- 3. Update theme_type enum
-- Postgres allows adding values to enum inside a transaction block only if it hasn't been used in a way that prevents it, 
-- but generally ALTER TYPE ADD VALUE cannot be run inside a transaction block.
-- Supabase migrations run in transactions.
-- To be safe, we'll use a DO block or just run the statements. 
-- However, standard migrations usually just run. 
-- Note: 'superhero', 'fantasy', 'sci-fi', 'anime', 'custom' already exist.

ALTER TYPE theme_type ADD VALUE IF NOT EXISTS 'noir';

-- 4. Add comments
COMMENT ON COLUMN public.users.display_name IS 'User display name / nickname';
COMMENT ON COLUMN public.users.age_range IS 'User age range bucket';
COMMENT ON COLUMN public.users.primary_focus_area IS 'Primary focus area (e.g. Health, Career)';

COMMENT ON COLUMN public.goals.context_current_frequency IS 'How often user currently works on goal';
COMMENT ON COLUMN public.goals.context_biggest_blocker IS 'Biggest obstacle preventing success';
COMMENT ON COLUMN public.goals.context_notes IS 'Additional context notes';
COMMENT ON COLUMN public.goals.context_past_efforts IS 'What they have done in the past to accomplish goal';
