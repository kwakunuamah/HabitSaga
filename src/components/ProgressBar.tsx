import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { theme } from '../theme';

interface ProgressBarProps {
    current: number;
    total: number;
    showLabel?: boolean;
    label?: string;
    color?: string;
    style?: ViewStyle;
    height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    current,
    total,
    showLabel = false,
    label,
    color = theme.colors.primary,
    style,
    height = 8,
}) => {
    const percentage = Math.min(Math.max((current / total) * 100, 0), 100);

    return (
        <View style={[styles.container, style]}>
            {(showLabel || label) && (
                <View style={styles.labelContainer}>
                    <AppText variant="caption" style={styles.label}>
                        {label || `${current} / ${total}`}
                    </AppText>
                    <AppText variant="caption" style={styles.percentage}>
                        {Math.round(percentage)}%
                    </AppText>
                </View>
            )}
            <View style={[styles.track, { height, borderRadius: height / 2 }]}>
                <View
                    style={[
                        styles.fill,
                        {
                            width: `${percentage}%`,
                            backgroundColor: color,
                            borderRadius: height / 2,
                        },
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xs,
    },
    label: {
        color: theme.colors.textSecondary,
    },
    percentage: {
        color: theme.colors.textSecondary,
        fontWeight: 'bold',
    },
    track: {
        width: '100%',
        backgroundColor: theme.colors.surfaceHighlight,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
    },
});
