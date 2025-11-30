import { Goal, Chapter, Outcome, Cadence, Theme } from '../types';
import { supabase } from './supabaseClient';

// Mock data
const MOCK_GOALS: Goal[] = [
    {
        id: '1',
        user_id: 'user1',
        title: 'Read 10 Books',
        target_date: '2025-12-31',
        cadence: { type: 'daily' },
        theme: 'fantasy',
        hero_profile: 'A wise scholar seeking ancient knowledge.',
        theme_profile: 'A mystical library in the clouds.',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

const MOCK_CHAPTERS: Chapter[] = [
    {
        id: 'c1',
        goal_id: '1',
        user_id: 'user1',
        chapter_index: 1,
        date: new Date().toISOString(),
        outcome: 'completed',
        chapter_title: 'The First Page',
        chapter_text: 'You open the ancient tome. Dust motes dance in the light...',
        image_url: null, // Placeholder
        created_at: new Date().toISOString(),
    }
];

export const habitSagaApi = {
    async createGoalAndOrigin(payload: {
        title: string;
        target_date: string;
        cadence: Cadence;
        theme: Theme;
        selfie_uri?: string;
    }): Promise<{ goal: Goal; originChapter: Chapter }> {
        // TODO: Upload selfie to Supabase Storage 'avatars' bucket
        // TODO: Call Edge Function 'create-goal-and-origin'

        console.log('Creating goal with payload:', payload);

        // Mock response delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newGoal: Goal = {
            id: Math.random().toString(),
            user_id: 'current-user',
            title: payload.title,
            target_date: payload.target_date,
            cadence: payload.cadence,
            theme: payload.theme,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const originChapter: Chapter = {
            id: Math.random().toString(),
            goal_id: newGoal.id,
            user_id: 'current-user',
            chapter_index: 1,
            date: new Date().toISOString(),
            outcome: 'completed', // Origin is always a "win"
            chapter_title: 'The Beginning',
            chapter_text: 'Your journey begins here...',
            created_at: new Date().toISOString(),
        };

        return { goal: newGoal, originChapter };
    },

    async checkIn(payload: {
        goalId: string;
        outcome: Outcome;
        note?: string;
    }): Promise<Chapter> {
        // TODO: Call Edge Function 'check-in'
        console.log('Checking in:', payload);

        await new Promise(resolve => setTimeout(resolve, 1500));

        return {
            id: Math.random().toString(),
            goal_id: payload.goalId,
            user_id: 'current-user',
            chapter_index: 2, // Mock
            date: new Date().toISOString(),
            outcome: payload.outcome,
            note: payload.note,
            chapter_title: 'A New Challenge',
            chapter_text: 'You faced the challenge and...',
            created_at: new Date().toISOString(),
        };
    },

    async fetchGoals(): Promise<Goal[]> {
        // TODO: supabase.from('goals').select('*')
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_GOALS;
    },

    async fetchChapters(goalId: string): Promise<Chapter[]> {
        // TODO: supabase.from('chapters').select('*').eq('goal_id', goalId)
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_CHAPTERS.filter(c => c.goal_id === goalId || goalId === '1');
    },

    async updateNotificationPreferences(enabled: boolean): Promise<void> {
        // TODO: Call Edge Function or update 'users' table
        console.log('Updating notifications:', enabled);
    }
};
