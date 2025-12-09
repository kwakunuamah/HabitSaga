import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { theme } from '../theme';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container style={[styles.card, style]} onPress={onPress}>
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.backgroundElevated,
        borderRadius: 12,
        padding: theme.spacing.l,
        marginBottom: theme.spacing.m,
        borderWidth: 2,
        borderColor: theme.colors.border,


    },
});
