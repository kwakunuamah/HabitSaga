import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { theme } from '../../../theme';
import { habitSagaApi } from '../../../api/habitSagaApi';
import { Outcome } from '../../../types';

export default function CheckInForm() {
    const { goalId } = useLocalSearchParams();
    const router = useRouter();
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCheckIn = async (outcome: Outcome) => {
        setLoading(true);
        try {
            const chapter = await habitSagaApi.checkIn({
                goalId: goalId as string,
                outcome,
                note,
            });

            // Navigate to the new chapter
            router.replace(`/(tabs)/home/chapter/${chapter.id}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to submit check-in');
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <AppText variant="headingL" style={styles.title}>How did it go?</AppText>

                <Input
                    label="Add a note (optional)"
                    placeholder="I felt strong today..."
                    value={note}
                    onChangeText={setNote}
                    multiline
                    style={{ height: 100, textAlignVertical: 'top' }}
                />

                <View style={styles.buttons}>
                    <Button
                        title="Completed"
                        onPress={() => handleCheckIn('completed')}
                        loading={loading}
                        style={{ backgroundColor: theme.colors.success }}
                    />
                    <Button
                        title="Partial"
                        onPress={() => handleCheckIn('partial')}
                        loading={loading}
                        style={{ backgroundColor: theme.colors.warning }}
                    />
                    <Button
                        title="Missed"
                        onPress={() => handleCheckIn('missed')}
                        loading={loading}
                        style={{ backgroundColor: theme.colors.error }}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: theme.spacing.xl,
    },
    title: {
        marginBottom: theme.spacing.l,
        textAlign: 'center',
    },
    buttons: {
        gap: theme.spacing.m,
        marginTop: theme.spacing.xl,
    },
});
