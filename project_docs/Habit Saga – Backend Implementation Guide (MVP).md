\# Habit Saga – Backend Implementation Guide (MVP)

\#\# 1\. Purpose

This document explains \*\*how the backend for Habit Saga should be structured and behave\*\*:

\- What infrastructure we use (Supabase, Gemini, Expo Push, Cloudflare Pages).  
\- How data is modeled (users, goals/stories, chapters, quotas).  
\- Which \*\*Edge Functions\*\* exist and what each one does.  
\- How we integrate with \*\*Gemini 2.5 Flash-Lite\*\* (text) and \*\*Gemini 3 Pro Image Preview\*\* (images).:contentReference\[oaicite:0\]{index=0}    
\- How notifications and sharing hooks tie in.

The front-end (Expo app) should mostly talk to \*\*Supabase \+ Edge Functions\*\*, not directly to any AI APIs.

\---

\#\# 2\. High-Level Architecture (Backend)

\#\#\# 2.1 Components

1\. \*\*Supabase project(s)\*\* – main backend    
   \- \*\*Postgres\*\* DB for users, goals, chapters, usage.    
   \- \*\*Auth\*\* (email/password).    
   \- \*\*Storage\*\* for selfies \+ comic panels (buckets).    
   \- \*\*Edge Functions\*\* (TypeScript on Deno) for all sensitive logic and AI calls.:contentReference\[oaicite:1\]{index=1}  

2\. \*\*AI providers\*\*    
   \- \*\*Gemini 2.5 Flash-Lite\*\* for narrative and summaries    
     \- Very low token cost (\~$0.10 / 1M input tokens, $0.40 / 1M output).    
   \- \*\*Gemini 3 Pro Image Preview\*\* (\`gemini-3-pro-image-preview\`, a.k.a. Nano Banana Pro) for panels    
     \- Paid tier priced at \~$0.067 per 1K/2K image (Vertex pricing), with some sources quoting \~$0.139 per 2K image depending on route/discounts.:contentReference\[oaicite:3\]{index=3}  

3\. \*\*Notifications\*\*    
   \- Expo push notification service: unified API for push across iOS/Android; integrates with \`expo-notifications\`.:contentReference\[oaicite:4\]{index=4}  

4\. \*\*Marketing site\*\*    
   \- \`habitsaga.com\` hosted on \*\*Cloudflare Pages\*\* as a static marketing site (built from a Git repo).    
   \- Cloudflare Pages is optimized for static HTML/JAMstack sites and offers a generous free tier with integrated CDN.    
   \- This is \*\*separate\*\* from the app backend; only interaction is via links and possibly a simple public “status”/FAQ.

\---

\#\# 3\. Supabase Setup

\#\#\# 3.1 Projects / Environments

\- \*\*Supabase projects:\*\*  
  \- \`habit-saga-dev\`  
  \- \`habit-saga-prod\`

Both have the same schema; dev uses lower quotas and non-production AI keys.

\#\#\# 3.2 Core Tables

\*\*1) \`users\`\*\*

\- \`id\` (uuid, PK)  
\- \`email\`  
\- \`created\_at\`  
\- \`subscription\_tier\` (\`free\` / \`plus\` / \`premium\`)  
\- \`timezone\`  
\- \`notifications\_enabled\` (bool)  
\- \`expo\_push\_token\` (string, nullable)

\*\*2) \`goals\` (stories)\*\*

\- \`id\`, \`user\_id\`  
\- \`title\`, \`description\`  
\- \`target\_date\`  
\- \`cadence\` (JSON or enum: \`daily\`, \`3x\_week\`, \`custom\`)  
\- \`theme\` (enum)  
\- \`hero\_profile\` (text)  
\- \`theme\_profile\` (text)  
\- \`saga\_summary\_short\` (text)  
\- \`last\_chapter\_summary\` (text)  
\- \`status\` (\`active\`, \`completed\`, \`archived\`)  
\- \`created\_at\`, \`updated\_at\`

\*\*3) \`chapters\`\*\*

\- \`id\`, \`goal\_id\`, \`user\_id\`  
\- \`chapter\_index\` (int)  
\- \`date\`  
\- \`outcome\` (\`completed\`, \`partial\`, \`missed\`)  
\- \`note\` (text)  
\- \`chapter\_title\` (text)  
\- \`chapter\_text\` (text)  
\- \`image\_url\` (text, nullable)  
\- \`created\_at\`

\*\*4) \`usage\_panels\`\*\* (for quotas)

\- \`id\`  
\- \`user\_id\`  
\- \`goal\_id\`  
\- \`chapter\_id\`  
\- \`created\_at\` (used to group by month)

\*\*5) \`subscriptions\`\*\* (optional for App Store/Play Store receipts)

\- \`user\_id\`  
\- \`platform\` (\`ios\`, \`android\`)  
\- \`product\_id\`  
\- \`status\` (\`active\`, \`canceled\`, \`expired\`)  
\- \`renewal\_date\`  
\- raw receipt metadata as JSON (if needed)

\> All tables should use \*\*Row-Level Security\*\* so that \`auth.uid()\` can only access its own records. Supabase RLS \+ policies enforce this.  

\#\#\# 3.3 Storage Buckets

\- \`avatars\` – user selfies / hero crops.  
\- \`panels\` – AI-generated comic panels.

Supabase Storage charges \~$0.021/GB-month beyond included quota on Pro plans.:contentReference\[oaicite:7\]{index=7}  

\---

\#\# 4\. Edge Functions – Responsibilities & APIs

Supabase \*\*Edge Functions\*\* are globally distributed serverless functions (TypeScript on Deno) that run close to users and scale automatically.:contentReference\[oaicite:8\]{index=8}  

\#\#\# 4.1 Principles

\- All calls to \*\*Gemini\*\* must go through Edge Functions (never from the client).  
\- Quota checks and billing-sensitive logic live in Edge Functions.  
\- Functions are authenticated via Supabase JWT; they derive \`user\_id\` from the token.

Below is a suggested set of functions and what each does.

\---

\#\#\# 4.2 \`create\_goal\_and\_origin\` (POST)

\*\*Path example:\*\* \`/functions/v1/create-goal-and-origin\`

\*\*Called by:\*\* Goal creation wizard after user completes details \+ selfie.

\*\*Input (JSON)\*\*

\- \`title\`  
\- \`description\` (optional)  
\- \`target\_date\`  
\- \`cadence\` config  
\- \`theme\`  
\- \`selfie\_public\_url\` (from \`avatars\` bucket)  
\- Optional: onboarding Q\&A answers (e.g., tone preferences)

\*\*Backend flow\*\*

1\. \*\*Auth check\*\*    
   \- Read Supabase JWT → \`user\_id\`. If missing, return 401\.

2\. \*\*Create goal record\*\*    
   \- Insert into \`goals\` (status \`active\`) with raw data (no story fields yet).

3\. \*\*Generate hero \+ theme profiles\*\*    
   \- Build prompt and call \*\*Gemini 2.5 Flash-Lite\*\* to produce:  
     \- Short \`hero\_profile\` (e.g., “A determined bookish hero…”)  
     \- \`theme\_profile\` (e.g., “Magical library in a floating castle…”)  
   \- Save to \`goals\`.

4\. \*\*Generate origin story\*\*    
   \- Call Flash-Lite again to:  
     \- Produce \`origin\_chapter\_title\`, \`origin\_chapter\_text\`.  
     \- Produce initial \`saga\_summary\_short\` \+ \`last\_chapter\_summary\`.

5\. \*\*Generate origin panel (Gemini 3 Image)\*\*    
   \- Check user’s remaining \*\*panel quota\*\* (tier rules).  
   \- If allowed:  
     \- Call Gemini 3 Pro Image Preview (\`1K\` or \`2K\` size) with hero \+ theme context.:contentReference\[oaicite:9\]{index=9}    
     \- Save image file in \`panels\` bucket.  
     \- Record \`usage\_panels\` entry.

6\. \*\*Create first \`chapters\` row\*\*    
   \- \`chapter\_index \= 1\`, date \= now, outcome \= \`origin\`.  
   \- Attach \`chapter\_title\`, \`chapter\_text\`, \`image\_url\`.

7\. \*\*Return response\*\*    
   \- Goal object.  
   \- Origin chapter object (for immediate display).

\*\*Error handling\*\*

\- If image fails but text succeeds:  
  \- Return chapter with text only, set \`image\_url \= null\`.

\---

\#\#\# 4.3 \`check\_in\_and\_generate\_chapter\` (POST)

\*\*Path:\*\* \`/functions/v1/check-in\`

\*\*Called by:\*\* Check-in screen after user selects \`Completed\` / \`Partial\` / \`Missed\`.

\*\*Input (JSON)\*\*

\- \`goal\_id\`  
\- \`outcome\` (\`completed\`, \`partial\`, \`missed\`)  
\- \`note\` (optional)  
\- \`checkin\_date\` (optional; default \= today)

\*\*Backend flow\*\*

1\. Auth \+ \`user\_id\` from token; verify goal belongs to user.  
2\. Compute \`chapter\_index\` by counting existing chapters for that goal.  
3\. Insert barebones \`chapters\` row (without text/image yet).  
4\. Build prompt to \*\*Flash-Lite\*\*:  
   \- Inputs: \`hero\_profile\`, \`theme\_profile\`, \`saga\_summary\_short\`, \`last\_chapter\_summary\`, \`outcome\`, \`note\`.  
   \- Outputs: new \`chapter\_title\`, \`chapter\_text\`, updated \`saga\_summary\_short\`, \`last\_chapter\_summary\`.  
5\. Save narrative \+ updated summaries to DB.  
6\. Check \*\*monthly panel quota\*\*:  
   \- If user has remaining panels:  
     \- Call Gemini 3 Image with compressed context.  
     \- Save image to \`panels\` bucket.  
     \- Update \`image\_url\` and insert into \`usage\_panels\`.  
7\. Return updated chapter (with or without image\_url).

\*\*Retry strategy\*\*

\- If text fails: mark chapter as minimal (outcome \+ note), allow client to trigger “Retry narrative”.  
\- If image fails: keep text, allow optional “Retry panel” if quota \> 0\.

\---

\#\#\# 4.4 \`list\_goals\_and\_chapters\` (GET)

\*\*Paths (examples):\*\*

\- \`/functions/v1/goals\` → list of user’s goals.  
\- \`/functions/v1/goals/:goal\_id/chapters\` → chapter list.

This can be \*\*optional\*\* if client just uses Supabase client SDK with RLS, but a function wrapper is useful for:

\- Returning pre-joined data (e.g., latest chapter & stats).  
\- Applying business logic (e.g., hide certain chapters until complete).

\---

\#\#\# 4.5 \`update\_notification\_preferences\` (POST)

\*\*Path:\*\* \`/functions/v1/update-notifications\`

\*\*Called by:\*\* Profile → Notifications Settings.

\*\*Input (JSON)\*\*

\- \`notifications\_enabled\` (bool)  
\- Per-goal reminder times (optional)

\*\*Backend responsibilities\*\*

\- Store settings on \`users\` (and/or per-goal metadata).  
\- Forward \`expo\_push\_token\` (provided by client) into DB.

Push scheduling is mostly on the \*\*client\*\* (local reminders), but the backend must store tokens so future \*\*server-initiated pushes\*\* (inactivity nudges, marketing) can be sent.

Expo push service gives a unified API for sending push notifications to FCM (Android) and APNs (iOS) via HTTP calls.:contentReference\[oaicite:10\]{index=10}  

\---

\#\#\# 4.6 \`send\_inactivity\_nudges\` (cron-like Edge Function)

\*\*Path:\*\* \`/functions/v1/send-inactivity-nudges\` (invoked on schedule)

\*\*Trigger:\*\* Supabase scheduled function / external cron (e.g., daily).

\*\*Logic\*\*

1\. Query users with:  
   \- \`notifications\_enabled \= true\`  
   \- Last check-in older than N days.  
2\. For each:  
   \- Build a simple push notification (“Your saga is waiting…”).  
   \- Call \*\*Expo push API\*\* with stored token.:contentReference\[oaicite:11\]{index=11}  

\*\*Note:\*\* This is lightweight and can be added once core flows are stable.

\---

\#\#\# 4.7 \`handle\_subscription\_webhook\` (POST, optional for later)

If you integrate RevenueCat or native store webhooks, this Edge Function:

\- Validates webhook signature.  
\- Maps incoming product IDs → \`subscription\_tier\`.  
\- Updates \`users.subscription\_tier\` and resets monthly panel quotas accordingly.

\---

\#\#\# 4.8 \`generate\_share\_image\` (optional)

You can either:

\- Build share images \*\*in the client\*\* (overlay text/watermark on the raw panel).    
\- Or provide a \*\*backend-rendered\*\* share image (simpler for client):

\*\*Path:\*\* \`/functions/v1/generate-share-image\`

\*\*Input\*\*

\- \`chapter\_id\` or \`goal\_id\` (for final saga).  
\- Desired layout (\`panel\_only\`, \`panel\_with\_stats\`).

\*\*Backend\*\*

\- Fetch \`image\_url\`, chapter stats.  
\- Use a server-side image composition tool (e.g., Satori, Resvg, or even Gemini Image editing) to produce a final PNG:  
  \- Panel \+ text overlay \+ watermark \+ URL.  
\- Return a signed URL or store in \`panels\`/\`shares\` bucket.

MVP can skip this and do simple client-side shares; add later if needed.

\---

\#\# 5\. AI Integration Details

\#\#\# 5.1 Gemini: Configuration & Keys

\- Use \*\*Google AI Studio / Gemini API\*\* (server-side) for both text and images. Pricing & API details are documented in Google’s Gemini API pricing page.:contentReference\[oaicite:12\]{index=12}    
\- Store API keys and project IDs in \*\*Supabase Edge Function secrets\*\* (or environment variables); never send keys to client.

\#\#\# 5.2 Text Prompts (Flash-Lite)

\*\*Model:\*\* Gemini 2.5 Flash-Lite – low-cost, low-latency, good for high-volume workloads.  

\*\*Use cases:\*\*

\- Hero \+ theme profile generation.  
\- Origin story.  
\- Per-chapter narrative.  
\- Saga summaries (short & last chapter).

\*\*Prompt pattern (example)\*\*

\- System: “You are a narrative engine for a personal habit comic. Keep responses short and structured.”    
\- User:  
  \- Hero profile base info.  
  \- Theme context.  
  \- Goals \+ target date.  
  \- Previous saga summary & last chapter.  
  \- Today’s outcome \+ note.

\*\*Output format:\*\*

\- JSON-ish structured text (e.g., \`title\`, \`body\`, \`saga\_summary\_short\`, \`last\_chapter\_summary\`).

The edge function should \*\*parse and validate\*\* outputs before saving.

\---

\#\#\# 5.3 Image Prompts (Gemini 3 Pro Image Preview)

\*\*Model:\*\* \`gemini-3-pro-image-preview\` (Nano Banana Pro). It can generate \*\*1K images by default and 2K/4K when configured\*\*, with pricing per generated image.:contentReference\[oaicite:14\]{index=14}  

\*\*Use cases:\*\*

\- Origin cover.  
\- Per-chapter panel (as quota allows).  
\- Final saga recap panel.

\*\*Prompt pattern\*\*

\- Provide:  
  \- Hero description (from \`hero\_profile\`).  
  \- Theme description (\`theme\_profile\`).  
  \- Quick recap of last chapter \+ today’s outcome.  
  \- Visual mood (“optimistic after a small setback”, “triumphant”, etc.).  
\- Ask for:  
  \- Single-panel, comic/anime-esque composition.  
  \- No embedded text (so you can overlay text separately).

\*\*Cost controls\*\*

\- Enforce \*\*hard monthly panel limits\*\* per user tier before calling Gemini:  
  \- \`free\`: 3 lifetime.  
  \- \`plus\`: 15/month.  
  \- \`premium\`: 30/month.  
\- Log each successful generation in \`usage\_panels\`.

\---

\#\# 6\. Notifications – Backend Responsibilities

Backend’s job is not to schedule every reminder (client handles many as \*\*local notifications\*\*). Instead:

1\. \*\*Store Expo push tokens\*\* and user preferences.  
2\. \*\*Send push notifications\*\* for:  
   \- Inactivity nudges.  
   \- Big streak milestones (optional).  
   \- Major product announcements (sparingly, per app-store rules).

Expo provides a unified push endpoint and dashboard; Supabase Edge Functions simply POST notification payloads with expo tokens.:contentReference\[oaicite:15\]{index=15}  

\---

\#\# 7\. Security & Access Control

1\. \*\*RLS on all tables\*\*    
   \- Policies like \`user\_id \= auth.uid()\` to restrict access.  

2\. \*\*Edge Functions\*\*    
   \- Only accept requests with valid Supabase JWT (except webhooks).  
   \- Derive \`user\_id\` server-side; never take \`user\_id\` from client body.

3\. \*\*AI keys & secrets\*\*    
   \- Stored as environment variables for edge functions.  
   \- Rotated periodically.

4\. \*\*CORS\*\*    
   \- Restrict allowed origins to:  
     \- Mobile app bundle origins.  
     \- Marketing site \`https://habitsaga.com\` if you ever expose public APIs there (most likely you won’t).

\---

\#\# 8\. Monitoring, Logging & Costs

\#\#\# 8.1 Monitoring & Logs

\- Use Supabase project logs (Edge Functions, Postgres) to:  
  \- Track errors in AI calls.  
  \- Monitor 4xx/5xx on function endpoints.  
\- Add simple \`console.log\` statements inside Edge Functions for critical paths.

\#\#\# 8.2 Cost levers

\- Supabase Pro plan includes:  
  \- 8GB DB, 100GB storage, 250GB bandwidth, 2M Edge Function calls, 100k MAUs.    
\- Storage overage: \~$0.021/GB-month.:contentReference\[oaicite:18\]{index=18}    
\- Gemini Flash-Lite text is extremely cheap; don’t worry much about it.    
\- Gemini 3 Image is the primary COGS; keep it bounded by per-tier panel limits.:contentReference\[oaicite:20\]{index=20}  

\---

\#\# 9\. Backend “Done” Checklist (MVP)

Before launch, backend should have:

\- \[ \] Supabase dev \+ prod projects with schema and RLS.  
\- \[ \] Storage buckets (\`avatars\`, \`panels\`) with correct access policies.  
\- \[ \] Edge Functions:  
  \- \[ \] \`create\_goal\_and\_origin\`  
  \- \[ \] \`check\_in\_and\_generate\_chapter\`  
  \- \[ \] \`list\_goals\_and\_chapters\` (if not using direct queries from client)  
  \- \[ \] \`update\_notification\_preferences\`  
  \- \[ \] \`send\_inactivity\_nudges\` (initial version)  
\- \[ \] Integration with:  
  \- \[ \] Gemini 2.5 Flash-Lite for narrative.  
  \- \[ \] Gemini 3 Pro Image Preview for panels.  
\- \[ \] Basic logging and error handling in functions.  
\- \[ \] Panel quota enforcement by subscription tier.  
\- \[ \] Expo push tokens saved and test push working.  
\- \[ \] \`habitsaga.com\` marketing site deployed on Cloudflare Pages, pointing to app store links.

Once this is in place, the front-end guide \+ this backend guide together give a full blueprint for devs to build and ship Habit Saga.

