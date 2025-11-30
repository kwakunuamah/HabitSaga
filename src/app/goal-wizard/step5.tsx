import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { theme } from '../../theme';
import { useWizard } from './WizardContext';

export default function Step5() {
    const router = useRouter();
    const { updateData } = useWizard();
    const [image, setImage] = useState<string | null>(null);

    const pickImage = async () => {
        // Request permissions
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera permission is required to take a selfie.');
            return;
        }

        // Launch camera
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleNext = () => {
        // Allow skipping for MVP if no image
        updateData({ selfie_uri: image || undefined });
        router.push('/goal-wizard/step6');
    };

    return (
        <ScreenWrapper>
            <AppText variant="headingL" style={styles.title}>Meet Your Hero</AppText>
            <AppText variant="body" style={styles.subtitle}>
                Take a selfie to star in your saga.
            </AppText>

            <View style={styles.imageContainer}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder} />
                )}
            </View>

            <Button title={image ? "Retake Photo" : "Take Selfie"} onPress={pickImage} style={styles.button} />

            <Button
                title={image ? "Next" : "Skip for now"}
                variant={image ? "primary" : "secondary"}
                onPress={handleNext}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    title: {
        marginTop: theme.spacing.l,
        marginBottom: theme.spacing.s,
        textAlign: 'center',
    },
    subtitle: {
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
        color: theme.colors.textSecondary,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 100,
    },
    placeholder: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: theme.colors.backgroundElevated,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
    },
    button: {
        marginBottom: theme.spacing.m,
    },
});
