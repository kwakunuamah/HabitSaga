-- Migration: 007_season2_and_notifications.sql
-- Description: Adds support for Season 2 (goal lineage) and notification preferences

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'parent_goal_id') THEN
        ALTER TABLE public.goals ADD COLUMN parent_goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL;
    END IF;
END $$;

COMMENT ON COLUMN public.goals.parent_goal_id IS 'Reference to the previous season/goal if this is a continuation';

-- Add index for parent_goal_id lookups
CREATE INDEX IF NOT EXISTS idx_goals_parent_goal_id ON public.goals(parent_goal_id);

-- Add check_in_time to users table for notification scheduling
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'check_in_time') THEN
        ALTER TABLE public.users ADD COLUMN check_in_time TIME NOT NULL DEFAULT '20:00:00';
    END IF;
END $$;

COMMENT ON COLUMN public.users.check_in_time IS 'Preferred local time for check-in reminders';
