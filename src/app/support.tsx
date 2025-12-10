import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { theme } from '../theme';
import { useRouter } from 'expo-router';
import { ChevronLeft, Mail } from 'lucide-react-native';

const CONTACT_EMAIL = 'info@habitchronicle.com';

export default function Support() {
    const router = useRouter();

    const handleContact = () => {
        Linking.openURL(`mailto:${CONTACT_EMAIL}`);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
                    <ChevronLeft size={24} color={theme.colors.textPrimary} />
                    <Text style={styles.backText}>Back to Home</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Support Center</Text>
                <Text style={styles.subtitle}>
                    Need help with your Habit Chronicle? We're here to assist you on your journey.
                </Text>

                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        <Mail size={48} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.cardTitle}>Contact Us</Text>
                    <Text style={styles.cardText}>
                        Have a question, feedback, or experiencing an issue? Send us an email and we'll get back to you as soon as possible.
                    </Text>

                    <TouchableOpacity onPress={handleContact} style={styles.contactButton}>
                        <Text style={styles.contactButtonText}>{CONTACT_EMAIL}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.faqSection}>
                    <Text style={styles.faqHeader}>Common Topics</Text>

                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>How do I delete my account?</Text>
                        <Text style={styles.faqAnswer}>
                            You can delete your account from within the mobile app. Go to Profile {'>'} Settings {'>'} Delete Account.
                        </Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>How do I cancel my subscription?</Text>
                        <Text style={styles.faqAnswer}>
                            Subscriptions are managed through your Apple ID. Go to iPhone Settings {'>'} Apple ID {'>'} Subscriptions.
                        </Text>
                    </View>
                </View>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    contentContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: 80,
    },
    header: {
        width: '100%',
        maxWidth: 800,
        padding: 20,
        alignSelf: 'center',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginLeft: 8,
    },
    content: {
        width: '100%',
        maxWidth: 800,
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: theme.colors.textSecondary,
        marginBottom: 48,
        textAlign: 'center',
        maxWidth: 600,
    },
    card: {
        backgroundColor: theme.colors.surfaceHighlight, // Light gray
        borderRadius: 20,
        padding: 40,
        width: '100%',
        alignItems: 'center',
        marginBottom: 60,
    },
    iconContainer: {
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 16,
    },
    cardText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    contactButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 50,
    },
    contactButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    faqSection: {
        width: '100%',
    },
    faqHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        color: theme.colors.textPrimary,
    },
    faqItem: {
        marginBottom: 24,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    faqQuestion: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: theme.colors.textPrimary,
    },
    faqAnswer: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        lineHeight: 24,
    },
});
