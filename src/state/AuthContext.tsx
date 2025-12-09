import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../api/supabaseClient';
import { logger } from '../utils/logger';

interface UserProfile {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    // Add other fields as needed
}

// Profile status to distinguish between "checking", "found", "not_found", and "error"
type ProfileStatus = 'checking' | 'found' | 'not_found' | 'error';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: UserProfile | null;
    profileStatus: ProfileStatus;
    loading: boolean;
    signIn: () => void; // Placeholder for demo
    signOut: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    profileStatus: 'checking',
    loading: true,
    signIn: () => { },
    signOut: () => { },
    refreshProfile: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileStatus, setProfileStatus] = useState<ProfileStatus>('checking');
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string, retryCount = 0): Promise<boolean> => {
        const MAX_RETRIES = 2;
        const TIMEOUT_MS = 8000; // 8 seconds per attempt

        try {
            logger.log('🔍 Fetching profile for user:', userId, retryCount > 0 ? `(retry ${retryCount})` : '');
            setProfileStatus('checking');

            // Create a timeout promise for the fetch
            const fetchTimeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Profile fetch timed out')), TIMEOUT_MS);
            });

            const fetchPromise = supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            // Race the fetch against the timeout
            const { data, error } = await Promise.race([fetchPromise, fetchTimeoutPromise]) as any;

            if (error) {
                logger.error('❌ Error fetching profile:', error);
                setProfileStatus('error');
                return false;
            } else if (data) {
                logger.log('✅ Profile fetched successfully:', data);
                setProfile(data);
                setProfileStatus('found');
                return true;
            } else {
                // No data means profile genuinely doesn't exist - user needs onboarding
                logger.warn('⚠️ No profile data found - user needs to complete onboarding');
                setProfile(null);
                setProfileStatus('not_found');
                return true; // Return true because check completed successfully
            }
        } catch (e) {
            logger.error('💥 Exception fetching profile:', e);

            // Retry on timeout
            if (retryCount < MAX_RETRIES) {
                logger.log(`🔄 Retrying profile fetch (${retryCount + 1}/${MAX_RETRIES})...`);
                return fetchProfile(userId, retryCount + 1);
            }

            setProfileStatus('error');
            return false;
        }
    };

    useEffect(() => {
        // Check active session
        const initSession = async () => {
            let foundSession: Session | null = null;

            try {
                // Create a timeout promise for SESSION check only (5s should be plenty)
                const sessionTimeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error('Session check timed out')), 5000);
                });

                // Race the session check against the timeout
                const sessionPromise = supabase.auth.getSession();
                const result = await Promise.race([sessionPromise, sessionTimeoutPromise]);
                const { data: { session } } = result;

                foundSession = session;
                setSession(session);
            } catch (error) {
                logger.error('AuthContext: Session check error or timeout:', error);
                // Session check failed - assume no session
                setSession(null);
                setProfile(null);
                setProfileStatus('error');
                setLoading(false);
                return;
            }

            // Now fetch profile separately - don't let session timeout affect this
            // Profile fetch has its own retry logic
            if (foundSession?.user) {
                try {
                    await fetchProfile(foundSession.user.id);
                } catch (error) {
                    logger.error('AuthContext: Profile fetch failed:', error);
                    // Profile failed but we still have a valid session
                    // profileStatus is already set by fetchProfile
                }
            } else {
                setProfileStatus('not_found');
            }

            logger.log('AuthContext: Setting loading to false');
            setLoading(false);
        };

        initSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setProfileStatus('not_found');
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            // Create a timeout promise (2 seconds)
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Sign out timed out')), 2000);
            });

            // Race the sign out against the timeout
            await Promise.race([supabase.auth.signOut(), timeoutPromise]);
        } catch (error) {
            logger.error('AuthContext: Sign out error or timeout:', error);
        } finally {
            // Always clear local state
            setSession(null);
            setProfile(null);
            setProfileStatus('checking');
        }
    };

    const signIn = () => {
        // Just a stub for now if we want to manually trigger something, 
        // but usually we call supabase.auth.signInWithPassword directly in components.
    }

    const refreshProfile = async () => {
        if (session?.user) {
            await fetchProfile(session.user.id);
        }
    };

    return (
        <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, profileStatus, loading, signIn, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
