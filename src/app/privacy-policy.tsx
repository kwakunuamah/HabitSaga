import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../theme';

/**
 * Privacy Policy Screen
 */
export default function PrivacyPolicy() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </Pressable>

                <Text style={styles.title}>Habit Chronicle Privacy Policy</Text>
                <Text style={styles.lastUpdated}>Last Updated: December 9, 2025</Text>

                <Text style={styles.paragraph}>
                    <Text style={styles.bold}>Habit Chronicle</Text> ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application and related services (the "Service").
                </Text>

                <Text style={styles.sectionTitle}>1. Information We Collect</Text>
                <Text style={styles.paragraph}>
                    <Text style={styles.bold}>Personal Information:</Text> When you create an account, we collect your email address and any profile information you provide (name).{'\n\n'}
                    <Text style={styles.bold}>Photos or Videos:</Text> Images you upload (such as selfies) are collected to generate personalized avatars.{'\n\n'}
                    <Text style={styles.bold}>Goal and Check-In Data:</Text> We collect the goals you create, check-in data, and any text you input to generate your saga narrative.{'\n\n'}
                    <Text style={styles.bold}>Usage Data:</Text> We automatically collect information about how you use the app, including features accessed and time spent.{'\n\n'}
                    <Text style={styles.bold}>Diagnostics:</Text> We collect crash data and performance data to improve app stability and reliability.{'\n\n'}
                    <Text style={styles.bold}>Device Information:</Text> We collect device type, operating system, and unique device identifiers.
                </Text>

                <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
                <Text style={styles.paragraph}>
                    • To provide and maintain our service{'\n'}
                    • To generate AI-powered narrative content and images{'\n'}
                    • To process subscriptions and payments{'\n'}
                    • To send you notifications about your goals{'\n'}
                    • To improve and personalize your experience{'\n'}
                    • To respond to your requests and support needs
                </Text>

                <Text style={styles.sectionTitle}>3. AI-Generated Content</Text>
                <Text style={styles.paragraph}>
                    Your goal, check-in data, and uploaded images are used as input to generate personalized narrative content and images through third-party AI services.
                    We do not share this input data with third parties for their own purposes, but it is processed by these AI services as part of generating your content.
                </Text>

                <Text style={styles.sectionTitle}>4. Data Sharing and Disclosure</Text>
                <Text style={styles.paragraph}>
                    We may share your information with:{'\n\n'}
                    <Text style={styles.bold}>Service Providers:</Text> Third-party companies that help us operate the app, including:{'\n'}
                    • Backend and cloud infrastructure providers{'\n'}
                    • AI service providers{'\n'}
                    • Subscription and payment processors{'\n'}
                    • Crash reporting and diagnostics tools{'\n\n'}
                    <Text style={styles.bold}>Legal Requirements:</Text> When required by law or to protect our rights.{'\n\n'}
                    We do not sell your personal information to third parties.
                </Text>

                <Text style={styles.sectionTitle}>5. Data Security</Text>
                <Text style={styles.paragraph}>
                    We implement appropriate security measures to protect your information. However, no method of transmission over the internet
                    or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                </Text>

                <Text style={styles.sectionTitle}>6. Your Rights</Text>
                <Text style={styles.paragraph}>
                    You have the right to:{'\n'}
                    • Access your personal data{'\n'}
                    • Correct inaccurate data{'\n'}
                    • Request deletion of your data{'\n'}
                    • Export your data{'\n'}
                    • Opt out of marketing communications
                </Text>

                <Text style={styles.sectionTitle}>7. Data Retention</Text>
                <Text style={styles.paragraph}>
                    We retain your data for as long as your account is active or as needed to provide services.
                    If you delete your account, we will delete or anonymize your personal data within 30 days, except where retention is required by law.
                </Text>

                <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
                <Text style={styles.paragraph}>
                    Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13.
                    If you believe we have collected such information, please contact us immediately.
                </Text>

                <Text style={styles.sectionTitle}>9. Changes to This Policy</Text>
                <Text style={styles.paragraph}>
                    We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy in the app and updating the "Last Updated" date.
                </Text>

                <Text style={styles.sectionTitle}>10. Contact Us</Text>
                <Text style={styles.paragraph}>
                    If you have questions about this Privacy Policy, please contact us at:{'\n\n'}
                    info@habitchronicle.com
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    backButton: {
        marginBottom: 20,
    },
    backText: {
        color: colors.primary,
        fontSize: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    lastUpdated: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        marginTop: 24,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
        color: colors.textSecondary,
        marginBottom: 12,
    },
    bold: {
        fontWeight: '600',
        color: colors.textPrimary,
    },
});
