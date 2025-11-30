import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { theme } from '../../theme';

export default function Welcome() {
    const router = useRouter();

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.content}>
                <View style={styles.hero}>
                    {/* Placeholder for Hero Image */}
                    <View style={styles.placeholderImage} />
                    <AppText variant="headingXL" style={styles.title}>
                        Habit Saga
                    </AppText>
                    <AppText variant="body" style={styles.subtitle}>
                        Turn your daily habits into an epic story.
                    </AppText>
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Start My Saga"
                        onPress={() => router.push('/(auth)/sign-up')}
                        style={styles.button}
                    />
                    <Button
                        title="Log In"
                        variant="secondary"
                        onPress={() => router.push('/(auth)/login')}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.xl,
    },
    hero: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderImage: {
        width: 200,
        height: 200,
        backgroundColor: theme.colors.backgroundElevated,
        borderRadius: 100,
        marginBottom: theme.spacing.xl,
    },
    title: {
        textAlign: 'center',
        marginBottom: theme.spacing.m,
        color: theme.colors.primary,
    },
    subtitle: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        paddingHorizontal: theme.spacing.xl,
    },
    footer: {
        gap: theme.spacing.m,
    },
    button: {
        marginBottom: theme.spacing.s,
    },
});
