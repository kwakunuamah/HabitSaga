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
                <Stack.Screen name="step2" options={{ title: 'Details' }} />
                <Stack.Screen name="step3" options={{ title: 'Cadence' }} />
                <Stack.Screen name="step4" options={{ title: 'Theme' }} />
                <Stack.Screen name="step5" options={{ title: 'Your Hero' }} />
                <Stack.Screen name="step6" options={{ title: 'Origin Story', headerShown: false }} />
            </Stack>
        </WizardProvider>
    );
}
