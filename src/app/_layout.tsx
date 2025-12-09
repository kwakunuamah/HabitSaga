import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../state/AuthContext';
import { RevenueCatProvider } from '../providers/RevenueCatProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { registerForPushNotificationsAsync } from '../utils/notifications';
import { habitSagaApi } from '../api/habitSagaApi';
import { logger } from '../utils/logger';

function RootLayoutNav() {
    const { session, loading, profile } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    // Request notification permissions and save push token once authenticated
    useEffect(() => {
        async function setupNotifications() {
            if (!session) return;

            // Skip if user is still in onboarding (profile not complete yet)
            // This prevents the notification setup from interfering with onboarding flow
            if (!profile?.display_name) {
                logger.log('⏭️ Skipping push notification setup - user still in onboarding');
                return;
            }

            try {
                logger.log('🔔 Starting push notification setup...');

                // Create a timeout promise to prevent indefinite hangs
                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error('Push notification setup timed out')), 3000);
                });

                // Race the notification setup against the timeout
                const notificationPromise = (async () => {
                    const token = await registerForPushNotificationsAsync();
                    if (token) {
                        await habitSagaApi.updatePushToken(token);
                        logger.log('✅ Push token registered successfully');
                    } else {
                        logger.log('⚠️ Push token not available (permissions denied or not supported)');
                    }
                })();

                await Promise.race([notificationPromise, timeoutPromise]);
            } catch (error) {
                // Log the error but don't block the user experience
                logger.error('⚠️ Non-blocking error setting up notifications:', error);
                logger.log('ℹ️ App will continue normally without push notifications');
            }
        }

        setupNotifications();
    }, [session, profile]);

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inOnboardingGroup = segments[0] === 'onboarding';
        const inGoalWizardGroup = segments[0] === 'goal-wizard';
        const inTabsGroup = segments[0] === '(tabs)';

        if (!session && !inAuthGroup) {
            // Not logged in and not in auth screens
            // If we are at the root (Landing Page), do nothing.
            // If we are deeper in the app (but not in auth), redirect to Landing Page.
            const isRoot = segments.length === 0;
            if (!isRoot) {
                router.replace('/');
            }
        } else if (session && !profile?.display_name && !inOnboardingGroup) {
            // Check for incomplete onboarding FIRST (before redirecting from auth)
            // This prevents the race condition where new users skip onboarding
            router.replace('/onboarding/tutorial');
        } else if (session && inAuthGroup) {
            // Logged in with complete profile but in auth screens → redirect to home
            router.replace('/(tabs)/home');
        }
        // Allow free navigation within onboarding, goal-wizard, and tabs
    }, [session, loading, segments, profile]);

    return <Slot />;
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <RevenueCatProvider>
                    <RootLayoutNav />
                    <StatusBar style="dark" />
                </RevenueCatProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
