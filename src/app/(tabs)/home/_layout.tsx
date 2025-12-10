import { Stack } from 'expo-router';
import { theme } from '../../../theme';

export default function HomeStack() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.textPrimary,
                contentStyle: { backgroundColor: theme.colors.background },
            }}
        >
            <Stack.Screen name="index" options={{ title: 'My Stories' }} />
            <Stack.Screen name="[id]" options={{ title: 'Story Timeline' }} />
            <Stack.Screen name="chapter/[chapterId]" options={{ title: 'Chapter' }} />
        </Stack>
    );
}
