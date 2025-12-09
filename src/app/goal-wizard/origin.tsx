import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, Modal, TouchableOpacity, Animated, Easing } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { theme } from '../../theme';
import { Chapter, Goal } from '../../types';
import { useWizard } from './WizardContext';
import { supabase } from '../../api/supabaseClient';

// Progress stages during image generation
const LOADING_STAGES = [
    { message: "Preparing your scene...", emoji: "🎨" },
    { message: "Rendering your hero...", emoji: "🦸" },
    { message: "Adding dramatic lighting...", emoji: "✨" },
    { message: "Perfecting the details...", emoji: "🖌️" },
    { message: "Almost there...", emoji: "🌟" },
];

export default function Origin() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { reset } = useWizard();

    const [originChapter, setOriginChapter] = useState<Chapter | null>(null);
    const [goal, setGoal] = useState<Goal | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);
    const [userTier, setUserTier] = useState('free');
    const [imageLoading, setImageLoading] = useState(true);
    const [loadingStage, setLoadingStage] = useState(0);
    const [imageRevealed, setImageRevealed] = useState(false);

    // Animation refs
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const gradientAnim = useRef(new Animated.Value(0)).current;
    const imageScale = useRef(new Animated.Value(0.8)).current;
    const imageOpacity = useRef(new Animated.Value(0)).current;

    // Parse initial params
    useEffect(() => {
        if (params.originChapter && params.goal) {
            try {
                const chapter = JSON.parse(params.originChapter as string);
                setOriginChapter(chapter);
                setGoal(JSON.parse(params.goal as string));
                if (chapter.image_url) {
                    setImageLoading(false);
                    setImageRevealed(true);
                    imageScale.setValue(1);
                    imageOpacity.setValue(1);
                }
            } catch (e) {
                console.error('Error parsing params', e);
            }
        }
        checkUserTier();
    }, [params.originChapter, params.goal]);

    // Poll for image update if not yet loaded
    useEffect(() => {
        if (!originChapter || originChapter.image_url || !imageLoading) return;

        const pollInterval = setInterval(async () => {
            try {
                const { data } = await supabase
                    .from('chapters')
                    .select('image_url')
                    .eq('id', originChapter.id)
                    .single();

                if (data?.image_url) {
                    setOriginChapter(prev => prev ? { ...prev, image_url: data.image_url } : null);
                    setImageLoading(false);
                    // Trigger celebration animation
                    Animated.parallel([
                        Animated.spring(imageScale, {
                            toValue: 1,
                            tension: 50,
                            friction: 7,
                            useNativeDriver: true,
                        }),
                        Animated.timing(imageOpacity, {
                            toValue: 1,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                    ]).start(() => setImageRevealed(true));
                    clearInterval(pollInterval);
                }
            } catch (e) {
                console.error('Error polling for image:', e);
            }
        }, 3000);

        const timeout = setTimeout(() => {
            clearInterval(pollInterval);
            setImageLoading(false);
        }, 120000);

        return () => {
            clearInterval(pollInterval);
            clearTimeout(timeout);
        };
    }, [originChapter?.id, originChapter?.image_url, imageLoading]);

    // Rotate through loading stages
    useEffect(() => {
        if (!imageLoading) return;
        const stageInterval = setInterval(() => {
            setLoadingStage(prev => (prev + 1) % LOADING_STAGES.length);
        }, 4000);
        return () => clearInterval(stageInterval);
    }, [imageLoading]);

    // Shimmer animation for loading state
    useEffect(() => {
        if (!imageLoading) return;
        const shimmer = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
                Animated.timing(shimmerAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
            ])
        );
        shimmer.start();
        return () => shimmer.stop();
    }, [imageLoading]);

    // Gradient sweep animation
    useEffect(() => {
        if (!imageLoading) return;
        const gradient = Animated.loop(
            Animated.timing(gradientAnim, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        gradient.start();
        return () => gradient.stop();
    }, [imageLoading]);

    const checkUserTier = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('users')
                .select('subscription_tier')
                .eq('id', user.id)
                .single();
            if (data) {
                setUserTier(data.subscription_tier);
            }
        }
    };

    const handleContinue = () => {
        if (userTier === 'free') {
            setShowPaywall(true);
        } else {
            finishOnboarding();
        }
    };

    const finishOnboarding = () => {
        reset();
        router.replace('/(tabs)/home');
    };

    if (!originChapter || !goal) {
        return (
            <ScreenWrapper>
                <View style={styles.loading}>
                    <AppText>Loading your story...</AppText>
                </View>
            </ScreenWrapper>
        );
    }

    const shimmerOpacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 0.8],
    });

    const gradientTranslate = gradientAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-300, 300],
    });

    const currentStage = LOADING_STAGES[loadingStage];

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <AppText variant="headingL" style={styles.title}>Your Origin Story</AppText>
                    <AppText variant="body" style={styles.subtitle}>
                        {goal.title}
                    </AppText>
                </View>

                {/* Image container - shows loading state or actual image */}
                <View style={styles.imageContainer}>
                    {originChapter.image_url ? (
                        <Animated.View style={[
                            styles.imageWrapper,
                            {
                                transform: [{ scale: imageScale }],
                                opacity: imageOpacity,
                            }
                        ]}>
                            <Image
                                source={{ uri: originChapter.image_url }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        </Animated.View>
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            {/* Animated gradient background */}
                            <LinearGradient
                                colors={[theme.colors.backgroundElevated, theme.colors.surface, theme.colors.backgroundElevated]}
                                style={StyleSheet.absoluteFill}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            />
                            <Animated.View
                                style={[
                                    styles.shimmerOverlay,
                                    {
                                        opacity: shimmerOpacity,
                                        transform: [{ translateX: gradientTranslate }]
                                    }
                                ]}
                            >
                                <LinearGradient
                                    colors={['transparent', 'rgba(255,255,255,0.15)', 'transparent']}
                                    style={styles.shimmerGradient}
                                    start={{ x: 0, y: 0.5 }}
                                    end={{ x: 1, y: 0.5 }}
                                />
                            </Animated.View>

                            {/* Loading content */}
                            <View style={styles.loadingContent}>
                                <AppText style={styles.loadingEmoji}>{currentStage.emoji}</AppText>
                                <AppText variant="body" style={styles.loadingText}>
                                    {currentStage.message}
                                </AppText>
                                <View style={styles.progressDots}>
                                    {LOADING_STAGES.map((_, i) => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.progressDot,
                                                i === loadingStage && styles.progressDotActive
                                            ]}
                                        />
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.chapterContent}>
                    <AppText variant="headingM" style={styles.chapterTitle}>
                        {originChapter.chapter_title}
                    </AppText>
                    <AppText variant="body" style={styles.chapterText}>
                        {originChapter.chapter_text}
                    </AppText>
                </View>

                <View style={styles.footer}>
                    <AppText variant="caption" style={styles.footerText}>
                        This is just the beginning. As you check in, your saga will grow with new chapters and scenes.
                    </AppText>
                    <Button
                        title="Continue to Story"
                        onPress={handleContinue}
                        style={styles.button}
                    />
                </View>
            </ScrollView>

            <Modal
                visible={showPaywall}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPaywall(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <AppText variant="headingL" style={styles.modalTitle}>
                            Unlock Your Full Chronicle
                        </AppText>

                        <View style={styles.tierContainer}>
                            <View style={styles.tierRow}>
                                <AppText variant="headingM" style={styles.tierName}>Free</AppText>
                                <AppText variant="body" style={styles.tierDesc}>Occasional illustrated scenes (origin & finale).</AppText>
                            </View>
                            <View style={[styles.tierRow, styles.highlightTier]}>
                                <AppText variant="headingM" style={styles.tierName}>Plus</AppText>
                                <AppText variant="body" style={styles.tierDesc}>Regular illustrated scenes across your journey.</AppText>
                            </View>
                            <View style={styles.tierRow}>
                                <AppText variant="headingM" style={styles.tierName}>Premium</AppText>
                                <AppText variant="body" style={styles.tierDesc}>Heavily illustrated saga, almost every step.</AppText>
                            </View>
                        </View>

                        <Button
                            title="Upgrade for More Art"
                            onPress={() => {
                                setShowPaywall(false);
                                router.push('/paywall');
                            }}
                            style={styles.upgradeButton}
                        />

                        <Button
                            title="Continue for Free"
                            variant="ghost"
                            onPress={finishOnboarding}
                        />
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingVertical: theme.spacing.xl,
    },
    header: {
        marginBottom: theme.spacing.l,
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
        color: theme.colors.primary,
    },
    subtitle: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        marginBottom: theme.spacing.l,
        backgroundColor: theme.colors.surface,
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    shimmerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 200,
        height: '100%',
    },
    shimmerGradient: {
        width: '100%',
        height: '100%',
    },
    loadingContent: {
        alignItems: 'center',
        zIndex: 1,
    },
    loadingEmoji: {
        fontSize: 48,
        marginBottom: theme.spacing.m,
    },
    loadingText: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.m,
    },
    progressDots: {
        flexDirection: 'row',
        gap: theme.spacing.xs,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.border,
    },
    progressDotActive: {
        backgroundColor: theme.colors.primary,
    },
    chapterContent: {
        marginBottom: theme.spacing.xl,
    },
    chapterTitle: {
        marginBottom: theme.spacing.m,
        color: theme.colors.textPrimary,
    },
    chapterText: {
        lineHeight: 24,
        color: theme.colors.textSecondary,
    },
    footer: {
        gap: theme.spacing.m,
    },
    footerText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },
    button: {
        marginTop: theme.spacing.s,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.backgroundElevated,
        borderTopLeftRadius: theme.borderRadius.l,
        borderTopRightRadius: theme.borderRadius.l,
        padding: theme.spacing.xl,
        gap: theme.spacing.l,
    },
    modalTitle: {
        textAlign: 'center',
        color: theme.colors.primary,
    },
    tierContainer: {
        gap: theme.spacing.m,
    },
    tierRow: {
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        backgroundColor: theme.colors.surface,
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    highlightTier: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
    },
    tierName: {
        marginBottom: theme.spacing.xs,
    },
    tierDesc: {
        color: theme.colors.textSecondary,
    },
    upgradeButton: {
        marginTop: theme.spacing.m,
    },
});
