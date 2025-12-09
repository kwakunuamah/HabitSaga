import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
    withScrollView?: boolean; // Can implement later if needed
    keyboardAvoiding?: boolean; // Enable keyboard avoidance
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, style, keyboardAvoiding = false }) => {
    const { width } = useWindowDimensions();

    // Responsive breakpoints for tablet optimization
    const isTablet = width >= 768;
    const isLargeTablet = width >= 1024;

    // Dynamic padding based on screen size
    const horizontalPadding = isLargeTablet ? 64 : isTablet ? 40 : theme.spacing.l;

    // Maximum content width for centered layouts on large screens
    const maxContentWidth = isLargeTablet ? 720 : isTablet ? 600 : undefined;

    const content = (
        <View style={[
            styles.content,
            { paddingHorizontal: horizontalPadding },
            maxContentWidth && {
                maxWidth: maxContentWidth,
                alignSelf: 'center',
                width: '100%',
            }
        ]}>
            {children}
        </View>
    );

    const wrappedContent = keyboardAvoiding ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
                {content}
            </View>
        </TouchableWithoutFeedback>
    ) : content;

    return (
        <SafeAreaView style={[styles.container, style]}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
            {keyboardAvoiding ? (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingView}
                >
                    {wrappedContent}
                </KeyboardAvoidingView>
            ) : (
                wrappedContent
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
});

