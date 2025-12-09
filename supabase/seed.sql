-- Seed Data for Habit Saga
-- This creates test data to verify the full Habit Plan flow including:
-- - AI narrative generation prompts
-- - Image generation prompts  
-- - Task-based check-ins
-- - Habit plan metrics

-- ============================================================================
-- TEST USER
-- ============================================================================

-- Insert a test user (use actual auth user ID from Supabase Auth)
-- You'll need to replace this with your actual test user ID after signup
-- For now, using a placeholder UUID
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
    '2694dddc-34b1-4429-8a3e-0836b1612629'::uuid,
    'test@habitsaga.com',
    'premium', -- Premium tier to test all features including image generation
    'America/New_York',
    true,
    'Alex Chen',
    '25-34',
    'Software developer trying to build better habits',
    'https://via.placeholder.com/200'
) ON CONFLICT (id) DO UPDATE SET
    subscription_tier = 'premium',
    display_name = 'Alex Chen',
    age_range = '25-34',
    bio = 'Software developer trying to build better habits';

-- ============================================================================
-- TEST GOAL WITH HABIT PLAN
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
    context_current_status,
    context_notes,
    context_past_efforts,
    habit_cue_time_window,
    habit_cue_location
) VALUES (
    '10000000-0000-0000-0000-000000000001'::uuid,
    '2694dddc-34b1-4429-8a3e-0836b1612629'::uuid,
    'Read 12 Books This Year',
    'I want to become a more consistent reader and expand my knowledge',
    (CURRENT_DATE + INTERVAL '90 days')::date,
    '{"type": "daily", "details": "Read every evening"}'::jsonb,
    'fantasy',
    'Alex is a determined scholar on a quest for wisdom, wielding books as their greatest weapon against the chaos of modern life.',
    'A mystical ancient library floating among the clouds, where countless tomes hold the secrets of the universe and each page turned brings new magical discoveries.',
    'Alex embarks on an epic quest through the Infinite Library, seeking to unlock the wisdom contained in twelve legendary tomes before the Season of Growth concludes.',
    'The hero stands at the entrance of the Grand Library, accepting the Library Keeper''s challenge to read twelve sacred books.',
    '[
        {
            "id": "habit-001",
            "label": "Read 5 pages before bed",
            "tiny_version": "Read 2 pages",
            "full_version": "Read 10+ pages",
            "cue_type": "habit_stack",
            "if_then": "If it is 10pm and I am in bed, then I will read 5 pages of my current book",
            "habit_stack": "After I plug in my phone for the night, I will open my book",
            "suggested_frequency": "daily",
            "difficulty": 2,
            "active": true,
            "metrics": {
                "total_full_completions": 8,
                "total_tiny_completions": 3,
                "total_missed": 2
            }
        },
        {
            "id": "habit-002",
            "label": "Take reading notes",
            "tiny_version": "Write down one interesting quote",
            "full_version": "Summarize the chapter in 3-5 sentences",
            "cue_type": "habit_stack",
            "if_then": "After I finish reading, I will write down my thoughts",
            "habit_stack": "After I close my book, I will write at least one thought in my reading journal",
            "suggested_frequency": "daily",
            "difficulty": 3,
            "active": true,
            "metrics": {
                "total_full_completions": 5,
                "total_tiny_completions": 6,
                "total_missed": 2
            }
        }
    ]'::jsonb,
    'active',
    'I currently read maybe 1-2 times per week, usually on weekends',
    'I get distracted by my phone and social media in the evenings',
    'Just starting',
    'I really want to learn more about history and philosophy',
    'I''ve tried book clubs before but they felt too rigid. I do better on my own schedule.',
    'night_before_bed',
    'home'
) ON CONFLICT (id) DO UPDATE SET
    habit_plan = EXCLUDED.habit_plan,
    saga_summary_short = EXCLUDED.saga_summary_short;

-- ============================================================================
-- TEST CHAPTERS (Including task-based check-ins)
-- ============================================================================

-- Chapter 1: Origin
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
    '2694dddc-34b1-4429-8a3e-0836b1612629'::uuid,
    1,
    (CURRENT_DATE - INTERVAL '13 days')::date,
    'origin',
    'The Library of Infinite Pages',
    'Alex stood before the towering gates of the Infinite Library, their heart racing with anticipation. The ancient structure floated among silver clouds, its crystalline spires reaching toward the heavens. The Library Keeper, an ethereal being of pure light, descended the marble steps.

"Welcome, seeker of wisdom," the Keeper''s voice echoed like wind through ancient trees. "You have been chosen for the Quest of Twelve Tomes. Within these walls lie books of immense power, waiting for one brave enough to unlock their secrets."

Alex gripped the leather-bound journal given to them at the entrance. "I''m ready," they said, their voice steady despite the enormity of the task ahead. "I will read all twelve books and document my journey."

The Keeper smiled, a warm glow spreading across their luminous form. "Remember, young scholar: it is not the speed of reading, but the wisdom gained. Even the smallest page turned is progress. The tiny steps will light your path through the darkest sections of the library."

With determination burning bright, Alex crossed the threshold into a world of endless knowledge, ready to begin their epic saga.',
    CURRENT_TIMESTAMP - INTERVAL '13 days'
) ON CONFLICT (id) DO NOTHING;

-- Chapter 2: Task-based check-in with full completion
INSERT INTO public.chapters (
    id,
    goal_id,
    user_id,
    chapter_index,
    date,
    outcome,
    note,
    tasks_results,
    chapter_title,
    chapter_text,
    created_at
) VALUES (
    'c0000000-0000-0000-0000-000000000002'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    '2694dddc-34b1-4429-8a3e-0836b1612629'::uuid,
    2,
    (CURRENT_DATE - INTERVAL '12 days')::date,
    'completed',
    'I really enjoyed the first chapter of my new history book!',
    '{"habit-001": "full", "habit-002": "full"}'::jsonb,
    'The First Pages of Power',
    'Alex settled into their favorite reading spot, a plush chair beside a window overlooking the cloud gardens. As they opened the first tome—an ancient history text—golden light spilled from its pages.

They read deeply, losing themselves in the stories of civilizations past. Ten full pages later, they set the book down and reached for their journal with excitement. Their pen flew across the page as they captured insights about how empires rise and fall, drawing connections to their own life.

The Library Keeper appeared at their shoulder, nodding with approval. "Excellent work, young scholar. You completed both your reading AND your reflection. The wisdom is truly taking root."

A warm magical glow surrounded Alex as experience points materialized in the air—their progress made visible. They had taken two major steps forward on their quest, and the path ahead seemed clearer than ever.',
    CURRENT_TIMESTAMP - INTERVAL '12 days'
) ON CONFLICT (id) DO NOTHING;

-- Chapter 3: Task-based check-in with partial (full + tiny)
INSERT INTO public.chapters (
    id,
    goal_id,
    user_id,
    chapter_index,
    date,
    outcome,
    note,
    barrier,
    tiny_adjustment,
    tasks_results,
    chapter_title,
    chapter_text,
    created_at
) VALUES (
    'c0000000-0000-0000-0000-000000000003'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    '2694dddc-34b1-4429-8a3e-0836b1612629'::uuid,
    3,
    (CURRENT_DATE - INTERVAL '11 days')::date,
    'partial',
    'Work ran late but I still made time',
    'time_management',
    'Set a phone reminder at 9:30pm to start winding down',
    '{"habit-001": "tiny", "habit-002": "full"}'::jsonb,
    'The Tiny Steps Still Count',
    'Alex arrived home exhausted from a long day at work. The library seemed dimmer tonight, as if sensing their low energy. They glanced at their book with tired eyes.

"I''ll just read two pages," Alex muttered, barely able to keep their eyes open. Two pages turned into a small victory rather than a defeat. They captured their thoughts in their journal—the notes were thorough despite their fatigue.

The Library Keeper materialized, their form gentler and more understanding. "You honored your commitment, even in a small way. This is the mark of a true scholar—showing up even when the path is difficult."

A softer glow of magic surrounded Alex, different from yesterday but no less meaningful. "Remember," the Keeper whispered, "the tiny victories are what build the foundation of great quests. Tomorrow, you might try setting a reminder to begin earlier."

Alex nodded, feeling proud rather than disappointed. Two pages was better than none.',
    CURRENT_TIMESTAMP - INTERVAL '11 days'
) ON CONFLICT (id) DO NOTHING;

-- Chapter 4: Task-based check-in with all missed
INSERT INTO public.chapters (
    id,
    goal_id,
    user_id,
    chapter_index,
    date,
    outcome,
    barrier,
    tiny_adjustment,
    tasks_results,
    chapter_title,
    chapter_text,
    created_at
) VALUES (
    'c0000000-0000-0000-0000-000000000004'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    '2694dddc-34b1-4429-8a3e-0836b1612629'::uuid,
    4,
    (CURRENT_DATE - INTERVAL '10 days')::date,
    'missed',
    'tired_stressed',
    'Keep my book on my nightstand so it''s the first thing I see',
    '{"habit-001": "missed", "habit-002": "missed"}'::jsonb,
    'A Day in the Shadows',
    'The Infinite Library felt distant tonight. Alex collapsed into bed, their book sitting untouched on the nightstand. The weight of the day—deadlines, meetings, stress—had drained every ounce of energy.

They stared at the ceiling, feeling a pang of guilt. The Library Keeper appeared, but their presence was warm rather than judgmental.

"Every hero faces days where the quest seems impossible," the Keeper said gently. "What matters is not this single day, but the pattern you weave over time. You''ve shown up many times before."

Alex sat up slightly. "Tomorrow, I''ll keep the book right on my nightstand. So it''s the first thing I see when I wake up, and the last thing before sleep."

The Keeper smiled. "Now you''re thinking like a true strategist. Adjusting your approach is wisdom in action. Rest tonight, young scholar. The library will be here tomorrow, ready to welcome you back."

A small ember of determination flickered in Alex''s chest as they drifted off to sleep.',
    CURRENT_TIMESTAMP - INTERVAL '10 days'
) ON CONFLICT (id) DO NOTHING;

-- Add a few more recent chapters for variety
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
    created_at
) VALUES 
(
    'c0000000-0000-0000-0000-000000000005'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    '2694dddc-34b1-4429-8a3e-0836b1612629'::uuid,
    5,
    (CURRENT_DATE - INTERVAL '9 days')::date,
    'completed',
    '{"habit-001": "full", "habit-002": "tiny"}'::jsonb,
    'Renewed Determination',
    'Alex returned to the library with fresh eyes and a renewed spirit...',
    CURRENT_TIMESTAMP - INTERVAL '9 days'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- USAGE TRACKING (for image quota testing)
-- ============================================================================

-- Track some panel image usage for the premium user
INSERT INTO public.usage_panels (
    user_id,
    goal_id,
    chapter_id,
    created_at
) VALUES 
(
    '2694dddc-34b1-4429-8a3e-0836b1612629'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    'c0000000-0000-0000-0000-000000000001'::uuid,
    CURRENT_TIMESTAMP - INTERVAL '13 days'
),
(
    '2694dddc-34b1-4429-8a3e-0836b1612629'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    'c0000000-0000-0000-0000-000000000002'::uuid,
    CURRENT_TIMESTAMP - INTERVAL '12 days'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify the data was inserted correctly
DO $$
BEGIN
    RAISE NOTICE 'Seed data inserted successfully!';
    RAISE NOTICE 'Test user ID: 2694dddc-34b1-4429-8a3e-0836b1612629';
    RAISE NOTICE 'Test goal ID: 10000000-0000-0000-0000-000000000001';
    RAISE NOTICE 'To test: ';
    RAISE NOTICE '1. Sign up with email: test@habitsaga.com';
    RAISE NOTICE '2. Update the user_id in this script to match your auth user ID';
    RAISE NOTICE '3. Re-run this script';
    RAISE NOTICE '4. Navigate to the goal to see habit plan and check-ins';
END $$;

-- Show habit plan
SELECT 
    title,
    jsonb_pretty(habit_plan) as habit_plan_formatted
FROM public.goals
WHERE id = '10000000-0000-0000-0000-000000000001';

-- Show chapters with task results
SELECT 
    chapter_index,
    date,
    outcome,
    tasks_results,
    chapter_title
FROM public.chapters
WHERE goal_id = '10000000-0000-0000-0000-000000000001'
ORDER BY chapter_index;
