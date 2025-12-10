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

type Location = 'home' | 'work_school' | 'commuting' | 'gym' | 'other';

const LOCATIONS: { value: Location; label: string }[] = [
    { value: 'home', label: 'At home' },
    { value: 'work_school', label: 'At work/school' },
    { value: 'commuting', label: 'Commuting' },
    { value: 'gym', label: 'Gym' },
    { value: 'other', label: 'Other' },
];

export default function StepLocation() {
    const router = useRouter();
    const { data, updateData } = useWizard();
    const { handleCancel } = useWizardCancel();
    const [location, setLocation] = useState<Location | undefined>(
        data.habit_cue_location as Location | undefined
    );

    const handleNext = () => {
        updateData({
            habit_cue_location: location,
        });
        router.push('/goal-wizard/step4');
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.content}>
                <WizardProgressBar currentStep={10} totalSteps={12} />

                <View style={styles.header}>
                    <AppText variant="headingL">Where will you usually be then?</AppText>
                    <AppText variant="body" style={styles.subtitle}>
                        This helps us tailor your plan to your environment.
                    </AppText>
                </View>

                <View style={styles.section}>
                    <View style={styles.chipContainer}>
                        {LOCATIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.locationChip,
                                    location === option.value && styles.selectedLocationChip,
                                ]}
                                onPress={() => setLocation(option.value)}
                            >
                                <AppText
                                    variant="body"
                                    style={[
                                        styles.locationChipText,
                                        location === option.value && styles.selectedChipText,
                                    ]}
                                >
                                    {option.label}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity onPress={handleNext} style={styles.skipButton}>
                        <AppText variant="bodySmall" style={styles.skipText}>Skip</AppText>
                    </TouchableOpacity>
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
    chipContainer: {
        gap: theme.spacing.m,
    },
    locationChip: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.m, // Increased padding for better touch target
        borderRadius: theme.borderRadius.m, // Consistent with other buttons
        borderWidth: 2,
        borderColor: theme.colors.border,
        width: '100%', // Full width like the time options
    },
    selectedLocationChip: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    locationChipText: {
        color: theme.colors.textPrimary,
        fontWeight: 'bold',
    },
    selectedChipText: {
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
    skipButton: {
        alignSelf: 'center',
        marginTop: theme.spacing.m,
        padding: theme.spacing.s,
    },
    skipText: {
        color: theme.colors.textSecondary,
        textDecorationLine: 'underline',
    },
});
