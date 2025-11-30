import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { theme } from '../theme';

interface AppTextProps extends TextProps {
    variant?: keyof typeof theme.typography;
    style?: TextStyle;
}

export const AppText: React.FC<AppTextProps> = ({
    children,
    variant = 'body',
    style,
    ...props
}) => {
    return (
        <Text
            style={[theme.typography[variant], style]}
            {...props}
        >
            {children}
        </Text>
    );
};
