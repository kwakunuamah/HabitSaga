import React, { useEffect, useState } from 'react';
import { SectionList, StyleSheet, View, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Flame, BookOpen } from 'lucide-react-native';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { theme } from '../../../theme';
import { habitSagaApi } from '../../../api/habitSagaApi';
import { GoalWithStatus } from '../../../types';
import { logger } from '../../../utils/logger';

export default function Home() {
    const router = useRouter();
    const [sections, setSections] = useState<{ title: string; data: GoalWithStatus[] }[]>([]);
    const [loading, setLoading] = useState(true);

    logger.log('Home: Rendering, loading=', loading);

    const loadGoals = async () => {
        logger.log('Home: loadGoals started');
        setLoading(true);
        try {
            logger.log('Home: Fetching goals...');
            const data = await habitSagaApi.fetchGoalsWithStatus();
            logger.log('Home: Goals fetched, count=', data.length);

            const due = data.filter(g => g.isDueToday);
            const others = data.filter(g => !g.isDueToday);

            const newSections = [];
            if (due.length > 0) {
                newSections.push({ title: 'Action Required', data: due });
            }
            if (others.length > 0 || due.length === 0) {
                // Always show "My Sagas" if we have any goals, or if we have NO goals (to show empty state)
                // Actually if data is empty, sections will be empty.
                if (data.length > 0) {
                    newSections.push({ title: 'My Stories', data: others });
                }
            }

            setSections(newSections);
        } catch (error) {
            logger.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGoals();
    }, []);

    const renderItem = ({ item, section }: { item: GoalWithStatus; section: any }) => {
        const isDueSection = section.title === 'Action Required';

        return (
            <Card onPress={() => router.push(`/(tabs)/home/${item.id}`)}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconPlaceholder}>
                        <AppText style={styles.iconText}>{item.title.charAt(0)}</AppText>
                    </View>
                    <View style={styles.cardText}>
                        <AppText variant="headingM">{item.title}</AppText>
                        <AppText variant="caption" style={styles.themeText}>
                            {item.theme} • {item.cadence.details || item.cadence.type}
                        </AppText>
                    </View>
                    {isDueSection && (
                        <Button
                            title="Check In"
                            variant="primary"
                            onPress={() => router.push(`/check-in/${item.id}/outcome`)}
                            style={styles.checkInButton}
                        />
                    )}
                </View>

                {!isDueSection && item.last_chapter_summary && (
                    <View style={styles.summaryContainer}>
                        <AppText variant="bodySmall" numberOfLines={2} style={styles.summaryText}>
                            "{item.last_chapter_summary}"
                        </AppText>
                    </View>
                )}

                <View style={styles.statsRow}>
                    <View style={styles.streakContainer}>
                        <Flame size={16} color={theme.colors.primary} />
                        <AppText variant="bodySmall" style={styles.streakText}>{item.streak} day streak</AppText>
                    </View>
                    {!isDueSection && (
                        <AppText variant="caption" style={styles.nextCheckIn}>
                            Next: {item.isDueToday ? 'Today' : 'Upcoming'}
                        </AppText>
                    )}
                </View>
            </Card>
        );
    };

    const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
        <View style={styles.sectionHeader}>
            <AppText variant="headingS" style={styles.sectionTitle}>{title}</AppText>
        </View>
    );

    return (
        <ScreenWrapper>
            <SectionList
                sections={sections}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadGoals} tintColor={theme.colors.primary} />}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            {/* Placeholder for Illustration */}
                            <View style={styles.illustrationPlaceholder}>
                                <BookOpen size={64} color={theme.colors.textSecondary} />
                            </View>
                            <AppText variant="headingM">Begin Your First Story</AppText>
                            <AppText style={styles.emptyText}>
                                Turn your daily habits into an epic story.
                            </AppText>
                            <Button title="Create Story" onPress={() => router.push('/goal-wizard/step1')} style={styles.createButton} />
                        </View>
                    ) : null
                }
            />
            <View style={styles.fabContainer}>
                <Button
                    title="+ New Story"
                    onPress={() => router.push('/goal-wizard/step1')}
                    style={styles.fab}
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingVertical: theme.spacing.m,
        paddingBottom: 100, // Space for FAB
    },
    sectionHeader: {
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        backgroundColor: theme.colors.background, // Sticky header bg
    },
    sectionTitle: {
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontSize: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surfaceHighlight,
        marginRight: theme.spacing.m,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    iconText: {
        color: theme.colors.textPrimary,
        fontWeight: 'bold',
    },
    cardText: {
        flex: 1,
    },
    themeText: {
        textTransform: 'capitalize',
        color: theme.colors.textSecondary,
    },
    checkInButton: {
        marginLeft: theme.spacing.s,
    },
    summaryContainer: {
        marginBottom: theme.spacing.m,
        padding: theme.spacing.s,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.s,
    },
    summaryText: {
        fontStyle: 'italic',
        color: theme.colors.textSecondary,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingTop: theme.spacing.s,
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    streakText: {
        color: theme.colors.textSecondary,
    },
    nextCheckIn: {
        color: theme.colors.textSecondary,
    },
    emptyState: {
        marginTop: theme.spacing.xxl,
        alignItems: 'center',
        gap: theme.spacing.m,
        padding: theme.spacing.xl,
    },
    illustrationPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    emptyText: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.m,
    },
    createButton: {
        minWidth: 200,
    },
    fabContainer: {
        position: 'absolute',
        bottom: theme.spacing.l,
        right: theme.spacing.l,
    },
    fab: {
        borderRadius: 24,
        borderWidth: 2,
        borderColor: theme.colors.primaryDark,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 5,
    }
});
