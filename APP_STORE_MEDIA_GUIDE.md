# App Store Media - Quick Reference

## What You Need to Provide

1. **Email**: Your demo account email (e.g., `demo@habitchronicle.com`)
2. **Password**: Your demo account password
3. **Selfie**: A photo of yourself (JPG or PNG format)

## Quick Start Commands

### 1. Seed Demo Account
```bash
# Place your selfie in the project root first
npx tsx seed-demo-account.ts \
  --email demo@habitchronicle.com \
  --password YourPassword123 \
  --selfie ./selfie.jpg
```

**Duration:** 10-15 minutes  
**What it creates:**
- 3 goals (Exercise Daily, Read 10 Books, Learn Spanish)
- 30+ chapters total with realistic check-in history
- AI-generated panels with your face as the hero
- Plus subscription tier
- Realistic streaks and progress

### 2. Capture Media
Follow the workflow: `/capture-app-store-media`

## Demo Goals Created

### 🦸 Goal 1: Exercise Daily
- **Theme:** Superhero
- **Chapters:** 15 (14 days of check-ins + origin)
- **Current Streak:** 7 days
- **Progress:** 100% completion rate in last week

### 📚 Goal 2: Read 10 Books in 2025
- **Theme:** Fantasy (Magical Kingdom)
- **Chapters:** 12 (11 days of check-ins + origin)
- **Current Streak:** 4 days
- **Progress:** First book completed

### 🗣️ Goal 3: Learn Spanish
- **Theme:** Slice-of-Life Anime
- **Cadence:** 5 days per week
- **Chapters:** 8 (7 check-ins + origin)
- **Current Streak:** 2 days
- **Progress:** Building vocabulary

## 10 Required Screenshots

1. ✨ Welcome/Onboarding Screen
2. 🎨 Origin Story Panel (Exercise Daily)
3. 🏠 Home View (All 3 Goals)
4. 📖 Chapter Timeline (Exercise Daily)
5. 🎭 Mid-Story Chapter (Exercise Daily, Ch 7-8)
6. ✅ Check-In Screen
7. 🎨 Theme Selection Gallery
8. 📚 Reading Goal Chapter (Fantasy theme)
9. 💎 Subscription/Profile (Plus tier)
10. 🗣️ Spanish Learning Chapter (Anime theme)

## 3 Required Videos

1. **Onboarding Flow** (30s) - Welcome → Goal Creation → Origin Reveal
2. **Check-In Experience** (20s) - Complete workout → New chapter generated
3. **Multiple Sagas** (25s) - Browse 3 goals → View chapters → Show variety

## Important Notes

- **Wait Time:** After seeding, wait 5-10 minutes for AI images to generate
- **Device:** Use iPhone 15 Pro Max (6.7") for best results
- **Mode:** Always use Light mode
- **Battery:** Show 100% battery in screenshots if possible
- **DND:** Enable Do Not Disturb during filming

## File Locations

- Seeding script: `seed-demo-account.ts`
- Full workflow: `.agent/workflows/capture-app-store-media.md`
- App Store notes: `APP_STORE_REVIEW_NOTES.md`

## Next Steps After Seeding

1. ⏰ Wait 5-10 minutes for images
2. 📱 Open app and sign in to demo account
3. 👀 Verify all goals and chapters look good
4. 📸 Follow `/capture-app-store-media` workflow
5. 🎬 Capture screenshots and videos
6. ⬆️ Upload to App Store Connect

## Troubleshooting

**No images showing?**
- Wait longer (up to 15 minutes for all images)
- Check chapter details - `image_url` should be populated
- Verify Plus subscription is active (10 images/month quota)

**Script errors?**
- Check `.env.local` has Supabase credentials
- Ensure account exists (create it in app first if needed)
- Verify selfie file path is correct

**Poor quality panels?**
- Make sure selfie is clear and well-lit
- Check that selfie_public_url is being passed correctly
- Images are generated asynchronously - check back later

---

**Total Time Investment:** 3-4 hours  
**Result:** Professional App Store submission media ready to go! 🚀
