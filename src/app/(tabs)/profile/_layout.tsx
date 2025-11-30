import { Stack } from 'expo-router';
import { theme } from '../../../theme';

export default function ProfileStack() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.textPrimary,
                contentStyle: { backgroundColor: theme.colors.background },
            }}
        >
            <Stack.Screen name="index" options={{ title: 'Profile' }} />
        </Stack>
    );
}
