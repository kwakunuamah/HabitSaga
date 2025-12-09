import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { theme } from '../theme';
import { AppText } from './AppText';
import { BookOpen } from 'lucide-react-native';

interface ChapterRevealAnimationProps {
    onReveal?: () => void;
}

export function ChapterRevealAnimation({ onReveal }: ChapterRevealAnimationProps) {
    const scaleAnim = new Animated.Value(0.8);
    const glowAnim = new Animated.Value(0);
    const shakeAnim = new Animated.Value(0);

    useEffect(() => {
        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.9,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
            ])
        ).start();

        // Glow animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.5,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.iconContainer,
                    {
                        transform: [{ scale: scaleAnim }],
                        shadowOpacity: glowAnim,
                    },
                ]}
            >
                <BookOpen size={80} color={theme.colors.primary} />
            </Animated.View>
            <AppText variant="headingM" style={styles.text}>
                Writing your story...
            </AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.spacing.l,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    text: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});
