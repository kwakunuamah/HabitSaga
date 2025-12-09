// Habit Saga - Supabase Admin Client (Service Role)
// This client bypasses RLS and is used for privileged operations:
// - Inserting into usage_panels (RLS blocks direct user inserts)
// - Uploading to panels storage bucket (service_role only policy)

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

let _supabaseAdmin: SupabaseClient | null = null;

/**
 * Get or create the Supabase admin client (service role)
 * Lazy initialization to avoid errors at module load time
 */
export function getSupabaseAdmin(): SupabaseClient {
    if (_supabaseAdmin) {
        return _supabaseAdmin;
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error(
            'Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
        );
    }

    // Create service-role client (bypasses RLS)
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return _supabaseAdmin;
}

// Export for backwards compatibility (lazy getter)
export const supabaseAdmin = {
    get storage() {
        return getSupabaseAdmin().storage;
    },
    from(table: string) {
        return getSupabaseAdmin().from(table);
    },
};

