import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image, ActivityIndicator, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { theme } from '../../../theme';
import { Chapter } from '../../../types';
import { supabase } from '../../../api/supabaseClient';
import { habitSagaApi } from '../../../api/habitSagaApi';
import { ChapterRevealAnimation } from '../../../components/ChapterRevealAnimation';

export default function ChapterRevealScreen() {
    const { chapterId, headline, body, microPlan, outcome } = useLocalSearchParams<{
        chapterId: string;
        headline: string;
        body: string;
        microPlan?: string;
        outcome?: string;
    }>();
    const router = useRouter();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (chapterId) {
            loadChapter();
        }
    }, [chapterId]);

    const loadChapter = async () => {
        const data = await habitSagaApi.fetchChapter(chapterId);
        setChapter(data);

        if (data?.image_url) {
            // Get public URL or signed URL
            // Assuming public bucket for now or using helper
            const { data: { publicUrl } } = supabase.storage
                .from('panels')
                .getPublicUrl(data.image_url);
            setImageUrl(publicUrl);
        }

        setLoading(false);
    };

    const handleContinue = () => {
        // Navigate back to Saga Home (pop to top of stack or specific route)
        // We want to go back to the goal detail screen
        if (chapter) {
            router.dismissAll();
            router.replace(`/(tabs)/home/${chapter.goal_id}`);
        } else {
            router.replace('/(tabs)/home');
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ChapterRevealAnimation />
                </View>
            </ScreenWrapper>
        );
    }

    if (!chapter) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <AppText>Failed to load chapter.</AppText>
                    <Button title="Go Home" onPress={() => router.replace('/(tabs)/home')} style={{ marginTop: theme.spacing.m }} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <AppText variant="headingL" style={styles.title}>
                    Chapter {chapter.chapter_index}
                </AppText>
                <AppText variant="headingM" style={styles.subtitle}>
                    {chapter.chapter_title}
                </AppText>

                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.image, styles.placeholderImage]}>
                        <AppText variant="headingM" style={{ color: theme.colors.primary }}>
                            {chapter.chapter_title?.charAt(0) || '?'}
                        </AppText>
                    </View>
                )}

                <AppText variant="body" style={styles.text}>
                    {chapter.chapter_text}
                </AppText>

                <View style={styles.divider} />

                <Card style={styles.encouragementCard}>
                    <AppText variant="headingS" style={styles.encouragementTitle}>
                        {headline}
                    </AppText>
                    <AppText variant="body" style={styles.encouragementBody}>
                        {body}
                    </AppText>
                    {(microPlan && (outcome === 'partial' || outcome === 'missed')) && (
                        <View style={styles.microPlan}>
                            <AppText variant="caption" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                                Next time, try:
                            </AppText>
                            <AppText variant="caption">
                                {microPlan}
                            </AppText>
                        </View>
                    )}
                </Card>

                <Button
                    title="Back to saga"
                    onPress={handleContinue}
                    style={styles.button}
                />

                <Button
                    title="Share this chapter"
                    variant="secondary"
                    onPress={async () => {
                        try {
                            const message = imageUrl
                                ? `Chapter ${chapter.chapter_index} of my Habit Chronicle: ${chapter.chapter_title}`
                                : `I just unlocked Chapter ${chapter.chapter_index} in my Habit Chronicle! "${chapter.chapter_title}"`;

                            await Share.share({
                                message,
                                url: imageUrl || undefined, // iOS only for image
                                title: 'My Habit Chronicle Chapter',
                            });
                        } catch (error) {
                            console.error('Error sharing:', error);
                        }
                    }}
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
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: theme.spacing.l,
    },
    image: {
        width: '100%',
        aspectRatio: 2 / 3,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.l,
        backgroundColor: theme.colors.surface,
    },
    text: {
        lineHeight: 24,
        marginBottom: theme.spacing.xl,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: theme.spacing.xl,
    },
    encouragementCard: {
        backgroundColor: theme.colors.surfaceHighlight,
        marginBottom: theme.spacing.xl,
    },
    encouragementTitle: {
        marginBottom: theme.spacing.s,
        color: theme.colors.primary,
    },
    encouragementBody: {
        fontStyle: 'italic',
    },
    microPlan: {
        marginTop: theme.spacing.m,
        paddingTop: theme.spacing.m,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    button: {
        marginBottom: theme.spacing.m,
    },
    secondaryButton: {
        marginBottom: theme.spacing.l,
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceHighlight,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
});
