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

export default function Step2e() {
    const router = useRouter();
    const { data, updateData } = useWizard();

    const [notes, setNotes] = useState(data.context_notes || '');

    const handleNext = () => {
        updateData({
            context_notes: notes,
        });
        router.push('/goal-wizard/step3');
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.content}>
                <WizardProgressBar currentStep={6} totalSteps={12} />

                <View style={styles.header}>
                    <AppText variant="headingL">Any other thoughts?</AppText>
                    <AppText variant="body" style={styles.subtitle}>
                        Share anything else that might help shape your saga.
                    </AppText>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Any general notes?"
                        placeholder="Any other context you want to provide..."
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={4}
                    />
                    <TouchableOpacity onPress={handleNext} style={styles.skipButton}>
                        <AppText variant="bodySmall" style={styles.skipText}>Skip</AppText>
                    </TouchableOpacity>
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
    form: {
        flex: 1,
        marginBottom: theme.spacing.xl,
    },
    button: {
        marginTop: 'auto',
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
