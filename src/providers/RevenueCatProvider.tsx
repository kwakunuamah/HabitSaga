import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CustomerInfo, PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';
import {
    initializeRevenueCat,
    getCustomerInfo,
    getOfferings,
    purchasePackage as purchasePkg,
    restorePurchases as restorePurchasesUtil,
    getSubscriptionTier,
    getFeatureLimits,
} from '../utils/subscriptions';
import { SubscriptionContextValue, SubscriptionStatus, FeatureLimits } from '../types/subscription';

/**
 * RevenueCat Provider
 * 
 * Initializes RevenueCat SDK and provides subscription state throughout the app
 */

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

interface RevenueCatProviderProps {
    children: ReactNode;
    userId?: string;
}

export function RevenueCatProvider({ children, userId }: RevenueCatProviderProps) {
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
    const [status, setStatus] = useState<SubscriptionStatus>({
        tier: 'free',
        isActive: false,
    });
    const [featureLimits, setFeatureLimits] = useState<FeatureLimits>({
        activeSagas: 2,
        imagesPerMonth: 4,
        hasAllThemes: false,
        hasWatermark: true,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Initialize RevenueCat on mount
    useEffect(() => {
        initializeSDK();
    }, [userId]);

    async function initializeSDK() {
        try {
            setIsLoading(true);

            // Initialize SDK
            await initializeRevenueCat(userId);

            // Fetch initial data
            await refresh();
        } catch (error) {
            console.error('Failed to initialize RevenueCat SDK:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function refresh() {
        try {
            // Fetch customer info
            const info = await getCustomerInfo();
            setCustomerInfo(info);

            // Fetch offerings
            const availableOfferings = await getOfferings();
            setOfferings(availableOfferings);

            // Determine subscription tier
            const tier = await getSubscriptionTier();

            // Get feature limits
            const limits = await getFeatureLimits();
            setFeatureLimits(limits);

            // Update status
            const hasActiveSubscription = tier !== 'free';
            setStatus({
                tier,
                isActive: hasActiveSubscription,
            });
        } catch (error) {
            console.error('Failed to refresh subscription data:', error);
        }
    }

    async function purchasePackage(packageId: string) {
        try {
            if (!offerings?.current) {
                throw new Error('No offerings available');
            }

            // Find the package by identifier
            const pkg = offerings.current.availablePackages.find(
                (p: PurchasesPackage) => p.identifier === packageId
            );

            if (!pkg) {
                throw new Error(`Package ${packageId} not found`);
            }

            // Make the purchase
            const info = await purchasePkg(pkg);
            setCustomerInfo(info);

            // Refresh subscription state
            await refresh();
        } catch (error: any) {
            console.error('Purchase failed:', error);
            if (error.message !== 'PURCHASE_CANCELLED') {
                throw error;
            }
        }
    }

    async function restorePurchases() {
        try {
            setIsLoading(true);
            const info = await restorePurchasesUtil();
            setCustomerInfo(info);

            // Refresh subscription state
            await refresh();
        } catch (error) {
            console.error('Restore purchases failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const value: SubscriptionContextValue = {
        status,
        customerInfo,
        offerings,
        featureLimits,
        isLoading,
        purchasePackage,
        restorePurchases,
        refresh,
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}

/**
 * Hook to access subscription context
 */
export function useSubscription() {
    const context = useContext(SubscriptionContext);

    if (!context) {
        throw new Error('useSubscription must be used within a RevenueCatProvider');
    }

    return context;
}

/**
 * Hook to check if user has access to a specific feature
 */
export function useFeatureAccess() {
    const { status, featureLimits } = useSubscription();

    return {
        tier: status.tier,
        canCreateSaga: (currentSagas: number) => currentSagas < featureLimits.activeSagas,
        canGenerateImage: (imagesThisMonth: number) => imagesThisMonth < featureLimits.imagesPerMonth,
        hasAllThemes: featureLimits.hasAllThemes,
        hasWatermark: featureLimits.hasWatermark,
        maxActiveSagas: featureLimits.activeSagas,
        maxImagesPerMonth: featureLimits.imagesPerMonth,
    };
}
