import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { theme } from '../../../theme';
import { CheckInBarrier, TaskCheckInResult } from '../../../types';
import { habitSagaApi } from '../../../api/habitSagaApi';

export default function CheckInReflectionScreen() {
    const { id, taskResults, outcome } = useLocalSearchParams<{
        id: string;
        taskResults?: string;
        outcome?: 'completed' | 'partial' | 'missed';
    }>();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // Reflection state
    const [note, setNote] = useState('');
    const [barrier, setBarrier] = useState<CheckInBarrier | null>(null);
    const [tinyAdjustment, setTinyAdjustment] = useState('');

    // Parse task results if available
    const parsedTaskResults: TaskCheckInResult[] = taskResults
        ? JSON.parse(taskResults)
        : [];

    const isTaskBased = parsedTaskResults.length > 0;

    // Determine overall feel from task results
    const hasAnySuccess = isTaskBased && parsedTaskResults.some(t => t.outcome === 'full' || t.outcome === 'tiny');
    const hasAnyMissed = isTaskBased && parsedTaskResults.some(t => t.outcome === 'missed');
    const allMissed = isTaskBased && parsedTaskResults.every(t => t.outcome === 'missed');

    // Legacy outcomes
    const isSuccess = outcome === 'completed';
    const isPartial = outcome === 'partial';
    const isMissed = outcome === 'missed';

    const showBarrierField = isTaskBased ? hasAnyMissed : (isPartial || isMissed);
    const showAdjustmentField = isTaskBased && hasAnyMissed;

    const handleSubmit = async () => {
        if (!id) return;

        if (showBarrierField && !barrier) {
            Alert.alert('Please select what got in the way.');
            return;
        }

        setSubmitting(true);
        try {
            let response;

            if (isTaskBased) {
                // Task-based check-in
                response = await habitSagaApi.checkInWithTasks({
                    goalId: id,
                    taskResults: parsedTaskResults,
                    reflection: {
                        note: note.trim() || undefined,
                        barrier: barrier || undefined,
                        tiny_adjustment: tinyAdjustment.trim() || undefined,
                    },
                });
            } else {
                // Legacy check-in
                response = await habitSagaApi.checkIn({
                    goalId: id,
                    outcome: outcome!,
                    note: note.trim() || undefined,
                    barrier: barrier || undefined,
                    retry_plan: tinyAdjustment.trim() || undefined,
                });
            }

            // Navigate to reveal screen
            router.push({
                pathname: `/check-in/${id}/reveal`,
                params: {
                    chapterId: response.chapter.id,
                    headline: response.encouragement.headline,
                    body: response.encouragement.body,
                    microPlan: response.encouragement.microPlan,
                    outcome: outcome || 'partial',
                }
            });
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save check-in. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const BarrierOption = ({ value, label }: { value: CheckInBarrier; label: string }) => (
        <TouchableOpacity
            style={[
                styles.option,
                barrier === value && styles.optionSelected
            ]}
            onPress={() => setBarrier(value)}
        >
            <AppText style={barrier === value ? styles.textSelected : styles.text}>{label}</AppText>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper keyboardAvoiding>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <AppText variant="headingL" style={styles.title}>
                    {hasAnySuccess || isSuccess ? 'Great job!' : 'Reflection'}
                </AppText>

                {/* Show note field for any success */}
                {(hasAnySuccess || isSuccess) && (
                    <View style={styles.section}>
                        <AppText variant="body" style={styles.question}>
                            Anything you want to remember about today?
                        </AppText>
                        <AppText variant="bodySmall" style={styles.hint}>
                            Optional
                        </AppText>
                        <Input
                            placeholder="I felt really focused because..."
                            value={note}
                            onChangeText={setNote}
                            multiline
                            style={styles.textArea}
                        />
                    </View>
                )}

                {/* Show barrier field if any missed */}
                {showBarrierField && (
                    <View style={styles.section}>
                        <AppText variant="body" style={styles.question}>
                            What got in the way most?
                        </AppText>
                        <View style={styles.options}>
                            <BarrierOption value="time_management" label="Time got away from me" />
                            <BarrierOption value="tired_stressed" label="Too tired / stressed" />
                            <BarrierOption value="forgot" label="Forgot until late" />
                            <BarrierOption value="unexpected_event" label="Something unexpected came up" />
                            <BarrierOption value="motivation_low" label="Just didn't feel like it" />
                            <BarrierOption value="other" label="Something else" />
                        </View>
                    </View>
                )}

                {/* Show tiny adjustment field for task-based missed */}
                {showAdjustmentField && (
                    <View style={styles.section}>
                        <AppText variant="body" style={styles.question}>
                            What small change will you try next time?
                        </AppText>
                        <AppText variant="bodySmall" style={styles.hint}>
                            Optional
                        </AppText>
                        <Input
                            placeholder="I'll try right after breakfast instead..."
                            value={tinyAdjustment}
                            onChangeText={setTinyAdjustment}
                            multiline
                            style={styles.textArea}
                        />
                    </View>
                )}

                {/* Show note field for all missed (no success) */}
                {(allMissed || isMissed) && !hasAnySuccess && !isSuccess && (
                    <View style={styles.section}>
                        <AppText variant="body" style={styles.question}>
                            Any other thoughts?
                        </AppText>
                        <AppText variant="bodySmall" style={styles.hint}>
                            Optional
                        </AppText>
                        <Input
                            placeholder="What happened today..."
                            value={note}
                            onChangeText={setNote}
                            multiline
                            style={styles.textArea}
                        />
                    </View>
                )}

                <Button
                    title={submitting ? "Saving..." : "Finish Check-In"}
                    onPress={handleSubmit}
                    disabled={submitting}
                    style={styles.button}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: theme.spacing.m,
        paddingBottom: theme.spacing.xxl,
    },
    title: {
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    question: {
        marginBottom: theme.spacing.xs,
        fontWeight: '600',
    },
    hint: {
        marginBottom: theme.spacing.s,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: theme.spacing.s,
    },
    options: {
        gap: theme.spacing.s,
    },
    option: {
        padding: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    optionSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surfaceHighlight,
    },
    text: {
        color: theme.colors.textPrimary,
    },
    textSelected: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    button: {
        marginTop: theme.spacing.m,
    },
});
