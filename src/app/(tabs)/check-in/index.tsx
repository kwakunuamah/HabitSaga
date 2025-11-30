import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { theme } from '../../../theme';
import { habitSagaApi } from '../../../api/habitSagaApi';
import { Goal } from '../../../types';

export default function CheckInList() {
    const router = useRouter();
    const [goals, setGoals] = useState<Goal[]>([]);

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        const data = await habitSagaApi.fetchGoals();
        setGoals(data);
    };

    const renderItem = ({ item }: { item: Goal }) => (
        <Card>
            <View style={styles.cardContent}>
                <View>
                    <AppText variant="headingM">{item.title}</AppText>
                    <AppText variant="caption">Target: {item.cadence.details || 'Complete daily action'}</AppText>
                </View>
                <Button
                    title="Check In"
                    onPress={() => router.push({ pathname: '/(tabs)/check-in/form', params: { goalId: item.id } })}
                    style={styles.button}
                />
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
                ListEmptyComponent={<AppText style={{ textAlign: 'center', marginTop: 20 }}>No active goals for today.</AppText>}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingVertical: theme.spacing.m,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    button: {
        height: 36,
        paddingHorizontal: theme.spacing.m,
    },
});
