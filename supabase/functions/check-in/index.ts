// Habit Saga - Check-In and Generate Chapter Edge Function
// POST /functions/v1/check-in
//
// Records a check-in outcome (task-based or legacy), generates chapter narrative,
// and optionally generates a panel (if quota allows).

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type {
    CheckInRequest,
    CheckInResponse,
    ErrorResponse,
    SubscriptionTier,
    HabitTask,
    TaskCheckInResult,
} from '../_shared/types.ts';
import { generateChapterNarrative } from '../_shared/geminiText.ts';
import { generatePanelImage } from '../_shared/geminiImage.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(
    status: number,
    body: CheckInResponse | ErrorResponse
): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const authHeader = req.headers.get('Authorization');

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Missing Supabase environment variables');
            return jsonResponse(500, {
                error: 'Internal Server Error',
                message: 'Server configuration error',
                code: 'CONFIG_ERROR',
            });
        }

        if (!authHeader) {
            return jsonResponse(401, {
                error: 'Unauthorized',
                message: 'Authentication required',
                code: 'UNAUTHORIZED',
            });
        }

        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            global: {
                headers: { Authorization: authHeader },
            },
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // Get authenticated user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return jsonResponse(401, {
                error: 'Unauthorized',
                message: 'Authentication required',
                code: 'UNAUTHORIZED',
            });
        }

        // Parse request body
        let body: CheckInRequest;
        try {
            body = await req.json();
        } catch (parseError) {
            return jsonResponse(400, {
                error: 'Bad Request',
                message: 'Invalid JSON in request body',
                code: 'PARSE_ERROR',
            });
        }

        // Validate required fields
        if (!body.goal_id) {
            return jsonResponse(400, {
                error: 'Bad Request',
                message: 'Missing required field: goal_id',
                code: 'VALIDATION_ERROR',
            });
        }

        // Validate outcome OR task_results (one must be provided)
        const hasLegacyOutcome = body.outcome && ['completed', 'partial', 'missed'].includes(body.outcome);
        const hasTaskResults = body.task_results && Array.isArray(body.task_results) && body.task_results.length > 0;

        if (!hasLegacyOutcome && !hasTaskResults) {
            return jsonResponse(400, {
                error: 'Bad Request',
                message: 'Either outcome or task_results must be provided',
                code: 'VALIDATION_ERROR',
            });
        }

        // Determine check-in date (normalized to YYYY-MM-DD)
        const parsedDate = body.checkin_date ? new Date(body.checkin_date) : new Date();
        if (Number.isNaN(parsedDate.getTime())) {
            return jsonResponse(400, {
                error: 'Bad Request',
                message: 'Invalid checkin_date. Must be an ISO date string (YYYY-MM-DD)',
                code: 'VALIDATION_ERROR',
            });
        }
        const checkinDate = parsedDate.toISOString().split('T')[0];

        // Verify goal exists and belongs to user
        const { data: goal, error: goalError } = await supabase
            .from('goals')
            .select(
                'id, user_id, title, theme, hero_profile, theme_profile, saga_summary_short, last_chapter_summary, target_date, cadence, habit_plan, context_current_frequency, context_biggest_blocker, context_current_status, context_notes, context_past_efforts'
            )
            .eq('id', body.goal_id)
            .single();

        if (goalError || !goal) {
            return jsonResponse(404, {
                error: 'Not Found',
                message: 'Goal not found',
                code: 'GOAL_NOT_FOUND',
            });
        }

        if (goal.user_id !== user.id) {
            return jsonResponse(403, {
                error: 'Forbidden',
                message: 'Goal does not belong to user',
                code: 'FORBIDDEN',
            });
        }

        // Get user record
        const { data: userRecord, error: userError } = await supabase
            .from('users')
            .select('subscription_tier, display_name, age_range, bio, avatar_url')
            .eq('id', user.id)
            .single();

        if (userError || !userRecord) {
            return jsonResponse(500, {
                error: 'Internal Server Error',
                message: 'Failed to fetch user record',
                code: 'USER_FETCH_ERROR',
            });
        }

        // ========================================================================
        // PROCESS TASK-BASED OR LEGACY CHECK-IN
        // ========================================================================
        let finalOutcome: 'completed' | 'partial' | 'missed';
        let tasksResults: Record<string, 'full' | 'tiny' | 'missed'> | null = null;
        let updatedHabitPlan: HabitTask[] | null = goal.habit_plan ? JSON.parse(JSON.stringify(goal.habit_plan)) : null;

        if (hasTaskResults && body.task_results) {
            // TASK-BASED CHECK-IN
            const taskResultsMap: Record<string, 'full' | 'tiny' | 'missed'> = {};
            let fullCount = 0;
            let tinyCount = 0;
            let missedCount = 0;

            // Process each task result
            body.task_results.forEach((taskResult: TaskCheckInResult) => {
                taskResultsMap[taskResult.habit_id] = taskResult.outcome;

                // Count outcomes
                if (taskResult.outcome === 'full') fullCount++;
                else if (taskResult.outcome === 'tiny') tinyCount++;
                else if (taskResult.outcome === 'missed') missedCount++;

                // Update habit plan metrics
                if (updatedHabitPlan) {
                    const habitIndex = updatedHabitPlan.findIndex(h => h.id === taskResult.habit_id);
                    if (habitIndex !== -1) {
                        const habit = updatedHabitPlan[habitIndex];
                        if (taskResult.outcome === 'full') {
                            habit.metrics.total_full_completions++;
                        } else if (taskResult.outcome === 'tiny') {
                            habit.metrics.total_tiny_completions++;
                        } else if (taskResult.outcome === 'missed') {
                            habit.metrics.total_missed++;
                        }
                    }
                }
            });

            tasksResults = taskResultsMap;

            // Determine overall outcome from task results
            const totalTasks = body.task_results.length;
            if (fullCount === totalTasks) {
                finalOutcome = 'completed';
            } else if (fullCount + tinyCount > 0) {
                finalOutcome = 'partial';
            } else {
                finalOutcome = 'missed';
            }
        } else {
            // LEGACY CHECK-IN
            finalOutcome = body.outcome!;
        }

        // ========================================================================
        // FETCH LAST 2 CHAPTERS FOR N+2 AI CONTEXT STRATEGY
        // ========================================================================
        const { data: recentChapters, error: chaptersError } = await supabase
            .from('chapters')
            .select('chapter_index, chapter_title, chapter_text')
            .eq('goal_id', body.goal_id)
            .order('chapter_index', { ascending: false })
            .limit(2);

        if (chaptersError) {
            return jsonResponse(500, {
                error: 'Internal Server Error',
                message: 'Failed to fetch recent chapters',
                code: 'CHAPTER_FETCH_ERROR',
            });
        }

        // N-1: Full previous chapter for immediate continuity
        const previousChapter = recentChapters?.[0] || null;
        // N-2: Older chapter summary for broader context
        const olderChapter = recentChapters?.[1] || null;
        const nextChapterIndex = (previousChapter?.chapter_index || 0) + 1;

        // ========================================================================
        // CREATE DRAFT CHAPTER
        // ========================================================================
        const { data: draftChapter, error: draftError } = await supabase
            .from('chapters')
            .insert({
                goal_id: body.goal_id,
                user_id: user.id,
                chapter_index: nextChapterIndex,
                date: checkinDate,
                outcome: finalOutcome,
                note: body.reflection?.note || body.note || null,
                barrier: body.reflection?.barrier || body.barrier || null,
                retry_plan: body.retry_plan || null,
                tasks_results: tasksResults, // NEW: store task outcomes
                tiny_adjustment: body.reflection?.tiny_adjustment || null, // NEW: user's adjustment plan
                chapter_title: 'Pending...', // Placeholder
                chapter_text: null,
                image_url: null,
            })
            .select()
            .single();

        if (draftError || !draftChapter) {
            console.error('Failed to create draft chapter:', draftError);
            return jsonResponse(500, {
                error: 'Internal Server Error',
                message: 'Failed to create draft chapter',
                code: 'CHAPTER_CREATE_ERROR',
            });
        }

        // ========================================================================
        // GENERATE CHAPTER NARRATIVE USING GEMINI
        // ========================================================================
        let chapterTitle: string;
        let chapterText: string;
        let updatedSagaSummary: string;
        let updatedLastChapterSummary: string;
        let encouragement: { headline: string; body: string };
        let microPlan: string;

        // Retry logic for AI generation (3 attempts)
        let attempts = 0;
        const maxAttempts = 3;
        let generationSuccess = false;

        // Default fallback values
        chapterTitle = `Chapter ${nextChapterIndex}: ${finalOutcome === 'completed' ? 'Victory' : finalOutcome === 'partial' ? 'Progress' : 'Setback'}`;
        chapterText = `The hero ${finalOutcome === 'completed' ? 'succeeded' : finalOutcome === 'partial' ? 'made progress' : 'faced a challenge'} today.`;
        updatedSagaSummary = goal.saga_summary_short || 'An ongoing saga of determination.';
        updatedLastChapterSummary = `The hero ${finalOutcome === 'completed' ? 'achieved their goal' : finalOutcome === 'partial' ? 'made progress' : 'faced a setback'} on this day.`;
        encouragement = {
            headline: 'Keep going!',
            body: 'Every step counts. You got this.',
        };
        microPlan = 'Keep pushing forward!';

        while (attempts < maxAttempts && !generationSuccess) {
            attempts++;
            try {
                const narrative = await generateChapterNarrative({
                    heroProfile: goal.hero_profile || 'A determined hero',
                    themeProfile: goal.theme_profile || `A ${goal.theme} world`,
                    sagaSummaryShort: goal.saga_summary_short,
                    lastChapterSummary: goal.last_chapter_summary,
                    // N+2 context: full previous chapter + older chapter summary
                    previousChapterText: previousChapter?.chapter_text || null,
                    previousChapterTitle: previousChapter?.chapter_title || null,
                    olderChapterSummary: olderChapter?.chapter_title || null,
                    outcome: finalOutcome,
                    note: body.reflection?.note || body.note,
                    barrier: body.reflection?.barrier || body.barrier,
                    retryPlan: body.reflection?.tiny_adjustment || body.retry_plan,
                    goalTitle: goal.title,
                    context: {
                        currentFrequency: goal.context_current_frequency,
                        biggestBlocker: goal.context_biggest_blocker,
                        currentStatus: goal.context_current_status,
                        notes: goal.context_notes,
                        pastEfforts: goal.context_past_efforts,
                    },
                    userProfile: {
                        name: userRecord.display_name,
                        age: userRecord.age_range,
                        bio: userRecord.bio,
                    },
                });
                chapterTitle = narrative.chapterTitle;
                chapterText = narrative.chapterText;
                updatedSagaSummary = narrative.newSagaSummaryShort;
                updatedLastChapterSummary = narrative.newLastChapterSummary;
                encouragement = narrative.encouragement;
                microPlan = narrative.microPlan;
                generationSuccess = true;
            } catch (narrativeError) {
                console.error(`Attempt ${attempts} failed to generate chapter narrative:`, narrativeError);
                if (attempts >= maxAttempts) {
                    console.error('All attempts failed. Using fallback content.');
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
                }
            }
        }

        // Update chapter with generated content
        const { data: chapter, error: updateChapterError } = await supabase
            .from('chapters')
            .update({
                chapter_title: chapterTitle,
                chapter_text: chapterText,
            })
            .eq('id', draftChapter.id)
            .select()
            .single();

        if (updateChapterError) {
            console.error('Failed to update chapter with narrative:', updateChapterError);
        }

        // Update goal with new summaries AND updated habit plan metrics
        const { error: updateGoalError } = await supabase
            .from('goals')
            .update({
                saga_summary_short: updatedSagaSummary,
                last_chapter_summary: updatedLastChapterSummary,
                habit_plan: updatedHabitPlan, // NEW: save updated metrics
            })
            .eq('id', body.goal_id);

        if (updateGoalError) {
            console.error('Failed to update goal:', updateGoalError);
        }

        // ========================================================================
        // PANEL IMAGE GENERATION (QUOTA-BASED)
        // ========================================================================
        let imageUrl: string | null = null;
        let panelGenerated = false;
        const tier = userRecord.subscription_tier as SubscriptionTier;

        // Calculate panel usage
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let usageQuery = supabase
            .from('usage_panels')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (tier !== 'free') {
            usageQuery = usageQuery.gte('created_at', startOfMonth.toISOString());
        }

        const { count: panelUsage, error: usageFetchError } = await usageQuery;

        if (!usageFetchError) {
            const quotaLimits: Record<SubscriptionTier, number> = {
                free: 4,
                plus: 10,
                premium: 30,
            };

            const limit = quotaLimits[tier] ?? 0;
            const used = panelUsage || 0;
            const hasQuota = used < limit;

            // Determine eligibility
            let isEligible = false;
            if (nextChapterIndex > 1) {
                if (tier === 'premium') {
                    isEligible = (nextChapterIndex - 1) % 2 === 0; // Every other chapter
                } else if (tier === 'plus' || tier === 'free') {
                    isEligible = (nextChapterIndex - 1) % 3 === 0; // Every 3rd chapter
                }
            }

            if (isEligible && hasQuota) {
                try {
                    const imageBytes = await generatePanelImage({
                        heroProfile: goal.hero_profile || 'A determined hero',
                        themeProfile: goal.theme_profile || `A ${goal.theme} world`,
                        theme: goal.theme, // Pass theme key for visual style matching
                        outcome: finalOutcome,
                        chapterTitle,
                        chapterText,
                        avatarUrl: userRecord.avatar_url || null,
                        userProfile: {
                            name: userRecord.display_name,
                            age: userRecord.age_range,
                            bio: userRecord.bio,
                        },
                    });

                    const imagePath = `${user.id}/${goal.id}/chapter_${nextChapterIndex}.png`;

                    const { error: uploadError } = await supabaseAdmin.storage
                        .from('panels')
                        .upload(imagePath, imageBytes, {
                            contentType: 'image/png',
                            upsert: true,
                        });

                    if (!uploadError) {
                        // Get full public URL (consistent with create-goal-and-origin)
                        const { data: urlData } = supabaseAdmin.storage
                            .from('panels')
                            .getPublicUrl(imagePath);
                        imageUrl = urlData.publicUrl;
                        panelGenerated = true;

                        await supabase
                            .from('chapters')
                            .update({ image_url: imageUrl })
                            .eq('id', draftChapter.id);

                        await supabaseAdmin
                            .from('usage_panels')
                            .insert({
                                user_id: user.id,
                                goal_id: goal.id,
                                chapter_id: draftChapter.id,
                            });

                        if (chapter) {
                            chapter.image_url = imageUrl;
                        }
                    }
                } catch (imageError) {
                    console.error('Error generating panel image:', imageError);
                }
            }
        }

        // ========================================================================
        // RETURN RESPONSE
        // ========================================================================
        const { data: updatedGoal } = await supabase
            .from('goals')
            .select('*')
            .eq('id', body.goal_id)
            .single();

        const response: CheckInResponse = {
            goal: updatedGoal || goal,
            chapter: chapter || draftChapter,
            encouragement: {
                headline: encouragement.headline,
                body: encouragement.body,
                microPlan: microPlan,
            },
            panelGenerated,
        };

        return jsonResponse(200, response);
    } catch (error) {
        console.error('Error in check-in:', error);
        return jsonResponse(500, {
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error',
            code: 'INTERNAL_ERROR',
        });
    }
});
