import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { WizardProgressBar } from '../../components/WizardProgressBar';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';
import { ThemeType } from '../../types'; // Ensure ThemeType is exported from types

const THEMES: { type: ThemeType; label: string; image: any }[] = [
    { type: 'superhero', label: 'Comic Superhero', image: require('../../../assets/themes/theme_superhero.png') },
    { type: 'fantasy', label: 'Magical Fantasy', image: require('../../../assets/themes/theme_fantasy.png') },
    { type: 'sci-fi', label: 'Cyber Sci-Fi', image: require('../../../assets/themes/theme_scifi.png') },
    { type: 'anime', label: 'Classic Anime', image: require('../../../assets/themes/theme_anime.png') },
    { type: 'noir', label: 'Mystery Noir', image: require('../../../assets/themes/theme_noir.png') },
    { type: 'action_adventure', label: 'Action Adventure', image: require('../../../assets/themes/action_adventure.png') },
    { type: 'pop_regency', label: 'Pop Regency', image: require('../../../assets/themes/pop_regency.png') },
];

export default function Step4() {
    const router = useRouter();
    const { data, updateData } = useWizard();
    const [selectedTheme, setSelectedTheme] = useState<ThemeType>(data.theme as ThemeType);

    const handleCreate = () => {
        updateData({ theme: selectedTheme });
        router.push('/goal-wizard/loading');
    };

    return (
        <ScreenWrapper>
            <WizardProgressBar currentStep={11} totalSteps={12} style={{ paddingHorizontal: theme.spacing.l }} />
            <View style={styles.header}>
                <AppText variant="headingL">Choose Your Story Style</AppText>
                <AppText variant="body" style={styles.subtitle}>
                    This will define the visual style of your journey.
                </AppText>
            </View>

            <ScrollView contentContainerStyle={styles.grid}>
                {THEMES.map((item) => (
                    <TouchableOpacity
                        key={item.type}
                        style={[
                            styles.card,
                            selectedTheme === item.type && styles.selectedCard,
                        ]}
                        onPress={() => setSelectedTheme(item.type)}
                    >
                        <Image source={item.image} style={styles.image} resizeMode="cover" />
                        <View style={styles.labelContainer}>
                            <AppText
                                variant="bodySmall"
                                style={[
                                    styles.label,
                                    selectedTheme === item.type && styles.selectedLabel,
                                ]}
                            >
                                {item.label}
                            </AppText>
                        </View>
                    </TouchableOpacity>
                ))}
                <View style={styles.scrollHintContainer}>
                    <AppText variant="caption" style={styles.scrollHintText}>
                        Scroll for more themes ↓
                    </AppText>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title="Create My Story"
                    onPress={handleCreate}
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingVertical: theme.spacing.xl,
    },
    subtitle: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.m,
        paddingBottom: theme.spacing.xl,
    },
    card: {
        width: '47%', // Roughly half minus gap
        aspectRatio: 2 / 3,
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        backgroundColor: theme.colors.surface,
    },
    selectedCard: {
        borderColor: theme.colors.primary,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    labelContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: theme.spacing.s,
        alignItems: 'center',
    },
    label: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    selectedLabel: {
        color: theme.colors.primary,
    },
    scrollHintContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: theme.spacing.m,
    },
    scrollHintText: {
        color: theme.colors.textSecondary,
        opacity: 0.8,
    },
    footer: {
        paddingVertical: theme.spacing.xl,
    },
});
