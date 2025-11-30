import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';

export default function Step2() {
    const router = useRouter();
    const { data, updateData } = useWizard();
    const [title, setTitle] = useState(data.title);

    // Simple date handling for MVP (YYYY-MM-DD)
    // Ideally use a DatePicker library
    const [targetDate, setTargetDate] = useState('2025-12-31');

    const handleNext = () => {
        if (!title.trim()) {
            Alert.alert('Validation', 'Please enter a goal title.');
            return;
        }
        updateData({ title, target_date: targetDate });
        router.push('/goal-wizard/step3');
    };

    return (
        <ScreenWrapper>
            <AppText variant="headingL" style={styles.title}>Define your goal</AppText>

            <View style={styles.form}>
                <Input
                    label="Goal Title"
                    placeholder="e.g. Read 10 Books"
                    value={title}
                    onChangeText={setTitle}
                />

                <Input
                    label="Target Date (YYYY-MM-DD)"
                    placeholder="2025-12-31"
                    value={targetDate}
                    onChangeText={setTargetDate}
                />
            </View>

            <Button title="Next" onPress={handleNext} />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    title: {
        marginTop: theme.spacing.l,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    form: {
        marginBottom: theme.spacing.xl,
    },
});
