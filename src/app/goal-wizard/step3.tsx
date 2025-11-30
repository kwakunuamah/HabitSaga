import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';
import { CadenceType } from '../../types';

export default function Step3() {
    const router = useRouter();
    const { updateData } = useWizard();

    const handleSelect = (type: CadenceType) => {
        updateData({ cadence: { type } });
        router.push('/goal-wizard/step4');
    };

    return (
        <ScreenWrapper>
            <AppText variant="headingL" style={styles.title}>How often?</AppText>

            <View style={styles.options}>
                <Button
                    title="Every Day"
                    variant="secondary"
                    onPress={() => handleSelect('daily')}
                    style={styles.button}
                />
                <Button
                    title="3x Per Week"
                    variant="secondary"
                    onPress={() => handleSelect('3x_week')}
                    style={styles.button}
                />
                <Button
                    title="Custom"
                    variant="secondary"
                    onPress={() => handleSelect('custom')}
                    style={styles.button}
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    title: {
        marginTop: theme.spacing.l,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    options: {
        gap: theme.spacing.m,
    },
    button: {
        marginBottom: theme.spacing.m,
    },
});
