# App Store Review Notes for Habit Chronicle Plus Subscription

## App Overview
Habit Chronicle is a gamified habit tracking app that transforms users' daily habits into an epic comic book story. Each time a user checks in on their habits, the app uses AI to generate a personalized narrative chapter and comic-style illustrations, creating a unique story of their journey toward their goals.

## Plus Subscription Features

The Habit Chronicle Plus subscription unlocks enhanced features that allow users to track more goals and create richer stories:

**Core Features:**
- **3 Active Sagas**: Track up to 3 active habit goals simultaneously (free tier limited to 2)
- **10 AI-Generated Images Per Month**: Receive 10 AI-generated comic panel illustrations monthly (free tier limited to 4)
- **All Themes**: Access to all available story themes including Action/Adventure, Fantasy, Sci-Fi, Superhero, Anime, Noir, and Pop Regency (free tier has limited theme access)
- **Unlimited Text Chapters**: No limit on narrative text generation for story chapters
- **Enhanced Sharing**: Improved sharing capabilities for story chapters and progress updates
- **Lighter Watermark**: Reduced watermark on shared content compared to free tier

**Subscription Options:**
- Weekly: $3.99/week
- Monthly: $9.99/month (save 40% compared to weekly)

## How to Test the Subscription

1. **Launch the app** and complete the onboarding flow (create account, set timezone, enable notifications)

2. **Create a goal (Saga)**:
   - Tap "Start My Saga" or navigate to the goal creation wizard
   - Enter a goal (e.g., "Exercise daily")
   - Complete the wizard steps (context, target date, cadence, theme selection)
   - The app will generate an origin chapter

3. **Access the paywall**:
   - Navigate to the paywall screen (typically shown when attempting to create a 3rd saga or when hitting image limits)
   - Or access via Profile → Subscription/Upgrade

4. **View subscription options**:
   - You'll see two tiers: Plus and Premium
   - Select the Plus tier
   - Toggle between Weekly ($3.99) and Monthly ($9.99) options

5. **Test purchase flow**:
   - Tap "Subscribe to Plus"
   - Complete the purchase using your sandbox test account
   - Verify the subscription activates and features unlock

6. **Test subscription features**:
   - Create a 3rd active saga (should now be allowed)
   - Generate AI images (up to 10 per month)
   - Access all themes in the theme selection screen
   - Share a chapter and verify enhanced sharing features

7. **Test restore purchases**:
   - Delete and reinstall the app
   - Tap "Restore Purchases" on the paywall screen
   - Verify subscription is restored and features remain unlocked

## Testing Credentials

Use a sandbox test account created in App Store Connect:
- Go to Users and Access → Sandbox Testers
- Create a test account with a unique email
- Sign out of your real Apple ID before testing
- The sandbox prompt will appear when attempting to purchase

## Key Testing Points

- Verify subscription unlocks Plus features immediately after purchase
- Confirm monthly image quota (10 images) is enforced correctly
- Test that users can have up to 3 active sagas with Plus subscription
- Verify all themes are accessible with Plus subscription
- Test subscription restoration after app reinstall
- Confirm subscription cancellation works (via iOS Settings → Subscriptions)
- Verify users retain access until the end of the billing period after cancellation

## Technical Details

- **Product IDs**: 
  - Plus Weekly: `com.habitsaga.app.plus.weekly`
  - Plus Monthly: `com.habitsaga.app.plus.monthly`
- **Subscription Management**: Handled via RevenueCat SDK
- **Auto-Renewal**: Subscriptions automatically renew unless cancelled at least 24 hours before the end of the billing period
- **Cancellation**: Users can cancel via iOS Settings → [Name] → Subscriptions → Habit Chronicle

**Note:** The bundle ID and product IDs still use "habitsaga" (com.habitsaga.app) from the original app name, but the app is now branded as "Habit Chronicle" throughout the user interface.

## Additional Notes

- The app uses AI (Google Gemini) to generate narrative text and comic-style images
- Subscription status is synced across devices via RevenueCat
- Free tier users can still use the app with limited features (2 sagas, 4 images/month, limited themes)
- All subscription terms and pricing are clearly displayed in the app's Subscription Terms screen

