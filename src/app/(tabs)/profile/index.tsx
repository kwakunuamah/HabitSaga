import React, { useState } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { theme } from '../../../theme';
import { useAuth } from '../../../state/AuthContext';
import { habitSagaApi } from '../../../api/habitSagaApi';

export default function Profile() {
    const { user, signOut } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(false); // Mock initial state

    const toggleNotifications = (value: boolean) => {
        setNotificationsEnabled(value);
        habitSagaApi.updateNotificationPreferences(value);
    };

    return (
        <ScreenWrapper>
            <View style={styles.section}>
                <View style={styles.avatarPlaceholder} />
                <AppText variant="headingM" style={styles.email}>{user?.email}</AppText>
                <AppText variant="caption">Free Tier</AppText>
            </View>

            <View style={styles.section}>
                <AppText variant="headingM" style={styles.sectionTitle}>Settings</AppText>

                <View style={styles.row}>
                    <AppText>Notifications</AppText>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={toggleNotifications}
                        trackColor={{ false: theme.colors.backgroundElevated, true: theme.colors.primary }}
                    />
                </View>
            </View>

            <Button title="Log Out" onPress={signOut} variant="outline" style={styles.logoutButton} />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: theme.spacing.xl,
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.backgroundElevated,
        marginBottom: theme.spacing.m,
    },
    email: {
        marginBottom: theme.spacing.xs,
    },
    sectionTitle: {
        alignSelf: 'flex-start',
        marginBottom: theme.spacing.m,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: theme.spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    logoutButton: {
        marginTop: 'auto',
        marginBottom: theme.spacing.xl,
    },
});
