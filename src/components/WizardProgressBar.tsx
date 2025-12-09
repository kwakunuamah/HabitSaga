import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { theme } from '../theme';

interface WizardProgressBarProps {
    currentStep: number;
    totalSteps: number;
    style?: ViewStyle;
}

export const WizardProgressBar: React.FC<WizardProgressBarProps> = ({
    currentStep,
    totalSteps,
    style,
}) => {
    const progressAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    const percentage = (currentStep / totalSteps) * 100;

    useEffect(() => {
        // Animate progress bar fill
        Animated.spring(progressAnim, {
            toValue: percentage,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
        }).start();

        // Pulsing glow effect
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [currentStep, totalSteps]);

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.8],
    });

    return (
        <View style={[styles.container, style]}>
            <View style={styles.labelContainer}>
                <AppText variant="caption" style={styles.label}>
                    Setup Progress
                </AppText>
                <AppText variant="caption" style={styles.stepText}>
                    Step {currentStep} of {totalSteps}
                </AppText>
            </View>
            <View style={styles.trackContainer}>
                <View style={styles.track}>
                    <Animated.View
                        style={[
                            styles.fill,
                            {
                                width: progressAnim.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: ['0%', '100%'],
                                }),
                            },
                        ]}
                    >
                        {/* Gradient effect layer */}
                        <View style={styles.gradient} />

                        {/* Glow effect */}
                        <Animated.View
                            style={[
                                styles.glow,
                                { opacity: glowOpacity },
                            ]}
                        />
                    </Animated.View>
                </View>

                {/* XP-style notches */}
                <View style={styles.notchesContainer}>
                    {Array.from({ length: totalSteps - 1 }).map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.notch,
                                {
                                    left: `${((index + 1) / totalSteps) * 100}%`,
                                    backgroundColor:
                                        currentStep > index + 1
                                            ? theme.colors.primary
                                            : theme.colors.border,
                                },
                            ]}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: theme.spacing.m,
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xs,
    },
    label: {
        color: theme.colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        fontSize: 11,
        letterSpacing: 1,
    },
    stepText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    trackContainer: {
        position: 'relative',
        height: 12,
    },
    track: {
        width: '100%',
        height: 12,
        backgroundColor: theme.colors.surfaceHighlight,
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    fill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        position: 'relative',
        overflow: 'hidden',
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        height: '50%',
    },
    glow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 8,
    },
    notchesContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    notch: {
        position: 'absolute',
        width: 2,
        height: 12,
        top: 0,
    },
});
