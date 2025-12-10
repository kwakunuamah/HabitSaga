# 📸 Ready to Seed Your Demo Account!

I've created everything you need to generate professional App Store screenshots and videos. Here's what to do:

## 🚀 Quick Start (3 Steps)

### Step 1: Prepare Your Selfie
Place your selfie image in the project root. It should be:
- **Format:** JPG or PNG
- **Quality:** Clear, well-lit photo of your face
- **Name:** Anything you want (e.g., `selfie.jpg`, `my-photo.png`)

### Step 2: Run the Seeding Script

**Option A - Using npm script (easiest):**
```bash
npm run seed:demo -- --email YOUR_EMAIL --password YOUR_PASSWORD --selfie ./your-selfie.jpg
```

**Option B - Direct command:**
```bash
npx tsx seed-demo-account.ts --email YOUR_EMAIL --password YOUR_PASSWORD --selfie ./your-selfie.jpg
```

**Example:**
```bash
npm run seed:demo -- --email demo@habitchronicle.com --password DemoPass123! --selfie ./selfie.jpg
```

### Step 3: Wait and Capture

1. ⏰ **Wait 5-10 minutes** for AI to generate all the images
2. 📱 **Open your app** and sign in with the credentials you used
3. 📸 **Follow the workflow** by typing `/capture-app-store-media`

## 📦 What Gets Created

The script will automatically create:

### ✅ Account Setup
- **Subscription:** Plus tier (3 sagas, 10 images/month)
- **Avatar:** Your selfie uploaded and set as profile picture
- **Profile:** Name, bio, age range configured

### ✅ Goal 1: "Exercise Daily" 🦸
- **Theme:** Superhero City
- **Chapters:** 15 total (1 origin + 14 check-ins)
- **Streak:** 7-day current streak
- **Timeline:** Last 2 weeks of activity
- **Your hero:** You as a superhero in AI-generated panels!

### ✅ Goal 2: "Read 10 Books in 2025" 📚
- **Theme:** Magical Kingdom (Fantasy)
- **Chapters:** 12 total (1 origin + 11 check-ins)
- **Streak:** 4-day current streak
- **Progress:** First book completed
- **Your hero:** You as a fantasy adventurer!

### ✅ Goal 3: "Learn Spanish" 🗣️
- **Theme:** Slice-of-Life Anime
- **Chapters:** 8 total (1 origin + 7 check-ins)
- **Cadence:** 5 days per week
- **Streak:** 2-day current streak
- **Your hero:** You in anime art style!

**Total:** 35 chapters with realistic notes, outcomes, and AI-generated story progression!

## 🎨 How Your Selfie Is Used

Your selfie will be passed to **every AI generation call**, which means:

1. **Origin Stories (3 total)** - You'll be the hero in 3 different themed origin panels
2. **Check-In Panels** - Selected chapters will have AI-generated art featuring you
3. **Personalized Narratives** - AI knows who the hero is and makes it personal
4. **Consistent Character** - You'll appear as the same hero across all chapters in each saga

The AI (Gemini 3 Pro Image) will:
- Understand your appearance from the selfie
- Transform you into each theme's art style
- Maintain consistency across all panels
- Create professional comic book quality art

## ⏱️ Script Duration

- **Total runtime:** 10-15 minutes
- **What happens:**
  - Signs in to your account
  - Uploads selfie to Supabase Storage
  - Updates profile with Plus subscription
  - Creates Goal 1 + origin chapter (2-3 min)
  - Creates 14 check-ins for Goal 1 (4-5 min)
  - Creates Goal 2 + origin chapter (2-3 min)
  - Creates 11 check-ins for Goal 2 (3-4 min)
  - Creates Goal 3 + origin chapter (2-3 min)
  - Creates 7 check-ins for Goal 3 (2-3 min)

**Note:** Images generate asynchronously in the background, so allow 5-10 minutes after the script completes for all panels to finish.

## 📋 Prerequisites

Make sure you have:
- ✅ Account created in the app (create it first if it doesn't exist)
- ✅ Supabase credentials in `.env.local`
- ✅ Your selfie image ready
- ✅ Good internet connection (lots of API calls!)

## 🔍 Monitoring Progress

While the script runs, you'll see:
```
🚀 Starting Habit Chronicle Demo Account Seeding
================================================

📧 Signing in...
✅ Signed in as: demo@habitchronicle.com

📸 Uploading selfie...
✅ Selfie uploaded: https://...

👤 Updating user profile...
✅ Profile updated with Plus subscription

🎯 Creating demo goals with AI-generated content...

============================================================
📚 Goal 1/3: Exercise Daily
============================================================

  🌟 Creating goal and generating origin story...
  ✅ Goal created: abc-123-def
  ✅ Origin chapter: "Chapter 1: The Awakening"
  ⏳ Waiting for AI image generation (async)...
  ✅ Origin image generated!

  📝 Creating 15 check-ins...
    [1/15] completed (14 days ago)... ✅ "Chapter 2: First Steps"
    [2/15] completed (13 days ago)... ✅ "Chapter 3: Building Momentum"
    ...
```

## ❓ Troubleshooting

**"No active session" error?**
- The account doesn't exist yet - create it in the app first
- Double-check your email and password

**"Failed to upload selfie" error?**
- Verify the file path is correct
- Make sure the image file exists
- Check file is JPG or PNG format

**Script is slow or timing out?**
- This is normal! AI generation takes time
- Check your internet connection
- The script has retries built-in
- Wait for it to complete - it will succeed

**Images not showing in app?**
- Wait 5-10 more minutes
- Images are generated asynchronously
- Refresh the app (pull down on chapter list)
- Check Supabase Functions logs if still missing

## 📚 Additional Resources

- **Full workflow:** Type `/capture-app-store-media` or see `.agent/workflows/capture-app-store-media.md`
- **Quick reference:** `APP_STORE_MEDIA_GUIDE.md`
- **App Store review notes:** `APP_STORE_REVIEW_NOTES.md`
- **Script file:** `seed-demo-account.ts`

## 🎬 What's Next?

After seeding completes and images finish generating:

1. Open your app
2. Sign in with your demo account
3. Browse through your 3 sagas
4. Admire the AI-generated art featuring YOU as the hero!
5. Follow the capture workflow to get your screenshots and videos
6. Submit to App Store! 🚀

---

**Ready?** Just provide your selfie, email, password, and run the command! The rest is automatic. ✨
