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
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', 'Please check your email for confirmation!');
            // In a real app, we might auto-login or redirect to a "check email" screen.
            // For MVP, if auto-confirm is on in Supabase (dev), it will log them in.
        }
        setLoading(false);
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
