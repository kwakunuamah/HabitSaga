---
description: Capture App Store screenshots and preview videos
---

# Capture App Store Screenshots and Preview Videos

This workflow guides you through capturing the required media for your iOS App Store submission.

## Prerequisites

1. **Demo account seeded** - Run the seeding script first (see below)
2. **Physical iPhone or Simulator** - iPhone 15 Pro Max (6.7") recommended
3. **Screen recording tools ready** - iOS built-in screen recorder or QuickTime
4. **Light mode enabled** - Screenshots should be in light mode

## Step 1: Seed Demo Account

// turbo
Run the demo account seeding script to create realistic data:

```bash
# First, prepare your selfie image
# Place it in the project root or note its path

# Run the seeding script
npx tsx seed-demo-account.ts --email demo@habitchronicle.com --password YourSecurePassword123 --selfie ./path/to/your/selfie.jpg
```

**Expected duration:** 10-15 minutes (creates 3 goals with 30+ chapters total)

## Step 2: Wait for AI Images

After seeding, wait **5-10 minutes** for all AI-generated panel images to complete. The origin chapters and select check-ins will have images generated asynchronously.

You can monitor progress by:
1. Opening the app
2. Viewing each goal's chapter timeline
3. Checking that panels are appearing

## Step 3: Set Up Device for Capture

### On Physical iPhone:
1. Go to Settings → Display & Brightness → Always Light
2. Enable Do Not Disturb to avoid notification interruptions
3. Swipe down from top-right to open Control Center
4. Add Screen Recording button if not present (Settings → Control Center)
5. Charge device to 100% (screenshots look better with full battery)

### On Simulator:
1. Launch iPhone 15 Pro Max simulator
2. Set appearance to Light mode
3. Screenshots: `Cmd + S`
4. Screen recording: Use QuickTime → New Screen Recording

## Step 4: Capture 10 Screenshots

Sign in to the demo account and capture these screens in order:

### Screenshot 1: Welcome Screen
- Fresh app launch (or force quit and reopen)
- Capture the beautiful welcome/onboarding screen
- Should show "Turn your goals into an epic story" messaging

### Screenshot 2: Origin Story Panel
- Navigate to "Exercise Daily" goal
- Tap into the first chapter (origin story)
- Capture the full-screen panel with narrative text
- **Should show:** Beautiful superhero-themed AI art with your face

### Screenshot 3: Home View with Multiple Sagas
- Navigate back to home
- Capture the home screen showing all 3 goals:
  - Exercise Daily (Superhero theme)
  - Read 10 Books (Fantasy theme)  
  - Learn Spanish (Anime theme)
- **Should show:** Cover arts, progress bars, streaks, next check-in times

### Screenshot 4: Chapter Timeline
- Tap into "Exercise Daily" goal
- Capture the chapter list/timeline view
- **Should show:** Multiple chapters with dates, outcomes, some with panel art

### Screenshot 5: Mid-Story Chapter
- Scroll to chapter 7-8 in "Exercise Daily"
- Tap to view a chapter with a panel image
- Capture the full chapter view
- **Should show:** Compelling narrative + high-quality panel art

### Screenshot 6: Check-In Screen
- Navigate back to home
- Tap on a goal to check in (or use the check-in button)
- Capture the check-in screen
- **Should show:** Goal info, streak counter, completion buttons, note field

### Screenshot 7: Theme Selection
- Start creating a new goal (+ button)
- Navigate through wizard to theme selection step
- Capture the theme gallery
- **Should show:** Grid of beautiful theme options with sample art

### Screenshot 8: Reading Goal Chapter
- Navigate to "Read 10 Books" goal
- Open a chapter with fantasy-themed panel art
- Capture the chapter view
- **Should show:** Different art style (fantasy vs superhero)

### Screenshot 9: Subscription/Profile Screen
- Navigate to Profile tab
- Tap on subscription/upgrade section OR show the paywall
- Capture screen showing Plus benefits
- **Should show:** "3 Active Sagas", "10 AI Images/month", subscription tiers

### Screenshot 10: Spanish Learning Chapter
- Navigate to "Learn Spanish" goal
- Open a chapter with anime-style panel art
- Capture the chapter view
- **Should show:** Third unique theme style

## Step 5: Capture 3 App Preview Videos

### Video 1: "Onboarding to First Chapter" (30 seconds)

**Setup:**
- Sign out of account
- Force quit app

**Recording flow:**
1. [0-2s] Launch app → Welcome screen
2. [2-5s] Tap "Start My Saga" → create account or sign in screen (show briefly)
3. [5-7s] Already signed in → skip to wizard
4. [7-10s] Quick goal creation: "Morning Meditation" 
5. [10-13s] Theme selection: Choose "Fantasy"
6. [13-16s] Avatar selection (show selfie upload)
7. [16-18s] "Creating Your Origin Story..." loading animation
8. [18-28s] REVEAL: Beautiful origin chapter panel + title + narrative
9. [28-30s] Slow scroll through narrative text

**Tips:**
- Keep transitions smooth
- Show the "wow" moment of AI generation
- End on the compelling narrative

### Video 2: "Daily Check-In Experience" (20 seconds)

**Setup:**
- Be on home screen with "Exercise Daily" goal showing
- Simulate a notification (or just navigate directly)

**Recording flow:**
1. [0-2s] Home screen showing goal with "Ready to check in" indicator
2. [2-4s] Tap goal → check-in screen appears
3. [4-6s] Show streak: "7-day streak!" 
4. [6-8s] Tap "Completed" → add note "Crushed today's workout!"
5. [8-10s] Submit → Loading "Generating chapter..."
6. [10-16s] NEW CHAPTER reveals with animation
7. [16-18s] Tap share button → show share sheet (don't actually share)
8. [18-20s] Back to home → updated chapter count and streak

**Tips:**
- Emphasize the satisfying feedback loop
- Show the story progression
- Highlight social sharing capability

### Video 3: "Multiple Sagas & Progress" (25 seconds)

**Setup:**
- Sign in to demo account
- Be at home screen

**Recording flow:**
1. [0-4s] Home view showing 3 active sagas with different themes
   - Pan slowly to show cover art, progress bars, streaks
2. [4-8s] Tap "Exercise Daily" → scroll through chapter timeline
   - Show progression from chapter 1 → 15
3. [8-14s] Tap chapter 8 → view mid-story panel with epic narrative
   - Slow scroll to show quality of storytelling
4. [14-18s] Back → back to home → show other goals briefly
5. [18-22s] Quick peek at "Read 10 Books" fantasy theme
6. [22-25s] End with app icon reveal + tagline
   - Screen fades to black → app icon appears → "Habit Chronicle - Your story begins today"

**Tips:**
- Show variety and depth
- Demonstrate long-term engagement
- End with strong branding moment

## Step 6: Export and Optimize

### Screenshots:
- Export as PNG (highest quality)
- Ensure file names are descriptive: `01_welcome.png`, `02_origin_panel.png`, etc.
- Verify resolution: Should be native device resolution
- Upload to App Store Connect in order

### Videos:
- Export as .mov or .mp4
- Maximum file size: 500MB each
- Resolution: 1080p minimum
- Frame rate: 30fps minimum
- No sound required (but can add music if desired)
- Trim to exact durations (30s, 20s, 25s)
- Consider adding subtle background music using iMovie or Final Cut

## Step 7: Upload to App Store Connect

1. Go to App Store Connect → Your App → App Store tab
2. Scroll to "App Preview and Screenshots"
3. Select device size: 6.7" Display (iPhone 15 Pro Max)
4. Upload screenshots in order (drag and drop)
5. Upload preview videos
6. Add captions/descriptions for videos in App Store Connect
7. Review and save

## Troubleshooting

**Issue: Images not generating**
- Wait longer (up to 15 minutes)
- Check Supabase edge function logs
- Verify quota hasn't been exceeded

**Issue: Screen recording has notifications**
- Enable Do Not Disturb before recording
- Turn off all notification previews in Settings

**Issue: Colors look washed out**
- Ensure Light Mode is enabled
- Check that True Tone is disabled (Settings → Display)
- Capture in well-lit environment

**Issue: App crashes during seeding**
- Check internet connection
- Reduce check-in count in seed script
- Run script again (it's safe to re-run)

## Quality Checklist

Before submitting, verify:
- ✅ All 10 screenshots are clear and high resolution
- ✅ Screenshots show variety (different themes, screens, features)
- ✅ All 3 videos are smooth and under time limits
- ✅ Videos demonstrate core user flows
- ✅ No personal information visible (unless demo account)
- ✅ UI looks polished (no debug info, proper spacing)
- ✅ AI-generated content is high quality and on-brand
- ✅ Subscription features are showcased

## Additional Tips

1. **Consistency**: Use the same demo account for all media
2. **Timing**: Capture everything in one session for consistent lighting/appearance
3. **Backup**: Save raw recordings before editing
4. **Test**: Review videos on different devices to ensure quality
5. **Iterate**: Don't be afraid to re-capture if something doesn't look right

---

**Estimated total time:** 2-3 hours (including seeding, waiting for AI, and capturing)
