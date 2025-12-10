import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../theme';
import { ChevronLeft } from 'lucide-react-native';

/**
 * Subscription Terms Screen
 * 
 * Displays detailed subscription terms including:
 * - Auto-renewal disclosure
 * - Payment terms & billing cycle
 * - Cancellation policy
 * - App Store requirements compliance
 */
export default function SubscriptionTerms() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={colors.text.primary} />
                </Pressable>
                <Text style={styles.headerTitle}>Subscription Terms</Text>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>Habit Chronicle Subscription Terms</Text>
                <Text style={styles.lastUpdated}>Last Updated: November 30, 2025</Text>

                {/* Subscription Overview */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Subscription Overview</Text>
                    <Text style={styles.paragraph}>
                        Habit Chronicle offers auto-renewing subscriptions to provide you with unlimited access to all features and content.
                        as weekly or monthly subscriptions that automatically renew unless cancelled.
                    </Text>
                </View>

                {/* Subscription Tiers & Pricing */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Subscription Tiers & Pricing</Text>

                    <Text style={styles.tierTitle}>Plus Tier</Text>
                    <Text style={styles.paragraph}>
                        • Weekly: $3.99/week{'\n'}
                        • Monthly: $9.99/month{'\n'}
                        • Up to 3 active stories{'\n'}
                        • ~10 AI-generated images per month{'\n'}
                        • Access to all themes{'\n'}
                        • Enhanced sharing features
                    </Text>

                    <Text style={styles.tierTitle}>Premium Tier</Text>
                    <Text style={styles.paragraph}>
                        • Weekly: $6.99/week{'\n'}
                        • Monthly: $14.99/month{'\n'}
                        • Up to 5+ active stories{'\n'}
                        • ~30 AI-generated images per month{'\n'}
                        • All themes + early access to new theme packs{'\n'}
                        • Best sharing features with minimal watermark{'\n'}
                        • Priority access to new features
                    </Text>
                </View>

                {/* Auto-Renewal */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Billing Period & Auto-Renewal</Text>
                    <Text style={styles.paragraph}>
                        Your billing period starts on your purchase date. For example, if you subscribe on the 15th
                        of a month, your monthly subscription will renew on the 15th of each subsequent month. Weekly
                        subscriptions renew 7 days from your purchase date.{'\n\n'}
                        Your subscription will automatically renew at the end of each billing period unless you cancel
                        it at least 24 hours before the end of the current period. Your account will be charged for
                        renewal within 24 hours prior to the end of the current period.
                    </Text>
                </View>

                {/* Payment */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment</Text>
                    <Text style={styles.paragraph}>
                        Payment will be charged to your Apple ID account at confirmation of purchase. Subscriptions
                        are billed through your Apple ID account and are subject to Apple's terms and conditions.
                    </Text>
                </View>

                {/* Cancellation */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cancellation Policy</Text>
                    <Text style={styles.paragraph}>
                        You can cancel your subscription at any time through your Apple ID account settings. To cancel:{'\n\n'}
                        1. Open the Settings app on your iOS device{'\n'}
                        2. Tap your name at the top{'\n'}
                        3. Tap Subscriptions{'\n'}
                        4. Select Habit Chronicle{'\n'}
                        5. Tap Cancel Subscription{'\n\n'}
                        Cancellation takes effect at the end of the current billing period. You will continue to have
                        access to premium features until then. No refunds will be provided for the current billing period.
                    </Text>
                </View>

                {/* Free Trial */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Free Trials (If Applicable)</Text>
                    <Text style={styles.paragraph}>
                        If we offer a free trial, you will be charged the full subscription price after the trial
                        period ends unless you cancel before the trial expires. You can cancel anytime during the
                        trial period without being charged.
                    </Text>
                </View>

                {/* Changes to Pricing */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Changes to Pricing</Text>
                    <Text style={styles.paragraph}>
                        We reserve the right to change subscription prices. If prices change, we will notify you
                        in advance. The new price will apply to your next billing cycle after the notice period.
                        Continuing your subscription after a price change constitutes your acceptance of the new price.
                    </Text>
                </View>

                {/* Additional Terms */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Additional Terms</Text>
                    <Text style={styles.paragraph}>
                        Your use of Habit Chronicle and its subscription services is also governed by our Terms of Service
                        and Privacy Policy. Please review these documents for complete information about your rights
                        and obligations.
                    </Text>
                </View>

                {/* Links */}
                <View style={styles.linksSection}>
                    <Pressable onPress={() => router.push('/terms-of-service' as any)}>
                        <Text style={styles.link}>Terms of Service</Text>
                    </Pressable>
                    <Pressable onPress={() => router.push('/privacy-policy' as any)}>
                        <Text style={styles.link}>Privacy Policy</Text>
                    </Pressable>
                </View>

                {/* Contact */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Questions?</Text>
                    <Text style={styles.paragraph}>
                        If you have any questions about these Subscription Terms, please contact us at:{'\n'}
                        info@habitchronicle.com
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        paddingTop: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: spacing.xs,
        marginRight: spacing.sm,
    },
    headerTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold as any,
        color: colors.text.primary,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.lg,
        paddingBottom: spacing.xl * 2,
    },
    title: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold as any,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    lastUpdated: {
        fontSize: typography.sizes.sm,
        color: colors.text.tertiary,
        marginBottom: spacing.xl,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold as any,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    tierTitle: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold as any,
        color: colors.primary,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    paragraph: {
        fontSize: typography.sizes.md,
        lineHeight: 24,
        color: colors.text.secondary,
        marginBottom: spacing.sm,
    },
    linksSection: {
        marginVertical: spacing.lg,
        gap: spacing.md,
    },
    link: {
        fontSize: typography.sizes.md,
        color: colors.primary,
        textDecorationLine: 'underline',
        marginBottom: spacing.sm,
    },
});
