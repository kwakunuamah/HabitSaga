-- Migration: 006_check_in_updates.sql
-- Description: Adds barrier and retry_plan columns to chapters table for check-in reflections

-- Create enum for check-in barriers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'check_in_barrier') THEN
        CREATE TYPE check_in_barrier AS ENUM (
            'time_management',
            'tired_stressed',
            'forgot',
            'unexpected_event',
            'motivation_low',
            'other'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chapters' AND column_name = 'barrier') THEN
        ALTER TABLE public.chapters ADD COLUMN barrier check_in_barrier;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chapters' AND column_name = 'retry_plan') THEN
        ALTER TABLE public.chapters ADD COLUMN retry_plan TEXT;
    END IF;
END $$;

-- Comment on columns
COMMENT ON COLUMN public.chapters.barrier IS 'Reason for partial or missed check-in';
COMMENT ON COLUMN public.chapters.retry_plan IS 'User plan for when to try again';
