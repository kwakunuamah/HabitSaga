import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { theme } from '../../../theme';
import { habitSagaApi } from '../../../api/habitSagaApi';
import { supabase } from '../../../api/supabaseClient';
import { Chapter, Goal, GoalProgress } from '../../../types';
import { schedulePostCompletionNudge } from '../../../utils/notifications';
import { logger } from '../../../utils/logger';

export default function FinaleScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [goal, setGoal] = useState<Goal | null>(null);
    const [finaleChapter, setFinaleChapter] = useState<Chapter | null>(null);
    const [celebration, setCelebration] = useState<{ headline: string; body: string } | null>(null);
    const [stats, setStats] = useState<GoalProgress | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [startingSeason2, setStartingSeason2] = useState(false);

    useEffect(() => {
        if (id) {
            loadFinale();
        }
    }, [id]);

    const loadFinale = async () => {
        try {
            // Call complete-goal endpoint
            // Note: In a real app, we might check if it's already completed first
            // But the endpoint is idempotent-ish (will return existing if completed)
            const response = await habitSagaApi.completeGoal(id as string);

            setGoal(response.goal);
            setFinaleChapter(response.finaleChapter);
            setCelebration(response.celebrationMessage);

            // Fetch goal progress for stats
            const progress = await habitSagaApi.getGoalProgress(id as string);
            setStats(progress);

            if (response.finaleChapter.image_url) {
                const { data: { publicUrl } } = supabase.storage
                    .from('panels')
                    .getPublicUrl(response.finaleChapter.image_url);
                setImageUrl(publicUrl);
            }

            // Schedule "Season 2" nudge for 36 hours from now
            try {
                await schedulePostCompletionNudge(
                    id as string,
                    response.goal.title,
                    36 // 1.5 days
                );
                logger.log('Scheduled post-completion nudge');
            } catch (notifError) {
                logger.error('Error scheduling post-completion nudge:', notifError);
            }
        } catch (error) {
            logger.error('Error loading finale:', error);
            Alert.alert('Error', 'Failed to load the finale. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleStartSeason2 = () => {
        Alert.alert(
            'Season 2: Keep building this habit?',
            `Keep your momentum going with Season 2 — same habit, fresh arc.\n\nContinue with ${goal?.hero_profile?.substring(0, 30)}...?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: '4 Weeks', onPress: () => startSeason2(4) },
                { text: '8 Weeks', onPress: () => startSeason2(8) },
                { text: '12 Weeks', onPress: () => startSeason2(12) },
            ]
        );
    };

    const startSeason2 = async (weeks: number) => {
        setStartingSeason2(true);
        try {
            const response = await habitSagaApi.startSeasonTwo(id as string, weeks);
            // Navigate to new goal home
            router.replace(`/(tabs)/home/${response.goal.id}`);
        } catch (error) {
            logger.error('Error starting Season 2:', error);
            Alert.alert('Error', 'Failed to start Season 2.');
        } finally {
            setStartingSeason2(false);
        }
    };

    const handleNewSaga = () => {
        router.push('/goal-wizard/step1');
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <AppText style={{ marginTop: theme.spacing.m }}>Preparing the grand finale...</AppText>
                </View>
            </ScreenWrapper>
        );
    }

    if (!finaleChapter) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <AppText>Something went wrong.</AppText>
                    <Button title="Go Home" onPress={() => router.replace('/(tabs)/home')} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <AppText variant="headingL" style={styles.title}>SEASON FINALE</AppText>

                <Card style={styles.celebrationCard}>
                    <AppText variant="headingM" style={styles.celebrationTitle}>
                        {celebration?.headline || 'Congratulations!'}
                    </AppText>
                    <AppText variant="body" style={styles.celebrationBody}>
                        {celebration?.body}
                    </AppText>
                </Card>

                {stats && (
                    <Card style={styles.statsCard}>
                        <AppText variant="headingS" style={styles.statsTitle}>Saga Stats</AppText>
                        <View style={styles.statRow}>
                            <AppText variant="body">Chapters Completed:</AppText>
                            <AppText variant="body" style={styles.statValue}>{stats.completedCheckins}</AppText>
                        </View>
                        <View style={styles.statRow}>
                            <AppText variant="body">Completion Rate:</AppText>
                            <AppText variant="body" style={styles.statValue}>{Math.round((stats.completedCheckins / stats.totalChapters) * 100)}%</AppText>
                        </View>
                        <View style={styles.statRow}>
                            <AppText variant="body">Goal Hit By:</AppText>
                            <AppText variant="body" style={styles.statValue}>{new Date().toLocaleDateString()}</AppText>
                        </View>
                    </Card>
                )}

                <View style={styles.divider} />

                <AppText variant="headingM" style={styles.chapterTitle}>
                    {finaleChapter.chapter_title}
                </AppText>

                {imageUrl && (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                )}

                <AppText variant="body" style={styles.text}>
                    {finaleChapter.chapter_text}
                </AppText>

                <View style={styles.divider} />

                <AppText variant="headingS" style={styles.nextTitle}>What's Next?</AppText>

                <Button
                    title={startingSeason2 ? "Starting..." : "Create Season 2"}
                    subtitle="Keep your momentum going"
                    onPress={handleStartSeason2}
                    disabled={startingSeason2}
                    style={styles.primaryButton}
                />

                <Button
                    title="Start new saga"
                    subtitle="Start a new adventure based on what you just achieved"
                    variant="secondary"
                    onPress={handleNewSaga}
                    style={styles.secondaryButton}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: theme.spacing.m,
        paddingBottom: theme.spacing.xxl,
    },
    title: {
        textAlign: 'center',
        color: theme.colors.primary,
        marginBottom: theme.spacing.l,
        letterSpacing: 2,
    },
    celebrationCard: {
        backgroundColor: theme.colors.surfaceHighlight,
        marginBottom: theme.spacing.xl,
        alignItems: 'center',
        borderColor: theme.colors.primary,
        borderWidth: 1,
    },
    celebrationTitle: {
        color: theme.colors.primary,
        marginBottom: theme.spacing.s,
    },
    celebrationBody: {
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: theme.spacing.xl,
    },
    chapterTitle: {
        textAlign: 'center',
        marginBottom: theme.spacing.m,
    },
    image: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.l,
        backgroundColor: theme.colors.surface,
    },
    text: {
        lineHeight: 24,
        marginBottom: theme.spacing.xl,
    },
    nextTitle: {
        textAlign: 'center',
        marginBottom: theme.spacing.m,
        color: theme.colors.textSecondary,
    },
    primaryButton: {
        marginBottom: theme.spacing.m,
    },
    secondaryButton: {
        marginBottom: theme.spacing.l,
    },
    statsCard: {
        backgroundColor: theme.colors.surface,
        marginBottom: theme.spacing.xl,
        padding: theme.spacing.m,
    },
    statsTitle: {
        marginBottom: theme.spacing.m,
        color: theme.colors.text,
        textAlign: 'center',
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.s,
    },
    statValue: {
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
});
