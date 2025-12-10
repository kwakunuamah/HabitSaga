import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { WizardProgressBar } from '../../components/WizardProgressBar';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';
import { useWizardCancel } from './useWizardCancel';

export default function Step2d() {
    const router = useRouter();
    const { data, updateData } = useWizard();
    const { handleCancel } = useWizardCancel();

    const [pastEfforts, setPastEfforts] = useState(data.context_past_efforts || '');

    const handleNext = () => {
        updateData({
            context_past_efforts: pastEfforts,
        });
        router.push('/goal-wizard/step2e');
    };

    return (
        <ScreenWrapper keyboardAvoiding={true}>
            <ScrollView contentContainerStyle={styles.content}>
                <WizardProgressBar currentStep={5} totalSteps={12} />

                <View style={styles.header}>
                    <AppText variant="headingL">What have you tried before?</AppText>
                    <AppText variant="body" style={styles.subtitle}>
                        Let's learn from past attempts.
                    </AppText>
                </View>

                <View style={styles.form}>
                    <Input
                        label="What have you done in the past to accomplish this?"
                        placeholder="e.g. Tried a gym membership, used an app, worked with a trainer..."
                        value={pastEfforts}
                        onChangeText={setPastEfforts}
                        multiline
                        numberOfLines={4}
                    />
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
    form: {
        flex: 1,
        marginBottom: theme.spacing.xl,
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
