import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { AppleSignInButton } from '../../components/AppleSignInButton';
import { theme } from '../../theme';

export default function Welcome() {
    const router = useRouter();

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.content}>
                <View style={styles.hero}>
                    {/* Hero Graphic */}
                    <Image
                        source={require('../../../assets/habitChronicle_Clear.png')}
                        style={styles.heroGraphic}
                    />
                    <AppText variant="body" style={styles.subtitle}>
                        Turn your daily habits into an epic story.
                    </AppText>
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Begin My Story"
                        onPress={() => router.push('/(auth)/sign-up')}
                        style={styles.button}
                    />

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <AppText variant="body" style={styles.dividerText}>or</AppText>
                        <View style={styles.dividerLine} />
                    </View>

                    <AppleSignInButton style={styles.appleButton} />

                    <Button
                        title="Log in with email"
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
    heroGraphic: {
        width: 300,
        height: 300,
        resizeMode: 'contain',
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
    appleButton: {
        marginBottom: theme.spacing.m,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.spacing.m,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.backgroundElevated,
    },
    dividerText: {
        color: theme.colors.textSecondary,
        paddingHorizontal: theme.spacing.m,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
