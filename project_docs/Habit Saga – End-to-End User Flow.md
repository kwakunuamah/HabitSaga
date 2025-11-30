\# Habit Saga – End-to-End User Flow  
\_From onboarding to first goal completion\_

\#\# 0\. Pre-Onboarding (App Store → First Launch)

\*\*Entry points\*\*  
\- User discovers Habit Saga via:  
  \- TikTok/IG video showing comic-style habit stories.  
  \- Shared chapter image from a friend.  
  \- App Store search (“habit tracker”, “motivation”, “comic diary”).

\*\*Key screen (store listing)\*\*  
\- App icon, screenshots showing:  
  \- Goal → story mapping.  
  \- Comic panels (wins/fails).  
  \- Simple check-in UI.  
\- Clear value copy:  
  \- “Turn your goals into a comic saga.”  
  \- “Every day you show up becomes a new chapter.”

\*\*User goal\*\*  
\- Decide to download and open the app.

\---

\#\# 1\. First Launch & Lightweight Onboarding

\#\#\# 1.1 Welcome & Value Proposition

\*\*Screen: Welcome\*\*

\- Elements:  
  \- Logo \+ tagline.  
  \- 2–3 swipeable cards:  
    \- Card 1: “Set a goal → we turn it into a story.”  
    \- Card 2: “Every check-in becomes a new chapter.”  
    \- Card 3: “Share your saga with friends.”  
  \- Primary CTA: \*\*“Start My Saga”\*\*  
  \- Secondary: \*\*“Log In”\*\* (for returning users).

\*\*User action\*\*  
\- Taps \*\*“Start My Saga”\*\*.

\---

\#\#\# 1.2 Account Creation

\*\*Screen: Create Account\*\*

\- Inputs:  
  \- Email.  
  \- Password.  
\- CTAs:  
  \- Primary: \*\*“Create Account”\*\*  
  \- Secondary: \*\*“Already have an account? Log in”\*\*

\*\*System actions\*\*  
\- Call Supabase Auth to create user.  
\- On success:  
  \- Create base \`users\` row with:  
    \- \`subscription\_tier \= "free"\`  
    \- Default timezone (from device).  
    \- Default notification preferences (off until user opt-in).

\---

\#\#\# 1.3 Timezone & Notifications

\*\*Screen: Stay on Track\*\*

\- Explanation:  
  \- “We’ll remind you when it’s time to show up so your story never stops.”  
\- Two steps:  
  1\. Show detected timezone with option to adjust.  
  2\. Ask for notification permission.

\*\*User actions\*\*  
\- Confirms timezone.  
\- Taps \*\*“Allow reminders”\*\* (or “Not now”).

\*\*System actions\*\*  
\- If permission granted:  
  \- Store notification token.  
  \- Mark \`notifications\_enabled \= true\`.  
\- If denied:  
  \- \`notifications\_enabled \= false\`, and we’ll prompt later from settings.

\---

\#\# 2\. First Goal Creation → Story Setup

\#\#\# 2.1 Choose Goal Type

\*\*Screen: “What do you want your saga to be about?”\*\*

\- Options (example quick-pick buttons):  
  \- “Fitness”  
  \- “Reading”  
  \- “Learning”  
  \- “Morning Routine”  
  \- “Custom”

\*\*User action\*\*  
\- Taps e.g. \*\*“Reading”\*\*.

\*\*System\*\*  
\- Pre-populate default suggestions for the next screen.

\---

\#\#\# 2.2 Define the Goal

\*\*Screen: Goal Details\*\*

\- Fields:  
  \- Goal name (default: “Read 10 Books in 2025” → editable).  
  \- Target date (date picker; pre-filled \~6–12 weeks ahead).  
  \- Description (optional short text).  
\- At bottom: \*\*Next\*\*

\*\*User action\*\*  
\- Adjusts goal name/target date if needed.  
\- Taps \*\*Next\*\*.

\---

\#\#\# 2.3 Choose Cadence

\*\*Screen: “How often will you take action?”\*\*

\- Simple options:  
  \- “Every day”  
  \- “3 days per week”  
  \- “Custom” (choose days or frequency)  
\- Optional advanced:  
  \- “Daily target” input (e.g., “Read 10 pages”).

\*\*User action\*\*  
\- Selects cadence (e.g., “Every day”).  
\- Taps \*\*Next\*\*.

\*\*System\*\*  
\- Computes initial milestone schedule for the next several weeks.

\---

\#\#\# 2.4 Select Theme

\*\*Screen: “Pick your world”\*\*

\- Grid of theme cards (with sample art):  
  \- “Superhero City”  
  \- “Magical Kingdom”  
  \- “Cyberpunk Future”  
  \- “Space Explorer”  
  \- “Slice-of-Life Anime”  
\- Later, some themes are Premium-only, but MVP can keep them open or lightly gated.

\*\*User action\*\*  
\- Picks a theme (e.g., “Magical Kingdom”).  
\- Taps \*\*Next\*\*.

\---

\#\#\# 2.5 Selfie & Hero Setup

\*\*Screen: “Meet Your Hero”\*\*

\- Message:  
  \- “Take a selfie so we can turn you into the main character of your saga. Your photo stays private.”  
\- UI:  
  \- Camera preview \+ “Take Photo” button.  
  \- Optional “Upload from gallery”.

\*\*User actions\*\*  
\- Takes or uploads a selfie.  
\- Confirms if satisfied.

\*\*System actions\*\*  
\- Upload selfie to Supabase Storage (avatars bucket).  
\- Create initial \`hero\_profile\`:  
  \- Either by:  
    \- Quick local heuristics (age range, hairstyle) plus user’s input, or  
    \- Sending to Gemini Flash with some questions (name, vibe) to generate a short text description.  
\- Save hero profile & theme profile in \`goals\` table.

\---

\#\#\# 2.6 Origin Story & First Panel

\*\*Screen: “Creating Your Origin Story…”\*\*

\- Loading state while backend:  
  1\. Calls Flash to:  
     \- Generate:  
       \- \`origin\_chapter\_title\`  
       \- \`origin\_chapter\_text\`  
       \- \`saga\_summary\_short\`  
       \- \`last\_chapter\_summary\`  
  2\. Calls Gemini 3 Image to:  
     \- Generate \*\*cover/origin panel\*\*:  
       \- Hero in theme world.  
       \- Goal context implied (reading, running, etc.).  
  3\. Saves:  
     \- New \`chapters\` row (chapter index 1).  
     \- Panel in Supabase Storage, URL in chapter.

\*\*Screen when done: Origin Chapter\*\*

\- Show:  
  \- Full-screen comic panel.  
  \- Title: e.g., “Chapter 1: The Oath”  
  \- Text: 2–4 paragraphs of narrative.  
\- CTAs:  
  \- Primary: \*\*“Continue”\*\*  
  \- Secondary: \*\*“Share this chapter”\*\* (optional in MVP).

\*\*User action\*\*  
\- Reads, then taps \*\*Continue\*\*.

\*\*System\*\*  
\- Navigates to \*\*Home / Stories\*\* view.

\---

\#\# 3\. Ongoing Usage: Check-Ins, Reminders, Encouragement

Now the user is “live” with their first goal/story.

\#\#\# 3.1 Home / Stories Overview

\*\*Screen: Home (Stories)\*\*

\- Card for each active goal (currently just one):  
  \- Cover art thumbnail.  
  \- Title (e.g., “Read 10 Books in 2025”).  
  \- Progress bar (chapters completed vs estimated).  
  \- Next check-in time (“Next chapter: Today at 8 PM”).

\*\*User actions\*\*  
\- Can tap the story card to:  
  \- View story timeline (chapters list).  
  \- See streak stats.

\---

\#\#\# 3.2 Daily Reminder & Check-In Flow

\#\#\#\# 3.2.1 Reminder

\*\*At scheduled time\*\*

\- If notifications enabled:  
  \- Local notification:  
    \- Title: “Chapter check-in”  
    \- Body: “Did you read today for ‘Read 10 Books in 2025’?”

\*\*User action\*\*  
\- Taps notification → app opens directly into \*\*Check-In screen\*\* for that goal.

\---

\#\#\#\# 3.2.2 Check-In Screen

\*\*Screen: “Did you complete today’s action?”\*\*

\- Shows:  
  \- Goal and theme.  
  \- Today’s milestone (e.g., “Read 10 pages”).  
  \- Streak summary (e.g., “Streak: 4 days”).

\- Buttons:  
  \- \*\*Completed\*\*  
  \- \*\*Partially\*\*  
  \- \*\*Missed\*\*  
\- Optional text input:  
  \- “Want to add a note?”

\*\*User action\*\*  
\- Selects result (e.g., “Completed”).  
\- Optionally types note.  
\- Taps \*\*Submit\*\*.

\*\*System actions\*\*  
1\. Create new \`chapters\` row with outcome \+ note \+ date.  
2\. Update streak.  
3\. Call Flash to:  
   \- Generate chapter title \+ narrative text.  
   \- Update \`saga\_summary\_short\` \+ \`last\_chapter\_summary\`.  
4\. If user has remaining panel quota:  
   \- Call Gemini 3 Image to generate panel.  
   \- Save image URL in chapter.  
5\. Mark this milestone as “completed” in schedule.

\---

\#\#\#\# 3.2.3 Chapter Result Screen

\*\*Screen: “New Chapter Unlocked”\*\*

\- Present:  
  \- New panel (if generated).  
  \- Chapter title (e.g., “Chapter 2: The Pages Turn”).  
  \- Short excerpt of narrative or full text.

\- CTAs:  
  \- Primary: \*\*“Back to Home”\*\* or \*\*“See Story Timeline”\*\*.  
  \- Secondary: \*\*“Share this chapter”\*\* (if image exists).

\*\*User action\*\*  
\- Often just taps \*\*“Back to Home”\*\*.

\---

\#\#\# 3.3 Positive Encouragement & Nudges

To keep them engaged across days/weeks:

\*\*Types of nudges\*\*

1\. \*\*Post-win micro copy\*\*  
   \- After a streak milestone (e.g., 7 days):  
     \- “You’ve unlocked a mini-badge: Week One Champion.”  
   \- Optionally overlay a tiny visual badge on the chapter or story card.

2\. \*\*Soft in-app notifications\*\*  
   \- On opening app after several days of consistency:  
     \- “Your saga is on fire – keep going for Chapter 7\!”

3\. \*\*Missed-day encouragement\*\*  
   \- After a “Missed” check-in:  
     \- Text narrative shows setback but ends with hopeful note.  
   \- Push next morning:  
     \- “Every hero stumbles. Ready to turn it around today?”

\*\*System\*\*  
\- Uses stored streak

