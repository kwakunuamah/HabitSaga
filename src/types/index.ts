export type SubscriptionTier = 'free' | 'plus' | 'premium';

export type GoalStatus = 'active' | 'completed' | 'archived';

export type Outcome = 'origin' | 'completed' | 'partial' | 'missed';

export type ThemeType =
    | 'superhero'
    | 'fantasy'
    | 'sci-fi'
    | 'anime'
    | 'noir'
    | 'action_adventure'
    | 'pop_regency'
    | 'custom';

export type CadenceType = 'daily' | '3x_week' | 'custom';

export interface Cadence {
    type: CadenceType;
    details?: string; // e.g., specific days or "Read 10 pages"
}

// ============================================================================
// HABIT PLAN TYPES
// ============================================================================

export type CueType = 'time_location' | 'habit_stack';
export type HabitFrequency = 'daily' | 'three_per_week' | 'weekly';
export type TaskOutcome = 'full' | 'tiny' | 'missed';
export type HabitCueTimeWindow = 'morning' | 'midday' | 'after_work' | 'night_before_bed';
export type HabitCueLocation = 'home' | 'work_school' | 'commuting' | 'gym' | 'other';

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
    created_at: string;
    updated_at: string;
    subscription_tier: SubscriptionTier;
    timezone: string;
    notifications_enabled: boolean;
    expo_push_token?: string | null;
    display_name?: string;
    age_range?: string;
    primary_focus_area?: string;
    avatar_url?: string | null;
}

export interface Goal {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    target_date: string;
    cadence: Cadence;
    theme: ThemeType;
    hero_profile?: string;
    theme_profile?: string;
    saga_summary_short?: string;
    last_chapter_summary?: string;
    habit_plan?: HabitTask[] | null; // NEW: structured habit plan
    status: GoalStatus;
    created_at: string;
    updated_at: string;
    context_current_frequency?: string;
    context_biggest_blocker?: string;
    context_notes?: string;
    context_past_efforts?: string;
    habit_cue_time_window?: HabitCueTimeWindow;
    habit_cue_location?: HabitCueLocation;
    parent_goal_id?: string | null;
}

export interface GoalWithStatus extends Goal {
    streak: number;
    isDueToday: boolean;
    lastCheckInDate?: string;
}

export type CheckInBarrier = 'time_management' | 'tired_stressed' | 'forgot' | 'unexpected_event' | 'motivation_low' | 'other';

export interface Chapter {
    id: string;
    goal_id: string;
    user_id: string;
    chapter_index: number;
    date: string;
    outcome: Outcome;
    note?: string;
    barrier?: CheckInBarrier | null;
    retry_plan?: string | null;
    tasks_results?: Record<string, TaskOutcome> | null; // NEW: per-task outcomes
    tiny_adjustment?: string | null; // NEW: user's planned adjustment
    chapter_title?: string;
    chapter_text?: string;
    image_url?: string | null;
    created_at: string;
}

export interface UsagePanel {
    id: string;
    user_id: string;
    goal_id: string;
    chapter_id: string;
    created_at: string;
}

export interface CheckInResponse {
    chapter: Chapter;
    panelGenerated: boolean;
    encouragement: {
        headline: string;
        body: string;
        microPlan?: string;
    };
}

export interface CompleteGoalResponse {
    finaleChapter: Chapter;
    goal: Goal;
    celebrationMessage: {
        headline: string;
        body: string;
    };
    canStartSeason2: boolean;
}

export interface StartSeasonTwoResponse {
    goal: Goal;
    firstChapter: Chapter;
}

export interface GoalProgress {
    totalChapters: number;
    completedCheckins: number;
    partialCheckins: number;
    missedCheckins: number;
    currentStreak: number;
    longestStreak: number;
    daysUntilTarget: number;
    daysElapsed: number;
    isDueToday: boolean;
    lastCheckInDate?: string;
}

export interface QuotaUsage {
    used: number;
    limit: number;
    resetDate?: string;
}
