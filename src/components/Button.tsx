import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../theme';
import { AppText } from './AppText';

interface ButtonProps {
    title: string;
    subtitle?: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    subtitle,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    const getBackgroundColor = () => {
        if (disabled) return theme.colors.backgroundElevated;
        switch (variant) {
            case 'primary': return theme.colors.primary;
            case 'secondary': return theme.colors.backgroundElevated;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            default: return theme.colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return theme.colors.textSecondary;
        switch (variant) {
            case 'primary': return '#ffffff';
            case 'secondary': return theme.colors.textPrimary;
            case 'outline': return theme.colors.primary;
            case 'ghost': return theme.colors.textSecondary;
            default: return '#ffffff';
        }
    };

    const getSubtitleColor = () => {
        if (disabled) return theme.colors.textSecondary;
        switch (variant) {
            case 'primary': return 'rgba(255, 255, 255, 0.8)';
            case 'secondary': return theme.colors.textSecondary;
            default: return theme.colors.textSecondary;
        }
    };

    const getBorder = () => {
        if (variant === 'outline') return { borderWidth: 2, borderColor: theme.colors.primary };
        return { borderColor: 'transparent' };
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.container,
                { backgroundColor: getBackgroundColor() },
                getBorder(),
                style,
                subtitle ? { height: 'auto', paddingVertical: 12 } : {}
            ]}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    <AppText style={[{ color: getTextColor(), fontWeight: '600', textAlign: 'center' }, textStyle]}>
                        {title}
                    </AppText>
                    {subtitle && (
                        <AppText variant="caption" style={{ color: getSubtitleColor(), marginTop: 4, textAlign: 'center' }}>
                            {subtitle}
                        </AppText>
                    )}
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.l,
        borderWidth: 2,
        borderColor: 'transparent', // Default, overridden by getBorder or style

    },
});
