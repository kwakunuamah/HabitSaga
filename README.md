# Habit Saga

**Turn your daily habits into an epic story.**

Habit Saga is a gamified habit tracker that uses AI to generate a personalized comic book story based on your consistency. Every time you check in, a new chapter is written.

## Tech Stack

- **Frontend**: React Native (Expo Managed Workflow)
- **Backend**: Supabase (Postgres, Auth, Storage, Edge Functions)
- **AI**: Google Gemini 2.5 Flash (Narrative) & Gemini 3 Pro Image (Panels)
- **Notifications**: Expo Notifications

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Copy `.env.example` to `.env` and fill in your Supabase credentials.
    ```bash
    cp .env.example .env
    ```

3.  **Run the App**
    ```bash
    npx expo start
    ```
    - Press `i` for iOS simulator
    - Press `a` for Android emulator
    - Scan QR code with Expo Go app on physical device

## Project Structure

- `src/app`: Expo Router screens and layouts
- `src/components`: Reusable UI components
- `src/api`: Supabase client and API service layer
- `src/types`: TypeScript definitions
- `src/theme`: Design tokens (colors, spacing, typography)
- `src/utils`: Helper functions (notifications, etc.)

## Backend Integration (Phase 2)

Currently, the app uses mocked API calls in `src/api/habitSagaApi.ts`. To connect to the real backend:

1.  Deploy Supabase Edge Functions (`create-goal-and-origin`, `check-in`).
2.  Update `habitSagaApi.ts` to call these functions using `supabase.functions.invoke()`.
3.  Ensure RLS policies are set up on Supabase tables.

## Documentation

- [Frontend Guide](project_docs/Habit%20Saga%20–%20Front-End%20Implementation%20Guide%20(MVP).md)
- [Backend Guide](project_docs/Habit%20Saga%20–%20Backend%20Implementation%20Guide%20(MVP).md)
- [PRD](project_docs/Habit%20Saga%20–%20PRD%20(MVP).md)
