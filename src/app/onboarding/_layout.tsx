import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="tutorial" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="avatar" />
            <Stack.Screen name="start-saga" />
        </Stack>
    );
}
