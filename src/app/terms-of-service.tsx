import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../theme';
import { ChevronLeft } from 'lucide-react-native';

/**
 * Terms of Service Screen
 */
export default function TermsOfService() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={colors.text.primary} />
                </Pressable>
                <Text style={styles.headerTitle}>Terms of Service</Text>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>Habit Chronicle Terms of Service</Text>
                <Text style={styles.lastUpdated}>Last Updated: December 10, 2025</Text>

                {/* Introduction */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
                    <Text style={styles.paragraph}>
                        By accessing or using the Habit Chronicle app and website (collectively, the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                    </Text>
                </View>

                {/* Description of Service */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Description of Service</Text>
                    <Text style={styles.paragraph}>
                        Habit Chronicle is a habit tracking application that uses artificial intelligence to generate
                        personalized narrative content and images based on your goal progress and check-ins. The App
                        offers both free and premium subscription tiers with varying feature access.
                    </Text>
                </View>

                {/* User Accounts */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. User Accounts</Text>
                    <Text style={styles.paragraph}>
                        To use certain features of the App, you must create an account. You are responsible for:{'\n\n'}
                        • Maintaining the confidentiality of your account credentials{'\n'}
                        • All activities that occur under your account{'\n'}
                        • Notifying us immediately of any unauthorized use{'\n'}
                        • Ensuring the accuracy of your account information
                    </Text>
                </View>

                {/* Subscriptions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Subscriptions and Payments</Text>
                    <Text style={styles.paragraph}>
                        Premium features require a paid subscription. Subscription terms, pricing, and billing are
                        detailed in our Subscription Terms. By subscribing, you agree to pay all applicable fees and
                        authorize us to charge your payment method.
                    </Text>
                </View>

                {/* User Content */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. User Content and AI-Generated Content</Text>
                    <Text style={styles.paragraph}>
                        You retain ownership of the goals, check-ins, and other content you input into the App.
                        By using the App, you grant us a license to use this content to provide and improve our services,
                        including using it as input for AI-generated narrative and images.{'\n\n'}
                        AI-generated content (stories, images) created by the App based on your input is provided
                        to you for personal, non-commercial use. We retain certain rights to this content as necessary
                        to operate and improve the service.
                    </Text>
                </View>

                {/* Acceptable Use */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>6. Acceptable Use</Text>
                    <Text style={styles.paragraph}>
                        You agree not to:{'\n\n'}
                        • Use the App for any illegal purpose{'\n'}
                        • Attempt to gain unauthorized access to any part of the App{'\n'}
                        • Interfere with or disrupt the App's functionality{'\n'}
                        • Reverse engineer or attempt to extract source code{'\n'}
                        • Use the App to harass, abuse, or harm others{'\n'}
                        • Submit false or misleading information
                    </Text>
                </View>

                {/* Prohibited Content */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>7. Prohibited Content</Text>
                    <Text style={styles.paragraph}>
                        You may not create goals, upload images, or submit content that:{'\n\n'}
                        • Describes or promotes illegal activities{'\n'}
                        • Contains explicit, obscene, or pornographic material{'\n'}
                        • Promotes violence, self-harm, or harm to others{'\n'}
                        • Infringes on intellectual property rights{'\n'}
                        • Contains hate speech or discriminatory content{'\n'}
                        • Is otherwise inappropriate or violates community standards{'\n\n'}
                        We reserve the right to remove any content that violates these guidelines without notice.
                    </Text>
                </View>

                {/* Content Monitoring */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>8. Content Monitoring</Text>
                    <Text style={styles.paragraph}>
                        We may review, monitor, and analyze user-generated content, including goals, descriptions,
                        and uploaded images, to ensure compliance with these Terms and to improve our services.
                        By using the App, you consent to this monitoring.{'\n\n'}
                        If we identify content that violates these Terms, we may take action including content removal,
                        account suspension, or permanent account termination.
                    </Text>
                </View>

                {/* Intellectual Property */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>9. Intellectual Property</Text>
                    <Text style={styles.paragraph}>
                        The App, including its design, features, functionality, and all content not provided by users,
                        is owned by Habit Chronicle and protected by copyright, trademark, and other intellectual property laws.
                    </Text>
                </View>

                {/* Disclaimers */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>10. Disclaimers</Text>
                    <Text style={styles.paragraph}>
                        THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee that the App
                        will be uninterrupted, error-free, or completely secure. AI-generated content is provided for
                        entertainment and motivational purposes and should not be relied upon for medical, psychological,
                        or professional advice.
                    </Text>
                </View>

                {/* Limitation of Liability */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>11. Limitation of Liability</Text>
                    <Text style={styles.paragraph}>
                        To the maximum extent permitted by law, Habit Chronicle shall not be liable for any indirect,
                        incidental, special, consequential, or punitive damages arising from your use of the App.
                    </Text>
                </View>

                {/* Termination */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>12. Termination</Text>
                    <Text style={styles.paragraph}>
                        We reserve the right to suspend or terminate your account at any time for violation of these
                        Terms, including but not limited to:{'\n\n'}
                        • Creating goals that describe or promote illegal activities{'\n'}
                        • Uploading inappropriate, explicit, or offensive images{'\n'}
                        • Repeated violations of our content guidelines{'\n'}
                        • Any other conduct we deem harmful to the community{'\n\n'}
                        Termination may occur without prior notice. You may also delete your account at any time
                        through the Profile settings.
                    </Text>
                </View>

                {/* Changes to Terms */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>13. Changes to Terms</Text>
                    <Text style={styles.paragraph}>
                        We may modify these Terms at any time. We will notify you of material changes via the App or
                        email. Your continued use of the App after changes constitutes acceptance of the modified Terms.
                    </Text>
                </View>

                {/* Governing Law */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>14. Governing Law</Text>
                    <Text style={styles.paragraph}>
                        These Terms are governed by the laws of the United States and the State of New York, without
                        regard to conflict of law provisions.
                    </Text>
                </View>

                {/* Contact */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>15. Contact Information</Text>
                    <Text style={styles.paragraph}>
                        If you have questions about these Terms, please contact us at:{'\n\n'}
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
    paragraph: {
        fontSize: typography.sizes.md,
        lineHeight: 24,
        color: colors.text.secondary,
    },
});
