import { useState, useEffect } from 'react';
import { ActivityIndicator, View, Image, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '../state/AuthContext';
import { theme } from '../theme';
import { logger } from '../utils/logger';

export default function Index() {
    const { session, profile, profileStatus, loading, refreshProfile } = useAuth();
    const router = useRouter();

    const [isReady, setIsReady] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);

    useEffect(() => {
        logger.log('Index: loading=', loading, 'session=', !!session, 'profileStatus=', profileStatus, 'profile=', profile?.display_name);

        if (!loading) {
            if (session) {
                // User is logged in - check profile status
                if (profileStatus === 'found') {
                    // Profile exists - but is it complete?
                    if (profile?.display_name) {
                        // Profile is complete, go to home
                        logger.log('Index: Redirecting to home (profile complete)');
                        router.replace('/(tabs)/home');
                    } else {
                        // Profile exists but incomplete (no display_name) - needs onboarding
                        logger.log('Index: Redirecting to onboarding (profile incomplete - no display_name)');
                        router.replace('/onboarding/tutorial');
                    }
                } else if (profileStatus === 'not_found') {
                    // Profile genuinely doesn't exist, go to onboarding
                    logger.log('Index: Redirecting to onboarding (no profile exists)');
                    router.replace('/onboarding/tutorial');
                } else if (profileStatus === 'error') {
                    // Error loading profile - stay here and show retry option
                    logger.log('Index: Profile load error, showing retry UI');
                    setIsReady(true);
                }
                // If profileStatus is 'checking', keep loading
            } else {
                // Not logged in, stay here (Landing Page)
                setIsReady(true);
            }
        }
    }, [session, profile, profileStatus, loading]);

    const handleRetry = async () => {
        setIsRetrying(true);
        try {
            await refreshProfile();
        } finally {
            setIsRetrying(false);
        }
    };

    // Show loading state while auth is initializing or profile is being checked
    if (loading || (!isReady && profileStatus === 'checking')) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    // Show error retry UI if logged in but profile failed to load
    if (session && profileStatus === 'error') {
        return (
            <View style={{
                flex: 1,
                backgroundColor: theme.colors.background,
                justifyContent: 'center',
                alignItems: 'center',
                padding: theme.spacing.xl,
            }}>
                <StatusBar style="dark" />
                <Image
                    source={require('../../assets/habitChronicle_Clear.png')}
                    style={{
                        width: 150,
                        height: 150,
                        resizeMode: 'contain',
                        marginBottom: theme.spacing.xl,
                    }}
                />
                <Text style={{
                    color: theme.colors.text,
                    fontSize: theme.typography.sizes.lg,
                    fontWeight: theme.typography.weights.semibold,
                    textAlign: 'center',
                    marginBottom: theme.spacing.m,
                }}>
                    Connection Issue
                </Text>
                <Text style={{
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.sizes.md,
                    textAlign: 'center',
                    marginBottom: theme.spacing.xl,
                }}>
                    We're having trouble loading your profile. Please check your connection and try again.
                </Text>
                <TouchableOpacity
                    onPress={handleRetry}
                    disabled={isRetrying}
                    style={{
                        backgroundColor: theme.colors.primary,
                        paddingVertical: theme.spacing.m,
                        paddingHorizontal: theme.spacing.xl,
                        borderRadius: theme.borderRadius.full,
                        opacity: isRetrying ? 0.6 : 1,
                    }}
                >
                    {isRetrying ? (
                        <ActivityIndicator color={theme.colors.surface} />
                    ) : (
                        <Text style={{
                            color: theme.colors.surface,
                            fontSize: theme.typography.sizes.md,
                            fontWeight: theme.typography.weights.bold,
                        }}>
                            Retry
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    }

    // Landing page for non-logged-in users
    return (
        <View style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            justifyContent: 'space-between',
            padding: theme.spacing.xl,
            paddingTop: 100, // Extra padding for top spacing
            paddingBottom: 60  // Extra padding for bottom spacing
        }}>
            <StatusBar style="dark" />

            {/* Logo Section */}
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Image
                    source={require('../../assets/habitChronicle_Clear.png')}
                    style={{
                        width: 300,
                        height: 300,
                        resizeMode: 'contain'
                    }}
                />
            </View>

            {/* Action Section */}
            <View style={{ width: '100%', gap: theme.spacing.l }}>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/welcome')}
                    style={{
                        backgroundColor: theme.colors.primary,
                        paddingVertical: theme.spacing.l,
                        borderRadius: theme.borderRadius.full,
                        alignItems: 'center',

                    }}
                >
                    <Text style={{
                        color: theme.colors.surface,
                        fontSize: theme.typography.sizes.lg,
                        fontWeight: theme.typography.weights.bold,
                    }}>
                        Get Started
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
