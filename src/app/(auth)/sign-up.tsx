import React, { useState } from 'react';
import { View, StyleSheet, Alert, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { theme } from '../../theme';
import { supabase } from '../../api/supabaseClient';

export default function SignUp() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                Alert.alert('Error', error.message);
                setLoading(false);
                return;
            }

            // Note: User row is automatically created by database trigger (on_auth_user_created)
            // Auth state listener in _layout.tsx will automatically redirect to onboarding
            Alert.alert('Success', 'Account created! Setting up your profile...');
        } catch (err) {
            Alert.alert('Error', 'An unexpected error occurred');
            console.error('Sign up error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <AppText variant="headingL">Create Account</AppText>
                <AppText variant="body" style={styles.subtitle}>
                    Begin your journey.
                </AppText>
            </View>

            <View style={styles.form}>
                <Input
                    label="Email"
                    placeholder="hero@example.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <Input
                    label="Password"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <Button
                title="Sign Up"
                onPress={handleSignUp}
                loading={loading}
                style={styles.button}
            />

            <Button
                title="Back"
                variant="outline"
                onPress={() => router.back()}
            />

            <View style={styles.legalLinks}>
                <Pressable onPress={() => router.push('/privacy-policy' as any)}>
                    <AppText variant="caption" style={styles.legalLink}>Privacy Policy</AppText>
                </Pressable>
                <AppText variant="caption" style={styles.legalSeparator}>•</AppText>
                <Pressable onPress={() => router.push('/terms-of-service' as any)}>
                    <AppText variant="caption" style={styles.legalLink}>Terms of Service</AppText>
                </Pressable>
            </View>

            <Pressable
                style={styles.supportLink}
                onPress={() => Linking.openURL('mailto:info@chroniclehabit.com')}
            >
                <AppText variant="caption" style={styles.supportText}>
                    Need help? Contact info@chroniclehabit.com
                </AppText>
            </Pressable>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    subtitle: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    form: {
        marginBottom: theme.spacing.xl,
    },
    button: {
        marginBottom: theme.spacing.m,
    },
    legalLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing.l,
        gap: 8,
    },
    legalLink: {
        color: theme.colors.textSecondary,
        fontSize: 12,
    },
    legalSeparator: {
        color: theme.colors.textSecondary,
        fontSize: 12,
    },
    supportLink: {
        marginTop: theme.spacing.m,
        alignItems: 'center',
    },
    supportText: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});
