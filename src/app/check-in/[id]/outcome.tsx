import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { theme } from '../../../theme';
import { Goal, TaskOutcome, HabitTask } from '../../../types';
import { habitSagaApi } from '../../../api/habitSagaApi';

export default function CheckInOutcomeScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [goal, setGoal] = useState<Goal | null>(null);
    const [loading, setLoading] = useState(true);

    // Task outcomes map: habit_id -> outcome
    const [taskOutcomes, setTaskOutcomes] = useState<Record<string, TaskOutcome>>({});

    useEffect(() => {
        if (id) {
            loadGoal();
        }
    }, [id]);

    const loadGoal = async () => {
        try {
            setLoading(true);
            const goalData = await habitSagaApi.fetchGoal(id as string);
            setGoal(goalData);

            // Initialize all tasks to 'missed'
            if (goalData.habit_plan) {
                const initialOutcomes: Record<string, TaskOutcome> = {};
                goalData.habit_plan.filter(h => h.active).forEach(habit => {
                    initialOutcomes[habit.id] = 'missed';
                });
                setTaskOutcomes(initialOutcomes);
            }
        } catch (error) {
            console.error('Error loading goal:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (!goal) return;

        // Convert taskOutcomes to array format
        const taskResults = Object.entries(taskOutcomes).map(([habit_id, outcome]) => ({
            habit_id,
            outcome,
        }));

        router.push({
            pathname: `/check-in/${id}/reflection`,
            params: {
                taskResults: JSON.stringify(taskResults),
            }
        });
    };

    const hasHabitPlan = goal?.habit_plan && goal.habit_plan.some(h => h.active);
    const activeTasks = goal?.habit_plan?.filter(h => h.active) || [];

    // Check if all tasks have been reviewed (at least one non-missed OR explicitly selected missed)
    const allTasksReviewed = activeTasks.length > 0 &&
        activeTasks.every(task => taskOutcomes[task.id] !== undefined);

    // Count outcomes for determining overall feel
    const outcomeCount = Object.values(taskOutcomes).reduce((acc, outcome) => {
        acc[outcome] = (acc[outcome] || 0) + 1;
        return acc;
    }, {} as Record<TaskOutcome, number>);

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <AppText variant="body" style={styles.loadingText}>Loading...</AppText>
                </View>
            </ScreenWrapper>
        );
    }

    if (!hasHabitPlan) {
        // Fallback to legacy outcome screen
        return <LegacyOutcomeScreen goalId={id as string} router={router} />;
    }

    return (
        <ScreenWrapper>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <AppText variant="headingL" style={styles.title}>
                        Today's actions
                    </AppText>
                    <AppText variant="bodySmall" style={styles.subtitle}>
                        {goal?.title}
                    </AppText>
                </View>

                <View style={styles.tasksContainer}>
                    {activeTasks.map(task => (
                        <TaskCheckInCard
                            key={task.id}
                            task={task}
                            outcome={taskOutcomes[task.id] || 'missed'}
                            onOutcomeChange={(outcome) => {
                                setTaskOutcomes(prev => ({ ...prev, [task.id]: outcome }));
                            }}
                        />
                    ))}
                </View>

                <View style={styles.hintContainer}>
                    <AppText variant="bodySmall" style={styles.hintText}>
                        "Be honest. Progress grows from what really happens."
                    </AppText>
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Next"
                        onPress={handleNext}
                        disabled={!allTasksReviewed}
                        style={styles.nextButton}
                    />
                    <Button
                        title="Back"
                        variant="ghost"
                        onPress={() => router.back()}
                        style={styles.backButton}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

interface TaskCheckInCardProps {
    task: HabitTask;
    outcome: TaskOutcome;
    onOutcomeChange: (outcome: TaskOutcome) => void;
}

function TaskCheckInCard({ task, outcome, onOutcomeChange }: TaskCheckInCardProps) {
    // Compress cue to one line
    const cueText = task.cue_type === 'habit_stack' && task.habit_stack
        ? task.habit_stack
        : task.if_then;

    return (
        <Card style={styles.taskCard}>
            <View style={styles.taskHeader}>
                <AppText variant="headingS" style={styles.taskLabel}>{task.label}</AppText>
                <AppText variant="bodySmall" style={styles.taskCue} numberOfLines={1} ellipsizeMode="tail">
                    {cueText}
                </AppText>
            </View>

            <View style={styles.outcomeButtons}>
                <TouchableOpacity
                    style={[
                        styles.outcomeButton,
                        outcome === 'full' && styles.outcomeButtonSelected
                    ]}
                    onPress={() => onOutcomeChange('full')}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="check-circle" size={28} color="#22c55e" />
                    <AppText
                        variant="bodySmall"
                        style={[
                            styles.outcomeLabel,
                            outcome === 'full' && styles.outcomeLabelSelected
                        ]}
                    >
                        Full
                    </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.outcomeButton,
                        outcome === 'tiny' && styles.outcomeButtonSelected
                    ]}
                    onPress={() => onOutcomeChange('tiny')}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="circle-half-full" size={28} color="#f59e0b" />
                    <AppText
                        variant="bodySmall"
                        style={[
                            styles.outcomeLabel,
                            outcome === 'tiny' && styles.outcomeLabelSelected
                        ]}
                    >
                        Tiny
                    </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.outcomeButton,
                        outcome === 'missed' && styles.outcomeButtonSelected
                    ]}
                    onPress={() => onOutcomeChange('missed')}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="close-circle-outline" size={28} color="#ef4444" />
                    <AppText
                        variant="bodySmall"
                        style={[
                            styles.outcomeLabel,
                            outcome === 'missed' && styles.outcomeLabelSelected
                        ]}
                    >
                        None
                    </AppText>
                </TouchableOpacity>
            </View>
        </Card>
    );
}

// Legacy fallback for goals without habit plans
function LegacyOutcomeScreen({ goalId, router }: { goalId: string, router: any }) {
    const [selectedOutcome, setSelectedOutcome] = useState<'completed' | 'partial' | 'missed' | null>(null);

    const handleNext = () => {
        if (selectedOutcome) {
            router.push({
                pathname: `/check-in/${goalId}/reflection`,
                params: { outcome: selectedOutcome }
            });
        }
    };

    const OutcomeOption = ({ outcome, label, icon, color }: { outcome: 'completed' | 'partial' | 'missed'; label: string; icon: 'check-circle' | 'circle-half-full' | 'close-circle-outline'; color: string }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedOutcome(outcome)}
        >
            <Card
                style={[
                    styles.optionCard,
                    selectedOutcome === outcome && styles.selectedCard
                ]}
            >
                <MaterialCommunityIcons name={icon} size={32} color={color} style={styles.optionIcon} />
                <AppText
                    variant="headingS"
                    style={[
                        styles.optionLabel,
                        selectedOutcome === outcome && styles.selectedLabel
                    ]}
                >
                    {label}
                </AppText>
            </Card>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.header}>
                    <AppText variant="headingL" style={styles.title}>How did this check-in go?</AppText>
                </View>

                <View style={styles.optionsContainer}>
                    <OutcomeOption outcome="completed" label="Yes, I did it" icon="check-circle" color="#22c55e" />
                    <OutcomeOption outcome="partial" label="Partly" icon="circle-half-full" color="#f59e0b" />
                    <OutcomeOption outcome="missed" label="Not this time" icon="close-circle-outline" color="#ef4444" />
                </View>

                <View style={styles.hintContainer}>
                    <AppText variant="bodySmall" style={styles.hintText}>
                        "Be honest. Your saga grows from what really happens."
                    </AppText>
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Next"
                        onPress={handleNext}
                        disabled={!selectedOutcome}
                        style={styles.nextButton}
                    />
                    <Button
                        title="Back"
                        variant="ghost"
                        onPress={() => router.back()}
                        style={styles.backButton}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.m,
        paddingBottom: theme.spacing.xxl,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    loadingText: {
        color: theme.colors.textSecondary,
    },
    header: {
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
    },
    tasksContainer: {
        gap: theme.spacing.m,
    },
    taskCard: {
        padding: theme.spacing.m,
    },
    taskHeader: {
        marginBottom: theme.spacing.m,
    },
    taskLabel: {
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    taskCue: {
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },
    outcomeButtons: {
        flexDirection: 'row',
        gap: theme.spacing.s,
    },
    outcomeButton: {
        flex: 1,
        alignItems: 'center',
        padding: theme.spacing.s,
        borderRadius: theme.borderRadius.m,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
    outcomeButtonSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surfaceHighlight,
    },
    outcomeIcon: {
        fontSize: 24,
        marginBottom: theme.spacing.xs,
    },
    outcomeLabel: {
        color: theme.colors.textSecondary,
        fontSize: 12,
    },
    outcomeLabelSelected: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    hintContainer: {
        marginTop: theme.spacing.xl,
        paddingHorizontal: theme.spacing.l,
    },
    hintText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },
    footer: {
        marginTop: theme.spacing.xl,
        gap: theme.spacing.s,
    },
    nextButton: {
        width: '100%',
    },
    backButton: {
        width: '100%',
    },
    // Legacy styles
    optionsContainer: {
        gap: theme.spacing.m,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.l,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCard: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surfaceHighlight,
    },
    optionIcon: {
        fontSize: 32,
        marginRight: theme.spacing.m,
    },
    optionLabel: {
        color: theme.colors.textPrimary,
    },
    selectedLabel: {
        color: theme.colors.primary,
    },
});
