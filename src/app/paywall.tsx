import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { X, Check, Crown, RefreshCw, ChevronRight } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import { useSubscription } from '../providers/RevenueCatProvider';

type Tier = 'plus' | 'premium';
type Cadence = 'weekly' | 'monthly';

const TIER_FEATURES = {
    plus: [
        { text: 'Unlimited text chapters', included: true },
        { text: '3 active stories', included: true },
        { text: '10 AI images/month', included: true },
        { text: 'All themes', included: true },
        { text: 'Enhanced sharing', included: true },
    ],
    premium: [
        { text: 'Unlimited text chapters', included: true },
        { text: '5+ active stories', included: true },
        { text: '30 AI images/month', included: true },
        { text: 'All themes + early access', included: true },
        { text: 'No watermark on shares', included: true },
        { text: 'Deeper insights & recaps', included: true },
        { text: 'Priority for new features', included: true },
    ],
};

const PRICING = {
    plus: { weekly: 3.99, monthly: 9.99 },
    premium: { weekly: 6.99, monthly: 14.99 },
};

export default function PaywallScreen() {
    const router = useRouter();
    const { purchasePackage, restorePurchases, offerings, status } = useSubscription();
    const [selectedTier, setSelectedTier] = useState<Tier>('plus');
    const [selectedCadence, setSelectedCadence] = useState<Cadence>('monthly');
    const [isLoading, setIsLoading] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    // Set initial selected tier based on current subscription
    React.useEffect(() => {
        if (status.tier === 'plus') {
            setSelectedTier('premium'); // Default to upgrade
        }
    }, [status.tier]);

    const handlePurchase = async () => {
        try {
            setIsLoading(true);
            const packageId = `${selectedTier}_${selectedCadence}`;
            await purchasePackage(packageId);
            router.back();
        } catch (error: any) {
            if (error.message !== 'PURCHASE_CANCELLED') {
                console.error('Purchase failed:', error);
                Alert.alert('Purchase Failed', 'Unable to complete your purchase. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestore = async () => {
        try {
            setIsRestoring(true);
            await restorePurchases();
            Alert.alert('Success', 'Your purchases have been restored!');
            router.back();
        } catch (error) {
            console.error('Restore failed:', error);
            Alert.alert('Restore Failed', 'Unable to restore purchases. Please try again.');
        } finally {
            setIsRestoring(false);
        }
    };

    const currentPrice = PRICING[selectedTier][selectedCadence];

    const getGradientColors = (tier: Tier): [string, string] => {
        if (tier === 'premium') return ['#4c1d95', '#8b5cf6']; // Deep purple to violet
        return ['#1e3a8a', '#3b82f6']; // Deep blue to blue
    };

    let ctaText = `Subscribe to ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`;
    if (status.tier === 'plus' && selectedTier === 'premium') {
        ctaText = 'Upgrade to Premium';
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={handleRestore}
                    style={styles.restoreButton}
                    disabled={isRestoring}
                >
                    <RefreshCw size={16} color={colors.primary} />
                    <Text style={styles.restoreText}>Restore</Text>
                </Pressable>
                <Pressable onPress={() => router.back()} style={styles.closeButton}>
                    <X size={22} color={colors.textPrimary} />
                </Pressable>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Crown size={40} color={colors.primary} fill={colors.primary} />
                    <Text style={styles.title}>Upgrade Your Journey</Text>
                    <Text style={styles.subtitle}>
                        Unlock the full potential of your hero's journey with Habit Chronicle Premium features
                    </Text>
                </View>

                {/* Tier Cards */}
                <View style={styles.tierCards}>
                    {/* Plus Card */}
                    <Pressable onPress={() => setSelectedTier('plus')}>
                        <LinearGradient
                            colors={selectedTier === 'plus' ? getGradientColors('plus') : [colors.backgroundElevated, colors.backgroundElevated]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                                styles.tierCard,
                                selectedTier !== 'plus' && styles.tierCardInactive,
                            ]}
                        >
                            <View style={styles.tierContent}>
                                <Text style={[
                                    styles.tierLabel,
                                    { color: selectedTier === 'plus' ? '#FFFFFF' : colors.textPrimary }
                                ]}>
                                    Plus
                                </Text>
                                <Text style={[styles.tierLimitText, { color: selectedTier === 'plus' ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
                                    3 stories • 10 images/mo
                                </Text>
                                <Text style={[
                                    styles.tierPrice,
                                    { color: selectedTier === 'plus' ? '#FFFFFF' : colors.textPrimary }
                                ]}>
                                    ${PRICING.plus[selectedCadence]}
                                    <Text style={styles.tierPeriod}>/{selectedCadence === 'weekly' ? 'wk' : 'mo'}</Text>
                                </Text>
                            </View>
                            {selectedTier === 'plus' && (
                                <View style={styles.selectedIndicator}>
                                    <Check size={16} color="#FFFFFF" />
                                </View>
                            )}
                        </LinearGradient>
                    </Pressable>

                    {/* Premium Card */}
                    <Pressable onPress={() => setSelectedTier('premium')} style={styles.premiumCardWrapper}>
                        <View style={styles.popularBadge}>
                            <Text style={styles.popularText}>BEST VALUE</Text>
                        </View>
                        <LinearGradient
                            colors={selectedTier === 'premium' ? getGradientColors('premium') : [colors.backgroundElevated, colors.backgroundElevated]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                                styles.tierCard,
                                selectedTier !== 'premium' && styles.tierCardInactive,
                            ]}
                        >
                            <View style={styles.tierContent}>
                                <View style={styles.tierLabelRow}>
                                    <Crown size={20} color={selectedTier === 'premium' ? '#FFD700' : colors.accent} fill={selectedTier === 'premium' ? '#FFD700' : colors.accent} />
                                    <Text style={[
                                        styles.tierLabel,
                                        { color: selectedTier === 'premium' ? '#FFFFFF' : colors.textPrimary }
                                    ]}>
                                        Premium
                                    </Text>
                                </View>
                                <Text style={[styles.tierLimitText, { color: selectedTier === 'premium' ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
                                    5+ stories • 30 images/mo • No watermark
                                </Text>
                                <Text style={[
                                    styles.tierPrice,
                                    { color: selectedTier === 'premium' ? '#FFFFFF' : colors.textPrimary }
                                ]}>
                                    ${PRICING.premium[selectedCadence]}
                                    <Text style={styles.tierPeriod}>/{selectedCadence === 'weekly' ? 'wk' : 'mo'}</Text>
                                </Text>
                            </View>
                            {selectedTier === 'premium' && (
                                <View style={styles.selectedIndicator}>
                                    <Check size={16} color="#FFFFFF" />
                                </View>
                            )}
                        </LinearGradient>
                    </Pressable>
                </View>

                {/* Cadence Toggle */}
                <View style={styles.cadenceContainer}>
                    <Pressable
                        style={[
                            styles.cadenceButton,
                            selectedCadence === 'weekly' && styles.cadenceButtonActive,
                        ]}
                        onPress={() => setSelectedCadence('weekly')}
                    >
                        <Text style={[
                            styles.cadenceText,
                            selectedCadence === 'weekly' && styles.cadenceTextActive,
                        ]}>
                            Weekly
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[
                            styles.cadenceButton,
                            selectedCadence === 'monthly' && styles.cadenceButtonActive,
                        ]}
                        onPress={() => setSelectedCadence('monthly')}
                    >
                        <Text style={[
                            styles.cadenceText,
                            selectedCadence === 'monthly' && styles.cadenceTextActive,
                        ]}>
                            Monthly
                        </Text>
                        <View style={styles.saveBadge}>
                            <Text style={styles.saveText}>Save 40%</Text>
                        </View>
                    </Pressable>
                </View>

                {/* Features List */}
                <View style={styles.featuresSection}>
                    <Text style={styles.featuresTitle}>What's included:</Text>
                    {TIER_FEATURES[selectedTier].map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                            <View style={styles.featureCheck}>
                                <Check size={14} color="#FFFFFF" />
                            </View>
                            <Text style={styles.featureText}>{feature.text}</Text>
                        </View>
                    ))}
                </View>

                {/* CTA Button */}
                <Pressable
                    style={[styles.ctaButton, isLoading && styles.ctaButtonDisabled]}
                    onPress={handlePurchase}
                    disabled={isLoading}
                >
                    <LinearGradient
                        colors={selectedTier === 'premium' ? ['#8b5cf6', '#7c3aed'] : ['#3b82f6', '#2563eb']}
                        style={styles.ctaGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.ctaText}>
                            {isLoading ? 'Processing...' : ctaText}
                        </Text>
                        <ChevronRight size={20} color="#FFFFFF" />
                    </LinearGradient>
                </Pressable>

                {/* Apple Compliance Footer */}
                <View style={styles.complianceSection}>
                    <Text style={styles.complianceText}>
                        Payment will be charged to your Apple ID account at confirmation of purchase.
                        Your billing period starts on your purchase date and renews on the same date
                        each week or month. Subscription automatically renews unless canceled at least
                        24 hours before the end of the current period.
                    </Text>
                    <Text style={styles.complianceText}>
                        To cancel: Open Settings → tap your name → Subscriptions → Habit Chronicle → Cancel.
                        Cancellation takes effect at the end of your current billing period.
                    </Text>

                    <View style={styles.legalLinks}>
                        <Pressable onPress={() => router.push('/terms-of-service' as any)}>
                            <Text style={styles.legalLink}>Terms</Text>
                        </Pressable>
                        <Text style={styles.legalSeparator}>•</Text>
                        <Pressable onPress={() => router.push('/privacy-policy' as any)}>
                            <Text style={styles.legalLink}>Privacy</Text>
                        </Pressable>
                        <Text style={styles.legalSeparator}>•</Text>
                        <Pressable onPress={() => router.push('/subscription-terms' as any)}>
                            <Text style={styles.legalLink}>Subscription Terms</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 8,
    },
    restoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: colors.backgroundElevated,
        borderWidth: 1,
        borderColor: colors.border,
    },
    restoreText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.backgroundElevated,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    titleSection: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 28,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.textPrimary,
        marginTop: 12,
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    tierCards: {
        gap: 24,
        marginBottom: 24,
    },
    premiumCardWrapper: {
        position: 'relative',
        marginTop: 8,
    },
    tierCard: {
        borderRadius: 20,
        padding: 20,
        position: 'relative',
    },
    tierCardInactive: {
        borderWidth: 2,
        borderColor: colors.border,
    },
    tierContent: {
        gap: 6,
    },
    tierLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tierLabel: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    tierPrice: {
        fontSize: 28,
        fontWeight: '700',
        marginTop: 4,
    },
    tierPeriod: {
        fontSize: 16,
        fontWeight: '500',
        opacity: 0.8,
    },
    tierLimitText: {
        fontSize: 14,
        fontWeight: '500',
    },
    selectedIndicator: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    popularBadge: {
        position: 'absolute',
        top: -12,
        left: 20,
        backgroundColor: colors.accent,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        zIndex: 10,
    },
    popularText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    cadenceContainer: {
        flexDirection: 'row',
        backgroundColor: colors.backgroundElevated,
        borderRadius: 16,
        padding: 4,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cadenceButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        position: 'relative',
    },
    cadenceButtonActive: {
        backgroundColor: colors.primary,
    },
    cadenceText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    cadenceTextActive: {
        color: '#FFFFFF',
    },
    saveBadge: {
        position: 'absolute',
        top: -8,
        right: 12,
        backgroundColor: colors.success,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    saveText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    featuresSection: {
        backgroundColor: colors.backgroundElevated,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.border,
    },
    featuresTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    featureCheck: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.success,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        fontSize: 15,
        color: colors.textPrimary,
        flex: 1,
    },
    ctaButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
    },

    ctaButtonDisabled: {
        opacity: 0.6,
    },
    ctaGradient: {
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    ctaText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    complianceSection: {
        gap: 16,
    },
    complianceText: {
        fontSize: 11,
        color: colors.textSecondary,
        lineHeight: 16,
        textAlign: 'center',
    },
    legalLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    legalLink: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
    },
    legalSeparator: {
        fontSize: 12,
        color: colors.textSecondary,
    },
});
