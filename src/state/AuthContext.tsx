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
        const MAX_RETRIES = 1; // Reduced from 2 for faster failure
        const TIMEOUT_MS = 5000; // 5 seconds per attempt (reduced from 8s)

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
        let initialAuthResolved = false;

        // Fallback timeout in case onAuthStateChange never fires
        const fallbackTimeout = setTimeout(() => {
            if (!initialAuthResolved) {
                logger.warn('AuthContext: Auth timeout - onAuthStateChange did not fire within 10s');
                initialAuthResolved = true;
                setLoading(false);
            }
        }, 10000);

        // Listen for auth changes - this is the source of truth for session state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            logger.log('AuthContext: onAuthStateChange event:', event, 'session:', !!session);

            setSession(session);

            if (session?.user) {
                // Don't await - let profile fetch happen in background for faster perceived load
                // The profile status will update when fetch completes
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                // Only set 'not_found' if this is from INITIAL_SESSION event (no session persisted)
                // or from an explicit sign-out. For other events, keep as 'checking'.
                if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
                    setProfileStatus('not_found');
                }
            }

            // Resolve initial auth on INITIAL_SESSION or TOKEN_REFRESHED
            // TOKEN_REFRESHED can fire first if there's a stored session that needs refreshing
            // INITIAL_SESSION fires after Supabase has checked AsyncStorage for persisted session
            const isInitialAuthEvent = event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN';
            if (isInitialAuthEvent && !initialAuthResolved) {
                initialAuthResolved = true;
                clearTimeout(fallbackTimeout);
                logger.log(`AuthContext: Initial auth resolved via ${event}, setting loading to false`);
                setLoading(false);
            }
        });

        return () => {
            clearTimeout(fallbackTimeout);
            subscription.unsubscribe();
        };
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
