import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';
import { habitSagaApi } from '../../api/habitSagaApi';
import { Chapter } from '../../types';

export default function Step6() {
    const router = useRouter();
    const { data, reset } = useWizard();
    const [loading, setLoading] = useState(true);
    const [originChapter, setOriginChapter] = useState<Chapter | null>(null);

    useEffect(() => {
        createGoal();
    }, []);

    const createGoal = async () => {
        try {
            const { originChapter } = await habitSagaApi.createGoalAndOrigin({
                title: data.title,
                target_date: data.target_date,
                cadence: data.cadence,
                theme: data.theme,
                selfie_uri: data.selfie_uri,
            });
            setOriginChapter(originChapter);
        } catch (error) {
            console.error(error);
            // Handle error (retry button, etc.)
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = () => {
        reset();
        router.replace('/(tabs)/home');
    };

    if (loading) {
        return (
            <ScreenWrapper style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <AppText style={styles.loadingText}>Generating your origin story...</AppText>
                <AppText variant="caption">Consulting the oracle (Gemini)...</AppText>
            </ScreenWrapper>
        );
    }

    if (!originChapter) {
        return (
            <ScreenWrapper style={styles.center}>
                <AppText style={{ color: theme.colors.error }}>Failed to generate origin.</AppText>
                <Button title="Retry" onPress={createGoal} style={{ marginTop: 20 }} />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <View style={styles.content}>
                <View style={styles.panel}>
                    {/* Placeholder for Origin Image */}
                    <AppText style={{ color: theme.colors.textSecondary }}>[Origin Comic Panel]</AppText>
                </View>

                <AppText variant="headingL" style={styles.title}>{originChapter.chapter_title}</AppText>

                <AppText variant="body" style={styles.text}>
                    {originChapter.chapter_text}
                </AppText>

                <Button title="Begin Saga" onPress={handleFinish} style={styles.button} />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: theme.spacing.l,
        marginBottom: theme.spacing.s,
    },
    content: {
        flex: 1,
        paddingVertical: theme.spacing.l,
    },
    panel: {
        height: 250,
        backgroundColor: theme.colors.backgroundElevated,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.l,
    },
    title: {
        marginBottom: theme.spacing.m,
        color: theme.colors.primary,
        textAlign: 'center',
    },
    text: {
        marginBottom: theme.spacing.xl,
    },
    button: {
        marginTop: 'auto',
    },
});
