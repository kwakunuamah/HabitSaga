import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { CachedImage } from '../../../components/CachedImage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { ProgressBar } from '../../../components/ProgressBar';
import { theme } from '../../../theme';
import { habitSagaApi } from '../../../api/habitSagaApi';
import { Chapter, Goal, GoalProgress } from '../../../types';

export default function GoalHome() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [goal, setGoal] = useState<Goal | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [progress, setProgress] = useState<GoalProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [completionModalVisible, setCompletionModalVisible] = useState(false);
    const [chaptersModalVisible, setChaptersModalVisible] = useState(false);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        if (id) {
            loadGoalData();
        }
    }, [id]);

    const loadGoalData = async () => {
        try {
            // Fetch goal
            const goalData = await habitSagaApi.fetchGoal(id as string);
            setGoal(goalData);

            // Fetch chapters
            const chaptersData = await habitSagaApi.fetchChapters(id as string);
            setChapters(chaptersData);

            // Fetch progress
            const progressData = await habitSagaApi.getGoalProgress(id as string);
            setProgress(progressData);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadGoalData();
    };

    const getNextCheckInText = () => {
        if (!goal) return 'Loading...';
        const cadenceType = goal.cadence.type;

        if (cadenceType === 'daily') return 'Daily';
        if (cadenceType === '3x_week') return '3x per week';
        return goal.cadence.details || 'Custom';
    };

    const getExcerpt = (text: string, maxLength: number = 80) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    };

    const shouldSuggestCompletion = () => {
        if (!goal || !progress) return false;
        if (goal.status === 'completed') return false; // Already completed

        const targetDate = new Date(goal.target_date);
        const now = new Date();
        const isTargetReached = now >= targetDate;

        // Simple rule: Suggest if target date reached AND > 60% check-ins (estimated)
        // For MVP, we'll just check if target date is reached.
        // Refinement: Check if we have enough check-ins.
        // Estimate expected check-ins based on days elapsed.
        let expectedCheckins = progress.daysElapsed;
        if (goal.cadence.type === '3x_week') {
            expectedCheckins = Math.ceil(progress.daysElapsed * (3 / 7));
        }

        // Avoid division by zero
        if (expectedCheckins === 0) return isTargetReached;

        const completionRate = progress.completedCheckins / expectedCheckins;

        // Suggest if target reached OR (target reached AND completion rate is decent)
        // For now, let's stick to the requirement: "reached or passed target_date" AND "sufficient number of completed check-ins"
        return isTargetReached && completionRate >= 0.6;
    };

    const handleCompleteGoal = () => {
        setCompletionModalVisible(true);
    };

    const confirmCompletion = async () => {
        try {
            setCompleting(true);
            await habitSagaApi.completeGoal(id as string);
            setCompletionModalVisible(false);
            router.push(`/completion/${id}/finale`);
        } catch (error) {
            console.error('Error completing goal:', error);
            // TODO: Show error toast
        } finally {
            setCompleting(false);
        }
    };

    if (loading || !goal) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <AppText>Loading saga...</AppText>
                </View>
            </ScreenWrapper>
        );
    }

    const showCompletionSuggestion = shouldSuggestCompletion();
    const isActive = goal.status === 'active';

    return (
        <ScreenWrapper>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >
                {/* Saga Title & Header */}
                <View style={styles.header}>
                    <View style={styles.headerTopRow}>
                        <AppText variant="caption" style={styles.currentLabel}>Current Saga</AppText>
                        <View style={[styles.statusBadge, { borderColor: isActive ? theme.colors.success : theme.colors.textSecondary }]}>
                            <AppText style={[styles.statusText, { color: isActive ? theme.colors.success : theme.colors.textSecondary }]}>
                                {isActive ? 'Active' : 'Completed'}
                            </AppText>
                        </View>
                    </View>

                    <AppText variant="headingL" style={styles.goalTitle}>{goal.title}</AppText>
                    <AppText variant="bodySmall" style={styles.themeText}>{goal.theme} Theme</AppText>

                    {goal.parent_goal_id && (
                        <View style={styles.seasonBadge}>
                            <AppText variant="caption" style={styles.seasonText}>Season 2</AppText>
                        </View>
                    )}
                </View>

                {/* Suggested Completion CTA */}
                {showCompletionSuggestion && (
                    <Card style={styles.completionCard}>
                        <AppText variant="headingM" style={styles.completionTitle}>Saga Complete?</AppText>
                        <AppText variant="body" style={styles.completionText}>
                            You've reached your target date and made great progress. Are you ready for the finale?
                        </AppText>
                        <Button
                            title="View Season Finale"
                            onPress={handleCompleteGoal}
                            style={styles.completionButton}
                        />
                    </Card>
                )}

                {/* Habit Plan Progress */}
                {goal?.habit_plan && goal.habit_plan.some(h => h.active) && (
                    <View style={styles.habitPlanSection}>
                        <AppText variant="headingS" style={styles.habitPlanTitle}>Your Habits</AppText>
                        {goal.habit_plan.filter(h => h.active).map(habit => (
                            <Card key={habit.id} style={styles.habitCard}>
                                <AppText variant="body" style={styles.habitLabel}>{habit.label}</AppText>
                                <View style={styles.habitMetrics}>
                                    <View style={styles.metricItem}>
                                        <AppText style={styles.metricIcon}>✅</AppText>
                                        <AppText style={styles.metricCount}>{habit.metrics.total_full_completions}</AppText>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <AppText style={styles.metricIcon}>🌓</AppText>
                                        <AppText style={styles.metricCount}>{habit.metrics.total_tiny_completions}</AppText>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <AppText style={styles.metricIcon}>❌</AppText>
                                        <AppText style={styles.metricCount}>{habit.metrics.total_missed}</AppText>
                                    </View>
                                </View>
                            </Card>
                        ))}
                    </View>
                )}

                {/* Stats / Progress */}
                {progress && (
                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <AppText variant="headingL" style={styles.statValue}>{progress.completedCheckins}</AppText>
                            <AppText style={styles.statLabel}>Check-ins</AppText>
                        </View>
                        <View style={styles.statBox}>
                            <AppText variant="headingL" style={styles.statValue}>{progress.daysElapsed}</AppText>
                            <AppText style={styles.statLabel}>Days In</AppText>
                        </View>
                        <View style={styles.statBox}>
                            <AppText variant="headingL" style={styles.statValue}>{progress.currentStreak}</AppText>
                            <AppText style={styles.statLabel}>Streak</AppText>
                        </View>
                        <View style={styles.statBox}>
                            <AppText variant="headingL" style={styles.statValue}>{progress.longestStreak}</AppText>
                            <AppText style={styles.statLabel}>Best Streak</AppText>
                        </View>
                    </View>
                )}

                {/* Progress Bar */}
                {progress && (
                    <View style={styles.progressSection}>
                        <ProgressBar
                            current={progress.daysElapsed}
                            total={progress.daysElapsed + Math.max(0, progress.daysUntilTarget)}
                            label={`${progress.daysUntilTarget > 0 ? progress.daysUntilTarget + ' days left' : 'Target reached'}`}
                            showLabel
                        />
                    </View>
                )}

                {/* Recent Chapters */}
                <AppText variant="headingS" style={styles.sectionTitle}>Recent Chapters</AppText>

                {chapters.slice(0, 5).map((chapter) => (
                    <TouchableOpacity
                        key={chapter.id}
                        onPress={() => router.push(`/(tabs)/home/chapter/${chapter.id}`)}
                    >
                        <Card style={styles.chapterCard}>
                            {/* Thumbnail */}
                            <View style={styles.chapterThumbnail}>
                                {chapter.image_url ? (
                                    <CachedImage
                                        uri={chapter.image_url}
                                        style={{ width: '100%', height: '100%' }}
                                        borderRadius={8}
                                        alt={`Chapter ${chapter.chapter_index} panel`}
                                    />
                                ) : (
                                    <View style={[styles.center, { opacity: 0.3 }]}>
                                        <AppText style={{ fontSize: 20 }}>
                                            {chapter.outcome === 'completed' ? '✨' : '📝'}
                                        </AppText>
                                    </View>
                                )}
                            </View>

                            {/* Content */}
                            <View style={styles.chapterContent}>
                                <View style={styles.chapterHeader}>
                                    <AppText style={styles.chapterLabel}>
                                        {new Date(chapter.date).toLocaleDateString()}
                                    </AppText>
                                    <AppText style={styles.outcomeIcon}>
                                        {chapter.outcome === 'completed' ? '✅' : chapter.outcome === 'partial' ? '🌓' : chapter.outcome === 'missed' ? '❌' : '⭐'}
                                    </AppText>
                                </View>

                                <AppText variant="headingS" style={styles.chapterTitle} numberOfLines={1}>
                                    {chapter.chapter_title || `Chapter ${chapter.chapter_index}`}
                                </AppText>

                                <AppText style={styles.chapterExcerpt} numberOfLines={2}>
                                    {getExcerpt(chapter.chapter_text || '')}
                                </AppText>
                            </View>
                        </Card>
                    </TouchableOpacity>
                ))}

                {/* Next Check-in Info */}
                {!showCompletionSuggestion && (
                    <View style={styles.checkInInfo}>
                        <AppText variant="bodySmall" style={styles.nextCheckInLabel}>
                            {progress?.isDueToday ? `Next check-in: ${getNextCheckInText()}` : "You're all caught up for today!"}
                        </AppText>
                        <AppText variant="caption" style={styles.checkInHint}>
                            {progress?.isDueToday ? "Track your progress and grow your saga" : "Great job keeping your streak alive."}
                        </AppText>
                    </View>
                )}

                {/* Action Buttons */}
                {!showCompletionSuggestion && (
                    <View>
                        <Button
                            title={progress?.isDueToday ? "Check in now" : "Log another check-in"}
                            variant={progress?.isDueToday ? "primary" : "secondary"}
                            onPress={() => router.push(`/check-in/${id}/outcome`)}
                            style={styles.actionButton}
                        />

                        <Button
                            title="Mark goal complete"
                            variant="secondary"
                            onPress={handleCompleteGoal}
                            style={styles.secondaryButton}
                        />

                        <Button
                            title="View all chapters"
                            variant="secondary"
                            onPress={() => setChaptersModalVisible(true)}
                            style={styles.secondaryButton}
                        />

                        {/* <Button
                            title="Edit saga settings"
                            variant="secondary"
                            onPress={() => { }} 
                            style={styles.secondaryButton}
                        /> */}
                    </View>
                )}
            </ScrollView>

            {/* Completion Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={completionModalVisible}
                onRequestClose={() => setCompletionModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <AppText variant="headingM" style={styles.modalTitle}>Complete this Saga?</AppText>
                        <AppText style={styles.modalText}>
                            Are you ready to complete this saga? You’ll get a special finale chapter to celebrate your journey.
                        </AppText>

                        <Button
                            title={completing ? "Completing..." : "Yes, complete saga"}
                            onPress={confirmCompletion}
                            disabled={completing}
                            style={styles.modalPrimaryButton}
                        />

                        <Button
                            title="Not yet"
                            variant="secondary"
                            onPress={() => setCompletionModalVisible(false)}
                            disabled={completing}
                            style={styles.modalSecondaryButton}
                        />
                    </View>
                </View>
            </Modal>

            {/* All Chapters Modal */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={chaptersModalVisible}
                onRequestClose={() => setChaptersModalVisible(false)}
                presentationStyle="pageSheet"
            >
                <ScreenWrapper>
                    <View style={styles.modalHeader}>
                        <AppText variant="headingM">All Chapters</AppText>
                        <TouchableOpacity onPress={() => setChaptersModalVisible(false)}>
                            <AppText style={{ color: theme.colors.primary }}>Close</AppText>
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalList}>
                        {chapters.map((chapter) => (
                            <TouchableOpacity
                                key={chapter.id}
                                onPress={() => {
                                    setChaptersModalVisible(false);
                                    router.push(`/(tabs)/home/chapter/${chapter.id}`);
                                }}
                            >
                                <Card style={styles.chapterCard}>
                                    <View style={styles.chapterThumbnail}>
                                        {chapter.image_url ? (
                                            <CachedImage
                                                uri={chapter.image_url}
                                                style={{ width: '100%', height: '100%' }}
                                                borderRadius={8}
                                                alt={`Chapter ${chapter.chapter_index} panel`}
                                            />
                                        ) : (
                                            <View style={[styles.center, { opacity: 0.3 }]}>
                                                <AppText style={{ fontSize: 20 }}>
                                                    {chapter.outcome === 'completed' ? '✨' : '📝'}
                                                </AppText>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.chapterContent}>
                                        <View style={styles.chapterHeader}>
                                            <AppText style={styles.chapterLabel}>
                                                {new Date(chapter.date).toLocaleDateString()}
                                            </AppText>
                                            <AppText style={styles.outcomeIcon}>
                                                {chapter.outcome === 'completed' ? '✅' : chapter.outcome === 'partial' ? '🌓' : chapter.outcome === 'missed' ? '❌' : '⭐'}
                                            </AppText>
                                        </View>
                                        <AppText variant="headingS" style={styles.chapterTitle} numberOfLines={1}>
                                            {chapter.chapter_title || `Chapter ${chapter.chapter_index}`}
                                        </AppText>
                                        <AppText style={styles.chapterExcerpt} numberOfLines={2}>
                                            {getExcerpt(chapter.chapter_text || '')}
                                        </AppText>
                                    </View>
                                </Card>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </ScreenWrapper>
            </Modal>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        paddingVertical: theme.spacing.m,
    },
    header: {
        marginBottom: theme.spacing.l,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    currentLabel: {
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statusBadge: {
        paddingHorizontal: theme.spacing.s,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    goalTitle: {
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    themeText: {
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
        marginBottom: theme.spacing.s,
    },
    seasonBadge: {
        backgroundColor: theme.colors.surfaceHighlight,
        paddingHorizontal: theme.spacing.s,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: theme.spacing.xs,
    },
    seasonText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Changed to space-between for better distribution
        marginBottom: theme.spacing.l,
        backgroundColor: theme.colors.backgroundElevated,
        borderRadius: 12,
        padding: theme.spacing.m,
        flexWrap: 'wrap', // Allow wrapping if needed on small screens
    },
    statBox: {
        alignItems: 'center',
        minWidth: '22%', // Ensure equal width distribution
    },
    statValue: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        marginBottom: theme.spacing.xs,
    },
    statLabel: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        fontSize: 12,
    },
    progressSection: {
        marginBottom: theme.spacing.xl,
    },
    habitPlanSection: {
        marginBottom: theme.spacing.xl,
    },
    habitPlanTitle: {
        marginBottom: theme.spacing.m,
        color: theme.colors.textSecondary,
    },
    habitCard: {
        marginBottom: theme.spacing.m,
        padding: theme.spacing.m,
    },
    habitLabel: {
        marginBottom: theme.spacing.s,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    habitMetrics: {
        flexDirection: 'row',
        gap: theme.spacing.m,
    },
    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    metricIcon: {
        fontSize: 16,
    },
    metricCount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    sectionTitle: {
        marginBottom: theme.spacing.m,
        color: theme.colors.textSecondary,
    },
    chapterCard: {
        marginBottom: theme.spacing.m,
        flexDirection: 'row', // Changed to row for thumbnail layout
        alignItems: 'center',
    },
    chapterThumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: theme.spacing.m,
        backgroundColor: theme.colors.surfaceHighlight,
    },
    chapterContent: {
        flex: 1,
    },
    chapterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xs,
    },
    chapterLabel: {
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontSize: 10,
    },
    outcomeIcon: {
        fontSize: 14,
    },
    chapterTitle: {
        color: theme.colors.primary,
        marginBottom: 2,
        fontSize: 16,
    },
    chapterExcerpt: {
        color: theme.colors.textSecondary,
        fontSize: 12,
    },
    checkInInfo: {
        padding: theme.spacing.m,
        backgroundColor: theme.colors.backgroundElevated,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.primary,
        marginBottom: theme.spacing.l,
        marginTop: theme.spacing.l,
    },
    nextCheckInLabel: {
        fontWeight: 'bold',
        marginBottom: theme.spacing.xs,
    },
    checkInHint: {
        color: theme.colors.textSecondary,
    },
    actionButton: {
        marginBottom: theme.spacing.m,
    },
    secondaryButton: {
        marginBottom: theme.spacing.m,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    completionCard: {
        backgroundColor: theme.colors.surfaceHighlight,
        marginBottom: theme.spacing.xl,
        borderColor: theme.colors.primary,
        borderWidth: 1,
    },
    completionTitle: {
        color: theme.colors.primary,
        marginBottom: theme.spacing.s,
        textAlign: 'center',
    },
    completionText: {
        textAlign: 'center',
        marginBottom: theme.spacing.m,
    },
    completionButton: {
        width: '100%',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.m,
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderRadius: 16,
        padding: theme.spacing.l,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    modalTitle: {
        marginBottom: theme.spacing.m,
        color: theme.colors.primary,
        textAlign: 'center',
    },
    modalText: {
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
        color: theme.colors.text,
        lineHeight: 24,
    },
    modalPrimaryButton: {
        width: '100%',
        marginBottom: theme.spacing.m,
    },
    modalSecondaryButton: {
        width: '100%',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalList: {
        padding: theme.spacing.m,
    },
});
