import { Tabs } from 'expo-router';
import { theme } from '../../theme';
import { BookOpen, User, type LucideProps } from 'lucide-react-native';
import type { ComponentType } from 'react';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.backgroundElevated,
                    borderTopColor: theme.colors.border,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Stories',
                    tabBarIcon: ({ color, size }) => {
                        const Icon = BookOpen as ComponentType<LucideProps>;
                        return <Icon color={color} size={size} />;
                    },
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => {
                        const Icon = User as ComponentType<LucideProps>;
                        return <Icon color={color} size={size} />;
                    },
                }}
            />
        </Tabs>
    );
}
