import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';
import { supabase } from '../../api/supabaseClient';
import { useAuth } from '../../state/AuthContext';
import { scheduleCheckInReminders } from '../../utils/notifications';
import { logger } from '../../utils/logger';

// Progress stages for saga creation
const STAGES = [
    { id: 1, label: 'Creating your saga...', icon: '📜' },
    { id: 2, label: 'Weaving your origin story...', icon: '✍️' },
    { id: 3, label: 'Summoning your hero...', icon: '🦸' },
];

// Motivational tips to rotate through
const TIPS = [
    "Great habits start small — even 2 minutes counts!",
    "Your hero's journey begins with a single step",
    "Every check-in writes a new chapter in your saga",
    "Consistency beats intensity every time",
    "Small wins compound into big victories",
    "The best time to start was yesterday. The next best time is now.",
    "Progress, not perfection, is the goal",
    "Your future self will thank you for starting today",
];

export default function Loading() {
    const router = useRouter();
    const { data, reset } = useWizard();
    const { session } = useAuth();
    const [currentStage, setCurrentStage] = useState(0);
    const [tipIndex, setTipIndex] = useState(0);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const tipOpacity = useRef(new Animated.Value(1)).current;
    const iconScale = useRef(new Animated.Value(1)).current;

    // Rotate tips every 4 seconds
    useEffect(() => {
        const tipInterval = setInterval(() => {
            // Fade out
            Animated.timing(tipOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setTipIndex((prev) => (prev + 1) % TIPS.length);
                // Fade in
                Animated.timing(tipOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        }, 4000);

        return () => clearInterval(tipInterval);
    }, []);

    // Animate icon pulse
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(iconScale, {
                    toValue: 1.2,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(iconScale, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    useEffect(() => {
        if (session) {
            createGoalAndOrigin();
        }
    }, [session]);

    const advanceStage = (stage: number) => {
        setCurrentStage(stage);
        Animated.timing(progressAnim, {
            toValue: stage / STAGES.length,
            duration: 500,
            useNativeDriver: false,
        }).start();
    };

    const createGoalAndOrigin = async () => {
        try {
            if (!session) throw new Error('No session found');

            // Stage 1: Creating saga
            advanceStage(1);
            await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UX

            // Construct payload
            const payload = {
                title: data.title,
                target_date: data.target_date,
                cadence: data.cadence,
                theme: data.theme,
                selfie_public_url: data.selfie_uri || '',
                context_current_frequency: data.context_current_frequency,
                context_biggest_blocker: data.context_biggest_blocker,
                context_current_status: data.context_current_status,
                context_notes: data.context_notes,
                context_past_efforts: data.context_past_efforts,
            };

            // Stage 2: Generating story (this happens on server)
            advanceStage(2);

            const { data: responseData, error } = await supabase.functions.invoke('create-goal-and-origin', {
                body: payload,
            });

            if (error) throw error;

            // Stage 3: Image is generating (or finished)
            advanceStage(3);
            await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UX

            // Schedule check-in reminders
            try {
                const { data: userData } = await supabase
                    .from('users')
                    .select('check_in_time, notifications_enabled')
                    .eq('id', session.user.id)
                    .single();

                if (userData?.notifications_enabled && userData?.check_in_time) {
                    await scheduleCheckInReminders(responseData.goal, userData.check_in_time);
                    logger.log('Scheduled check-in reminders for new goal');
                }
            } catch (notifError) {
                logger.error('Error scheduling notifications:', notifError);
            }

            // Navigate to origin reveal
            router.replace({
                pathname: '/goal-wizard/origin',
                params: {
                    originChapter: JSON.stringify(responseData.originChapter),
                    goal: JSON.stringify(responseData.goal)
                }
            });
        } catch (error) {
            logger.error('Creation error:', error);
            Alert.alert(
                'Error',
                'Failed to create your saga. Please try again.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        }
    };

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.content}>
                {/* Animated Icon */}
                <Animated.Text style={[styles.icon, { transform: [{ scale: iconScale }] }]}>
                    {STAGES[Math.max(0, currentStage - 1)]?.icon || '✨'}
                </Animated.Text>

                {/* Progress Stepper */}
                <View style={styles.stepsContainer}>
                    {STAGES.map((stage, index) => (
                        <View key={stage.id} style={styles.stepRow}>
                            <View style={[
                                styles.stepDot,
                                currentStage >= stage.id && styles.stepDotActive,
                                currentStage === stage.id && styles.stepDotCurrent,
                            ]}>
                                {currentStage > stage.id && (
                                    <AppText style={styles.checkMark}>✓</AppText>
                                )}
                            </View>
                            <AppText
                                variant="body"
                                style={[
                                    styles.stepLabel,
                                    currentStage >= stage.id && styles.stepLabelActive,
                                ]}
                            >
                                {stage.label}
                            </AppText>
                        </View>
                    ))}
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
                </View>

                {/* Rotating Tips */}
                <Animated.View style={[styles.tipContainer, { opacity: tipOpacity }]}>
                    <AppText variant="caption" style={styles.tipLabel}>💡 TIP</AppText>
                    <AppText variant="body" style={styles.tipText}>
                        {TIPS[tipIndex]}
                    </AppText>
                </Animated.View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: theme.spacing.l,
        width: '100%',
        maxWidth: 400,
    },
    icon: {
        fontSize: 64,
        marginBottom: theme.spacing.xl,
    },
    stepsContainer: {
        width: '100%',
        marginBottom: theme.spacing.l,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    stepDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.backgroundElevated,
        borderWidth: 2,
        borderColor: theme.colors.border,
        marginRight: theme.spacing.m,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepDotActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    stepDotCurrent: {
        borderColor: theme.colors.primary,
        backgroundColor: 'transparent',
    },
    checkMark: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    stepLabel: {
        color: theme.colors.textSecondary,
        flex: 1,
    },
    stepLabelActive: {
        color: theme.colors.text,
        fontWeight: '600',
    },
    progressContainer: {
        width: '100%',
        height: 4,
        backgroundColor: theme.colors.backgroundElevated,
        borderRadius: 2,
        marginBottom: theme.spacing.xl,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 2,
    },
    tipContainer: {
        backgroundColor: theme.colors.backgroundElevated,
        padding: theme.spacing.m,
        borderRadius: 12,
        width: '100%',
    },
    tipLabel: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        marginBottom: theme.spacing.xs,
    },
    tipText: {
        color: theme.colors.text,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
