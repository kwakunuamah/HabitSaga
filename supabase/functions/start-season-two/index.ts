// Habit Saga - Start Season Two Edge Function
// POST /functions/v1/start-season-two
//
// Creates a new goal (Season 2) based on a completed goal.
// Copies hero, theme, and cadence. Sets new target date.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { ErrorResponse } from '../_shared/types.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: { Authorization: req.headers.get('Authorization')! },
            },
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        }

        const { previous_goal_id, duration_weeks } = await req.json();

        if (!previous_goal_id || !duration_weeks) {
            return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: corsHeaders });
        }

        // Fetch previous goal
        const { data: prevGoal, error: fetchError } = await supabase
            .from('goals')
            .select('*')
            .eq('id', previous_goal_id)
            .single();

        if (fetchError || !prevGoal) {
            return new Response(JSON.stringify({ error: 'Goal not found' }), { status: 404, headers: corsHeaders });
        }

        if (prevGoal.user_id !== user.id) {
            return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
        }

        // Calculate new target date
        const startDate = new Date();
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + (duration_weeks * 7));

        // Calculate new season number
        let nextSeason = 2;
        let baseTitle = prevGoal.title;

        // Check if title already has (Season X)
        const seasonMatch = prevGoal.title.match(/(.*)\s+\(Season\s+(\d+)\)$/i);
        if (seasonMatch) {
            baseTitle = seasonMatch[1];
            nextSeason = parseInt(seasonMatch[2]) + 1;
        }

        const newTitle = `${baseTitle} (Season ${nextSeason})`;
        const newSagaSummary = `Season ${nextSeason} begins. ${prevGoal.saga_summary_short || ''}`;

        // Create Season X goal
        const { data: newGoal, error: createError } = await supabase
            .from('goals')
            .insert({
                user_id: user.id,
                title: newTitle,
                description: prevGoal.description,
                target_date: targetDate.toISOString().split('T')[0],
                cadence: prevGoal.cadence,
                theme: prevGoal.theme,
                hero_profile: prevGoal.hero_profile,
                theme_profile: prevGoal.theme_profile,
                saga_summary_short: newSagaSummary,
                last_chapter_summary: 'The hero prepares for a new chapter.',
                status: 'active',
                parent_goal_id: prevGoal.id,
                context_current_frequency: prevGoal.context_current_frequency,
                context_biggest_blocker: prevGoal.context_biggest_blocker,
            })
            .select()
            .single();

        if (createError) throw createError;

        // Create Season 2 Origin Chapter (Chapter 1)
        // Simple text generation or reuse logic
        const { data: chapter, error: chapterError } = await supabase
            .from('chapters')
            .insert({
                goal_id: newGoal.id,
                user_id: user.id,
                chapter_index: 1,
                date: new Date().toISOString().split('T')[0],
                outcome: 'origin',
                chapter_title: 'Season 2: A New Beginning',
                chapter_text: 'The hero returns, seasoned by past victories but facing new challenges. The journey continues.',
                image_url: null, // Optional: could generate image if quota allows
            })
            .select()
            .single();

        if (chapterError) throw chapterError;

        return new Response(
            JSON.stringify({ goal: newGoal, firstChapter: chapter }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error in start-season-two:', error);
        return new Response(
            JSON.stringify({ error: 'Internal Server Error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
