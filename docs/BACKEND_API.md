# Habit Saga Backend API Documentation

This document describes the Edge Function API contracts for the Habit Saga MVP backend.

## Base URL

All Edge Functions are available at:
```
https://<your-project-ref>.supabase.co/functions/v1/<function-name>
```

## Authentication

All functions (except `send-inactivity-nudges` when invoked by cron) require authentication via Supabase JWT token:

```
Authorization: Bearer <supabase-jwt-token>
```

The JWT token is obtained from the Supabase Auth client after user sign-in.

---

## 1. Create Goal and Origin Chapter

**Endpoint:** `POST /functions/v1/create-goal-and-origin`

**Description:** Creates a new goal, generates hero/theme profiles, origin chapter narrative, and optionally generates an origin panel (if quota allows).

**Authentication:** Required (Bearer token)

**Request Body:**

```typescript
{
  title: string;                    // Required: Goal title
  description?: string;              // Optional: Goal description
  target_date: string;              // Required: ISO date string (YYYY-MM-DD)
  cadence: {                         // Required: Check-in frequency
    type: 'daily' | '3x_week' | 'custom';
    details?: string;                // Optional: e.g., "Read 10 pages" or specific days
  };
  theme: 'superhero' | 'fantasy' | 'sci-fi' | 'anime' | 'custom';  // Required
  selfie_public_url: string;        // Required: Public URL of selfie in 'avatars' bucket
}
```

**Response (200 OK):**

```typescript
{
  goal: {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    target_date: string;
    cadence: Cadence;
    theme: ThemeType;
    hero_profile: string | null;
    theme_profile: string | null;
    saga_summary_short: string | null;
    last_chapter_summary: string | null;
    status: 'active' | 'completed' | 'archived';
    created_at: string;
    updated_at: string;
  };
  originChapter: {
    id: string;
    goal_id: string;
    user_id: string;
    chapter_index: number;          // Always 1 for origin
    date: string;
    outcome: 'origin';
    note: string | null;
    chapter_title: string | null;
    chapter_text: string | null;
    image_url: string | null;        // Supabase Storage path if panel generated
    created_at: string;
  };
}
```

**Error Responses:**

- **400 Bad Request:** Missing or invalid required fields
  ```json
  {
    "error": "Bad Request",
    "message": "Missing required fields: title, target_date, cadence, theme, selfie_public_url",
    "code": "VALIDATION_ERROR"
  }
  ```

- **401 Unauthorized:** Missing or invalid authentication token
  ```json
  {
    "error": "Unauthorized",
    "message": "Authentication required",
    "code": "UNAUTHORIZED"
  }
  ```

- **500 Internal Server Error:** Database or AI generation failure
  ```json
  {
    "error": "Internal Server Error",
    "message": "Failed to create goal",
    "code": "GOAL_CREATE_ERROR"
  }
  ```

**Notes:**
- The `selfie_public_url` should be a public URL from Supabase Storage `avatars` bucket (uploaded by client before calling this function)
- Hero and theme profiles are generated using Gemini 2.5 Flash-Lite
- Origin chapter text and summaries are generated using Gemini 2.5 Flash-Lite
- Origin panel generation depends on user's subscription tier quota:
  - Free: 3 panels lifetime
  - Plus: 15 panels/month
  - Premium: 30 panels/month

---

## 2. Check-In and Generate Chapter

**Endpoint:** `POST /functions/v1/check-in`

**Description:** Records a check-in outcome, generates chapter narrative, updates saga summaries, and optionally generates a panel (if quota allows).

**Authentication:** Required (Bearer token)

**Request Body:**

```typescript
{
  goal_id: string;                   // Required: UUID of the goal
  outcome: 'completed' | 'partial' | 'missed';  // Required: Check-in result
  note?: string;                     // Optional: User's note about the check-in
  checkin_date?: string;            // Optional: ISO date string (defaults to today)
}
```

**Response (200 OK):**

```typescript
{
  chapter: {
    id: string;
    goal_id: string;
    user_id: string;
    chapter_index: number;          // Auto-incremented
    date: string;
    outcome: 'completed' | 'partial' | 'missed';
    note: string | null;
    chapter_title: string | null;   // AI-generated
    chapter_text: string | null;    // AI-generated
    image_url: string | null;      // Supabase Storage path if panel generated
    created_at: string;
  };
  panelGenerated: boolean;          // Whether a panel was generated for this chapter
}
```

**Error Responses:**

- **400 Bad Request:** Missing or invalid required fields
  ```json
  {
    "error": "Bad Request",
    "message": "Missing required fields: goal_id, outcome",
    "code": "VALIDATION_ERROR"
  }
  ```

- **401 Unauthorized:** Missing or invalid authentication token

- **403 Forbidden:** Goal does not belong to the authenticated user
  ```json
  {
    "error": "Forbidden",
    "message": "Goal does not belong to user",
    "code": "FORBIDDEN"
  }
  ```

- **404 Not Found:** Goal not found
  ```json
  {
    "error": "Not Found",
    "message": "Goal not found",
    "code": "GOAL_NOT_FOUND"
  }
  ```

- **500 Internal Server Error:** Database or AI generation failure

**Notes:**
- Chapter index is automatically calculated based on existing chapters for the goal
- Chapter narrative is generated using Gemini 2.5 Flash-Lite with context from:
  - Hero profile
  - Theme profile
  - Saga summary
  - Last chapter summary
  - Current outcome and note
- Panel generation follows the same quota rules as origin creation

---

## 3. Update Notification Preferences

**Endpoint:** `POST /functions/v1/update-notifications`

**Description:** Updates user notification preferences and Expo push token.

**Authentication:** Required (Bearer token)

**Request Body:**

```typescript
{
  notifications_enabled: boolean;    // Required: Enable/disable notifications
  expo_push_token?: string | null;   // Optional: Expo push notification token
}
```

**Response (200 OK):**

```typescript
{
  user: {
    id: string;
    email: string;
    subscription_tier: 'free' | 'plus' | 'premium';
    timezone: string;
    notifications_enabled: boolean;
    expo_push_token: string | null;
    created_at: string;
    updated_at: string;
  };
}
```

**Error Responses:**

- **400 Bad Request:** Missing or invalid `notifications_enabled` field
  ```json
  {
    "error": "Bad Request",
    "message": "Missing or invalid field: notifications_enabled (must be boolean)",
    "code": "VALIDATION_ERROR"
  }
  ```

- **401 Unauthorized:** Missing or invalid authentication token

- **500 Internal Server Error:** Database update failure

**Notes:**
- If `expo_push_token` is not provided, it will not be updated
- Setting `expo_push_token` to `null` will clear the stored token

---

## 4. Send Inactivity Nudges

**Endpoint:** `POST /functions/v1/send-inactivity-nudges`

**Description:** Cron job that finds users with notifications enabled who haven't checked in for N days (default: 3) and sends push notifications via Expo Push API.

**Authentication:** Service role key (for cron invocation)

**Request Body:** None (or empty object)

**Response (200 OK):**

```typescript
{
  notificationsSent: number;         // Number of push notifications successfully sent
  errors: string[];                  // Array of error messages (if any)
}
```

**Example Response:**

```json
{
  "notificationsSent": 5,
  "errors": [
    "Failed to send push to user abc-123: Invalid token"
  ]
}
```

**Error Responses:**

- **500 Internal Server Error:** Database query failure or other system error

**Notes:**
- This function should be invoked by a scheduled task (Supabase cron or external cron service)
- Only users with `notifications_enabled = true` and a valid `expo_push_token` are considered
- Users are checked if their most recent chapter is older than the inactivity threshold (default: 3 days)
- Push notifications are sent via Expo Push API: `https://exp.host/--/api/v2/push/send`
- The notification message includes the user's active goal title for personalization

**Configuration:**
- `INACTIVITY_DAYS`: Number of days without check-in before sending nudge (default: 3)
- Can be adjusted in the function code or via environment variables

---

## Common Error Response Format

All error responses follow this structure:

```typescript
{
  error: string;        // Error type (e.g., "Bad Request", "Unauthorized")
  message: string;       // Human-readable error message
  code?: string;        // Machine-readable error code (optional)
}
```

---

## Panel Quota Rules

Panel generation is subject to monthly (or lifetime for free tier) quotas:

| Tier | Monthly Limit | Lifetime Limit |
|------|---------------|----------------|
| Free | N/A | 3 panels |
| Plus | 15 panels | N/A |
| Premium | 30 panels | N/A |

Quota is checked before generating panels. If quota is exceeded, the chapter is still created with text, but `image_url` will be `null` and `panelGenerated` will be `false`.

---

## Database Tables

The backend uses the following main tables:

- `users` - User profiles and preferences
- `goals` - User goals/stories
- `chapters` - Check-ins/story chapters
- `usage_panels` - Panel generation quota tracking
- `subscriptions` - App Store/Play Store subscription records

All tables have Row Level Security (RLS) enabled, ensuring users can only access their own data.

## Storage Buckets

- `avatars` - User selfies and hero images (public, user-uploadable)
- `panels` - AI-generated comic panels (public, service-role insert only)

Storage policies ensure:
- Users can only upload to their own folder (`{user_id}/...`)
- Panels can only be created by Edge Functions (service role)
- Both buckets are publicly readable for sharing

---

## Environment Variables

Edge Functions require the following environment variables (set via `supabase secrets set`):

- `GEMINI_API_KEY` - Google AI Studio API key (for Phase 2)
- `SUPABASE_URL` - Your Supabase project URL (automatically available)
- `SUPABASE_ANON_KEY` - Supabase anonymous key (automatically available)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for cron jobs, automatically available)

---

## Phase 2 Implementation Notes

The current Edge Function stubs include placeholder logic for AI generation. In Phase 2, you will:

1. **Gemini 2.5 Flash-Lite Integration:**
   - Generate hero profiles from selfie + Q&A
   - Generate theme profiles
   - Generate origin chapter text
   - Generate check-in chapter narratives
   - Update saga summaries

2. **Gemini 3 Pro Image Preview Integration:**
   - Generate origin panels
   - Generate chapter panels
   - Upload images to Supabase Storage `panels` bucket
   - Record usage in `usage_panels` table

3. **Error Handling:**
   - Retry logic for AI API failures
   - Graceful degradation (text-only chapters if image fails)
   - Quota enforcement with proper error messages

---

## Setup

Apply migrations in order:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Push migrations (001, 002, 003)
supabase db push

# Set secrets
supabase secrets set GEMINI_API_KEY=your_key_here

# Deploy functions
supabase functions deploy create-goal-and-origin
supabase functions deploy check-in
supabase functions deploy update-notifications
supabase functions deploy send-inactivity-nudges
```

Migrations include:
- `001_initial_schema.sql` - Tables and indexes
- `002_rls_policies.sql` - Row Level Security
- `003_user_trigger_and_storage.sql` - User creation trigger and storage buckets

---

## Testing

To test Edge Functions locally:

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve <function-name>

# Or test in deployed environment
curl -X POST https://<project-ref>.supabase.co/functions/v1/<function-name> \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

---

## Support

For issues or questions, refer to:
- Supabase Edge Functions docs: https://supabase.com/docs/guides/functions
- Gemini API docs: https://ai.google.dev/docs
- Expo Push Notifications: https://docs.expo.dev/push-notifications/overview/


