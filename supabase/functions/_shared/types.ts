// Habit Saga - Shared TypeScript Types for Edge Functions
// These types match the database schema and API contracts

// ============================================================================
// ENUMS
// ============================================================================

export type SubscriptionTier = 'free' | 'plus' | 'premium';
export type GoalStatus = 'active' | 'completed' | 'archived';
export type ChapterOutcome = 'origin' | 'completed' | 'partial' | 'missed';
export type SubscriptionPlatform = 'ios' | 'android';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired';
export type ThemeType = 'superhero' | 'fantasy' | 'sci-fi' | 'anime' | 'noir' | 'action_adventure' | 'pop_regency' | 'custom';

// ============================================================================
// DATABASE TYPES
// ============================================================================

export interface Cadence {
    type: 'daily' | '3x_week' | 'custom';
    details?: string; // e.g., specific days or "Read 10 pages"
}

// ============================================================================
// HABIT PLAN TYPES
// ============================================================================

export type CueType = 'time_location' | 'habit_stack';
export type HabitFrequency = 'daily' | 'three_per_week' | 'weekly';
export type TaskOutcome = 'full' | 'tiny' | 'missed';

export interface HabitMetrics {
    total_full_completions: number;
    total_tiny_completions: number;
    total_missed: number;
}

export interface HabitTask {
    id: string;
    label: string;
    tiny_version: string;
    full_version: string;
    cue_type: CueType;
    if_then: string;
    habit_stack?: string;
    suggested_frequency: HabitFrequency;
    difficulty: number; // 1-5
    active: boolean;
    metrics: HabitMetrics;
}

export interface TaskCheckInResult {
    habit_id: string;
    outcome: TaskOutcome;
}

export interface User {
    id: string;
    email: string;
    subscription_tier: SubscriptionTier;
    timezone: string;
    notifications_enabled: boolean;
    expo_push_token: string | null;
    created_at: string;
    updated_at: string;
}

export interface Goal {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    target_date: string; // ISO date string
    cadence: Cadence; // JSONB in DB
    theme: ThemeType;
    hero_profile: string | null;
    theme_profile: string | null;
    saga_summary_short: string | null;
    last_chapter_summary: string | null;
    habit_plan?: HabitTask[] | null; // NEW: structured habit plan
    status: GoalStatus;
    created_at: string;
    updated_at: string;
    context_current_frequency?: string;
    context_biggest_blocker?: string;
    context_notes?: string;
    context_past_efforts?: string;
    context_current_status?: string;
    habit_cue_time_window?: string;
    habit_cue_location?: string;
}

export type CheckInBarrier = 'time_management' | 'tired_stressed' | 'forgot' | 'unexpected_event' | 'motivation_low' | 'other';

// ...

export interface Chapter {
    id: string;
    goal_id: string;
    user_id: string;
    chapter_index: number;
    date: string; // ISO date string
    outcome: ChapterOutcome;
    note: string | null;
    barrier: CheckInBarrier | null;
    retry_plan: string | null;
    tasks_results?: Record<string, TaskOutcome> | null; // NEW: per-task outcomes
    tiny_adjustment?: string | null; // NEW: user's planned adjustment
    chapter_title: string | null;
    chapter_text: string | null;
    image_url: string | null;
    created_at: string;
}

// ...

// check-in
export interface CheckInRequest {
    goal_id: string;
    // Legacy fields (backward compatible)
    outcome?: 'completed' | 'partial' | 'missed';
    note?: string;
    barrier?: CheckInBarrier | null;
    retry_plan?: string | null;
    // NEW: Task-based check-in
    task_results?: TaskCheckInResult[];
    reflection?: {
        barrier?: CheckInBarrier;
        note?: string;
        tiny_adjustment?: string;
    };
    checkin_date?: string; // ISO date string, defaults to today
}

export interface CheckInResponse {
    goal: Goal;
    chapter: Chapter;
    panelGenerated: boolean;
    encouragement: {
        headline: string;
        body: string;
        microPlan?: string;
    };
}

// update-notifications
export interface UpdateNotificationsRequest {
    notifications_enabled: boolean;
    expo_push_token?: string | null;
}

export interface UpdateNotificationsResponse {
    user: User;
}

// send-inactivity-nudges (cron - no request body)
export interface SendInactivityNudgesResponse {
    notificationsSent: number;
    errors: string[];
}

// ============================================================================
// ERROR RESPONSE TYPES
// ============================================================================

export interface ErrorResponse {
    error: string;
    message: string;
    code?: string;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface AuthenticatedRequest {
    userId: string; // Extracted from JWT
}

export interface PanelQuotaInfo {
    tier: SubscriptionTier;
    monthlyLimit: number;
    usedThisMonth: number;
    remaining: number;
    lifetimeUsed?: number; // For free tier
}


export interface CreateGoalAndOriginRequest {
    title: string;
    description?: string;
    target_date: string;
    cadence: Cadence;
    theme: ThemeType;
    selfie_public_url?: string;
    context_current_frequency?: string;
    context_biggest_blocker?: string;
    context_current_status?: string;
    context_notes?: string;
    context_past_efforts?: string;
    habit_cue_time_window?: string;
    habit_cue_location?: string;
}

export interface CreateGoalAndOriginResponse {
    goal: Goal;
    originChapter: Chapter;
}
