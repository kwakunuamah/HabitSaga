-- Migration: 015_add_habit_cue_context.sql
-- Description: Adds habit cue context fields (time window and location) to goals table
-- These fields store user preferences for when/where they'll work on their habit,
-- which is used to generate personalized implementation intentions.

ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS habit_cue_time_window TEXT,
ADD COLUMN IF NOT EXISTS habit_cue_location TEXT;

COMMENT ON COLUMN public.goals.habit_cue_time_window IS 'User preference for when they have time for habit (e.g., "morning", "night_before_bed")';
COMMENT ON COLUMN public.goals.habit_cue_location IS 'User preference for where they typically work on habit (e.g., "home", "work_school")';
