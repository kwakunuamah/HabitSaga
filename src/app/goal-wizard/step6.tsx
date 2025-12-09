import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Modal, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { WizardProgressBar } from '../../components/WizardProgressBar';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';
import { habitSagaApi } from '../../api/habitSagaApi';
import { Chapter, Goal } from '../../types';
import { useSubscription } from '../../providers/RevenueCatProvider';
import { logger } from '../../utils/logger';

export default function Step6() {
    const router = useRouter();
    const { data, reset } = useWizard();
    const { status } = useSubscription();
    const [loading, setLoading] = useState(true);
    const [originChapter, setOriginChapter] = useState<Chapter | null>(null);
    const [goal, setGoal] = useState<Goal | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);

    useEffect(() => {
        createGoal();
    }, []);

    const createGoal = async () => {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out after 60 seconds')), 60000)
        );

        try {
            logger.log('🚀 Starting goal creation...');
            logger.log('Goal data:', {
                title: data.title,
                target_date: data.target_date,
                cadence: data.cadence,
                theme: data.theme,
                has_selfie: !!data.selfie_uri
            });

            const result = await Promise.race([
                habitSagaApi.createGoalAndOrigin({
                    title: data.title,
                    target_date: data.target_date,
                    cadence: data.cadence,
                    theme: data.theme,
                    selfie_uri: data.selfie_uri,
                    context_current_frequency: data.context_current_frequency,
                    context_biggest_blocker: data.context_biggest_blocker,
                    context_current_status: data.context_current_status,
                    context_notes: data.context_notes,
                    context_past_efforts: data.context_past_efforts,
                    habit_cue_time_window: data.habit_cue_time_window,
                    habit_cue_location: data.habit_cue_location,
                }),
                timeout
            ]) as { goal: Goal; originChapter: Chapter };

            logger.log('✅ Goal created successfully:', result);
            setOriginChapter(result.originChapter);
            setGoal(result.goal);

            // Show paywall for free users after successful creation
            if (status.tier === 'free') {
                setShowPaywall(true);
            }
        } catch (error: any) {
            logger.error('❌ Goal creation failed:', error);
            logger.error('Error name:', error?.name);
            logger.error('Error message:', error?.message);
            logger.error('Error context:', JSON.stringify(error?.context || {}));

            const errorMsg = error?.message || 'Failed to create your saga. Please try again.';
            Alert.alert('Error', errorMsg);

            // Navigate back on error
            router.back();
        } finally {
            logger.log('✅ Setting loading to false');
            setLoading(false);
        }
    };

    const handleContinue = () => {
        setShowPaywall(false);
        handleFinish();
    };

    const handleUpgrade = () => {
        // Navigate to paywall screen
        setShowPaywall(false);
        router.push('/paywall');
    };

    const handleFinish = () => {
        reset();
        if (goal) {
            router.replace(`/(tabs)/home/${goal.id}`);
        } else {
            router.replace('/(tabs)/home');
        }
    };

    if (loading) {
        return (
            <ScreenWrapper style={styles.center}>
                <WizardProgressBar currentStep={11} totalSteps={12} />
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <AppText style={styles.loadingText}>Summoning your origin saga…</AppText>
                <AppText variant="caption">Consulting the oracle (Gemini)...</AppText>
            </ScreenWrapper>
        );
    }

    if (!originChapter) {
        return (
            <ScreenWrapper style={styles.center}>
                <AppText style={{ color: theme.colors.error }}>Failed to generate origin.</AppText>
                <Button title="Retry" onPress={createGoal} style={{ marginTop: 20 }} />
            </ScreenWrapper>
        );
    }

    const tierInfo = {
        free: 'Occasional illustrated scenes (origin & finale).',
        plus: 'Regular illustrated scenes across your journey.',
        premium: 'Heavily illustrated saga, almost every step.',
    };

    return (
        <ScreenWrapper>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Origin Image Panel */}
                {originChapter.image_url ? (
                    <Image
                        source={{ uri: originChapter.image_url }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.panel}>
                        <AppText style={{ color: theme.colors.textSecondary }}>[Origin Comic Panel]</AppText>
                    </View>
                )}

                {/* Title */}
                <AppText variant="headingL" style={styles.title}>{originChapter.chapter_title}</AppText>

                {/* Narrative */}
                <AppText variant="body" style={styles.text}>
                    {originChapter.chapter_text}
                </AppText>

                {/* Explanation */}
                <View style={styles.explanationBox}>
                    <AppText variant="body" style={styles.explanation}>
                        This is just the beginning. As you check in, your saga will grow with new chapters and scenes.
                    </AppText>
                </View>

                {/* Tier info for Plus/Premium users */}
                {status.tier !== 'free' && (
                    <View style={styles.tierNote}>
                        <AppText variant="caption" style={styles.tierNoteText}>
                            ✨ {tierInfo[status.tier]}
                        </AppText>
                    </View>
                )}

                <Button
                    title={showPaywall ? "Continue to Saga" : "Begin Saga"}
                    onPress={showPaywall ? handleContinue : handleFinish}
                    style={styles.button}
                />
            </ScrollView>

            {/* Paywall Modal for Free Tier */}
            <Modal
                visible={showPaywall}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPaywall(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <AppText variant="headingM" style={styles.modalTitle}>
                            Unlock Your Full Saga
                        </AppText>

                        <AppText variant="body" style={styles.modalSubtitle}>
                            Choose how illustrated you want your journey to be:
                        </AppText>

                        {/* Tier Comparison */}
                        <View style={styles.tierComparison}>
                            <View style={styles.tierCard}>
                                <AppText variant="headingS" style={styles.tierLabel}>Free</AppText>
                                <AppText variant="caption" style={styles.tierDescription}>
                                    {tierInfo.free}
                                </AppText>
                            </View>

                            <View style={[styles.tierCard, styles.tierCardHighlight]}>
                                <AppText variant="headingS" style={[styles.tierLabel, styles.tierLabelHighlight]}>Plus</AppText>
                                <AppText variant="caption" style={styles.tierDescription}>
                                    {tierInfo.plus}
                                </AppText>
                            </View>

                            <View style={[styles.tierCard, styles.tierCardPremium]}>
                                <AppText variant="headingS" style={[styles.tierLabel, styles.tierLabelPremium]}>Premium</AppText>
                                <AppText variant="caption" style={styles.tierDescription}>
                                    {tierInfo.premium}
                                </AppText>
                            </View>
                        </View>

                        {/* CTAs */}
                        <Button
                            title="Upgrade for more illustrated scenes"
                            onPress={handleUpgrade}
                            style={styles.modalButton}
                        />
                        <Button
                            title="Continue for free"
                            variant="secondary"
                            onPress={handleContinue}
                            style={styles.modalButton}
                        />
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: theme.spacing.l,
        marginBottom: theme.spacing.s,
    },
    content: {
        flex: 1,
        paddingVertical: theme.spacing.l,
    },
    image: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        marginBottom: theme.spacing.l,
    },
    panel: {
        height: 250,
        backgroundColor: theme.colors.backgroundElevated,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.l,
    },
    title: {
        marginBottom: theme.spacing.m,
        color: theme.colors.primary,
        textAlign: 'center',
    },
    text: {
        marginBottom: theme.spacing.l,
        lineHeight: 24,
    },
    explanationBox: {
        padding: theme.spacing.m,
        backgroundColor: theme.colors.backgroundElevated,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.primary,
        marginBottom: theme.spacing.l,
    },
    explanation: {
        fontStyle: 'italic',
        color: theme.colors.textSecondary,
    },
    tierNote: {
        padding: theme.spacing.m,
        backgroundColor: theme.colors.backgroundElevated,
        borderRadius: 8,
        marginBottom: theme.spacing.l,
    },
    tierNoteText: {
        textAlign: 'center',
        color: theme.colors.primary,
    },
    button: {
        marginTop: theme.spacing.l,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: theme.spacing.xl,
        paddingBottom: theme.spacing.xxl,
    },
    modalTitle: {
        textAlign: 'center',
        marginBottom: theme.spacing.m,
        color: theme.colors.primary,
    },
    modalSubtitle: {
        textAlign: 'center',
        marginBottom: theme.spacing.l,
        color: theme.colors.textSecondary,
    },
    tierComparison: {
        marginBottom: theme.spacing.xl,
    },
    tierCard: {
        padding: theme.spacing.m,
        backgroundColor: theme.colors.backgroundElevated,
        borderRadius: 8,
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    tierCardHighlight: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
    },
    tierCardPremium: {
        borderColor: theme.colors.accent,
        borderWidth: 2,
    },
    tierLabel: {
        marginBottom: theme.spacing.xs,
        fontWeight: 'bold',
    },
    tierLabelHighlight: {
        color: theme.colors.primary,
    },
    tierLabelPremium: {
        color: theme.colors.accent,
    },
    tierDescription: {
        color: theme.colors.textSecondary,
    },
    modalButton: {
        marginBottom: theme.spacing.m,
    },
});
