// Habit Saga - Complete Goal Edge Function
// POST /functions/v1/complete-goal
//
// Handles goal completion, generates season finale chapter,
// and updates goal status.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type {
    ErrorResponse,
    SubscriptionTier,
} from '../_shared/types.ts';
import { generateFinaleNarrative } from '../_shared/geminiText.ts';
import { generatePanelImage } from '../_shared/geminiImage.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { initSentry, captureException, flush } from '../_shared/sentry.ts';

// Initialize Sentry for this Edge Function
initSentry('complete-goal');

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
        const { goal_id } = await req.json();

        if (!goal_id) {
            return new Response(
                JSON.stringify({
                    error: 'Bad Request',
                    message: 'Missing goal_id',
                    code: 'VALIDATION_ERROR',
                } as ErrorResponse),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Fetch goal
        const { data: goal, error: goalError } = await supabase
            .from('goals')
            .select('*')
            .eq('id', goal_id)
            .single();

        if (goalError || !goal) {
            return new Response(
                JSON.stringify({
                    error: 'Not Found',
                    message: 'Goal not found',
                    code: 'GOAL_NOT_FOUND',
                } as ErrorResponse),
                {
                    status: 404,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        if (goal.user_id !== user.id) {
            return new Response(
                JSON.stringify({
                    error: 'Forbidden',
                    message: 'Goal does not belong to user',
                    code: 'FORBIDDEN',
                } as ErrorResponse),
                {
                    status: 403,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Calculate next chapter index
        const { count: chapterCount } = await supabase
            .from('chapters')
            .select('*', { count: 'exact', head: true })
            .eq('goal_id', goal_id);

        const nextChapterIndex = (chapterCount || 0) + 1;

        // Generate finale narrative
        let finaleChapterTitle: string;
        let finaleChapterText: string;
        let finalSagaSummary: string;
        let celebrationMessage: { headline: string; body: string };

        try {
            const finale = await generateFinaleNarrative({
                heroProfile: goal.hero_profile || 'A determined hero',
                themeProfile: goal.theme_profile || `A ${goal.theme} world`,
                sagaSummaryShort: goal.saga_summary_short,
                lastChapterSummary: goal.last_chapter_summary,
                goalTitle: goal.title,
                targetDate: goal.target_date,
                totalChapters: nextChapterIndex,
            });
            finaleChapterTitle = finale.finaleChapterTitle;
            finaleChapterText = finale.finaleChapterText;
            finalSagaSummary = finale.finalSagaSummary;
            celebrationMessage = finale.celebrationMessage;
        } catch (error) {
            console.error('Error generating finale:', error);
            finaleChapterTitle = 'The Grand Finale';
            finaleChapterText = 'The hero stands triumphant, having achieved their goal against all odds. The journey was long, but the reward is sweet.';
            finalSagaSummary = 'The hero completed their quest and became a legend.';
            celebrationMessage = {
                headline: 'Congratulations!',
                body: 'You did it! You completed your goal.',
            };
        }

        // Check quota for finale image (prioritize this!)
        const { data: userRecord } = await supabase
            .from('users')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();

        const tier = userRecord?.subscription_tier || 'free';

        // Check usage
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        let usageQuery = supabase
            .from('usage_panels')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (tier !== 'free') {
            usageQuery = usageQuery.gte('created_at', startOfMonth.toISOString());
        }
        const { count: panelUsage } = await usageQuery;

        const quotaLimits: Record<string, number> = {
            free: 4,
            plus: 10,
            premium: 30,
        };

        const limit = quotaLimits[tier] || 0;
        const hasQuota = (panelUsage || 0) < limit;

        let imageUrl: string | null = null;
        let panelGenerated = false;

        if (hasQuota) {
            try {
                const imageBytes = await generatePanelImage({
                    heroProfile: goal.hero_profile,
                    themeProfile: goal.theme_profile,
                    theme: goal.theme, // Pass theme key for visual style matching
                    outcome: 'completed',
                    chapterTitle: finaleChapterTitle,
                    chapterText: finaleChapterText,
                });

                const imagePath = `${user.id}/${goal.id}/finale-${Date.now()}.png`;
                const { error: uploadError } = await supabaseAdmin.storage
                    .from('panels')
                    .upload(imagePath, imageBytes, {
                        contentType: 'image/png',
                        upsert: false,
                    });

                if (!uploadError) {
                    imageUrl = imagePath;
                    panelGenerated = true;
                }
            } catch (error) {
                console.error('Finale image generation failed:', error);
            }
        }

        // Create finale chapter
        const { data: chapter, error: chapterError } = await supabase
            .from('chapters')
            .insert({
                goal_id: goal_id,
                user_id: user.id,
                chapter_index: nextChapterIndex,
                date: new Date().toISOString().split('T')[0],
                outcome: 'completed',
                chapter_title: finaleChapterTitle,
                chapter_text: finaleChapterText,
                image_url: imageUrl,
            })
            .select()
            .single();

        if (chapterError) throw chapterError;

        // Record usage if image generated
        if (panelGenerated && imageUrl) {
            await supabaseAdmin.from('usage_panels').insert({
                user_id: user.id,
                goal_id: goal_id,
                chapter_id: chapter.id,
            });
        }

        // Update goal status
        const { data: updatedGoal, error: updateError } = await supabase
            .from('goals')
            .update({
                status: 'completed',
                saga_summary_short: finalSagaSummary,
                last_chapter_summary: 'The saga concluded with a grand finale.',
            })
            .eq('id', goal_id)
            .select()
            .single();

        if (updateError) throw updateError;

        return new Response(
            JSON.stringify({
                finaleChapter: chapter,
                goal: updatedGoal,
                celebrationMessage,
                canStartSeason2: true,
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );

    } catch (error) {
        console.error('Error in complete-goal:', error);
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
