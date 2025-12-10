import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, Pressable, Linking, Image, Alert, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { colors, theme } from '../../../theme';
import { useAuth } from '../../../state/AuthContext';
import { useSubscription } from '../../../providers/RevenueCatProvider';
import { habitSagaApi } from '../../../api/habitSagaApi';
import { rescheduleAllActiveGoals, registerForPushNotificationsAsync } from '../../../utils/notifications';
import { Crown, ChevronRight, User, Camera, Upload, Sparkles, X } from 'lucide-react-native';
import { supabase } from '../../../api/supabaseClient';

export default function Profile() {
    const router = useRouter();
    const { user, profile, signOut, refreshProfile } = useAuth();
    const { status, featureLimits } = useSubscription();
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [activeSagaCount, setActiveSagaCount] = useState<number | null>(null);

    // Fetch active saga count
    useEffect(() => {
        const fetchActiveSagas = async () => {
            try {
                const goals = await habitSagaApi.fetchGoalsWithStatus();
                setActiveSagaCount(goals.length);
            } catch (error) {
                console.error('Failed to fetch active sagas', error);
            }
        };

        fetchActiveSagas();
    }, []);

    // Load notification settings on mount
    useEffect(() => {
        async function loadSettings() {
            if (!user) return;

            const { data } = await supabase
                .from('users')
                .select('notifications_enabled, check_in_time')
                .eq('id', user.id)
                .single();

            if (data) {
                setNotificationsEnabled(data.notifications_enabled);

                // Parse check_in_time (format: "HH:MM:SS")
                if (data.check_in_time) {
                    const [hours, minutes] = data.check_in_time.split(':').map(Number);
                    const date = new Date();
                    date.setHours(hours, minutes, 0, 0);
                    setReminderTime(date);
                }
            }
        }

        loadSettings();
    }, [user]);

    const toggleNotifications = async (value: boolean) => {
        setNotificationsEnabled(value);

        if (value) {
            // Request permissions and register push token when enabling
            const token = await registerForPushNotificationsAsync();
            if (token) {
                await habitSagaApi.updatePushToken(token);
            }
        }

        await habitSagaApi.updateNotificationPreferences(value);
    };

    const handleTimeChange = async (_event: any, selectedDate?: Date) => {
        setShowTimePicker(false);

        if (selectedDate) {
            setReminderTime(selectedDate);

            // Format time as HH:MM:SS
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            const timeString = `${hours}:${minutes}:00`;

            // Save to database
            await habitSagaApi.updateCheckInTime(timeString);

            // Reschedule all active goals with new time
            await rescheduleAllActiveGoals(timeString);
        }
    };

    const getTierLabel = () => {
        if (status.tier === 'free') return 'Free Plan';
        if (status.tier === 'plus') return 'Plus Member';
        if (status.tier === 'premium') return 'Premium Member';
        return 'Free Plan';
    };

    const getGradientColors = () => {
        if (status.tier === 'premium') return ['#4c1d95', '#8b5cf6']; // Deep purple to violet
        if (status.tier === 'plus') return ['#1e3a8a', '#3b82f6']; // Deep blue to blue
        return [colors.backgroundElevated, colors.backgroundElevated]; // Flat for free
    };

    const isPaid = status.tier !== 'free';
    const textColor = isPaid ? '#FFFFFF' : colors.textPrimary;
    const subTextColor = isPaid ? 'rgba(255, 255, 255, 0.8)' : colors.textSecondary;

    const handleManageSubscription = () => {
        // Open App Store subscription management
        Linking.openURL('https://apps.apple.com/account/subscriptions');
    };

    const [isDeleting, setIsDeleting] = useState(false);

    // Avatar picker state
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const takeSelfie = async () => {
        const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permission Needed',
                'Camera permission is required to take a selfie. Please enable it in your device settings.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() }
                ]
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatarPreview(result.assets[0].uri);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatarPreview(result.assets[0].uri);
        }
    };

    const uploadAvatar = async (uri: string): Promise<string> => {
        if (!user) throw new Error('No user found');

        const response = await fetch(uri);
        const blob = await response.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();

        const fileName = `${user.id}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, arrayBuffer, {
                contentType: 'image/jpeg',
                upsert: false,
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        return publicUrl;
    };

    const handleSaveAvatar = async () => {
        if (!avatarPreview || !user) return;

        setIsUploadingAvatar(true);
        try {
            const avatarUrl = await uploadAvatar(avatarPreview);

            const { error } = await supabase
                .from('users')
                .update({ avatar_url: avatarUrl })
                .eq('id', user.id);

            if (error) throw error;

            await refreshProfile();
            setShowAvatarPicker(false);
            setAvatarPreview(null);
            Alert.alert('Success', 'Your avatar has been updated!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update avatar. Please try again.');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleRemoveAvatar = async () => {
        if (!user) return;

        setIsUploadingAvatar(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({ avatar_url: null })
                .eq('id', user.id);

            if (error) throw error;

            await refreshProfile();
            setShowAvatarPicker(false);
            setAvatarPreview(null);
            Alert.alert('Success', 'Avatar removed. We\'ll generate one for your saga.');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to remove avatar.');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This will permanently delete your account and all your data including:\n\n' +
            '• Your profile and avatar\n' +
            '• All your sagas and chapters\n' +
            '• Your progress and stats\n\n' +
            'If you have an active subscription, please cancel it in the App Store first.\n\n' +
            'This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Account',
                    style: 'destructive',
                    onPress: confirmDeletion,
                },
            ]
        );
    };

    const confirmDeletion = async () => {
        if (!user) return;

        setIsDeleting(true);
        try {
            const { data, error } = await supabase.rpc('delete_user_account', {
                p_user_id: user.id
            });

            if (error) {
                console.error('Account deletion error:', error);
                throw error;
            }

            // Sign out and show success
            await signOut();
            Alert.alert(
                'Account Deleted',
                'Your account and all data have been permanently deleted.'
            );
        } catch (error: any) {
            Alert.alert(
                'Deletion Failed',
                error.message || 'Failed to delete account. Please try again or contact support.'
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* User Info */}
                <View style={styles.section}>
                    <Pressable onPress={() => { setAvatarPreview(null); setShowAvatarPicker(true); }}>
                        <View style={styles.avatarContainer}>
                            {profile?.avatar_url ? (
                                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <User size={40} color={colors.textSecondary} />
                                </View>
                            )}
                            <View style={styles.avatarEditOverlay}>
                                <Camera size={18} color="#FFFFFF" />
                            </View>
                        </View>
                    </Pressable>
                    <AppText variant="headingM" style={styles.email}>{profile?.display_name || user?.email}</AppText>
                    {profile?.display_name && <AppText variant="bodySmall" style={styles.emailSub}>{user?.email}</AppText>}
                    <AppText variant="caption" style={styles.tapToEdit}>Tap avatar to change</AppText>
                </View>

                {/* Subscription Card */}
                <LinearGradient
                    colors={getGradientColors() as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.subscriptionCard, !isPaid && styles.freeCardBorder]}
                >
                    <View style={styles.subscriptionHeader}>
                        {isPaid && (
                            <Crown size={24} color="#FFD700" fill="#FFD700" />
                        )}
                        <AppText variant="headingM" style={[styles.tierLabel, { color: textColor }]}>
                            {getTierLabel()}
                        </AppText>
                    </View>

                    <View style={styles.limitsContainer}>
                        <View style={styles.limitRow}>
                            <AppText variant="caption" style={{ color: subTextColor }}>Active Stories</AppText>
                            <AppText variant="caption" style={[styles.limitValue, { color: textColor }]}>
                                {activeSagaCount !== null ? `${activeSagaCount} / ` : ''}{featureLimits.activeSagas}
                            </AppText>
                        </View>
                        <View style={styles.limitRow}>
                            <AppText variant="caption" style={{ color: subTextColor }}>Images/Month</AppText>
                            <AppText variant="caption" style={[styles.limitValue, { color: textColor }]}>
                                {featureLimits.imagesPerMonth}
                            </AppText>
                        </View>
                    </View>

                    {status.tier === 'free' ? (
                        <Button
                            title="Upgrade to Premium"
                            onPress={() => router.push('/paywall')}
                            style={styles.upgradeButton}
                            variant="primary"
                        />
                    ) : (
                        <Pressable style={styles.manageButton} onPress={handleManageSubscription}>
                            <AppText style={[styles.manageText, { color: textColor }]}>Manage Subscription</AppText>
                            <ChevronRight size={16} color={textColor} />
                        </Pressable>
                    )}
                </LinearGradient>

                {/* Settings */}
                <View style={styles.section}>
                    <AppText variant="headingM" style={styles.sectionTitle}>Settings</AppText>

                    <View style={styles.row}>
                        <AppText>Notifications</AppText>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={toggleNotifications}
                            trackColor={{ false: colors.backgroundElevated, true: colors.primary }}
                        />
                    </View>

                    {notificationsEnabled && (
                        <Pressable
                            style={styles.row}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <AppText>Reminder Time</AppText>
                            <AppText style={styles.timeText}>
                                {reminderTime.toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                })}
                            </AppText>
                        </Pressable>
                    )}

                    {showTimePicker && (
                        <DateTimePicker
                            value={reminderTime}
                            mode="time"
                            display="spinner"
                            onChange={handleTimeChange}
                        />
                    )}
                </View>

                {/* Legal Links */}
                <View style={styles.legalSection}>
                    <Pressable onPress={() => router.push('/privacy-policy' as any)} style={styles.legalRow}>
                        <AppText style={styles.legalLink}>Privacy Policy</AppText>
                        <ChevronRight size={16} color={colors.textSecondary} />
                    </Pressable>
                    <Pressable onPress={() => router.push('/terms-of-service' as any)} style={styles.legalRow}>
                        <AppText style={styles.legalLink}>Terms of Service</AppText>
                        <ChevronRight size={16} color={colors.textSecondary} />
                    </Pressable>
                    <Pressable onPress={() => Linking.openURL('https://habitsaga.com')} style={styles.legalRow}>
                        <AppText style={styles.legalLink}>Website</AppText>
                        <ChevronRight size={16} color={colors.textSecondary} />
                    </Pressable>
                    <Pressable onPress={() => Linking.openURL('mailto:info@habitsaga.com')} style={styles.legalRow}>
                        <AppText style={styles.legalLink}>Contact Us</AppText>
                        <ChevronRight size={16} color={colors.textSecondary} />
                    </Pressable>
                </View>

                <Button title="Log Out" onPress={signOut} variant="outline" style={styles.logoutButton} />

                {/* Delete Account - Required for iOS App Store compliance */}
                <Button
                    title={isDeleting ? 'Deleting...' : 'Delete Account'}
                    onPress={handleDeleteAccount}
                    variant="outline"
                    style={styles.deleteButton}
                    textStyle={styles.deleteButtonText}
                    disabled={isDeleting}
                />
            </ScrollView>

            {/* Avatar Picker Modal */}
            <Modal
                visible={showAvatarPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAvatarPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <AppText variant="headingM">Change Your Avatar</AppText>
                            <Pressable onPress={() => { setShowAvatarPicker(false); setAvatarPreview(null); }}>
                                <X size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>

                        {avatarPreview && (
                            <View style={styles.previewContainer}>
                                <Image source={{ uri: avatarPreview }} style={styles.previewImage} />
                            </View>
                        )}

                        <View style={styles.optionsContainer}>
                            <TouchableOpacity style={styles.optionCard} onPress={takeSelfie}>
                                <View style={styles.optionIconContainer}>
                                    <Camera size={28} color={colors.primary} />
                                </View>
                                <AppText variant="body" style={styles.optionTitle}>Take a Selfie</AppText>
                                <AppText variant="caption" style={styles.optionDescription}>Use your camera</AppText>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.optionCard} onPress={pickImage}>
                                <View style={styles.optionIconContainer}>
                                    <Upload size={28} color={colors.primary} />
                                </View>
                                <AppText variant="body" style={styles.optionTitle}>Upload Photo</AppText>
                                <AppText variant="caption" style={styles.optionDescription}>From your gallery</AppText>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.optionCard} onPress={handleRemoveAvatar}>
                                <View style={styles.optionIconContainer}>
                                    <Sparkles size={28} color={colors.primary} />
                                </View>
                                <AppText variant="body" style={styles.optionTitle}>Use Generated</AppText>
                                <AppText variant="caption" style={styles.optionDescription}>AI creates for you</AppText>
                            </TouchableOpacity>
                        </View>

                        <AppText variant="caption" style={styles.disclaimerText}>
                            Inappropriate images may result in account termination.
                        </AppText>

                        {avatarPreview && (
                            <Button
                                title={isUploadingAvatar ? 'Saving...' : 'Save Avatar'}
                                onPress={handleSaveAvatar}
                                loading={isUploadingAvatar}
                                disabled={isUploadingAvatar}
                                style={styles.saveButton}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    avatarContainer: {
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: colors.background,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.backgroundElevated,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: colors.background,
    },
    email: {
        marginBottom: 4,
    },
    emailSub: {
        color: colors.textSecondary,
    },
    subscriptionCard: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 32,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    freeCardBorder: {
        borderWidth: 1,
        borderColor: colors.border,
    },
    subscriptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    tierLabel: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    limitsContainer: {
        gap: 12,
        marginBottom: 24,
    },
    limitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    limitValue: {
        fontWeight: '700',
    },
    upgradeButton: {
        marginTop: 8,
    },
    manageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
    },
    manageText: {
        fontSize: 15,
        fontWeight: '600',
    },
    sectionTitle: {
        alignSelf: 'flex-start',
        marginBottom: 16,
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    timeText: {
        color: colors.primary,
        fontWeight: '600',
        fontSize: 16,
    },
    logoutButton: {
        marginTop: 'auto',
        marginBottom: 12,
    },
    legalSection: {
        width: '100%',
        marginBottom: 24,
    },
    legalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    legalLink: {
        fontSize: 15,
        color: colors.textSecondary,
    },
    deleteButton: {
        marginBottom: 40,
        borderColor: colors.error,
    },
    deleteButtonText: {
        color: colors.error,
    },
    avatarEditOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.background,
    },
    tapToEdit: {
        color: colors.textSecondary,
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    previewContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    previewImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: colors.primary,
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 20,
    },
    optionCard: {
        flex: 1,
        backgroundColor: colors.backgroundElevated,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    optionIconContainer: {
        marginBottom: 4,
    },
    optionTitle: {
        fontWeight: '600',
        fontSize: 13,
        textAlign: 'center',
    },
    optionDescription: {
        color: colors.textSecondary,
        fontSize: 11,
        textAlign: 'center',
    },
    saveButton: {
        marginTop: 8,
    },
    disclaimerText: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: 11,
        marginTop: 8,
    },
});
