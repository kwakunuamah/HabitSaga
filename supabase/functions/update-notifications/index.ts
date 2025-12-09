// Habit Saga - Update Notification Preferences Edge Function
// POST /functions/v1/update-notifications
//
// Updates user notification preferences and Expo push token.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type {
    UpdateNotificationsRequest,
    UpdateNotificationsResponse,
    ErrorResponse,
} from '../_shared/types.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

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
        const body: UpdateNotificationsRequest = await req.json();

        // Validate required fields
        if (typeof body.notifications_enabled !== 'boolean') {
            return new Response(
                JSON.stringify({
                    error: 'Bad Request',
                    message: 'Missing or invalid field: notifications_enabled (must be boolean)',
                    code: 'VALIDATION_ERROR',
                } as ErrorResponse),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Build update object
        const updateData: {
            notifications_enabled: boolean;
            expo_push_token?: string | null;
        } = {
            notifications_enabled: body.notifications_enabled,
        };

        // Update expo_push_token if provided
        if (body.expo_push_token !== undefined) {
            updateData.expo_push_token = body.expo_push_token || null;
        }

        // Update user record
        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id)
            .select()
            .single();

        if (updateError || !updatedUser) {
            return new Response(
                JSON.stringify({
                    error: 'Internal Server Error',
                    message: 'Failed to update notification preferences',
                    code: 'UPDATE_ERROR',
                } as ErrorResponse),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Return success response
        const response: UpdateNotificationsResponse = {
            user: updatedUser,
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in update-notifications:', error);
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


