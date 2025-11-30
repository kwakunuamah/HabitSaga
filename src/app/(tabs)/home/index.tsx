import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { theme } from '../../../theme';
import { habitSagaApi } from '../../../api/habitSagaApi';
import { Goal } from '../../../types';

export default function Home() {
    const router = useRouter();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    const loadGoals = async () => {
        setLoading(true);
        try {
            const data = await habitSagaApi.fetchGoals();
            setGoals(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGoals();
    }, []);

    const renderItem = ({ item }: { item: Goal }) => (
        <Card onPress={() => router.push(`/(tabs)/home/${item.id}`)}>
            <View style={styles.cardHeader}>
                <View style={styles.iconPlaceholder} />
                <View style={styles.cardText}>
                    <AppText variant="headingM">{item.title}</AppText>
                    <AppText variant="caption">{item.theme} • {item.cadence.type}</AppText>
                </View>
            </View>
            <View style={styles.progressContainer}>
                <AppText variant="caption">Next Check-in: Today</AppText>
            </View>
        </Card>
    );

    return (
        <ScreenWrapper>
            <FlatList
                data={goals}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadGoals} tintColor={theme.colors.primary} />}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <AppText style={styles.emptyText}>No sagas yet.</AppText>
                            <Button title="Start a New Saga" onPress={() => router.push('/goal-wizard/step1')} />
                        </View>
                    ) : null
                }
            />
            <View style={styles.fabContainer}>
                <Button
                    title="+ New Saga"
                    onPress={() => router.push('/goal-wizard/step1')}
                    style={styles.fab}
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingVertical: theme.spacing.m,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        marginRight: theme.spacing.m,
    },
    cardText: {
        flex: 1,
    },
    progressContainer: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingTop: theme.spacing.s,
    },
    emptyState: {
        marginTop: theme.spacing.xxl,
        alignItems: 'center',
        gap: theme.spacing.l,
    },
    emptyText: {
        color: theme.colors.textSecondary,
    },
    fabContainer: {
        position: 'absolute',
        bottom: theme.spacing.l,
        right: theme.spacing.l,
    },
    fab: {
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    }
});
