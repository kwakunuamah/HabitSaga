import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { User, Camera, Upload, Sparkles } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { theme } from '../../theme';
import { supabase } from '../../api/supabaseClient';
import { useAuth } from '../../state/AuthContext';

type AvatarMode = 'selfie' | 'upload' | 'skip' | null;

export default function Avatar() {
    const router = useRouter();
    const { refreshProfile } = useAuth();
    const [image, setImage] = useState<string | null>(null);
    const [selectedMode, setSelectedMode] = useState<AvatarMode>(null);
    const [uploading, setUploading] = useState(false);

    const takeSelfie = async () => {
        // Request camera permissions
        const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permission Needed',
                'Camera permission is required to take a selfie. Please enable it in your device settings.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Open Settings',
                        onPress: () => Linking.openSettings()
                    }
                ]
            );
            return;
        }

        // Launch camera
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setSelectedMode('selfie');
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
            setImage(result.assets[0].uri);
            setSelectedMode('upload');
        }
    };

    const handleSkip = () => {
        setSelectedMode('skip');
        setImage(null);
    };

    const uploadImage = async (uri: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
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
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    const handleContinue = async () => {
        setUploading(true);
        try {
            let avatarUrl = null;
            if (image) {
                avatarUrl = await uploadImage(image);
            }

            // Update user profile with avatar URL (or null if skipped)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase
                    .from('users')
                    .update({
                        avatar_url: avatarUrl,
                    })
                    .eq('id', user.id);

                if (error) throw error;
            }

            await refreshProfile();
            // Navigate to Start Saga screen
            router.replace('/onboarding/start-saga');
        } catch (error) {
            console.error('Avatar save error:', error);
            Alert.alert('Error', 'Failed to save avatar. You can continue without it.');
            router.replace('/onboarding/start-saga');
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <AppText variant="headingL">Make yourself the hero</AppText>
                    <AppText variant="body" style={styles.subtitle}>
                        Choose how you'd like to create your avatar. It will appear in your saga illustrations.
                    </AppText>
                </View>

                {/* Image Preview */}
                {image && (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: image }} style={styles.previewImage} />
                    </View>
                )}

                {/* Three Options */}
                <View style={styles.optionsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.optionCard,
                            selectedMode === 'selfie' && styles.optionCardSelected
                        ]}
                        onPress={takeSelfie}
                    >
                        <View style={styles.iconContainer}>
                            <Camera size={32} color={selectedMode === 'selfie' ? theme.colors.primary : theme.colors.textSecondary} />
                        </View>
                        <AppText variant="body" style={[styles.optionTitle, selectedMode === 'selfie' && styles.optionTitleSelected]}>
                            Take a Selfie
                        </AppText>
                        <AppText variant="bodySmall" style={styles.optionDescription}>
                            Capture a photo with your camera
                        </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.optionCard,
                            selectedMode === 'upload' && styles.optionCardSelected
                        ]}
                        onPress={pickImage}
                    >
                        <View style={styles.iconContainer}>
                            <Upload size={32} color={selectedMode === 'upload' ? theme.colors.primary : theme.colors.textSecondary} />
                        </View>
                        <AppText variant="body" style={[styles.optionTitle, selectedMode === 'upload' && styles.optionTitleSelected]}>
                            Upload Photo
                        </AppText>
                        <AppText variant="bodySmall" style={styles.optionDescription}>
                            Choose from your photo library
                        </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.optionCard,
                            selectedMode === 'skip' && styles.optionCardSelected
                        ]}
                        onPress={handleSkip}
                    >
                        <View style={styles.iconContainer}>
                            <Sparkles size={32} color={selectedMode === 'skip' ? theme.colors.primary : theme.colors.textSecondary} />
                        </View>
                        <AppText variant="body" style={[styles.optionTitle, selectedMode === 'skip' && styles.optionTitleSelected]}>
                            Skip for Now
                        </AppText>
                        <AppText variant="bodySmall" style={styles.optionDescription}>
                            We'll generate an avatar for you
                        </AppText>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Button
                        title={selectedMode ? "Continue" : "Choose an option above"}
                        onPress={handleContinue}
                        loading={uploading}
                        disabled={!selectedMode || uploading}
                        variant="primary"
                    />
                    {selectedMode === 'upload' && (
                        <AppText variant="caption" style={styles.guidanceText}>
                            💡 Choose a clear photo of your face for best results
                        </AppText>
                    )}
                    <AppText variant="caption" style={styles.disclaimerText}>
                        Inappropriate images may result in account termination.
                    </AppText>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        paddingVertical: theme.spacing.xl,
        gap: theme.spacing.xl,
    },
    header: {
        alignItems: 'center',
    },
    subtitle: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.s,
        paddingHorizontal: theme.spacing.m,
    },
    previewContainer: {
        alignItems: 'center',
        marginVertical: theme.spacing.m,
    },
    previewImage: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 3,
        borderColor: theme.colors.primary,
    },
    optionsContainer: {
        gap: theme.spacing.m,
    },
    optionCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        borderWidth: 2,
        borderColor: theme.colors.border,
        alignItems: 'center',
        gap: theme.spacing.s,
    },
    optionCardSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surfaceHighlight,
    },
    iconContainer: {
        marginBottom: theme.spacing.xs,
    },
    optionTitle: {
        fontWeight: '600',
    },
    optionTitleSelected: {
        color: theme.colors.primary,
    },
    optionDescription: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    footer: {
        gap: theme.spacing.s,
        marginTop: 'auto',
    },
    guidanceText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },
    disclaimerText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        fontSize: 11,
        marginTop: theme.spacing.xs,
    },
});
