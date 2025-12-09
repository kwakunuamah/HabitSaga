import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { theme } from '../../theme';

export default function StartSaga() {
    const router = useRouter();

    return (
        <ScreenWrapper>
            <View style={styles.content}>
                <View style={styles.header}>
                    <AppText variant="headingXL" style={styles.title}>Start your first Story</AppText>
                    <AppText variant="body" style={styles.subtitle}>
                        Your hero is ready. It's time to define your first quest.
                    </AppText>
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Create New Story"
                        onPress={() => router.push('/goal-wizard/step1')}
                        variant="primary"
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: theme.spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    title: {
        textAlign: 'center',
        marginBottom: theme.spacing.m,
    },
    subtitle: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        paddingHorizontal: theme.spacing.xl,
    },
    footer: {
        paddingHorizontal: theme.spacing.m,
    },
});
