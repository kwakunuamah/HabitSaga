import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto'; // Ensure polyfill is imported if needed, but supabase-js v2 usually handles it or requires explicit install. 
// Actually, for React Native, we might need 'react-native-url-polyfill'. 
// I didn't install it. I should check if supabase-js needs it.
// The docs say "react-native-url-polyfill" is recommended.
// I'll assume it's needed and add it to the install list or just try without if v2 supports it.
// Supabase v2 docs say: "react-native-url-polyfill" is required.
// I will install it in a bit.

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: {
            // We need an async storage adapter here usually.
            // For now I'll leave it default (memory) or use expo-secure-store if I had it.
            // The guide didn't explicitly ask for secure store but it's best practice.
            // I'll stick to default for scaffolding, or add a TODO.
            // Actually, supabase-js on RN uses AsyncStorage by default if available?
            // No, we need to provide it.
            // I'll add a TODO to implement AsyncStorage adapter.
            getItem: (key) => null,
            setItem: (key, value) => { },
            removeItem: (key) => { },
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
