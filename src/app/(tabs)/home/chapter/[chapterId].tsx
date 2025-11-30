import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Share } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '../../../../components/ScreenWrapper';
import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { theme } from '../../../../theme';
import { habitSagaApi } from '../../../../api/habitSagaApi';
import { Chapter } from '../../../../types';

export default function ChapterDetail() {
    const { chapterId } = useLocalSearchParams();
    const [chapter, setChapter] = useState<Chapter | null>(null);

    useEffect(() => {
        // In a real app, fetch specific chapter. For now, we mock fetching from the list or just use the mock data directly if we had a getChapterById.
        // I'll just mock it by fetching all and finding.
        const load = async () => {
            const all = await habitSagaApi.fetchChapters('1'); // Mock goal id
            const found = all.find(c => c.id === chapterId) || all[0];
            setChapter(found);
        }
        load();
    }, [chapterId]);

    const handleShare = async () => {
        if (!chapter) return;
        try {
            await Share.share({
                message: `Check out Chapter ${chapter.chapter_index}: ${chapter.chapter_title} in my Habit Saga!`,
                // url: chapter.image_url // if we had one
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (!chapter) return null;

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.panel}>
                    {/* Placeholder for Image Panel */}
                    <AppText style={{ color: theme.colors.textSecondary }}>[Comic Panel Image]</AppText>
                </View>

                <AppText variant="headingL" style={styles.title}>{chapter.chapter_title}</AppText>

                <View style={styles.meta}>
                    <View style={[styles.badge, { backgroundColor: chapter.outcome === 'completed' ? theme.colors.success : theme.colors.warning }]}>
                        <AppText style={styles.badgeText}>{chapter.outcome.toUpperCase()}</AppText>
                    </View>
                    <AppText variant="caption">{new Date(chapter.date).toLocaleDateString()}</AppText>
                </View>

                <AppText variant="body" style={styles.text}>
                    {chapter.chapter_text}
                </AppText>

                <Button title="Share Chapter" variant="secondary" onPress={handleShare} style={styles.shareButton} />
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingVertical: theme.spacing.l,
    },
    panel: {
        height: 300,
        backgroundColor: theme.colors.backgroundElevated,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.l,
    },
    title: {
        marginBottom: theme.spacing.s,
        color: theme.colors.primary,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.l,
        gap: theme.spacing.m,
    },
    badge: {
        paddingHorizontal: theme.spacing.s,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    text: {
        marginBottom: theme.spacing.xl,
    },
    shareButton: {
        marginTop: theme.spacing.l,
    },
});
