import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';

const GOAL_TYPES = [
    'Fitness',
    'Reading',
    'Learning',
    'Morning Routine',
    'Meditation',
    'Custom',
];

export default function Step1() {
    const router = useRouter();
    const { updateData } = useWizard();

    const handleSelect = (type: string) => {
        // For MVP, we just use the type as the initial title or category
        updateData({ title: type === 'Custom' ? '' : `My ${type} Goal` });
        router.push('/goal-wizard/step2');
    };

    return (
        <ScreenWrapper>
            <AppText variant="headingL" style={styles.title}>What's your quest?</AppText>
            <AppText variant="body" style={styles.subtitle}>Choose a category for your new saga.</AppText>

            <FlatList
                data={GOAL_TYPES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <Button
                        title={item}
                        variant="secondary"
                        onPress={() => handleSelect(item)}
                        style={styles.button}
                    />
                )}
                contentContainerStyle={styles.list}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    title: {
        marginTop: theme.spacing.l,
        marginBottom: theme.spacing.s,
        textAlign: 'center',
    },
    subtitle: {
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
        color: theme.colors.textSecondary,
    },
    list: {
        gap: theme.spacing.m,
    },
    button: {
        marginBottom: theme.spacing.m,
    },
});
