import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Share, Image } from 'react-native';
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
        const load = async () => {
            if (typeof chapterId === 'string') {
                const data = await habitSagaApi.fetchChapter(chapterId);
                setChapter(data);
            }
        }
        load();
    }, [chapterId]);

    const handleShare = async () => {
        if (!chapter) return;
        try {
            await Share.share({
                message: `Check out Chapter ${chapter.chapter_index}: ${chapter.chapter_title} in my Habit Chronicle!`,
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
                    {chapter.image_url ? (
                        <Image
                            source={{ uri: chapter.image_url }}
                            style={styles.panelImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <AppText style={{ color: theme.colors.textSecondary }}>[No Image]</AppText>
                    )}
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
        overflow: 'hidden',
    },
    panelImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
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
