import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { WizardProgressBar } from '../../components/WizardProgressBar';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';

type TimeWindow = 'morning' | 'midday' | 'after_work' | 'night_before_bed';
type Location = 'home' | 'work_school' | 'commuting' | 'gym' | 'other';

const TIME_WINDOWS: { value: TimeWindow; label: string; description: string }[] = [
    { value: 'morning', label: 'Morning', description: 'Before 10am' },
    { value: 'midday', label: 'Mid-day', description: '11am–2pm' },
    { value: 'after_work', label: 'After work/school', description: '4–7pm' },
    { value: 'night_before_bed', label: 'Night/before bed', description: '8–10pm' },
];

const LOCATIONS: { value: Location; label: string }[] = [
    { value: 'home', label: 'At home' },
    { value: 'work_school', label: 'At work/school' },
    { value: 'commuting', label: 'Commuting' },
    { value: 'gym', label: 'Gym' },
    { value: 'other', label: 'Other' },
];

export default function CueContextStep() {
    const router = useRouter();
    const { data, updateData } = useWizard();
    const [timeWindow, setTimeWindow] = useState<TimeWindow | undefined>(
        data.habit_cue_time_window as TimeWindow | undefined
    );

    const handleNext = () => {
        updateData({
            habit_cue_time_window: timeWindow,
        });
        router.push('/goal-wizard/step-location');
    };

    const canProceed = timeWindow !== undefined;

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.content}>
                <WizardProgressBar currentStep={9} totalSteps={12} />

                <View style={styles.header}>
                    <AppText variant="headingL">When should Habit Chronicle nudge you?</AppText>
                    <AppText variant="body" style={styles.subtitle}>
                        We'll use these details to create your personalized habit plan.
                    </AppText>
                </View>

                <View style={styles.section}>
                    <AppText variant="headingS" style={styles.questionLabel}>
                        On days you work on this, when are you most likely to have 10–15 free minutes?
                    </AppText>
                    <View style={styles.chipContainer}>
                        {TIME_WINDOWS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.chip,
                                    timeWindow === option.value && styles.selectedChip,
                                ]}
                                onPress={() => setTimeWindow(option.value)}
                            >
                                <AppText
                                    variant="body"
                                    style={[
                                        styles.chipLabel,
                                        timeWindow === option.value && styles.selectedChipText,
                                    ]}
                                >
                                    {option.label}
                                </AppText>
                                <AppText
                                    variant="caption"
                                    style={[
                                        styles.chipDescription,
                                        timeWindow === option.value && styles.selectedChipText,
                                    ]}
                                >
                                    {option.description}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Button
                    title="Next"
                    onPress={handleNext}
                    disabled={!canProceed}
                    style={styles.button}
                />
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
    questionLabel: {
        marginBottom: theme.spacing.m,
        color: theme.colors.textPrimary,
    },
    chipContainer: {
        gap: theme.spacing.m,
    },
    chip: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    selectedChip: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    chipLabel: {
        fontWeight: 'bold',
        marginBottom: theme.spacing.xs,
        color: theme.colors.textPrimary,
    },
    chipDescription: {
        color: theme.colors.textSecondary,
    },
    selectedChipText: {
        color: '#ffffff',
    },
    button: {
        marginTop: 'auto',
    },
});
