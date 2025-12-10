import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, Dimensions } from 'react-native';
import { theme } from '../theme';
import { useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';

// Constants
const APP_STORE_URL = 'https://apps.apple.com/us/app/habit-chronicle/id6739075727';
const SCREEN_WIDTH = Dimensions.get('window').width;
const IS_MOBILE = SCREEN_WIDTH < 768;

// Feature data
const FEATURES = [
    {
        icon: '🎨',
        title: 'Beautiful Story Art',
        description: 'Your journey visualized in stunning illustrations',
    },
    {
        icon: '⚡',
        title: 'Quick Daily Check-ins',
        description: 'Track progress in seconds, not minutes',
    },
    {
        icon: '🏆',
        title: 'Streaks & Achievements',
        description: 'Stay motivated with rewards for consistency',
    },
    {
        icon: '📖',
        title: 'Your Personal Chronicle',
        description: 'A living story that grows with every habit',
    },
];

// How It Works steps
const HOW_IT_WORKS_STEPS = [
    {
        number: '1',
        title: 'Define Your Quest',
        description: 'Set meaningful goals that shape your destiny',
        image: require('../../assets/ChronicleAssets/Iphone/Stylized_Screenshots_iOS/Screen 2-  Goal Wizard Step 1.png'),
    },
    {
        number: '2',
        title: 'Check In Daily',
        description: 'Answer a few quick questions about your progress',
        image: require('../../assets/ChronicleAssets/Iphone/Stylized_Screenshots_iOS/Screen 8-  Check_IN.png'),
    },
    {
        number: '3',
        title: 'Watch Your Story Unfold',
        description: 'See your journey transform into an epic chronicle',
        image: require('../../assets/ChronicleAssets/Iphone/Stylized_Screenshots_iOS/Screen 6-  Chapter Detail (Complete).png'),
    },
    {
        number: '4',
        title: 'Build Your Legend',
        description: 'Every streak unlocks new chapters in your story',
        image: require('../../assets/ChronicleAssets/Iphone/Stylized_Screenshots_iOS/Screen 5-  Story Timeline.png'),
    },
];

// FAQ data
const FAQ_ITEMS = [
    {
        question: 'Is Habit Chronicle free to use?',
        answer: 'Yes! Habit Chronicle offers a free tier with access to core features. Premium plans unlock additional themes, more concurrent stories, and exclusive features.',
    },
    {
        question: 'How does the story generation work?',
        answer: 'When you check in daily, your progress is woven into a personalized narrative. Your habits become chapters, and your consistency shapes your unique chronicle.',
    },
    {
        question: 'What happens if I miss a day?',
        answer: 'Life happens! Missing a check-in adds a twist to your story. Your chronicle reflects your real journey - the challenges make the triumphs more meaningful.',
    },
    {
        question: 'Can I have multiple stories at once?',
        answer: 'Absolutely! Free users can run 2 stories simultaneously, while Plus and Premium members can have 5 or unlimited stories.',
    },
];

// Navigation items for desktop
const NAV_ITEMS = [
    { label: 'Features', sectionId: 'features' },
    { label: 'How It Works', sectionId: 'how-it-works' },
    { label: 'FAQ', sectionId: 'faq' },
];

export default function LandingPage() {
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    const [showStickyButton, setShowStickyButton] = useState(false);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const sectionRefs = useRef<{ [key: string]: number }>({});

    const openAppStore = () => {
        Linking.openURL(APP_STORE_URL);
    };

    const scrollToSection = (sectionId: string) => {
        const offset = sectionRefs.current[sectionId];
        if (offset !== undefined && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: offset, animated: true });
        }
    };

    const handleScroll = (event: any) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        setShowStickyButton(scrollY > 400);
    };

    const toggleFaq = (index: number) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Header / Nav */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/habitChronicle_Clear.png')}
                                style={styles.headerLogo}
                                resizeMode="contain"
                            />
                            <Text style={styles.headerTitle}>Habit Chronicle</Text>
                        </View>

                        {/* Desktop Navigation */}
                        {!IS_MOBILE && (
                            <View style={styles.navLinks}>
                                {NAV_ITEMS.map((item) => (
                                    <TouchableOpacity
                                        key={item.sectionId}
                                        onPress={() => scrollToSection(item.sectionId)}
                                        style={styles.navButton}
                                    >
                                        <Text style={styles.navLink}>{item.label}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity onPress={openAppStore} style={styles.navDownloadButton}>
                                    <Text style={styles.navDownloadText}>Download</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.heroGradient} />
                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>Your Life, Epic Chronicle</Text>
                        <Text style={styles.heroSubtitle}>
                            Transform your daily habits into an epic story. Every check-in writes a new chapter in your legend.
                        </Text>

                        <TouchableOpacity onPress={openAppStore} style={styles.appStoreButton}>
                            <View style={styles.appStoreBadgeContent}>
                                <Text style={styles.appStoreSmallText}>Download on the</Text>
                                <View style={styles.appStoreMainRow}>
                                    <Text style={styles.appStoreAppleLogo}></Text>
                                    <Text style={styles.appStoreLargeText}>App Store</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Hero Image - Phones Fan */}
                    <View style={styles.heroImageContainer}>
                        <View style={styles.heroPhonesFan}>
                            {/* Left Phone */}
                            <View style={[styles.phoneWrapper, styles.phoneLeft]}>
                                <Image
                                    source={require('../../assets/ChronicleAssets/Iphone/Stylized_Screenshots_iOS/Screen 2-  Goal Wizard Step 1.png')}
                                    style={styles.phoneImage}
                                    resizeMode="contain"
                                />
                            </View>
                            {/* Right Phone */}
                            <View style={[styles.phoneWrapper, styles.phoneRight]}>
                                <Image
                                    source={require('../../assets/ChronicleAssets/Iphone/Stylized_Screenshots_iOS/Screen 5-  Story Timeline.png')}
                                    style={styles.phoneImage}
                                    resizeMode="contain"
                                />
                            </View>
                            {/* Center Phone - Most Prominent */}
                            <View style={[styles.phoneWrapper, styles.phoneCenter]}>
                                <View style={styles.phoneGlow} />
                                <Image
                                    source={require('../../assets/ChronicleAssets/Iphone/Stylized_Screenshots_iOS/Screen 6-  Chapter Detail (Complete).png')}
                                    style={styles.phoneImage}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Features Section */}
                <View
                    style={styles.featuresSection}
                    onLayout={(e) => { sectionRefs.current['features'] = e.nativeEvent.layout.y; }}
                >
                    <Text style={styles.sectionHeader}>Why Habit Chronicle?</Text>
                    <View style={styles.featuresGrid}>
                        {FEATURES.map((feature, index) => (
                            <View key={index} style={styles.featureCard}>
                                <Text style={styles.featureIcon}>{feature.icon}</Text>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDescription}>{feature.description}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* How It Works Section */}
                <View
                    style={styles.sectionContainer}
                    onLayout={(e) => { sectionRefs.current['how-it-works'] = e.nativeEvent.layout.y; }}
                >
                    <Text style={styles.sectionHeader}>How It Works</Text>

                    <View style={styles.stepsContainer}>
                        {HOW_IT_WORKS_STEPS.map((step, index) => (
                            <View key={index} style={styles.stepCard}>
                                <View style={styles.stepNumberBadge}>
                                    <Text style={styles.stepNumber}>{step.number}</Text>
                                </View>
                                <Image
                                    source={step.image}
                                    style={styles.stepImage}
                                    resizeMode="contain"
                                />
                                <Text style={styles.stepTitle}>{step.title}</Text>
                                <Text style={styles.stepDescription}>{step.description}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* FAQ Section */}
                <View
                    style={styles.faqSection}
                    onLayout={(e) => { sectionRefs.current['faq'] = e.nativeEvent.layout.y; }}
                >
                    <Text style={styles.sectionHeader}>Frequently Asked Questions</Text>
                    <View style={styles.faqContainer}>
                        {FAQ_ITEMS.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.faqItem}
                                onPress={() => toggleFaq(index)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.faqQuestion}>
                                    <Text style={styles.faqQuestionText}>{item.question}</Text>
                                    <Text style={styles.faqToggle}>
                                        {expandedFaq === index ? '−' : '+'}
                                    </Text>
                                </View>
                                {expandedFaq === index && (
                                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* CTA Section */}
                <View style={styles.ctaSection}>
                    <Text style={styles.ctaTitle}>Ready to Begin Your Story?</Text>
                    <Text style={styles.ctaSubtitle}>
                        Join thousands turning their habits into legendary chronicles.
                    </Text>
                    <TouchableOpacity onPress={openAppStore} style={styles.primaryButton}>
                        <Text style={styles.primaryButtonText}>Start Your Chronicle Now</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerLinks}>
                        <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
                            <Text style={styles.footerLink}>Privacy Policy</Text>
                        </TouchableOpacity>
                        <Text style={styles.footerSeparator}>•</Text>
                        <TouchableOpacity onPress={() => router.push('/terms-of-service')}>
                            <Text style={styles.footerLink}>Terms of Service</Text>
                        </TouchableOpacity>
                        <Text style={styles.footerSeparator}>•</Text>
                        <TouchableOpacity onPress={() => router.push('/support')}>
                            <Text style={styles.footerLink}>Support</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.copyright}>© 2025 Habit Chronicle. All rights reserved.</Text>
                </View>
            </ScrollView>

            {/* Sticky Mobile Download Button */}
            {IS_MOBILE && showStickyButton && (
                <TouchableOpacity
                    onPress={openAppStore}
                    style={styles.stickyButton}
                    activeOpacity={0.9}
                >
                    <Text style={styles.stickyButtonText}>Download Free</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
    },

    // Header Styles
    header: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        ...Platform.select({
            web: {
                position: 'sticky' as any,
                top: 0,
                zIndex: 100,
            },
        }),
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerLogo: {
        width: 40,
        height: 40,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    navLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    navButton: {
        padding: 8,
    },
    navLink: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    navDownloadButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 24,
    },
    navDownloadText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // Hero Section
    heroSection: {
        flexDirection: IS_MOBILE ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: IS_MOBILE ? 24 : 60,
        paddingTop: IS_MOBILE ? 40 : 80,
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        minHeight: IS_MOBILE ? 'auto' : 700,
        position: 'relative',
        overflow: 'visible',
    },
    heroGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FEF7F0',
        opacity: 0.6,
    },
    heroContent: {
        flex: 1,
        maxWidth: IS_MOBILE ? '100%' : 480,
        marginBottom: IS_MOBILE ? 40 : 0,
        zIndex: 1,
    },
    heroTitle: {
        fontSize: IS_MOBILE ? 36 : 52,
        fontWeight: '800',
        color: theme.colors.textPrimary,
        marginBottom: 20,
        lineHeight: IS_MOBILE ? 44 : 60,
    },
    heroSubtitle: {
        fontSize: IS_MOBILE ? 18 : 20,
        color: theme.colors.textSecondary,
        marginBottom: 32,
        lineHeight: IS_MOBILE ? 28 : 32,
    },
    appStoreButton: {
        alignSelf: 'flex-start',
        backgroundColor: '#000000',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#A6A6A6',
    },
    appStoreBadgeContent: {
        alignItems: 'center',
    },
    appStoreSmallText: {
        color: '#FFFFFF',
        fontSize: 10,
        letterSpacing: 0.3,
    },
    appStoreMainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    appStoreAppleLogo: {
        fontSize: 24,
        color: '#FFFFFF',
        marginTop: -2,
    },
    appStoreLargeText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '600',
        letterSpacing: -0.3,
    },

    // Hero Phones
    heroImageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: IS_MOBILE ? 500 : 600,
        overflow: 'visible',
        zIndex: 1,
    },
    heroPhonesFan: {
        width: IS_MOBILE ? 320 : 400,
        height: IS_MOBILE ? 480 : 580,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    phoneWrapper: {
        position: 'absolute',
        ...Platform.select({
            web: {
                transition: 'transform 0.3s ease',
            },
        }),
    },
    phoneImage: {
        width: IS_MOBILE ? 220 : 280,
        height: IS_MOBILE ? 440 : 560,
        borderRadius: 28,
        ...Platform.select({
            web: {
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            },
        }),
    },
    phoneLeft: {
        left: IS_MOBILE ? -60 : -80,
        transform: [{ translateY: 40 }, { rotate: '-12deg' }],
        zIndex: 1,
    },
    phoneRight: {
        right: IS_MOBILE ? -60 : -80,
        transform: [{ translateY: 40 }, { rotate: '12deg' }],
        zIndex: 1,
    },
    phoneCenter: {
        zIndex: 10,
        transform: [{ scale: IS_MOBILE ? 1.05 : 1.1 }],
    },
    phoneGlow: {
        position: 'absolute',
        width: '120%',
        height: '120%',
        borderRadius: 40,
        backgroundColor: theme.colors.primary,
        opacity: 0.1,
        ...Platform.select({
            web: {
                filter: 'blur(30px)',
            },
        }),
    },

    // Features Section
    featuresSection: {
        padding: IS_MOBILE ? 40 : 80,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
    },
    featuresGrid: {
        flexDirection: IS_MOBILE ? 'column' : 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: IS_MOBILE ? 24 : 32,
        maxWidth: 1000,
        width: '100%',
    },
    featureCard: {
        flex: 1,
        minWidth: IS_MOBILE ? '100%' : 200,
        maxWidth: IS_MOBILE ? '100%' : 220,
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#F9F7F1',
        borderRadius: 16,
    },
    featureIcon: {
        fontSize: 40,
        marginBottom: 16,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    featureDescription: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },

    // Section Common
    sectionContainer: {
        padding: IS_MOBILE ? 40 : 80,
        backgroundColor: '#F9F7F1',
        alignItems: 'center',
    },
    sectionHeader: {
        fontSize: IS_MOBILE ? 28 : 36,
        fontWeight: 'bold',
        marginBottom: IS_MOBILE ? 40 : 60,
        textAlign: 'center',
        color: theme.colors.textPrimary,
    },

    // How It Works
    stepsContainer: {
        flexDirection: IS_MOBILE ? 'column' : 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: IS_MOBILE ? 40 : 32,
        maxWidth: 1200,
        width: '100%',
    },
    stepCard: {
        flex: 1,
        minWidth: IS_MOBILE ? '100%' : 240,
        maxWidth: IS_MOBILE ? '100%' : 280,
        alignItems: 'center',
        position: 'relative',
    },
    stepNumberBadge: {
        position: 'absolute',
        top: -16,
        left: '50%',
        marginLeft: -20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        ...Platform.select({
            web: {
                boxShadow: '0 4px 14px rgba(226, 54, 54, 0.3)',
            },
        }),
    },
    stepNumber: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    stepImage: {
        width: IS_MOBILE ? 200 : 220,
        height: IS_MOBILE ? 400 : 440,
        marginBottom: 20,
        marginTop: 24,
        borderRadius: 20,
        ...Platform.select({
            web: {
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
            },
        }),
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        color: theme.colors.textPrimary,
        textAlign: 'center',
    },
    stepDescription: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 8,
    },

    // FAQ Section
    faqSection: {
        padding: IS_MOBILE ? 40 : 80,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
    },
    faqContainer: {
        maxWidth: 700,
        width: '100%',
    },
    faqItem: {
        backgroundColor: '#F9F7F1',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
    },
    faqQuestion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    faqQuestionText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        flex: 1,
        paddingRight: 16,
    },
    faqToggle: {
        fontSize: 24,
        fontWeight: '300',
        color: theme.colors.primary,
    },
    faqAnswer: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        lineHeight: 24,
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 0,
    },

    // CTA Section
    ctaSection: {
        padding: IS_MOBILE ? 60 : 100,
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
    },
    ctaTitle: {
        fontSize: IS_MOBILE ? 28 : 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
        textAlign: 'center',
    },
    ctaSubtitle: {
        fontSize: IS_MOBILE ? 16 : 18,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 32,
        textAlign: 'center',
        maxWidth: 500,
    },
    primaryButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 36,
        borderRadius: 50,
        ...Platform.select({
            web: {
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            },
        }),
    },
    primaryButtonText: {
        color: theme.colors.primary,
        fontSize: 18,
        fontWeight: 'bold',
    },

    // Footer
    footer: {
        padding: 40,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        backgroundColor: '#FFFFFF',
    },
    footerLinks: {
        flexDirection: 'row',
        marginBottom: 20,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    footerLink: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        marginHorizontal: 10,
    },
    footerSeparator: {
        color: theme.colors.text.tertiary,
    },
    copyright: {
        color: theme.colors.text.tertiary,
        fontSize: 14,
    },

    // Sticky Button
    stickyButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        borderRadius: 50,
        alignItems: 'center',
        ...Platform.select({
            web: {
                boxShadow: '0 4px 20px rgba(226, 54, 54, 0.4)',
            },
        }),
    },
    stickyButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
