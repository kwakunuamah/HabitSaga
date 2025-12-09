import { CustomerInfo, PurchasesOfferings } from 'react-native-purchases';

/**
 * Subscription tier types
 */
export type SubscriptionTier = 'free' | 'plus' | 'premium';

/**
 * Subscription status for the current user
 */
export interface SubscriptionStatus {
    tier: SubscriptionTier;
    isActive: boolean;
    expirationDate?: string;
    productId?: string;
}

/**
 * Feature limits based on subscription tier
 */
export interface FeatureLimits {
    activeSagas: number;
    imagesPerMonth: number;
    hasAllThemes: boolean;
    hasWatermark: boolean;
}

/**
 * Subscription context value
 */
export interface SubscriptionContextValue {
    // Current subscription status
    status: SubscriptionStatus;

    // Customer info from RevenueCat
    customerInfo: CustomerInfo | null;

    // Available offerings
    offerings: PurchasesOfferings | null;

    // Feature limits for current tier
    featureLimits: FeatureLimits;

    // Loading state
    isLoading: boolean;

    // Actions
    purchasePackage: (packageId: string) => Promise<void>;
    restorePurchases: () => Promise<void>;
    refresh: () => Promise<void>;
}

/**
 * Purchase result
 */
export interface PurchaseResult {
    success: boolean;
    error?: string;
    customerInfo?: CustomerInfo;
}
