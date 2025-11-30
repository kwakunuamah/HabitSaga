import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';
import { Theme } from '../../types';

const THEMES: Theme[] = [
    'superhero',
    'fantasy',
    'sci-fi',
    'anime',
    'custom',
];

export default function Step4() {
    const router = useRouter();
    const { updateData } = useWizard();

    const handleSelect = (selectedTheme: Theme) => {
        updateData({ theme: selectedTheme });
        router.push('/goal-wizard/step5');
    };

    return (
        <ScreenWrapper>
            <AppText variant="headingL" style={styles.title}>Pick your world</AppText>

            <FlatList
                data={THEMES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <Button
                        title={item.charAt(0).toUpperCase() + item.slice(1)}
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
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    list: {
        gap: theme.spacing.m,
    },
    button: {
        marginBottom: theme.spacing.m,
    },
});
