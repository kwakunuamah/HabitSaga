export type SubscriptionTier = 'free' | 'plus' | 'premium';

export type GoalStatus = 'active' | 'completed' | 'archived';

export type Outcome = 'completed' | 'partial' | 'missed';

export type Theme =
    | 'superhero'
    | 'fantasy'
    | 'sci-fi'
    | 'anime'
    | 'custom'; // Add more as needed

export type CadenceType = 'daily' | '3x_week' | 'custom';

export interface Cadence {
    type: CadenceType;
    details?: string; // e.g., specific days or "Read 10 pages"
}

export interface User {
    id: string;
    email: string;
    created_at: string;
    subscription_tier: SubscriptionTier;
    timezone: string;
    notifications_enabled: boolean;
    expo_push_token?: string | null;
}

export interface Goal {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    target_date: string;
    cadence: Cadence;
    theme: Theme;
    hero_profile?: string;
    theme_profile?: string;
    saga_summary_short?: string;
    last_chapter_summary?: string;
    status: GoalStatus;
    created_at: string;
    updated_at: string;
}

export interface Chapter {
    id: string;
    goal_id: string;
    user_id: string;
    chapter_index: number;
    date: string;
    outcome: Outcome;
    note?: string;
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
