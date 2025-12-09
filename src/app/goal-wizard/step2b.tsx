import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { WizardProgressBar } from '../../components/WizardProgressBar';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';

export default function Step2b() {
    const router = useRouter();
    const { data, updateData } = useWizard();

    const [blocker, setBlocker] = useState(data.context_biggest_blocker || '');

    const handleNext = () => {
        updateData({
            context_biggest_blocker: blocker,
        });
        router.push('/goal-wizard/step2c');
    };

    return (
        <ScreenWrapper keyboardAvoiding={true}>
            <ScrollView contentContainerStyle={styles.content}>
                <WizardProgressBar currentStep={3} totalSteps={12} />

                <View style={styles.header}>
                    <AppText variant="headingL">What's been holding you back?</AppText>
                    <AppText variant="body" style={styles.subtitle}>
                        Understanding barriers helps us give better guidance.
                    </AppText>
                </View>

                <View style={styles.form}>
                    <Input
                        label="What's the biggest thing that's held you back?"
                        placeholder="e.g. Lack of time, motivation, past injuries..."
                        value={blocker}
                        onChangeText={setBlocker}
                        multiline
                        numberOfLines={4}
                    />
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
});
