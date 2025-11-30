\# Habit Saga – Tech Stack Document (MVP)

\#\# 1\. High-Level Architecture

\*\*Goal:\*\* Ship an iOS-first mobile app (Android later) that turns user goals into comic-style stories using AI narrative \+ images, with push notifications and viral sharing.

\*\*Architecture overview\*\*

\- \*\*Client (Mobile App)\*\*    
  \- React Native app built with \*\*Expo\*\*, deployed to iOS (and later Android).  
  \- Handles UI, local state, offline caching, notifications, and OS-level sharing.

\- \*\*Backend & Data\*\*    
  \- \*\*Supabase\*\* project for:  
    \- Postgres database (users, goals, chapters, quotas, subscriptions).  
    \- Auth (email/password, later social).  
    \- Storage (user selfies \+ generated comic panels).  
    \- Edge Functions (secure AI calls, quota enforcement).

\- \*\*AI Layer\*\*    
  \- \*\*Gemini 2.5 Flash(-Lite)\*\* for all text/narrative and story state updates (very low token cost).  
  \- \*\*Gemini 3 Pro Image Preview (“Nano Banana Pro”)\*\* for comic-style images.    
    \- Priced at \*\*$0.134 per 1K–2K image\*\* (1024–2048 px, 1120 image tokens):contentReference\[oaicite:0\]{index=0}

\- \*\*Notifications & Virality\*\*    
  \- \*\*Expo Notifications\*\* \+ Expo Push Service for unified Android/iOS push & local notifications.:contentReference\[oaicite:1\]{index=1}    
  \- Native share sheet to export branded images to Instagram, X (Twitter), etc.

\- \*\*DevOps / CI / Delivery\*\*    
  \- \*\*EAS Build\*\* to compile and sign iOS/Android binaries in the cloud.:contentReference\[oaicite:2\]{index=2}    
  \- \*\*EAS Submit\*\* to send builds to App Store / Play Store.:contentReference\[oaicite:3\]{index=3}  

\---

\#\# 2\. Client: Mobile App Layer

\*\*Framework:\*\* React Native \+ Expo

\- \*\*Why Expo / React Native\*\*  
  \- Single codebase for \*\*iOS now, Android later\*\*.  
  \- EAS Build handles native signing and store-ready binaries.:contentReference\[oaicite:4\]{index=4}    
  \- OTA updates (EAS Update) can push small fixes without full store review (future phase).

\*\*Key client responsibilities\*\*

\- Render core flows:  
  \- Onboarding, selfie capture, goal creation (story setup).  
  \- Check-ins (completed / partial / missed) and chapter view.  
  \- Subscription upgrade screens.  
\- Manage local state & caching:  
  \- Current user profile, active goals, recent chapters (offline-friendly reading).  
\- Integrations:  
  \- \*\*Notifications:\*\* \`expo-notifications\` for scheduling and handling push/local notifications.:contentReference\[oaicite:5\]{index=5}    
  \- \*\*Sharing:\*\* React Native / Expo sharing APIs for system share sheet.  
  \- \*\*Deep links:\*\* open specific story/chapter when tapped from shared link (Phase 2–3).

\---

\#\# 3\. Backend & Data Layer (Supabase)

\*\*Provider:\*\* Supabase (managed Postgres \+ Auth \+ Storage)

\- \*\*Why Supabase\*\*  
  \- Postgres database, Auth, Storage, Edge Functions, and Realtime in one managed service.  
  \- Pro plan includes:  
    \- 8 GB DB, \*\*100 GB file storage\*\*, \*\*100k MAU\*\*, \*\*250 GB egress\*\*, and 2M Edge Function calls included.:contentReference\[oaicite:6\]{index=6}    
  \- File storage overage is \*\*\~$0.021/GB per month\*\*, which is cheap for MVP image volumes.:contentReference\[oaicite:7\]{index=7}  

\#\#\# 3.1 Database (Postgres)

\*\*Core tables (MVP)\*\*

\- \`users\`  
  \- \`id\`, \`email\`, \`created\_at\`  
  \- \`subscription\_tier\` (free / plus / premium)  
  \- \`panel\_quota\_monthly\` (derived from tier)  
  \- \`timezone\`, notification preferences

\- \`goals\` (stories)  
  \- \`id\`, \`user\_id\`  
  \- \`title\`, \`description\`  
  \- \`target\_date\`  
  \- \`cadence\` (enum/json: daily, 3x/week, custom)  
  \- \`theme\` (superhero, fantasy, sci-fi, etc.)  
  \- \`hero\_profile\` (short text description from selfie \+ answers)  
  \- \`theme\_profile\`  
  \- \`saga\_summary\_short\` (rolling story summary)  
  \- \`last\_chapter\_summary\`  
  \- \`status\` (active / archived)

\- \`chapters\`  
  \- \`id\`, \`goal\_id\`, \`user\_id\`  
  \- \`chapter\_index\`  
  \- \`date\`  
  \- \`outcome\` (completed / partial / missed)  
  \- \`note\` (user free text)  
  \- \`chapter\_title\`  
  \- \`chapter\_text\`  
  \- \`image\_url\` (Supabase storage path, nullable)  
  \- \`created\_at\`

\- \`usage\_panels\`  
  \- \`id\`, \`user\_id\`, \`goal\_id\`, \`chapter\_id\`, \`created\_at\`  
  \- For calculating monthly panel usage per user.

\- \`subscriptions\` (optional, depending on billing approach)  
  \- \`user\_id\`, \`store\_platform\`, \`product\_id\`, \`status\`, \`renewal\_date\`, etc.

\*\*Security\*\*

\- Use Supabase \*\*Row-Level Security (RLS)\*\*:  
  \- Users can only read/write their own rows (\`user\_id \= auth.uid()\`).  
\- Only backend / Edge Functions can modify:  
  \- \`panel\_quota\_monthly\`, \`saga\_summary\_short\`, \`last\_chapter\_summary\` (prevents client from tampering with AI logic or quotas).

\#\#\# 3.2 Auth

\- Supabase Auth for:  
  \- Email/password sign-up and login.  
\- Use Supabase client in Expo app to:  
  \- Sign in, manage sessions, refresh tokens.

\#\#\# 3.3 Storage

\- Buckets:  
  \- \`avatars\` – user selfies and hero cropped images.  
  \- \`panels\` – generated comic panels.  
\- Pricing:  
  \- \*\*$0.021/GB/month\*\* beyond included quota; good enough for an image-heavy but small user base.:contentReference\[oaicite:8\]{index=8}  

\#\#\# 3.4 Edge Functions

\- Written in TypeScript (Supabase Edge Functions).  
\- Responsibilities:  
  \- Validate current user and tier.  
  \- Check \*\*monthly panel usage\*\* against quota.  
  \- Build prompts for Gemini 2.5 Flash and Gemini 3 Image.  
  \- Call Gemini APIs securely (no keys in client).  
  \- Save narrative \+ image metadata back to DB/storage.

\---

\#\# 4\. AI Layer

\#\#\# 4.1 Text / Narrative – Gemini 2.5 Flash(-Lite)

\*\*Use cases\*\*

\- Origin story generation (on goal creation).  
\- Chapter narratives (per check-in).  
\- \`saga\_summary\_short\` and \`last\_chapter\_summary\` maintenance.  
\- Hero profile creation from selfie description \+ Q\&A.

\*\*Why Flash(-Lite)\*\*

\- Designed for high-throughput, low-latency tasks with \*\*very low token prices\*\* (≈ $0.10 / 1M input, $0.40 / 1M output).:contentReference\[oaicite:9\]{index=9}    
\- For short prompts and responses, cost per user/month is effectively \*\*fractions of a cent\*\*.

\#\#\# 4.2 Images – Gemini 3 Pro Image Preview

\*\*Use cases\*\*

\- Story cover art (origin).  
\- Chapter panels (wins/fails).  
\- Optional recap panels.

\*\*Key properties\*\*

\- \`gemini-3-pro-image-preview\`, delivering high-quality, grounded images with strong text rendering and multi-image referencing.:contentReference\[oaicite:10\]{index=10}    
\- Pricing:  
  \- \*\*1K–2K\*\* (1024–2048 px) outputs: \*\*1120 image tokens\*\*    
    → \*\*$0.134 per image\*\*.:contentReference\[oaicite:11\]{index=11}  

\*\*Cost control\*\*

\- Quotas enforced in Edge Functions:  
  \- Free: \*\*3 panels lifetime\*\*.  
  \- Plus: \*\*15 panels/month\*\*.  
  \- Premium: \*\*30 panels/month\*\*.  
\- Prompting:  
  \- Only send compressed context: hero profile, theme, short saga summary, last chapter summary, and current milestone result.  
  \- Reduces unnecessary tokens and ensures continuity.

\---

\#\# 5\. Notifications

\*\*Library:\*\* \`expo-notifications\` \+ Expo Push Service

\- Capabilities:  
  \- Fetch device push tokens.  
  \- Schedule local notifications (daily/weekly reminders).  
  \- Receive and respond to push notifications uniformly across iOS and Android.:contentReference\[oaicite:12\]{index=12}  

\*\*Flows\*\*

\- Onboarding:  
  \- Ask for notification permission with clear explanation (“We’ll remind you to check in so your story continues.”).  
\- Daily reminders:  
  \- Local schedules based on user’s timezone and cadence.  
\- Inactivity nudges:  
  \- Backend stores last check-in date per user/goal.  
  \- Periodic job (Edge Function or cron) sends push via Expo API if user hasn’t checked in for X days.

\---

\#\# 6\. Sharing & Deep Links

\*\*Goal:\*\* Help generate virality via shareable images with watermarks and links.

\*\*Implementation\*\*

\- On the client:  
  \- Compose shareable image:  
    \- Use base panel (from Supabase Storage).  
    \- Add overlay (chapter title, streak count, app watermark, handle/URL).  
  \- Use Expo / React Native’s share API to open \*\*native share sheet\*\* (Instagram, X, etc.).:contentReference\[oaicite:13\]{index=13}  

\- Deep links:  
  \- Use React Navigation \+ linking config to open:  
    \- The app (if installed) and route to:  
      \- Specific story.  
      \- Or generic landing inside the app.  
    \- Store listing if app not installed.

\- (Later) Referral tracking:  
  \- Include a short code/ID in shared URL.  
  \- Backend logs installs / sign-ups with that code.

\---

\#\# 7\. Analytics & Logging

\*\*MVP suggestion (pick one)\*\*

\- \*\*PostHog / Amplitude / Mixpanel\*\* (free tier for early usage).  
\- Basic \*\*Supabase logs\*\* \+ EAS Insights (optional).:contentReference\[oaicite:14\]{index=14}  

\*\*Tracked events\*\*

\- Sign-up, first goal created, first selfie uploaded.  
\- First origin panel generated, first chapter, first share.  
\- Panel generations per user per month (for COGS oversight).  
\- Free → Plus / Premium upgrades.

\---

\#\# 8\. DevOps, Environments & CI/CD

\#\#\# 8.1 Environments

\- \*\*Supabase projects\*\*  
  \- \`habit-saga-dev\`  
  \- \`habit-saga-prod\`    
  Separate DBs and storage to avoid test data mixing.

\- \*\*Gemini projects\*\*  
  \- Separate API keys / projects for dev and prod to:  
    \- Avoid blowing prod quota in tests.  
    \- Keep billing clean.

\#\#\# 8.2 CI/CD

\- \*\*Code hosting:\*\* GitHub.  
\- \*\*Build & release:\*\*  
  \- \`eas build\` for iOS (later Android).:contentReference\[oaicite:15\]{index=15}    
  \- \`eas submit\` to send builds to App Store Connect / Play Store.:contentReference\[oaicite:16\]{index=16}    
  \- \`eas.json\` config to define dev vs prod build profiles.:contentReference\[oaicite:17\]{index=17}  

\- \*\*Config & secrets:\*\*  
  \- Use environment variables for:  
    \- Supabase keys (public anon key only in client; service key in Edge Functions).  
    \- Gemini API keys (only in Supabase Edge Functions).  
  \- Never embed AI keys in the client bundle.

\---

\#\# 9\. Cost Profile Summary (Per Stack Choice)

\*\*Supabase\*\*

\- Pro plan starts around \*\*$25/month\*\*, including 8GB DB, 100GB storage, 100k MAU, and 250GB egress; overages:  
  \- Storage: \*\*$0.021/GB/month\*\*.  
  \- MAU over 100k: \*\*$0.00325 per MAU\*\*.:contentReference\[oaicite:18\]{index=18}  

\*\*Gemini\*\*

\- Text (Flash/Flash-Lite): negligible cost at MVP scale.  
\- Images (Gemini 3 Pro Image Preview):  
  \- \*\*$0.134 per 1K–2Kpx image\*\*.:contentReference\[oaicite:19\]{index=19}    
  \- Tier quotas:  
    \- Free: 3 panels lifetime → max \~$0.40 AI spend per fully-used free user.  
    \- Plus: 15 panels/month → \~$2.01/month per engaged Plus user.  
    \- Premium: 30 panels/month → \~$4.02/month per engaged Premium user.

\*\*Expo / EAS / Notifications\*\*

\- Expo SDK \+ \`expo-notifications\` library is open-source; Expo push service itself is free to use, with usage documented in Expo’s guides.:contentReference\[oaicite:20\]{index=20}    
\- EAS Build/Submit has separate pricing (but relatively low for one app; can be rolled into overall company dev tooling budget).

\---

This tech stack keeps Habit Saga:

\- \*\*Cross-platform\*\* from day one (iOS now, Android later)    
\- \*\*Cost-aware\*\*, with AI spend tied directly to panel quotas    
\- \*\*Simple to operate\*\* as a solo founder (Supabase \+ Expo do most heavy lifting)

You can paste this \`.md\` into your repo or business plan appendix as the “Technical Architecture Overview” for Habit Saga.

