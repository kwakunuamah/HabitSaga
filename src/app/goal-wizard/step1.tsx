import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { habitSagaApi } from '../../api/habitSagaApi';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { WizardProgressBar } from '../../components/WizardProgressBar';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';

export default function Step1() {
    const router = useRouter();
    const { data, updateData } = useWizard();
    const [goal, setGoal] = useState(data.title || '');
    const [hasGoals, setHasGoals] = useState(true); // Default to true to avoid flash

    useEffect(() => {
        checkGoals();
    }, []);

    const checkGoals = async () => {
        try {
            const goals = await habitSagaApi.fetchGoals();
            setHasGoals(goals.length > 0);
        } catch (e) {
            // If error, assume no goals or just let them go to home (which handles empty state)
            setHasGoals(false);
        }
    };

    const handleCancel = () => {
        if (hasGoals) {
            router.replace('/(tabs)/home');
        } else {
            // If they have no goals, "Cancel" effectively means "I don't want to do this yet"
            // But since they are logged in, Home is the only place. 
            // Actually, if they have NO goals, Home shows the empty state which IS the "Start Saga" button.
            // So redirecting to Home is actually fine, BUT let's make it explicit.
            router.replace('/(tabs)/home');
        }
    };

    const handleNext = () => {
        if (!goal.trim()) return;
        updateData({ title: goal });
        router.push('/goal-wizard/step2a');
    };

    return (
        <ScreenWrapper keyboardAvoiding={true}>
            <View style={styles.content}>
                <WizardProgressBar currentStep={1} totalSteps={12} />
                <View>
                    <AppText variant="headingL" style={styles.title}>
                        What do you want to accomplish?
                    </AppText>
                    <AppText variant="body" style={styles.subtitle}>
                        Describe one goal. We'll handle the details.
                    </AppText>

                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Run my first 5K, read 12 books this year, or build a consistent morning routine..."
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline
                        maxLength={200}
                        value={goal}
                        onChangeText={setGoal}
                        autoFocus
                    />
                    <AppText variant="caption" style={styles.counter}>
                        {goal.length}/200
                    </AppText>
                </View>

                <View style={styles.actions}>
                    <Button
                        title="Cancel"
                        variant="outline"
                        onPress={handleCancel}
                        style={styles.cancelButton}
                    />
                    <Button
                        title="Next"
                        onPress={handleNext}
                        disabled={!goal.trim()}
                        style={styles.nextButton}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.xl,
    },
    title: {
        marginBottom: theme.spacing.s,
    },
    subtitle: {
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xl,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        color: theme.colors.textPrimary,
        fontSize: 18,
        minHeight: 120,
        textAlignVertical: 'top',
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    counter: {
        textAlign: 'right',
        marginTop: theme.spacing.s,
        color: theme.colors.textSecondary,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.m,
    },
    cancelButton: {
        flex: 1,
    },
    nextButton: {
        flex: 2,
    },
});
