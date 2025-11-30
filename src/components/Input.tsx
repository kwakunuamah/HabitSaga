import React from 'react';
import { TextInput, StyleSheet, View, TextInputProps } from 'react-native';
import { theme } from '../theme';
import { AppText } from './AppText';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
    return (
        <View style={styles.container}>
            {label && <AppText variant="caption" style={styles.label}>{label}</AppText>}
            <TextInput
                style={[
                    styles.input,
                    error && styles.inputError,
                    style,
                ]}
                placeholderTextColor={theme.colors.textSecondary}
                {...props}
            />
            {error && <AppText style={styles.errorText}>{error}</AppText>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.m,
    },
    label: {
        marginBottom: theme.spacing.xs,
        color: theme.colors.textSecondary,
    },
    input: {
        height: 48,
        backgroundColor: theme.colors.backgroundElevated,
        borderRadius: 8,
        paddingHorizontal: theme.spacing.m,
        color: theme.colors.textPrimary,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: theme.spacing.xs,
    },
});
