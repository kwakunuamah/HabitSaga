import React, { useState } from 'react';
import { TextInput, StyleSheet, View, TextInputProps, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { theme } from '../theme';
import { AppText } from './AppText';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, secureTextEntry, ...props }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPassword = secureTextEntry === true;

    return (
        <View style={styles.container}>
            {label && <AppText variant="caption" style={styles.label}>{label}</AppText>}
            <View style={[
                styles.inputContainer,
                error && styles.inputError,
                style,
            ]}>
                <TextInput
                    style={styles.inputField}
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.eyeIcon}
                    >
                        {isPasswordVisible ? (
                            <EyeOff size={20} color={theme.colors.textSecondary} />
                        ) : (
                            <Eye size={20} color={theme.colors.textSecondary} />
                        )}
                    </TouchableOpacity>
                )}
            </View>
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
    inputContainer: {
        height: 48,
        backgroundColor: theme.colors.backgroundElevated,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: theme.colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.m,
    },
    inputField: {
        flex: 1,
        color: theme.colors.textPrimary,
        fontSize: 16,
        height: '100%',
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: theme.spacing.xs,
    },
    eyeIcon: {
        marginLeft: theme.spacing.s,
    },
});
