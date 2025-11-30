import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/AppText';
import { theme } from '../../../theme';
import { habitSagaApi } from '../../../api/habitSagaApi';
import { Chapter } from '../../../types';

export default function StoryDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadChapters();
        }
    }, [id]);

    const loadChapters = async () => {
        setLoading(true);
        try {
            const data = await habitSagaApi.fetchChapters(id as string);
            setChapters(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Chapter }) => (
        <Card onPress={() => router.push(`/(tabs)/home/chapter/${item.id}`)} style={styles.chapterCard}>
            <View style={styles.chapterRow}>
                <View style={styles.thumbnail} />
                <View style={styles.chapterInfo}>
                    <AppText variant="headingM" style={styles.chapterTitle}>Chapter {item.chapter_index}: {item.chapter_title}</AppText>
                    <AppText variant="caption">{new Date(item.date).toLocaleDateString()} • {item.outcome}</AppText>
                </View>
            </View>
        </Card>
    );

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <AppText variant="headingL">Story Timeline</AppText>
                {/* Could add goal stats here */}
            </View>
            <FlatList
                data={chapters}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingVertical: theme.spacing.m,
    },
    list: {
        paddingBottom: theme.spacing.xl,
    },
    chapterCard: {
        padding: theme.spacing.m,
    },
    chapterRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    thumbnail: {
        width: 60,
        height: 60,
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        marginRight: theme.spacing.m,
    },
    chapterInfo: {
        flex: 1,
    },
    chapterTitle: {
        marginBottom: theme.spacing.xs,
    },
});
