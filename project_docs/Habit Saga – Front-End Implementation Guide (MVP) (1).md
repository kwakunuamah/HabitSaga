\# Habit Saga – Front-End Implementation Guide (MVP)

\#\# 1\. Purpose of this document

This guide explains \*\*how the front-end should be built\*\* for Habit Saga:

\- What stacks and libraries we use on the client.  
\- How navigation and screens are organized.  
\- How we structure components, styles, and state.  
\- How we integrate notifications and social sharing.  
\- Where the front-end stops and the backend/Edge Functions take over.

It’s written so a dev can open this file and know exactly \*\*what to build and where things live\*\*.

\---

\#\# 2\. Front-End Stack Overview

\*\*Framework:\*\* React Native    
\*\*App shell:\*\* Expo (managed workflow)    
\*\*Navigation:\*\* React Navigation or Expo Router (tabs \+ stacks)    
\*\*Notifications:\*\* \`expo-notifications\`    
\*\*Sharing:\*\* Native share sheet (\`Share\` API \+ \`expo-sharing\` / \`react-native-share\`)  

\*\*Key principles\*\*

\- \*\*Single codebase\*\* for iOS now, Android later (no platform-specific forks unless absolutely necessary).  
\- Keep \*\*AI calls and secrets on the backend\*\* (Supabase Edge Functions).  
\- Front-end focuses on:  
  \- Smooth navigation.  
  \- Clean components.  
  \- Predictable state.  
  \- Nice animations \+ interactions.

\---

\#\# 3\. Navigation Structure

We’ll use a \*\*tab \+ stack\*\* pattern:

\- \*\*Root:\*\* Bottom tab navigator with 3 main tabs:  
  1\. \`Home\` (Stories)  
  2\. \`Check-ins\` or \`Today\`  
  3\. \`Profile\`

Inside each tab, use a \*\*stack navigator\*\* for detail screens. This is a common pattern in React Navigation and Expo Router setups.  

\#\#\# 3.1 Screens (high-level)

\*\*Auth flow (stack)\*\*  
\- \`Auth/Welcome\`  
\- \`Auth/Login\`  
\- \`Auth/Register\`

\*\*Main tabs\*\*

1\. \*\*Home tab (Stories)\*\*  
   \- \`Home/StoriesList\` – list of goals/stories.  
   \- \`Home/StoryDetail\` – chapters timeline for a specific goal.  
   \- \`Home/ChapterDetail\` – full panel \+ narrative.

2\. \*\*Check-in tab\*\*  
   \- \`Checkin/Today\` – shows today’s pending milestones for all goals.  
   \- \`Checkin/CheckinForm\` – per-goal check-in screen.

3\. \*\*Profile tab\*\*  
   \- \`Profile/Main\` – user info, subscription tier, settings.  
   \- \`Profile/NotificationsSettings\`  
   \- \`Profile/Subscriptions\`

4\. \*\*Creation flow (modal / stacked)\*\*  
   \- \`CreateGoal/Type\`  
   \- \`CreateGoal/Details\`  
   \- \`CreateGoal/Cadence\`  
   \- \`CreateGoal/Theme\`  
   \- \`CreateGoal/Selfie\`  
   \- \`CreateGoal/OriginPreview\`

You can implement this either with \*\*React Navigation\*\* (classic) or \*\*Expo Router\*\* (file-based). Expo Router’s tabs \+ stacks pattern is well-documented.  

\---

\#\# 4\. UI & Design System

We want Habit Saga to feel clean, modern, and consistent. To do that:

\#\#\# 4.1 Design tokens

Create a \`theme.ts\` (or similar) with:

\- \*\*Colors\*\*  
  \- \`primary\`, \`primaryDark\`, \`accent\`  
  \- \`background\`, \`backgroundElevated\`  
  \- \`textPrimary\`, \`textSecondary\`  
  \- \`success\`, \`warning\`, \`error\`  
\- \*\*Spacing scale\*\* (e.g. 4, 8, 12, 16, 24, 32\) – use consistently for margins/padding.    
\- \*\*Typography scale\*\*  
  \- \`headingXL\`, \`headingL\`, \`headingM\`  
  \- \`body\`, \`caption\`  
  \- Ensure minimum typographic sizes follow common mobile best practices (e.g. \~16px base body text).  

\#\#\# 4.2 Reusable components

Create a \`components/\` folder with:

\- \`PrimaryButton\`  
\- \`SecondaryButton\`  
\- \`TextInputField\`  
\- \`AppText\`, \`AppHeading\` (wrap \`\<Text\>\` to centralize font \+ color rules)    
\- \`Card\` (for story cards, chapter cards)  
\- \`Avatar\` (for hero / user)  
\- \`PanelImage\` (for comic panels with loading \+ error states)

This reduces duplicate styling and keeps the look consistent across screens.  

\#\#\# 4.3 Layout & spacing

\- Use \*\*Flexbox\*\* layouts everywhere (column-based, with gaps).    
\- Standard page padding: \*\*16–20px\*\* from screen edges.    
\- Minimum tap target size around \*\*44×44 points\*\* for buttons and toggles (Apple HIG guidance).  

\---

\#\# 5\. Screen-by-Screen Front-End Behavior

\#\#\# 5.1 Welcome / Onboarding

\*\*Screens\*\*  
\- \`Welcome\` – app value proposition.  
\- \`Sign Up\` / \`Log In\`.

\*\*Front-end responsibilities\*\*

\- Render carousel of 2–3 slides (no backend calls).  
\- Simple forms (email, password).  
\- On submit:  
  \- Call Supabase Auth.  
  \- On success: navigate to \*\*Goal creation\*\* if user has no goals, otherwise \*\*Home\*\*.

\---

\#\#\# 5.2 Goal Creation Wizard

This is a \*\*multi-step flow\*\* that should feel like one cohesive “wizard”:

1\. \*\*Goal Type\*\*  
2\. \*\*Goal Details\*\*  
3\. \*\*Cadence\*\*  
4\. \*\*Theme\*\*  
5\. \*\*Selfie\*\*  
6\. \*\*Origin Preview\*\*

\*\*Front-end behavior\*\*

\- Keep wizard state in local component (or lightweight context/store) until final submit.  
\- Show a progress indicator (e.g., “Step 2 of 6”).  
\- After the last step:  
  \- Call backend to:  
    \- Create the goal record.  
    \- Trigger AI origin generation.  
  \- Show “Generating origin story…” loading state.  
  \- Poll or await a response, then navigate to \*\*Origin Chapter\*\* screen.

\---

\#\#\# 5.3 Origin Chapter Screen

\*\*Purpose\*\*

\- Introduce the user to their first story.  
\- Celebrate the start of the saga.

\*\*UI\*\*

\- Full comic panel at the top.  
\- Below: chapter title \+ origin text.  
\- CTA buttons:  
  \- “Continue” → go to Home/Stories.  
  \- Optional: “Share this chapter” → open share flow.

\*\*Front-end responsibilities\*\*

\- Fetch and display chapter data from backend.  
\- Handle loading/error states:  
  \- If image not ready yet, show skeleton/loading and refresh when available.

\---

\#\#\# 5.4 Home / Stories List

\*\*UI\*\*

\- List of story cards:  
  \- Hero image (small cover thumbnail).  
  \- Title.  
  \- Progress bar (e.g., chapters completed vs estimated).  
  \- Next check-in time.  
\- Floating action button (FAB): “+ New Goal”.

\*\*Front-end\*\*

\- Fetch user’s goals from Supabase on mount, cache locally.  
\- Pull-to-refresh to refetch.  
\- Tap on card → navigate to \`StoryDetail\`.

\---

\#\#\# 5.5 Story Detail (Chapters Timeline)

\*\*UI\*\*

\- Hero banner (cover panel or hero avatar).  
\- Goal meta: target date, streak, theme.  
\- List of chapters:  
  \- Each row shows:  
    \- Small thumbnail (panel if exists).  
    \- Chapter title.  
    \- Outcome (icon: success/miss).  
    \- Date.

\*\*Front-end\*\*

\- Fetch chapters for selected goal.  
\- Infinite scroll / pagination (if many).  
\- Tap chapter → \`ChapterDetail\`.

\---

\#\#\# 5.6 Chapter Detail

\*\*UI\*\*

\- Full panel (if present).  
\- Chapter title.  
\- Narrative text.  
\- Outcome pill (e.g., “Win”, “Missed”).  
\- Buttons:  
  \- “Share” (if image exists).  
  \- “Back to Story”.

\*\*Front-end\*\*

\- Data passed via navigation params or refetched by id.  
\- On “Share”:  
  \- Compose shareable image (panel \+ overlay) client-side or use URL from backend.  
  \- Use native share sheet.

\---

\#\#\# 5.7 Check-In Flow

\*\*Check-in entry points\*\*

\- Daily \*\*notification\*\* → deep link to \`CheckinForm\`.  
\- \`Today\`/\`Check-ins\` tab → list of upcoming milestones.

\*\*Checkin/Today UI\*\*

\- List of today’s action items:  
  \- “Read 10 pages” for Story A.  
  \- “Run 15 min” for Story B.

\*\*Checkin/CheckinForm UI\*\*

\- Show:  
  \- Story title.  
  \- Today’s task description.  
  \- Streak.  
\- Buttons:  
  \- Completed.  
  \- Partial.  
  \- Missed.  
\- Optional note field.  
\- Submit button.

\*\*Front-end behavior\*\*

\- On submit:  
  \- POST to backend:  
    \- outcome \+ note.  
  \- Optimistically update local state (streak, chapter list).  
  \- Show “Generating Chapter…” overlay until backend responds with narrative/panel.  
  \- Navigate to new \`ChapterDetail\` once ready.

\---

\#\#\# 5.8 Profile & Settings

\*\*Profile/Main UI\*\*

\- Avatar / name.  
\- Current plan: Free / Plus / Premium.  
\- Buttons:  
  \- “Manage subscription”.  
  \- “Notifications settings”.  
  \- “Log out”.

\*\*Notifications Settings\*\*

\- Toggles:  
  \- Global notifications on/off.  
  \- Per-goal reminder time (select from dropdown or time picker).  
\- On change:  
  \- Update server with new preferences.  
  \- Update local notification schedule via \`expo-notifications\`.

\---

\#\# 6\. State Management Strategy

For MVP, keep it \*\*simple and explicit\*\*:

\- Use \*\*React Query / TanStack Query\*\* or a light abstraction for:  
  \- Fetching goals, chapters, and profile.  
  \- Caching and automatic refetch on focus.  
\- Use \*\*React Context\*\* only for:  
  \- Auth state (current user).  
  \- Global UI state (theme mode, etc.).

\*\*Local UI state\*\* (forms, wizard steps) stays inside components.

This approach keeps the app straightforward without introducing heavy tools unless necessary.

\---

\#\# 7\. Notifications – Front-End Responsibilities

We’ll rely on \`expo-notifications\` for both \*\*push\*\* and \*\*local\*\* notifications.  

\*\*On first launch after sign up:\*\*

1\. Ask permission with a friendly explainer.  
2\. If granted:  
   \- Get Expo push token.  
   \- Send token to backend.  
3\. Schedule local reminders per goal:  
   \- Using \`Notifications.scheduleNotificationAsync\` in the app.

\*\*When notification is tapped:\*\*

\- Use the listener APIs (\`addNotificationResponseReceivedListener\`) to:  
  \- Inspect the payload (goal id, type).  
  \- Navigate to the correct screen: \`CheckinForm\` or \`StoryDetail\`.

\*\*Front-end does not\*\* decide when to send push nudges for inactivity; backend can trigger those via Expo Push Service. The client just:

\- Receives and routes.  
\- Schedules/removes local notifications when user changes cadence or reminder time.

\---

\#\# 8\. Social Sharing – Front-End Responsibilities

We want share flows to be \*\*simple and native-feeling\*\*.

\*\*Where sharing is available\*\*

\- Origin chapter screen.  
\- Chapter detail screen (with panel).  
\- Final saga completion screen.

\*\*Implementation approach\*\*

\- Use React Native’s \`Share.share()\` for text-based sharing and system share sheet.    
\- Use \`expo-sharing\` or \`react-native-share\` if we need to share actual image files:    
  \- Download (or access) panel image.  
  \- Optionally overlay watermark/text (can be pre-baked server-side to keep front-end simple).  
  \- Invoke share sheet with file URL.

\*\*Front-end responsibilities\*\*

\- Prepare:  
  \- A share payload: image \+ optional share text (“My Habit Saga: 7-day streak\!”).  
  \- If there is a deep link URL, include it as text.  
\- Call:  
  \- \`Share.share({ message, url })\` or library equivalent.  
\- Handle:  
  \- Success/dismiss states (for analytics only).

\---

\#\# 9\. Error Handling & Loading States

Front-end should be resilient, especially around AI calls and network:

\#\#\# 9.1 Loading states

\- \*\*Global spinner\*\* for major transitions (origin generation).  
\- \*\*Inline loaders\*\*:  
  \- Skeleton panels where image is pending.  
  \- “Generating chapter…” message after check-in.

\#\#\# 9.2 Errors

\- Network/API errors:  
  \- Show snack/toast: “Something went wrong. Please try again.”  
  \- Provide a “Retry” button on critical screens (origin generation, chapter generation).  
\- AI image failure:  
  \- Show text-only chapter.  
  \- Optional “Retry panel” button if quota allows.

\---

\#\# 10\. Accessibility & UX Polish

\- Respect system font scaling where possible (dynamic text).    
\- Ensure touch targets ≥ 44x44 points.    
\- Use clear color contrast for text vs background.  
\- Avoid relying on color alone to convey success/failure—use icons or labels.

\---

\#\# 11\. Front-End “Done” Checklist (MVP)

Before shipping MVP, front-end should satisfy:

\- \[ \] Auth flows (register, login, logout) wired to Supabase.  
\- \[ \] Goal creation wizard (all steps) working end-to-end.  
\- \[ \] Origin story screen displays AI text \+ image.  
\- \[ \] Home tab shows list of active stories.  
\- \[ \] Story detail shows chapters and basic stats.  
\- \[ \] Check-in flow logs outcomes and displays new chapters.  
\- \[ \] Notifications:  
  \- \[ \] Permission prompt.  
  \- \[ \] Local check-in reminders per goal.  
  \- \[ \] Tapping notifications navigates correctly.  
\- \[ \] Sharing:  
  \- \[ \] Chapter-level sharing works on iOS devices.  
\- \[ \] UI:  
  \- \[ \] Uses shared theme (colors, spacing, typography).  
  \- \[ \] Buttons and inputs use reusable components.  
\- \[ \] Basic analytics events integrated (screen views, check-ins, shares).

\---

This guide should give you and any collaborator a \*\*clear, opinionated blueprint\*\* for how to implement the Habit Saga front-end in Expo/React Native, and where it plugs into your Supabase \+ Gemini backend.  

