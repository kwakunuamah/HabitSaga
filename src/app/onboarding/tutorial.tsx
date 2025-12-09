import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { theme } from '../../theme';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        title: 'Your Life, Epic Saga',
        description: 'Turn your real-life goals into an evolving saga.',
    },
    {
        title: 'Create Your Origin',
        description: 'Set a goal → answer a few questions → get your origin story.',
    },
    {
        title: 'Grow With Your Hero',
        description: 'Check in as you make progress. Your story grows with you.',
    },
];

export default function Tutorial() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = () => {
        router.replace('/onboarding/profile');
    };

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.header}>
                <Button
                    title="Skip"
                    variant="ghost"
                    onPress={handleFinish}
                    style={styles.skipButton}
                />
            </View>

            <View style={styles.content}>
                <View style={styles.slideContainer}>
                    <AppText variant="headingXL" style={styles.title}>
                        {SLIDES[currentIndex].title}
                    </AppText>
                    <AppText variant="body" style={styles.description}>
                        {SLIDES[currentIndex].description}
                    </AppText>
                </View>

                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentIndex && styles.activeDot,
                            ]}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <Button
                    title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
                    onPress={handleNext}
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'flex-end',
        paddingHorizontal: theme.spacing.m,
    },
    skipButton: {
        width: 'auto',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    slideContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    title: {
        textAlign: 'center',
        marginBottom: theme.spacing.m,
        color: theme.colors.primary,
    },
    description: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        lineHeight: 24,
    },
    pagination: {
        flexDirection: 'row',
        gap: theme.spacing.s,
        marginTop: theme.spacing.xl,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.surface,
    },
    activeDot: {
        backgroundColor: theme.colors.primary,
        width: 24,
    },
    footer: {
        padding: theme.spacing.xl,
    },
});
