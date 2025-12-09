import { Stack } from 'expo-router';
import { WizardProvider } from './WizardContext';
import { theme } from '../../theme';

export default function WizardLayout() {
    return (
        <WizardProvider>
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: theme.colors.background },
                    headerTintColor: theme.colors.textPrimary,
                    contentStyle: { backgroundColor: theme.colors.background },
                }}
            >
                <Stack.Screen name="step1" options={{ title: 'Goal Type' }} />
                <Stack.Screen name="step2a" options={{ title: 'Frequency' }} />
                <Stack.Screen name="step2b" options={{ title: 'Blockers' }} />
                <Stack.Screen name="step2c" options={{ title: 'Current Status' }} />
                <Stack.Screen name="step2d" options={{ title: 'Past Efforts' }} />
                <Stack.Screen name="step2e" options={{ title: 'Notes' }} />
                <Stack.Screen name="step3" options={{ title: 'Target Date' }} />
                <Stack.Screen name="cadence" options={{ title: 'Check-in Cadence' }} />
                <Stack.Screen name="step-time" options={{ title: 'When' }} />
                <Stack.Screen name="step-location" options={{ title: 'Where' }} />
                <Stack.Screen name="step4" options={{ title: 'Theme' }} />
                <Stack.Screen name="step5" options={{ title: 'Your Hero' }} />
                <Stack.Screen name="step6" options={{ title: 'Origin Story', headerShown: false }} />
            </Stack>
        </WizardProvider>
    );
}
