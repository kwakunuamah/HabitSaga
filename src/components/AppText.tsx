import React from 'react';
import { Text, TextProps, TextStyle, StyleProp } from 'react-native';
import { theme } from '../theme';

interface AppTextProps extends TextProps {
    variant?: keyof typeof theme.typography;
    style?: StyleProp<TextStyle>;
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
