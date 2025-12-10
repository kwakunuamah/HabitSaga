import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { WizardProgressBar } from '../../components/WizardProgressBar';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';
import { useWizardCancel } from './useWizardCancel';

const FREQUENCY_OPTIONS = [
    'Not at all yet',
    '1-2 times a week',
    '3-4 times a week',
    'Almost every day',
];

export default function Step2a() {
    const router = useRouter();
    const { data, updateData } = useWizard();
    const { handleCancel } = useWizardCancel();

    const [frequency, setFrequency] = useState(data.context_current_frequency || '');

    const handleNext = () => {
        updateData({
            context_current_frequency: frequency,
        });
        router.push('/goal-wizard/step2b');
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.content}>
                <WizardProgressBar currentStep={2} totalSteps={12} />

                <View style={styles.header}>
                    <AppText variant="headingL">Help us shape your saga</AppText>
                    <AppText variant="body" style={styles.subtitle}>
                        We'll use this to give better tips and more relevant story beats.
                    </AppText>
                </View>

                <View style={styles.form}>
                    <View style={styles.section}>
                        <AppText variant="caption" style={styles.label}>
                            How often are you currently working on this?
                        </AppText>
                        <View style={styles.optionsContainer}>
                            {FREQUENCY_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.optionChip,
                                        frequency === option && styles.selectedChip,
                                    ]}
                                    onPress={() => setFrequency(option)}
                                >
                                    <AppText
                                        variant="bodySmall"
                                        style={[
                                            styles.chipText,
                                            frequency === option && styles.selectedChipText,
                                        ]}
                                    >
                                        {option}
                                    </AppText>
                                </TouchableOpacity>
                            ))}
                        </View>
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
    },
    header: {
        marginBottom: theme.spacing.xl,
    },
    subtitle: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    form: {
        marginBottom: theme.spacing.xl,
        gap: theme.spacing.l,
    },
    section: {
        gap: theme.spacing.s,
    },
    label: {
        marginBottom: theme.spacing.xs,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.s,
    },
    optionChip: {
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    selectedChip: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    chipText: {
        color: theme.colors.textPrimary,
    },
    selectedChipText: {
        color: '#ffffff',
        fontWeight: 'bold',
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
