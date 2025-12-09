-- E2E Test Seed Data for Maestro Tests
-- Creates test user with credentials: E2E@test.com / test1234$
-- This seed data is specifically for automated E2E tests

-- ============================================================================
-- E2E TEST USER
-- ============================================================================

-- Insert E2E test user
-- NOTE: You must create this user in Supabase Auth first via signup
-- Then update the UUID here to match your actual auth user ID
INSERT INTO public.users (
    id,
    email,
    subscription_tier,
    timezone,
    notifications_enabled,
    display_name,
    age_range,
    bio,
    avatar_url
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid, -- REPLACE with actual auth user ID
    'E2E@test.com',
    'premium', -- Premium for testing all features
    'America/New_York',
    true,
    'E2E Test User',
    '25-34',
    'Automated test account for end-to-end testing',
    null
) ON CONFLICT (id) DO UPDATE SET
    subscription_tier = 'premium',
    display_name = 'E2E Test User',
    bio = 'Automated test account for end-to-end testing';

-- ============================================================================
-- NEARLY-COMPLETE GOAL (for testing saga finale)
-- ============================================================================

INSERT INTO public.goals (
    id,
    user_id,
    title,
    description,
    target_date,
    cadence,
    theme,
    hero_profile,
    theme_profile,
    saga_summary_short,
    last_chapter_summary,
    habit_plan,
    status,
    context_current_frequency,
    context_biggest_blocker,
    context_past_efforts,
    habit_cue_time_window,
    habit_cue_location
) VALUES (
    '10000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Read 12 Books This Year',
    'Build a consistent reading habit by reading every evening',
    (CURRENT_DATE + INTERVAL '5 days')::date, -- Near completion for finale test
    '{\"type\": \"weekly\", \"times\": 3}'::jsonb,
    'fantasy',
    'A determined scholar on a quest for wisdom through the written word',
    'An ancient mystical library where every book unlocks new powers',
    'The hero seeks to read twelve legendary books to unlock ancient wisdom',
    'Nearing the final books of the quest, the scholar feels the power of knowledge growing',
    '[
        {
            "id": "habit-001",
            "label": "Read 5 pages before bed",
            "tiny_version": "Read 2 pages",
            "full_version": "Read 10+ pages",
            "cue_type": "habit_stack",
            "if_then": "If it is 10pm and I am in bed, then I will read 5 pages",
            "habit_stack": "After I plug in my phone, I will open my book",
            "suggested_frequency": "daily",
            "difficulty": 2,
            "active": true,
            "metrics": {
                "total_full_completions": 15,
                "total_tiny_completions": 8,
                "total_missed": 2
            }
        },
        {
            "id": "habit-002",
            "label": "Take reading notes",
            "tiny_version": "Write one quote",
            "full_version": "Summarize chapter in 3-5 sentences",
            "cue_type": "habit_stack",
            "if_then": "After I finish reading, I will write my thoughts",
            "habit_stack": "After I close my book, I will write in my journal",
            "suggested_frequency": "daily",
            "difficulty": 3,
            "active": true,
            "metrics": {
                "total_full_completions": 12,
                "total_tiny_completions": 10,
                "total_missed": 3
            }
        }
    ]'::jsonb,
    'active',
    'Once or twice a week',
    'Too tired after work',
    'Tried book clubs but preferred own schedule',
    'night_before_bed',
    'home'
) ON CONFLICT (id) DO UPDATE SET
    habit_plan = EXCLUDED.habit_plan;

-- ============================================================================
-- SAMPLE CHAPTERS (for viewing in timeline)
-- ============================================================================

-- Origin chapter
INSERT INTO public.chapters (
    id,
    goal_id,
    user_id,
    chapter_index,
    date,
    outcome,
    chapter_title,
    chapter_text,
    created_at
) VALUES (
    'c0000000-0000-0000-0000-000000000001'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    1,
    (CURRENT_DATE - INTERVAL '25 days')::date,
    'origin',
    'The Library Awakens',
    'The ancient doors of the Infinite Library swing open before you, revealing towering shelves that stretch into eternity. The Keeper appears, a wise figure cloaked in starlight. "Welcome, seeker. Your quest to read twelve legendary tomes begins now."',
    CURRENT_TIMESTAMP - INTERVAL '25 days'
) ON CONFLICT (id) DO NOTHING;

-- Recent completed chapter
INSERT INTO public.chapters (
    id,
    goal_id,
    user_id,
    chapter_index,
    date,
    outcome,
    tasks_results,
    chapter_title,
    chapter_text,
    note,
    created_at
) VALUES (
    'c0000000-0000-0000-0000-000000000002'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    2,
    (CURRENT_DATE - INTERVAL '3 days')::date,
    'completed',
    '{"habit-001": "full", "habit-002": "full"}'::jsonb,
    'A Night of Deep Reading',
    'You settled into your reading chair and devoured page after page. The story came alive, and your journal filled with insights. The Keeper smiles - your dedication is showing.',
    'Really enjoyed this chapter!',
    CURRENT_TIMESTAMP - INTERVAL '3 days'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ E2E Test seed data created!';
    RAISE NOTICE '';
    RAISE NOTICE 'Test User Credentials:';
    RAISE NOTICE '  Email: E2E@test.com';
    RAISE NOTICE '  Password: test1234$';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: After creating the auth user via signup:';
    RAISE NOTICE '  1. Get the user UUID from Supabase Auth Dashboard';
    RAISE NOTICE '  2. Update line 20 in this file with the actual UUID';
    RAISE NOTICE '  3. Re-run this seed script';
    RAISE NOTICE '';
END $$;
