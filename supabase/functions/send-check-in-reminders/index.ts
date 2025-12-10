// Habit Saga - Send Check-in Reminders
// Scheduled Function (Cron)
//
// Sends push notifications to users who have check-in reminders enabled
// and whose preferred time matches the current hour.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { initSentry, captureException, flush } from '../_shared/sentry.ts';

// Initialize Sentry for this Edge Function
initSentry('send-check-in-reminders');

const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';

serve(async (req) => {
    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Get current hour (UTC)
        const now = new Date();
        const currentHour = now.getUTCHours();

        // We need to match users whose local check_in_time corresponds to this UTC hour.
        // Since we store check_in_time as local time (e.g., 20:00:00) and timezone (e.g., 'America/New_York'),
        // doing this query efficiently in SQL is tricky without timezone conversion functions.

        // SIMPLIFICATION FOR MVP:
        // We'll just assume a default timezone or send to everyone at a fixed UTC time if we can't easily map.
        // BETTER: Store check_in_time_utc in the database computed from local time + offset.
        // OR: Fetch all users with notifications enabled and filter in code (okay for small scale).

        // Let's fetch all users with notifications enabled
        const { data: users, error } = await supabase
            .from('users')
            .select('id, expo_push_token, timezone, check_in_time')
            .eq('notifications_enabled', true)
            .not('expo_push_token', 'is', null);

        if (error) throw error;

        const messages: any[] = [];

        for (const user of users || []) {
            if (!user.expo_push_token) continue;

            // Check if it's time to send (approximate logic)
            // Convert current UTC time to user's timezone
            // If user.timezone is missing, default to UTC
            try {
                const userTime = new Date(now.toLocaleString('en-US', { timeZone: user.timezone || 'UTC' }));
                const userHour = userTime.getHours();

                // Parse preferred hour (e.g., "20:00:00" -> 20)
                const [preferredHourStr] = (user.check_in_time || '20:00:00').split(':');
                const preferredHour = parseInt(preferredHourStr, 10);

                // If hours match, send notification
                if (userHour === preferredHour) {
                    messages.push({
                        to: user.expo_push_token,
                        sound: 'default',
                        title: 'Time to Check In',
                        body: 'Update your story! Your hero is waiting.',
                        data: { url: '/(tabs)/home' },
                    });
                }
            } catch (err) {
                console.error(`Error processing user ${user.id}:`, err);
            }
        }

        // Send batches to Expo
        if (messages.length > 0) {
            await fetch(EXPO_PUSH_API_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messages),
            });
        }

        return new Response(JSON.stringify({ sent: messages.length }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error sending reminders:', error);
        captureException(error);
        await flush();
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
