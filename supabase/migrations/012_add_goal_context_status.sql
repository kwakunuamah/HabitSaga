-- Migration: 011_add_goal_context_status.sql
-- Description: Adds context_current_status to goals table

ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS context_current_status TEXT;

COMMENT ON COLUMN public.goals.context_current_status IS 'Where the user is today in terms of their goal';
