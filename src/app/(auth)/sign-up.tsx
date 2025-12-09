import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
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
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                Alert.alert('Error', error.message);
                setLoading(false);
                return;
            }

            // Create user row in custom users table
            if (data.user) {
                const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                        id: data.user.id,
                        email: data.user.email,
                    });

                if (insertError) {
                    console.error('Error creating user profile:', insertError);
                    // Don't block the user - we'll handle this in the profile screen
                }
            }

            // Auth state listener in _layout.tsx will automatically redirect to onboarding
            // since the new user won't have a display_name yet
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
});
