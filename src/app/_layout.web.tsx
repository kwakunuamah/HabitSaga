import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { theme } from '../theme';
import React from 'react';

// Simple error boundary for debugging
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red' }}>Something went wrong</Text>
                    <Text style={{ marginTop: 10, color: '#333' }}>{this.state.error?.message}</Text>
                </View>
            );
        }
        return this.props.children;
    }
}

/**
 * Web-specific Root Layout
 * 
 * This layout overrides the native app layout to provide a lightweight,
 * static-site context for the marketing pages. It strips away:
 * - AuthContext: We don't want login/session checks on the marketing site.
 * - RevenueCat: No in-app purchases on the web landing page.
 * - Push Notifications logic.
 */
export default function RootLayoutWeb() {
    console.log('[RootLayoutWeb] Rendering...');
    return (
        <ErrorBoundary>
            <SafeAreaProvider>
                <View style={styles.container}>
                    <View style={styles.contentContainer}>
                        <Slot />
                    </View>
                    <StatusBar style="dark" />
                </View>
            </SafeAreaProvider>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Force white background for web
        overflow: 'hidden', // Prevent bounce scroll on body if possible
    },
    contentContainer: {
        flex: 1,
        // Center the content on very large screens if desired, but for now
        // we'll let the individual pages handle their max-widths.
        width: '100%',
        height: '100%',
    }
});
