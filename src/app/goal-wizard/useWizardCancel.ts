import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useWizard } from './WizardContext';

/**
 * Hook for handling wizard cancellation with confirmation dialog.
 * Provides a consistent cancel experience across all wizard steps.
 */
export function useWizardCancel() {
    const router = useRouter();
    const { reset } = useWizard();

    const handleCancel = useCallback(() => {
        Alert.alert(
            'Cancel Goal Creation?',
            'Are you sure you want to cancel? Your progress will be lost.',
            [
                {
                    text: 'Keep Going',
                    style: 'cancel',
                },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: () => {
                        reset(); // Clear wizard data
                        router.replace('/(tabs)/home');
                    },
                },
            ],
            { cancelable: true }
        );
    }, [router, reset]);

    return { handleCancel };
}
