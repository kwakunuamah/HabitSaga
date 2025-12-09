import React, { useState } from 'react';
import { Platform, Alert, StyleSheet, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '../api/supabaseClient';

interface AppleSignInButtonProps {
    style?: any;
}

export const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({ style }) => {
    const [loading, setLoading] = useState(false);

    // Only show on iOS
    if (Platform.OS !== 'ios') {
        return null;
    }

    const handleAppleSignIn = async () => {
        try {
            setLoading(true);

            // Generate a random nonce for security
            const nonce = Math.random().toString(36).substring(2, 10);

            // Initiate Apple authentication
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            // Sign in with Supabase using the Apple identity token
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'apple',
                token: credential.identityToken!,
                nonce,
            });

            if (error) {
                Alert.alert('Authentication Error', error.message);
            }

            // Session is automatically managed by AuthContext
        } catch (error: any) {
            if (error.code === 'ERR_REQUEST_CANCELED') {
                // User canceled the sign-in flow
                // Do nothing, just exit gracefully
            } else {
                Alert.alert('Error', 'Failed to sign in with Apple. Please try again.');
                console.error('Apple Sign In Error:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, style]}>
            <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={8}
                style={styles.button}
                onPress={handleAppleSignIn}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    button: {
        width: '100%',
        height: 48,
    },
});
