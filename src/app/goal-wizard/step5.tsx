import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload, Sparkles } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { WizardProgressBar } from '../../components/WizardProgressBar';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';

type AvatarMode = 'selfie' | 'upload' | 'skip' | null;

export default function Step5() {
    const router = useRouter();
    const { updateData } = useWizard();
    const [image, setImage] = useState<string | null>(null);
    const [selectedMode, setSelectedMode] = useState<AvatarMode>(null);

    const takeSelfie = async () => {
        // Request camera permissions
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
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

    const handleNext = () => {
        // Allow skipping for MVP if no image
        updateData({ selfie_uri: image || undefined });
        router.push('/goal-wizard/step6');
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <WizardProgressBar currentStep={12} totalSteps={12} />

                <View style={styles.header}>
                    <AppText variant="headingL" style={styles.title}>Meet Your Hero</AppText>
                    <AppText variant="body" style={styles.subtitle}>
                        Choose how you'd like to create your avatar
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
                            <Camera size={28} color={selectedMode === 'selfie' ? theme.colors.primary : theme.colors.textSecondary} />
                        </View>
                        <AppText variant="body" style={[styles.optionTitle, selectedMode === 'selfie' && styles.optionTitleSelected]}>
                            Take a Selfie
                        </AppText>
                        <AppText variant="bodySmall" style={styles.optionDescription}>
                            Capture with camera
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
                            <Upload size={28} color={selectedMode === 'upload' ? theme.colors.primary : theme.colors.textSecondary} />
                        </View>
                        <AppText variant="body" style={[styles.optionTitle, selectedMode === 'upload' && styles.optionTitleSelected]}>
                            Upload Photo
                        </AppText>
                        <AppText variant="bodySmall" style={styles.optionDescription}>
                            Choose from library
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
                            <Sparkles size={28} color={selectedMode === 'skip' ? theme.colors.primary : theme.colors.textSecondary} />
                        </View>
                        <AppText variant="body" style={[styles.optionTitle, selectedMode === 'skip' && styles.optionTitleSelected]}>
                            Skip for Now
                        </AppText>
                        <AppText variant="bodySmall" style={styles.optionDescription}>
                            We'll generate one
                        </AppText>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Button
                        title={selectedMode ? "Next" : "Choose an option above"}
                        onPress={handleNext}
                        disabled={!selectedMode}
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
        paddingVertical: theme.spacing.m,
        gap: theme.spacing.l,
    },
    header: {
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: theme.spacing.s,
    },
    subtitle: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
    },
    previewContainer: {
        alignItems: 'center',
        marginVertical: theme.spacing.m,
    },
    previewImage: {
        width: 140,
        height: 140,
        borderRadius: 70,
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
        gap: theme.spacing.xs,
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
        fontSize: 12,
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
