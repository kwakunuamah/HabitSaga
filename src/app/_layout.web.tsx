import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { theme } from '../theme';

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
    return (
        <SafeAreaProvider>
            <View style={styles.container}>
                <View style={styles.contentContainer}>
                    <Slot />
                </View>
                <StatusBar style="dark" />
            </View>
        </SafeAreaProvider>
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
