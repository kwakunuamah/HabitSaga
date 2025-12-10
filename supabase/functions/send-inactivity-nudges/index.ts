// Habit Saga - Send Inactivity Nudges Edge Function
// Daily Cron Job
//
// Sends "Don't miss twice" nudges to users who missed a check-in yesterday
// Uses science-backed messaging: encouraging, non-judgmental

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { initSentry, captureException, flush } from '../_shared/sentry.ts';

// Initialize Sentry for this Edge Function
initSentry('send-inactivity-nudges');

const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Get yesterday's date
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD

        // Fetch users with notifications enabled and push tokens
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, expo_push_token')
            .eq('notifications_enabled', true)
            .not('expo_push_token', 'is', null);

        if (usersError) throw usersError;

        const messages: any[] = [];

        for (const user of users || []) {
            if (!user.expo_push_token) continue;

            // Get active goals for this user
            const { data: goals, error: goalsError } = await supabase
                .from('goals')
                .select('id, title, cadence')
                .eq('user_id', user.id)
                .eq('status', 'active');

            if (goalsError) {
                console.error(`Error fetching goals for user ${user.id}:`, goalsError);
                continue;
            }

            for (const goal of goals || []) {
                // Check if yesterday was a scheduled check-in day based on cadence
                const wasCheckInDay = isCheckInDay(yesterday, goal.cadence);

                if (!wasCheckInDay) continue;

                // Check if there's a chapter for yesterday
                const { data: chapters } = await supabase
                    .from('chapters')
                    .select('id')
                    .eq('goal_id', goal.id)
                    .eq('date', yesterdayStr);

                // If no chapter for yesterday, send nudge
                if (!chapters || chapters.length === 0) {
                    messages.push({
                        to: user.expo_push_token,
                        sound: 'default',
                        title: 'Don\'t Miss Twice!',
                        body: `You missed yesterday's check-in for "${goal.title}", but that's okay. Don't miss twice — a tiny check-in today keeps your saga alive.`,
                        data: {
                            type: 'missed_checkin',
                            goalId: goal.id
                        },
                    });
                }
            }
        }

        // Send to Expo Push API
        if (messages.length > 0) {
            const response = await fetch(EXPO_PUSH_API_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messages),
            });

            const responseData = await response.json();
            console.log('Expo Push Response:', responseData);
        }

        return new Response(JSON.stringify({ sent: messages.length }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error sending nudges:', error);
        captureException(error);
        await flush();
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});

// Helper function to determine if a given date is a check-in day based on cadence
function isCheckInDay(date: Date, cadence: any): boolean {
    const { type } = cadence;

    if (type === 'daily') {
        return true;
    } else if (type === '3x_week') {
        // Mon, Wed, Fri = days 1, 3, 5
        const dayOfWeek = date.getDay();
        return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
    }

    // For custom or other types, default to true (could be refined)
    return true;
}
