import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { WizardProgressBar } from '../../components/WizardProgressBar';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';
import { CadenceType } from '../../types';
import { useWizardCancel } from './useWizardCancel';

const CADENCE_OPTIONS: { type: CadenceType; label: string; description: string }[] = [
    { type: 'daily', label: 'Daily', description: 'I want to show up every day.' },
    { type: '3x_week', label: '3 days per week', description: 'A few times each week.' },
    { type: 'custom', label: 'Weekly', description: 'Once a week is more realistic.' },
];

export default function CadenceStep() {
    const router = useRouter();
    const { data, updateData } = useWizard();
    const { handleCancel } = useWizardCancel();
    const [cadence, setCadence] = useState<CadenceType>(data.cadence.type);

    const handleNext = () => {
        updateData({
            cadence: { type: cadence },
        });
        router.push('/goal-wizard/step-time');
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.content}>
                <WizardProgressBar currentStep={8} totalSteps={12} />
                <View style={styles.header}>
                    <AppText variant="headingL">How often should Habit Chronicle check in with you?</AppText>
                    <AppText variant="body" style={styles.subtitle}>
                        We’ll build your story and reminders around this pace.
                    </AppText>
                </View>

                <View style={styles.section}>
                    <View style={styles.cadenceContainer}>
                        {CADENCE_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.type}
                                style={[
                                    styles.cadenceOption,
                                    cadence === option.type && styles.selectedCadence,
                                ]}
                                onPress={() => setCadence(option.type)}
                            >
                                <AppText
                                    variant="body"
                                    style={[
                                        styles.cadenceLabel,
                                        cadence === option.type && styles.selectedCadenceText,
                                    ]}
                                >
                                    {option.label}
                                </AppText>
                                <AppText
                                    variant="caption"
                                    style={[
                                        styles.cadenceDescription,
                                        cadence === option.type && styles.selectedCadenceText,
                                    ]}
                                >
                                    {option.description}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </View>
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
                        style={styles.nextButton}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingVertical: theme.spacing.xl,
        flexGrow: 1,
    },
    header: {
        marginBottom: theme.spacing.xl,
    },
    subtitle: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    cadenceContainer: {
        gap: theme.spacing.m,
    },
    cadenceOption: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    selectedCadence: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    cadenceLabel: {
        fontWeight: 'bold',
        marginBottom: theme.spacing.xs,
        color: theme.colors.textPrimary,
    },
    cadenceDescription: {
        color: theme.colors.textSecondary,
    },
    selectedCadenceText: {
        color: '#ffffff',
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.m,
        marginTop: 'auto',
    },
    cancelButton: {
        flex: 1,
    },
    nextButton: {
        flex: 2,
    },
});
