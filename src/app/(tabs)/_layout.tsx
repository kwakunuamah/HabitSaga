import { Tabs } from 'expo-router';
import { theme } from '../../theme';
import { BookOpen, CheckCircle, User } from 'lucide-react-native';

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
                        const Icon = BookOpen as any;
                        return <Icon color={color} size={size} />;
                    },
                }}
            />
            <Tabs.Screen
                name="check-in"
                options={{
                    title: 'Check-in',
                    tabBarIcon: ({ color, size }) => {
                        const Icon = CheckCircle as any;
                        return <Icon color={color} size={size} />;
                    },
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => {
                        const Icon = User as any;
                        return <Icon color={color} size={size} />;
                    },
                }}
            />
        </Tabs>
    );
}
