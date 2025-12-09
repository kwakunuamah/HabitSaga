import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { theme } from '../../theme';
import { supabase } from '../../api/supabaseClient';
import { useAuth } from '../../state/AuthContext';
import { logger } from '../../utils/logger';

const AGE_RANGES = [
    '13-17',
    '18-24',
    '25-34',
    '35-44',
    '45-54',
    '55+',
];



export default function Profile() {
    const router = useRouter();
    const { refreshProfile, user } = useAuth();
    const [name, setName] = useState('');
    const [ageRange, setAgeRange] = useState('');
    const [ageConfirmed, setAgeConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        if (!name || !ageRange) {
            Alert.alert('Missing Info', 'Please fill in all fields to continue.');
            return;
        }

        if (!ageConfirmed) {
            Alert.alert('Age Confirmation Required', 'Please confirm you are 13 years of age or older to continue.');
            return;
        }

        if (!user) {
            Alert.alert('Error', 'No user session found. Please sign in again.');
            return;
        }

        setLoading(true);
        try {
            logger.log('💾 Saving profile for user:', user.id, { display_name: name, age_range: ageRange });

            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Profile update timed out after 5s')), 5000);
            });

            // Use RPC function to bypass RLS policies
            const rpcPromise = supabase.rpc('update_user_profile', {
                p_user_id: user.id,
                p_display_name: name,
                p_age_range: ageRange,
                p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });

            const { error } = await Promise.race([rpcPromise, timeoutPromise]) as any;

            if (error) {
                logger.error('❌ Supabase RPC error:', JSON.stringify(error, null, 2));
                throw error;
            }

            logger.log('✅ Profile saved successfully, refreshing...');
            await refreshProfile(); // Refresh profile in context
            logger.log('✅ Profile refresh complete');
            router.push('/onboarding/avatar');
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper keyboardAvoiding>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <AppText variant="headingL">Create Your Hero</AppText>
                    <AppText variant="body" style={styles.subtitle}>
                        Help us personalize your saga.
                    </AppText>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Name / Nickname"
                        placeholder="What should we call you?"
                        value={name}
                        onChangeText={setName}
                    />

                    <View style={styles.section}>
                        <AppText variant="caption" style={styles.label}>Age Range</AppText>
                        <View style={styles.optionsContainer}>
                            {AGE_RANGES.map((range) => (
                                <TouchableOpacity
                                    key={range}
                                    style={[
                                        styles.optionChip,
                                        ageRange === range && styles.selectedChip,
                                    ]}
                                    onPress={() => setAgeRange(range)}
                                >
                                    <AppText
                                        variant="bodySmall"
                                        style={[
                                            styles.chipText,
                                            ageRange === range && styles.selectedChipText,
                                        ]}
                                    >
                                        {range}
                                    </AppText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Age Confirmation - Required for App Store compliance */}
                    <View style={styles.ageConfirmation}>
                        <Switch
                            value={ageConfirmed}
                            onValueChange={setAgeConfirmed}
                            trackColor={{ false: theme.colors.backgroundElevated, true: theme.colors.primary }}
                        />
                        <AppText style={styles.ageConfirmText}>
                            I confirm I am 13 years of age or older
                        </AppText>
                    </View>

                </View>

                <Button
                    title="Continue"
                    onPress={handleContinue}
                    loading={loading}
                    style={styles.button}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingVertical: theme.spacing.xl,
    },
    header: {
        marginBottom: theme.spacing.xl,
    },
    subtitle: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    form: {
        marginBottom: theme.spacing.xl,
        gap: theme.spacing.l,
    },
    section: {
        gap: theme.spacing.s,
    },
    label: {
        marginBottom: theme.spacing.xs,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.s,
    },
    optionChip: {
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    selectedChip: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    chipText: {
        color: theme.colors.textPrimary,
    },
    selectedChipText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    button: {
        marginTop: 'auto',
    },
    ageConfirmation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.s,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    ageConfirmText: {
        flex: 1,
        color: theme.colors.textPrimary,
        fontSize: 14,
    },
});
