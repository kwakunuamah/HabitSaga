/**
 * RevenueCat Configuration
 * 
 * This file contains all RevenueCat-related configuration including:
 * - API keys for iOS/Android
 * - Product identifiers
 * - Entitlement identifiers
 * - Offering identifiers
 */

// API Keys - These should be loaded from environment variables in production
export const REVENUECAT_CONFIG = {
    // iOS API Key - loaded from environment variables
    iosApiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '',

    // Android API Key (if needed in future)
    androidApiKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || '',
} as const;

// Entitlement Identifiers
// These are created in RevenueCat Dashboard under "Entitlements"
export const ENTITLEMENTS = {
    PLUS: 'plus',      // Plus tier features
    PREMIUM: 'premium', // Premium tier features
} as const;

// Product Identifiers
// These must match the product IDs created in App Store Connect AND RevenueCat
export const PRODUCT_IDS = {
    PLUS_WEEKLY: 'plus_weekly',
    PLUS_MONTHLY: 'plus_monthly',
    PREMIUM_WEEKLY: 'premium_weekly',
    PREMIUM_MONTHLY: 'premium_monthly',
} as const;

// Offering Identifiers
// These are created in RevenueCat Dashboard under "Offerings"
export const OFFERINGS = {
    DEFAULT: 'default', // Default offering shown to all users
} as const;

// Package Identifiers
// These are created in RevenueCat Dashboard and linked to products
export const PACKAGE_IDS = {
    PLUS_WEEKLY: 'plus_weekly',
    PLUS_MONTHLY: 'plus_monthly',
    PREMIUM_WEEKLY: 'premium_weekly',
    PREMIUM_MONTHLY: 'premium_monthly',
} as const;

// Subscription Tier Type
export type SubscriptionTier = 'free' | 'plus' | 'premium';

// Feature Limits by Tier
export const FEATURE_LIMITS = {
    free: {
        activeSagas: 2,
        imagesPerMonth: 4,
        themes: ['default', 'minimal'], // 1-2 basic themes
        hasWatermark: true,
    },
    plus: {
        activeSagas: 3,
        imagesPerMonth: 10,
        themes: 'all', // Access to all themes
        hasWatermark: true, // Lighter watermark
    },
    premium: {
        activeSagas: 5,
        imagesPerMonth: 30,
        themes: 'all_plus_early_access', // All themes + early access to new packs
        hasWatermark: false, // Minimal or no watermark
    },
} as const;
