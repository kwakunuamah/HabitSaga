import Purchases, {
    PurchasesOfferings,
    CustomerInfo,
    PurchasesPackage,
    LOG_LEVEL
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { REVENUECAT_CONFIG } from '../config/RevenueCatConfig';
import { logger } from '../utils/logger';

/**
 * RevenueCat Subscription Utilities
 * 
 * Handles all RevenueCat SDK operations including:
 * - SDK initialization
 * - Fetching offerings
 * - Purchase operations
 * - Subscription status checks
 */

/**
 * Initialize RevenueCat SDK
 * Must be called once on app startup
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
    try {
        // Configure SDK with appropriate API key based on platform
        const apiKey = Platform.OS === 'ios'
            ? REVENUECAT_CONFIG.iosApiKey
            : REVENUECAT_CONFIG.androidApiKey;

        if (!apiKey) {
            logger.warn('RevenueCat API key not configured for platform:', Platform.OS);
            return;
        }

        // Enable debug logs in development
        if (__DEV__) {
            Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }

        // Configure and initialize SDK
        Purchases.configure({ apiKey });

        // Set user ID if provided (optional, RevenueCat will generate anonymous ID otherwise)
        if (userId) {
            await Purchases.logIn(userId);
        }

        logger.log('RevenueCat SDK initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize RevenueCat:', error);
        throw error;
    }
}

/**
 * Get current customer info (subscription status, entitlements, etc.)
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
    try {
        return await Purchases.getCustomerInfo();
    } catch (error) {
        logger.error('Failed to get customer info:', error);
        throw error;
    }
}

/**
 * Check if user has active subscription for a specific entitlement
 * @param entitlementId - The entitlement identifier (e.g., 'plus', 'premium')
 */
export async function hasActiveEntitlement(entitlementId: string): Promise<boolean> {
    try {
        const customerInfo = await getCustomerInfo();
        const entitlement = customerInfo.entitlements.active[entitlementId];
        return entitlement !== undefined;
    } catch (error) {
        logger.error('Failed to check entitlement:', error);
        return false;
    }
}

/**
 * Get user's current subscription tier
 * @returns 'free' | 'plus' | 'premium'
 */
export async function getSubscriptionTier(): Promise<'free' | 'plus' | 'premium'> {
    try {
        const customerInfo = await getCustomerInfo();

        // Check for premium first (highest tier)
        if (customerInfo.entitlements.active['premium']) {
            return 'premium';
        }

        // Check for plus
        if (customerInfo.entitlements.active['plus']) {
            return 'plus';
        }

        // Default to free
        return 'free';
    } catch (error) {
        logger.error('Failed to get subscription tier:', error);
        return 'free';
    }
}

/**
 * Fetch available offerings from RevenueCat
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
    try {
        const offerings = await Purchases.getOfferings();
        return offerings;
    } catch (error) {
        logger.error('Failed to fetch offerings:', error);
        return null;
    }
}

/**
 * Purchase a subscription package
 * @param purchasePackage - The package to purchase
 * @returns CustomerInfo after successful purchase
 */
export async function purchasePackage(purchasePackage: PurchasesPackage): Promise<CustomerInfo> {
    try {
        const { customerInfo } = await Purchases.purchasePackage(purchasePackage);
        return customerInfo;
    } catch (error: any) {
        // User cancelled the purchase
        if (error.userCancelled) {
            logger.log('User cancelled purchase');
            throw new Error('PURCHASE_CANCELLED');
        }

        logger.error('Purchase failed:', error);
        throw error;
    }
}

/**
 * Restore previous purchases
 * Useful when user reinstalls app or logs in on new device
 */
export async function restorePurchases(): Promise<CustomerInfo> {
    try {
        const customerInfo = await Purchases.restorePurchases();
        logger.log('Purchases restored successfully');
        return customerInfo;
    } catch (error) {
        logger.error('Failed to restore purchases:', error);
        throw error;
    }
}

/**
 * Log in a user to RevenueCat
 * This syncs their purchases across devices
 */
export async function loginUser(userId: string): Promise<void> {
    try {
        await Purchases.logIn(userId);
        logger.log('User logged in successfully');
    } catch (error) {
        logger.error('Failed to log in user:', error);
        throw error;
    }
}

/**
 * Log out current user (for account switching)
 */
export async function logoutUser(): Promise<void> {
    try {
        await Purchases.logOut();
        logger.log('User logged out successfully');
    } catch (error) {
        logger.error('Failed to log out user:', error);
        throw error;
    }
}

/**
 * Get feature limits for current subscription tier
 */
export async function getFeatureLimits() {
    const tier = await getSubscriptionTier();

    const limits = {
        free: {
            activeSagas: 2,
            imagesPerMonth: 4,
            hasAllThemes: false,
            hasWatermark: true,
        },
        plus: {
            activeSagas: 3,
            imagesPerMonth: 10,
            hasAllThemes: true,
            hasWatermark: true,
        },
        premium: {
            activeSagas: 5,
            imagesPerMonth: 30,
            hasAllThemes: true,
            hasWatermark: false,
        },
    };

    return limits[tier];
}
