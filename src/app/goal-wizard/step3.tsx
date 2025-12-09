import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { WizardProgressBar } from '../../components/WizardProgressBar';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';

const DATE_OPTIONS = [
    { label: 'About 1 month', months: 1 },
    { label: 'About 3 months', months: 3 },
    { label: 'About 6 months', months: 6 },
    { label: 'About 12 months', months: 12 },
    { label: 'Pick a specific date', value: 'custom' },
];

export default function Step3() {
    const router = useRouter();
    const { data, updateData } = useWizard();

    const [targetDate, setTargetDate] = useState(new Date(data.target_date));
    const [selectedDateOption, setSelectedDateOption] = useState<string | number | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 7); // 7 days minimum
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1); // 12 months

    const handleDateOptionSelect = (option: typeof DATE_OPTIONS[0]) => {
        if (option.value === 'custom') {
            setSelectedDateOption('custom');
            setShowDatePicker(true);
        } else {
            let newDate = new Date();
            newDate.setMonth(newDate.getMonth() + Math.floor(option.months || 0));
            if (option.months === 0.25) {
                // Special case for 1 week
                newDate = new Date();
                newDate.setDate(newDate.getDate() + 7);
            }

            // Ensure we don't go below minDate
            if (newDate < minDate) {
                newDate = new Date(minDate);
            }
            setTargetDate(newDate);
            setSelectedDateOption(option.months || null);
            setShowDatePicker(false);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (selectedDate) {
            setTargetDate(selectedDate);
        }
    };

    const handleNext = () => {
        updateData({
            target_date: targetDate.toISOString(),
        });
        router.push('/goal-wizard/cadence');
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.content}>
                <WizardProgressBar currentStep={7} totalSteps={12} />
                <View style={styles.header}>
                    <AppText variant="headingL">About when would you like to reach this goal?</AppText>
                    <AppText variant="body" style={styles.subtitle}>
                        Set a target and a pace you can sustain.
                    </AppText>
                </View>

                <View style={styles.section}>
                    <AppText variant="caption" style={styles.label}>Target Date</AppText>
                    <View style={styles.optionsContainer}>
                        {DATE_OPTIONS.map((option, index) => {
                            const isSelected = option.value === 'custom'
                                ? selectedDateOption === 'custom'
                                : selectedDateOption === option.months;

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.optionButton,
                                        isSelected && styles.selectedOption
                                    ]}
                                    onPress={() => handleDateOptionSelect(option)}
                                >
                                    <AppText
                                        variant="body"
                                        style={[
                                            styles.optionText,
                                            isSelected && styles.selectedOptionText
                                        ]}
                                    >
                                        {option.label}
                                    </AppText>
                                    {isSelected && option.value !== 'custom' && (
                                        <AppText variant="caption" style={styles.datePreview}>
                                            {targetDate.toDateString()}
                                        </AppText>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {selectedDateOption === 'custom' && (
                        <View style={styles.datePickerContainer}>
                            {Platform.OS === 'ios' ? (
                                <DateTimePicker
                                    value={targetDate}
                                    mode="date"
                                    display="inline"
                                    minimumDate={minDate}
                                    maximumDate={maxDate}
                                    onChange={handleDateChange}
                                    style={styles.datePicker}
                                    themeVariant="dark"
                                />
                            ) : (
                                showDatePicker && (
                                    <DateTimePicker
                                        value={targetDate}
                                        mode="date"
                                        display="default"
                                        minimumDate={minDate}
                                        maximumDate={maxDate}
                                        onChange={handleDateChange}
                                    />
                                )
                            )}
                            {Platform.OS === 'android' && (
                                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.androidDateButton}>
                                    <AppText variant="body">{targetDate.toDateString()}</AppText>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

                <Button
                    title="Next"
                    onPress={handleNext}
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
    label: {
        marginBottom: theme.spacing.s,
    },
    optionsContainer: {
        gap: theme.spacing.s,
    },
    optionButton: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedOption: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surfaceHighlight, // Assuming this exists or similar
    },
    optionText: {
        color: theme.colors.textPrimary,
    },
    selectedOptionText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    datePreview: {
        color: theme.colors.primary,
    },
    datePickerContainer: {
        marginTop: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.s,
    },
    datePicker: {
        height: 300,
    },
    androidDateButton: {
        padding: theme.spacing.m,
        alignItems: 'center',
    },
    button: {
        marginTop: 'auto',
    },
});
