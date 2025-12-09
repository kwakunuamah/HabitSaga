-- Habit Saga - Add Habit Plan Support
-- This migration adds the habit_plan column to goals table and a tasks_results column to chapters

-- ============================================================================
-- ADD HABIT PLAN TO GOALS
-- ============================================================================

-- Add habit_plan JSONB column to store 1-3 structured habit tasks
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'habit_plan') THEN
        ALTER TABLE public.goals ADD COLUMN habit_plan JSONB;
    END IF;
END $$;

-- Add index for querying goals with habit plans
CREATE INDEX IF NOT EXISTS idx_goals_habit_plan ON public.goals USING GIN (habit_plan) WHERE habit_plan IS NOT NULL;

-- Add comment describing the structure
COMMENT ON COLUMN public.goals.habit_plan IS 
'JSONB array of 1-3 habit tasks with structure:
[{
  "id": "uuid",
  "label": "Read 5 pages of your book",
  "tiny_version": "Read 2 pages",
  "full_version": "Read 10+ pages",
  "cue_type": "habit_stack" | "time_location",
  "if_then": "If it is 10pm and I am in bed, then I will read 5 pages",
  "habit_stack": "After I plug in my phone, I will open my book" (optional),
  "suggested_frequency": "daily" | "three_per_week" | "weekly",
  "difficulty": 1-5,
  "active": true,
  "metrics": {
    "total_full_completions": 0,
    "total_tiny_completions": 0,
    "total_missed": 0
  }
}]';

-- ============================================================================
-- ADD TASK RESULTS TO CHAPTERS
-- ============================================================================

-- Add tasks_results column to store per-task outcomes for each check-in
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chapters' AND column_name = 'tasks_results') THEN
        ALTER TABLE public.chapters ADD COLUMN tasks_results JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chapters' AND column_name = 'tiny_adjustment') THEN
        ALTER TABLE public.chapters ADD COLUMN tiny_adjustment TEXT;
    END IF;
END $$;

-- Add comment describing the structure
COMMENT ON COLUMN public.chapters.tasks_results IS 
'JSONB object mapping habit_id to outcome:
{
  "habit-uuid-1": "full",
  "habit-uuid-2": "tiny",
  "habit-uuid-3": "missed"
}';

COMMENT ON COLUMN public.chapters.tiny_adjustment IS 
'User-provided small adjustment they want to try next time (e.g., "Try reading right after dinner instead")';
