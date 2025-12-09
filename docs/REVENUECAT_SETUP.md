# RevenueCat Setup Guide for Habit Saga

This guide walks you through setting up RevenueCat for in-app subscriptions in Habit Saga.

## Table of Contents
1. [App Store Connect Setup](#app-store-connect-setup)
2. [RevenueCat Dashboard Setup](#revenuecat-dashboard-setup)
3. [Product ID Reference](#product-id-reference)
4. [Testing](#testing)

---

## App Store Connect Setup

### 1. Create Subscription Group

1. Log in to [App Store Connect](https://appstoreconnect.apple.com/)
2. Navigate to your app
3. Go to **Features** → **In-App Purchases**
4. Click **+** to create a new subscription group
5. Name it: `Habit Saga Subscriptions`

### 2. Create Subscription Products

You need to create **4 subscription products** total (2 tiers × 2 durations).

#### Plus Tier - Weekly
1. Click **+** in your subscription group
2. Select **Auto-Renewable Subscription**
3. **Reference Name**: `Plus Weekly`
4. **Product ID**: `com.habitsaga.app.plus.weekly`
5. **Subscription Duration**: 1 Week
6. **Price**: $3.99 USD (select equivalent pricing in other regions)
7. **Subscription Display Name**: `Habit Saga Plus`
8. **Description**: "Unlock Plus features: up to 3 active sagas, 10 AI-generated images per month, and access to all themes."

#### Plus Tier - Monthly
1. Click **+** in your subscription group
2. Select **Auto-Renewable Subscription**
3. **Reference Name**: `Plus Monthly`
4. **Product ID**: `com.habitsaga.app.plus.monthly`
5. **Subscription Duration**: 1 Month
6. **Price**: $9.99 USD
7. **Subscription Display Name**: `Habit Saga Plus`
8. **Description**: "Unlock Plus features: up to 3 active sagas, 10 AI-generated images per month, and access to all themes."

#### Premium Tier - Weekly
1. Click **+** in your subscription group
2. Select **Auto-Renewable Subscription**
3. **Reference Name**: `Premium Weekly`
4. **Product ID**: `com.habitsaga.app.premium.weekly`
5. **Subscription Duration**: 1 Week
6. **Price**: $6.99 USD
7. **Subscription Display Name**: `Habit Saga Premium`
8. **Description**: "Unlock Premium features: 5+ active sagas, 30 AI-generated images per month, all themes + early access, and minimal watermarks."

#### Premium Tier - Monthly
1. Click **+** in your subscription group
2. Select **Auto-Renewable Subscription**
3. **Reference Name**: `Premium Monthly`
4. **Product ID**: `com.habitsaga.app.premium.monthly`
5. **Subscription Duration**: 1 Month
6. **Price**: $14.99 USD
7. **Subscription Display Name**: `Habit Saga Premium`
8. **Description**: "Unlock Premium features: 5+ active sagas, 30 AI-generated images per month, all themes + early access, and minimal watermarks."

### 3. Submit for Review

- For each subscription, you'll need to provide:
  - At least 1 screenshot (showing the feature/paywall)
  - Review notes (optional, but recommended)

---

## RevenueCat Dashboard Setup

### 1. Create Project (if not already created)

1. Log in to [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Click **Create New Project**
3. **Project Name**: `Habit Saga`
4. Click **Create**

### 2. Add iOS App

1. In your project, click **Apps** → **Add App**
2. Select **iOS**
3. **App Name**: `Habit Saga`
4. **Bundle ID**: `com.habitsaga.app`
5. **App Store Connect Shared Secret**: 
   - Get this from App Store Connect → Your App → General → App Information → App-Specific Shared Secret
   - Generate if you haven't already
6. Click **Save**

### 3. Get API Keys

1. In RevenueCat Dashboard, go to **Project Settings** → **API Keys**
2. Copy your **iOS API Key** (should start with `appl_` for production)
3. For testing, you're already using: `test_tzqsJxJiTleWHjVfNkjZELbAsXV`
4. Update `.env.local`:
   ```
   EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=test_tzqsJxJiTleWHjVfNkjZELbAsXV
   ```

### 4. Create Entitlements

1. Go to **Entitlements** in RevenueCat Dashboard
2. Click **+ New**
3. Create two entitlements:

#### Plus Entitlement
- **Identifier**: `plus`
- **Display Name**: `Plus`
- **Description**: "Access to Plus tier features"

#### Premium Entitlement
- **Identifier**: `premium`
- **Display Name**: `Premium`
- **Description**: "Access to Premium tier features (highest tier)"

### 5. Create Offerings

1. Go to **Offerings** in RevenueCat Dashboard
2. Click **+ New Offering**
3. **Offering Identifier**: `default`
4. **Display Name**: `Default Offering`
5. **Description**: "Standard subscription options for all users"
6. Check **Make this the current offering**
7. Click **Create**

### 6. Create Packages

Within your `default` offering, create 4 packages:

#### Package 1: Plus Weekly
- **Identifier**: `plus_weekly`
- **Duration**: Custom (Weekly)
- **Product**: Select `com.habitsaga.app.plus.weekly` from dropdown
- **Entitlements**: Check `plus`

#### Package 2: Plus Monthly
- **Identifier**: `plus_monthly`
- **Duration**: Monthly
- **Product**: Select `com.habitsaga.app.plus.monthly`
- **Entitlements**: Check `plus`

#### Package 3: Premium Weekly
- **Identifier**: `premium_weekly`
- **Duration**: Custom (Weekly)
- **Product**: Select `com.habitsaga.app.premium.weekly`
- **Entitlements**: Check `premium`

#### Package 4: Premium Monthly
- **Identifier**: `premium_monthly`
- **Duration**: Monthly
- **Product**: Select `com.habitsaga.app.premium.monthly`
- **Entitlements**: Check `premium`

---

## Product ID Reference

### App Store Connect Product IDs
```
com.habitsaga.app.plus.weekly
com.habitsaga.app.plus.monthly
com.habitsaga.app.premium.weekly
com.habitsaga.app.premium.monthly
```

### RevenueCat Identifiers
**Entitlements:**
- `plus`
- `premium`

**Offering:**
- `default`

**Packages:**
- `plus_weekly`
- `plus_monthly`
- `premium_weekly`
- `premium_monthly`

---

## Testing

### 1. Sandbox Testing

1. Create a sandbox test account in App Store Connect:
   - Go to **Users and Access** → **Sandbox Testers**
   - Click **+** to create a new tester
   - Use a unique email (doesn't need to be real)

2. On your iOS device/simulator:
   - Sign out of your real Apple ID (Settings → App Store)
   - Don't sign in yet - the sandbox prompt will appear when you try to purchase

3. Build and run the app:
   ```bash
   npx expo run:ios
   ```

4. Trigger a purchase in the app (once you build the paywall UI)
5. When prompted, sign in with your sandbox tester account
6. Complete the purchase flow
7. Verify in RevenueCat Dashboard that the subscription appears

### 2. Verify SDK Integration

Check the Xcode console/Metro logs for:
```
RevenueCat SDK initialized successfully
```

If you see errors, double-check:
- API key in `.env.local`
- Bundle ID matches App Store Connect
- Products are created and approved in App Store Connect

### 3. Test Restore Purchases

1. Delete and reinstall the app
2. Tap "Restore Purchases" in your paywall (when you build it)
3. Verify the subscription is restored

---

## Next Steps

Once this setup is complete, you'll be ready to:
1. **Design the paywall UI** - Create beautiful paywall screens showing the subscription options
2. **Implement purchase flow** - Use `useSubscription()` hook to trigger purchases
3. **Add feature gating** - Use `useFeatureAccess()` hook to check limits throughout the app
4. **Test thoroughly** - Test all purchase, restore, and cancellation flows

---

## Troubleshooting

### Products not showing in app
- Ensure products are in "Ready to Submit" or "Approved" status in App Store Connect
- Wait 15-30 minutes after creating products for App Store to sync
- Verify bundle ID matches exactly
- Check that you're using the correct API key

### Purchase fails
- Verify you're signed in with a sandbox account
- Ensure products are properly configured in both App Store Connect and RevenueCat
- Check RevenueCat package configuration matches product IDs

### Entitlements not unlocking
- Verify entitlements are assigned to packages in RevenueCat Dashboard
- Check that you're checking for the correct entitlement ID in code (`plus` or `premium`)
- Refresh customer info after purchase

---

## Important Notes

- **Test API Key**: Currently using `test_tzqsJxJiTleWHjVfNkjZELbAsXV` - replace with production key before release
- **Bundle ID**: Confirmed as `com.habitsaga.app` in `app.json`
- **Pricing**: All prices shown are USD - configure local pricing for other regions in App Store Connect
- **Attribution**: RevenueCat will automatically track purchase attribution if you integrate analytics tools later
