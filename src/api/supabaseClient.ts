import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
