import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';

const FREQUENCY_OPTIONS = [
    'Not at all yet',
    '1-2 times a week',
    '3-4 times a week',
    'Almost every day',
];

export default function Step2() {
    const router = useRouter();
    const { data, updateData } = useWizard();

    const [frequency, setFrequency] = useState(data.context_current_frequency || '');
    const [blocker, setBlocker] = useState(data.context_biggest_blocker || '');
    const [currentStatus, setCurrentStatus] = useState(data.context_current_status || '');
    const [pastEfforts, setPastEfforts] = useState(data.context_past_efforts || '');
    const [notes, setNotes] = useState(data.context_notes || '');
    const [showOptional, setShowOptional] = useState(false);

    const handleNext = () => {
        updateData({
            context_current_frequency: frequency,
            context_biggest_blocker: blocker,
            context_current_status: currentStatus,
            context_past_efforts: pastEfforts,
            context_notes: notes,
        });
        router.push('/goal-wizard/step3');
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.content}>
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

                <TouchableOpacity
                    onPress={() => setShowOptional(!showOptional)}
                    style={styles.toggleButton}
                >
                    <AppText style={styles.toggleButtonText}>
                        {showOptional ? 'Hide Optional Context' : 'Add More Context (Optional)'}
                    </AppText>
                </TouchableOpacity>

                {showOptional && (
                    <View style={styles.optionalFields}>
                        <Input
                            label="What's the biggest thing that's held you back?"
                            placeholder="e.g. Lack of time, motivation..."
                            value={blocker}
                            onChangeText={setBlocker}
                            multiline
                            numberOfLines={3}
                        />

                        <Input
                            label="Where are you today in terms of your goal?"
                            placeholder="e.g. Currently 250lbs, want to be 170lbs..."
                            value={currentStatus}
                            onChangeText={setCurrentStatus}
                            multiline
                            numberOfLines={3}
                        />

                        <Input
                            label="What have you done in the past to accomplish this?"
                            placeholder="e.g. Tried a gym membership, used an app..."
                            value={pastEfforts}
                            onChangeText={setPastEfforts}
                            multiline
                            numberOfLines={3}
                        />

                        <Input
                            label="Any general notes?"
                            placeholder="Any other context you want to provide..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                )}

                <Button
                    title="Next"
                    onPress={handleNext}
                    style={styles.button}
                />
            </ScrollView>
        </ScreenWrapper >
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
    button: {
        marginTop: 'auto',
    },
    toggleButton: {
        paddingVertical: theme.spacing.m,
        alignItems: 'center',
    },
    toggleButtonText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    optionalFields: {
        gap: theme.spacing.l,
        marginTop: theme.spacing.m,
    },
});
