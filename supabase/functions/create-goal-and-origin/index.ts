// Habit Saga - Create Goal and Origin Chapter Edge Function
// POST /functions/v1/create-goal-and-origin
//
// Creates a new goal, generates hero/theme profiles, origin chapter,
// and optionally generates an origin panel (if quota allows).

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type {
    CreateGoalAndOriginRequest,
    CreateGoalAndOriginResponse,
    ErrorResponse,
    HabitTask,
} from '../_shared/types.ts';
import { generateOriginStory } from '../_shared/geminiText.ts';
import { generateHabitPlan } from '../_shared/habitPlanGeneration.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { logGoalContentForReview } from '../_shared/contentModeration.ts';
import { initSentry, captureException, flush } from '../_shared/sentry.ts';

// Initialize Sentry for this Edge Function
initSentry('create-goal-and-origin');

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    let userId: string | undefined;

    try {
        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: { Authorization: req.headers.get('Authorization')! },
            },
        });

        // Get authenticated user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return new Response(
                JSON.stringify({
                    error: 'Unauthorized',
                    message: 'Authentication required',
                    code: 'UNAUTHORIZED',
                } as ErrorResponse),
                {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Parse request body
        let body: CreateGoalAndOriginRequest;
        try {
            body = await req.json();
        } catch (parseError) {
            return new Response(
                JSON.stringify({
                    error: 'Bad Request',
                    message: 'Invalid JSON in request body',
                    code: 'PARSE_ERROR',
                } as ErrorResponse),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Validate required fields
        if (!body.title || !body.target_date || !body.cadence || !body.theme) {
            return new Response(
                JSON.stringify({
                    error: 'Bad Request',
                    message: 'Missing required fields: title, target_date, cadence, theme',
                    code: 'VALIDATION_ERROR',
                } as ErrorResponse),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Get user record to check subscription tier
        const { data: userRecord, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (userError || !userRecord) {
            return new Response(
                JSON.stringify({
                    error: 'Internal Server Error',
                    message: 'Failed to fetch user record',
                    code: 'USER_FETCH_ERROR',
                } as ErrorResponse),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Resolve avatar URL with fallback logic
        let avatarUrl = body.selfie_public_url;

        // If no selfie provided, try to use avatar from user profile
        if (!avatarUrl && userRecord.avatar_url) {
            avatarUrl = userRecord.avatar_url;
            console.log('Using avatar from user profile:', avatarUrl);
        }

        // Final fallback to placeholder
        if (!avatarUrl) {
            avatarUrl = 'https://via.placeholder.com/200';
            console.log('No avatar found, using placeholder');
        }

        // Generate origin story and habit plan in parallel to reduce latency
        let heroProfile: string;
        let themeProfile: string;
        let originChapterTitle: string;
        let originChapterText: string;
        let sagaSummaryShort: string;
        let lastChapterSummary: string;
        let habitPlan: HabitTask[] | null = null;

        try {
            const [originStoryResult, habitPlanResult] = await Promise.allSettled([
                generateOriginStory({
                    selfiePublicUrl: avatarUrl,
                    theme: body.theme,
                    goalTitle: body.title,
                    goalDescription: body.description,
                    context: {
                        currentFrequency: body.context_current_frequency,
                        biggestBlocker: body.context_biggest_blocker,
                        currentStatus: body.context_current_status,
                        notes: body.context_notes,
                        pastEfforts: body.context_past_efforts,
                    },
                    userProfile: {
                        name: userRecord.display_name,
                        age: userRecord.age_range,
                        bio: userRecord.bio,
                    },
                }),
                generateHabitPlan({
                    goalText: body.title,
                    goalDescription: body.description,
                    cadence: body.cadence,
                    targetDate: body.target_date,
                    context: {
                        currentFrequency: body.context_current_frequency,
                        biggestBlocker: body.context_biggest_blocker,
                        currentStatus: body.context_current_status,
                        notes: body.context_notes,
                        pastEfforts: body.context_past_efforts,
                    },
                    habitCueContext: {
                        timeWindow: body.habit_cue_time_window,
                        location: body.habit_cue_location,
                    },
                    userProfile: {
                        name: userRecord.display_name,
                        age: userRecord.age_range,
                    },
                }),
            ]);

            // Handle Origin Story Result
            if (originStoryResult.status === 'fulfilled') {
                const originStory = originStoryResult.value;
                heroProfile = originStory.heroProfile;
                themeProfile = originStory.themeProfile;
                originChapterTitle = originStory.originChapterTitle;
                originChapterText = originStory.originChapterText;
                sagaSummaryShort = originStory.sagaSummaryShort;
                lastChapterSummary = originStory.lastChapterSummary;
            } else {
                console.error('Error generating origin story:', originStoryResult.reason);
                // Fallback values
                heroProfile = 'A determined hero ready to begin their journey.';
                themeProfile = `A ${body.theme} world filled with adventure.`;
                originChapterTitle = 'Chapter 1: The Beginning';
                originChapterText = 'Your journey begins here. The path ahead is filled with challenges and triumphs.';
                sagaSummaryShort = 'A new hero embarks on a quest to achieve their goal.';
                lastChapterSummary = 'The hero takes their first step forward.';
            }

            // Handle Habit Plan Result
            if (habitPlanResult.status === 'fulfilled') {
                habitPlan = habitPlanResult.value;
                console.log(`Generated ${habitPlan.length} habit(s) for goal:`, body.title);
            } else {
                console.error('Error generating habit plan:', habitPlanResult.reason);
                habitPlan = null;
            }

        } catch (unexpectedError) {
            console.error('Unexpected error in parallel generation:', unexpectedError);
            // Fallback for everything if Promise.allSettled itself fails (unlikely)
            heroProfile = 'A determined hero ready to begin their journey.';
            themeProfile = `A ${body.theme} world filled with adventure.`;
            originChapterTitle = 'Chapter 1: The Beginning';
            originChapterText = 'Your journey begins here. The path ahead is filled with challenges and triumphs.';
            sagaSummaryShort = 'A new hero embarks on a quest to achieve their goal.';
            lastChapterSummary = 'The hero takes their first step forward.';
            habitPlan = null;
        }

        // Create goal record with AI-generated summaries
        const { data: goal, error: goalError } = await supabase
            .from('goals')
            .insert({
                user_id: user.id,
                title: body.title,
                description: body.description || null,
                target_date: body.target_date,
                cadence: body.cadence,
                theme: body.theme,
                hero_profile: heroProfile,
                theme_profile: themeProfile,
                saga_summary_short: sagaSummaryShort,
                last_chapter_summary: lastChapterSummary,
                habit_plan: habitPlan, // NEW: store generated habit plan
                status: 'active',
                context_current_frequency: body.context_current_frequency,
                context_biggest_blocker: body.context_biggest_blocker,
                context_current_status: body.context_current_status,
                context_notes: body.context_notes,
                context_past_efforts: body.context_past_efforts,
                habit_cue_time_window: body.habit_cue_time_window,
                habit_cue_location: body.habit_cue_location,
            })
            .select()
            .single();

        if (goalError || !goal) {
            return new Response(
                JSON.stringify({
                    error: 'Internal Server Error',
                    message: 'Failed to create goal',
                    code: 'GOAL_CREATE_ERROR',
                } as ErrorResponse),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Log goal content for moderation review (non-blocking)
        logGoalContentForReview(user.id, goal.id, {
            title: body.title,
            description: body.description,
            contextNotes: body.context_notes,
            contextBlocker: body.context_biggest_blocker,
            contextPastEfforts: body.context_past_efforts,
        }).catch((err) => console.error('Moderation logging failed:', err));

        // Check panel quota for async image generation
        const tier = userRecord.subscription_tier;

        // Calculate panel usage based on tier
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // For free tier, count lifetime usage; for paid tiers, count monthly usage
        let usageQuery = supabase
            .from('usage_panels')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (tier !== 'free') {
            usageQuery = usageQuery.gte('created_at', startOfMonth.toISOString());
        }

        const { count: panelUsage } = await usageQuery;

        // Check quota limits
        const quotaLimits: Record<string, number> = {
            free: 4,      // 4 panels lifetime
            plus: 10,     // 10 panels/month
            premium: 30,  // 30 panels/month
        };

        const limit = quotaLimits[tier];
        const canGeneratePanel = (panelUsage || 0) < limit;

        // Create origin chapter (image generated async)
        const { data: originChapter, error: chapterError } = await supabase
            .from('chapters')
            .insert({
                goal_id: goal.id,
                user_id: user.id,
                chapter_index: 1,
                date: new Date().toISOString().split('T')[0],
                outcome: 'origin',
                chapter_title: originChapterTitle,
                chapter_text: originChapterText,
                image_url: null, // Image will be generated async
            })
            .select()
            .single();

        if (chapterError || !originChapter) {
            return new Response(
                JSON.stringify({
                    error: 'Internal Server Error',
                    message: 'Failed to create origin chapter',
                    code: 'CHAPTER_CREATE_ERROR',
                } as ErrorResponse),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Trigger async image generation if quota allows
        if (canGeneratePanel) {
            const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
            const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

            // Fire-and-forget: trigger async image generation
            fetch(`${supabaseUrl}/functions/v1/generate-chapter-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                },
                body: JSON.stringify({
                    chapter_id: originChapter.id,
                    goal_id: goal.id,
                    hero_profile: heroProfile,
                    theme_profile: themeProfile,
                    theme: body.theme,
                    outcome: 'origin',
                    chapter_title: originChapterTitle,
                    chapter_text: originChapterText,
                    avatar_url: avatarUrl,
                    user_profile: {
                        name: userRecord.display_name,
                        age: userRecord.age_range,
                        bio: userRecord.bio,
                    },
                }),
            }).then(() => {
                console.log('✅ Async image generation triggered for chapter:', originChapter.id);
            }).catch((err) => {
                console.error('❌ Failed to trigger async image generation:', err);
            });
        }

        // Return success response immediately (image will be generated in background)
        const response: CreateGoalAndOriginResponse = {
            goal,
            originChapter,
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in create-goal-and-origin:', error);
        captureException(error, { userId });
        await flush();
        return new Response(
            JSON.stringify({
                error: 'Internal Server Error',
                message: error instanceof Error ? error.message : 'Unknown error',
                code: 'INTERNAL_ERROR',
            } as ErrorResponse),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
