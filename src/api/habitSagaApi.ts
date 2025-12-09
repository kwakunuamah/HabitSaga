import { Goal, GoalWithStatus, Chapter, Outcome, Cadence, ThemeType, CheckInResponse, CheckInBarrier } from '../types';
import { supabase } from './supabaseClient';
import { logger } from '../utils/logger';
import { withTimeout, withTimeoutAndRetry, API_TIMEOUTS } from '../utils/apiUtils';

export const habitSagaApi = {
    async createGoalAndOrigin(payload: {
        title: string;
        description?: string;
        target_date: string;
        cadence: Cadence;
        theme: ThemeType;
        selfie_uri?: string;
        context_current_frequency?: string;
        context_biggest_blocker?: string;
        context_current_status?: string;
        context_notes?: string;
        context_past_efforts?: string;
        habit_cue_time_window?: string;
        habit_cue_location?: string;
    }): Promise<{ goal: Goal; originChapter: Chapter }> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        logger.log('Creating goal with payload:', payload);

        // Get user's avatar from profile if no selfie provided
        let selfiePublicUrl: string | undefined;

        if (payload.selfie_uri) {
            // Upload new selfie to Supabase Storage
            try {
                const fileName = `${session.user.id}/${Date.now()}.jpg`;
                const response = await fetch(payload.selfie_uri);
                const blob = await response.blob();

                const { data: uploadData, error: uploadError } = await withTimeout(
                    supabase.storage
                        .from('avatars')
                        .upload(fileName, blob, {
                            contentType: 'image/jpeg',
                        }),
                    API_TIMEOUTS.DEFAULT,
                    'Avatar upload timed out'
                );

                if (uploadError) {
                    logger.error('Error uploading selfie:', uploadError);
                } else {
                    const { data: urlData } = supabase.storage
                        .from('avatars')
                        .getPublicUrl(fileName);
                    selfiePublicUrl = urlData.publicUrl;
                }
            } catch (error) {
                logger.error('Error processing selfie:', error);
            }
        }

        // If no selfie uploaded, check user profile for existing avatar
        if (!selfiePublicUrl) {
            try {
                const { data: userProfile } = await withTimeout(
                    supabase
                        .from('users')
                        .select('avatar_url')
                        .eq('id', session.user.id)
                        .single(),
                    API_TIMEOUTS.FAST,
                    'Profile fetch timed out'
                );

                if (userProfile?.avatar_url) {
                    selfiePublicUrl = userProfile.avatar_url;
                    logger.log('Using existing avatar from profile:', selfiePublicUrl);
                }
            } catch (error) {
                logger.error('Error fetching user avatar:', error);
            }
        }

        // Final fallback to placeholder
        if (!selfiePublicUrl) {
            selfiePublicUrl = 'https://via.placeholder.com/200';
            logger.log('No avatar found, using placeholder');
        }

        // Call Edge Function with AI operation timeout
        logger.log('📡 Calling create-goal-and-origin Edge Function...');
        logger.log('Session exists:', !!session);
        logger.log('User ID:', session?.user?.id);

        const { data, error } = await withTimeout(
            supabase.functions.invoke('create-goal-and-origin', {
                body: {
                    title: payload.title,
                    description: payload.description,
                    target_date: payload.target_date,
                    cadence: payload.cadence,
                    theme: payload.theme,
                    selfie_public_url: selfiePublicUrl || 'https://via.placeholder.com/200',
                    context_current_frequency: payload.context_current_frequency,
                    context_biggest_blocker: payload.context_biggest_blocker,
                    context_current_status: payload.context_current_status,
                    context_notes: payload.context_notes,
                    context_past_efforts: payload.context_past_efforts,
                    habit_cue_time_window: payload.habit_cue_time_window,
                    habit_cue_location: payload.habit_cue_location,
                },
            }),
            API_TIMEOUTS.AI_OPERATION,
            'Goal creation timed out - AI processing took too long'
        );

        if (error) {
            logger.error('❌ Edge Function error:', error);
            logger.error('Error details:', JSON.stringify(error, null, 2));
            throw error;
        }

        logger.log('✅ Edge Function success:', data);
        return data;
    },

    async checkIn(payload: {
        goalId: string;
        outcome: Outcome;
        note?: string;
        barrier?: CheckInBarrier | null;
        retry_plan?: string | null;
    }): Promise<CheckInResponse> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        const { data, error } = await withTimeout(
            supabase.functions.invoke('check-in', {
                body: {
                    goal_id: payload.goalId,
                    outcome: payload.outcome,
                    note: payload.note,
                    barrier: payload.barrier,
                    retry_plan: payload.retry_plan,
                },
            }),
            API_TIMEOUTS.AI_OPERATION,
            'Check-in timed out - AI processing took too long'
        );

        if (error) {
            logger.error('Check-in error:', error);
            throw error;
        }

        return data;
    },

    async checkInWithTasks(payload: {
        goalId: string;
        taskResults: import('../types').TaskCheckInResult[];
        reflection?: {
            note?: string;
            barrier?: CheckInBarrier;
            tiny_adjustment?: string;
        };
    }): Promise<CheckInResponse> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        const { data, error } = await withTimeout(
            supabase.functions.invoke('check-in', {
                body: {
                    goal_id: payload.goalId,
                    task_results: payload.taskResults,
                    reflection: payload.reflection,
                },
            }),
            API_TIMEOUTS.AI_OPERATION,
            'Check-in timed out - AI processing took too long'
        );

        if (error) {
            logger.error('Check-in with tasks error:', error);
            throw error;
        }

        return data;
    },

    async fetchGoals(): Promise<Goal[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await withTimeoutAndRetry(
            () => supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false }),
            API_TIMEOUTS.FAST,
            { maxAttempts: 2, operationName: 'fetchGoals' }
        );

        if (error) {
            logger.error('Error fetching goals:', error);
            throw error;
        }

        return data || [];
    },

    async fetchGoalsWithStatus(): Promise<GoalWithStatus[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // Single query with join instead of N+1 pattern
        const { data, error } = await withTimeoutAndRetry(
            () => supabase
                .from('goals')
                .select('*, chapters(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false }),
            API_TIMEOUTS.FAST,
            { maxAttempts: 2, operationName: 'fetchGoalsWithStatus' }
        );

        if (error) {
            logger.error('Error fetching goals with chapters:', error);
            throw error;
        }

        const goalsWithStatus: GoalWithStatus[] = [];

        for (const goal of (data || [])) {
            const chapters = (goal.chapters as Chapter[]) || [];

            // Sort by date descending
            const sortedChapters = [...chapters].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            // Calculate streak
            let currentStreak = 0;
            for (const chapter of sortedChapters) {
                if (chapter.outcome === 'completed' || chapter.outcome === 'partial' || chapter.outcome === 'origin') {
                    currentStreak++;
                } else {
                    break;
                }
            }

            // Check if due today
            const today = new Date().toISOString().split('T')[0];
            const hasCheckInToday = sortedChapters.some(c => c.date.startsWith(today) && (c.outcome === 'completed' || c.outcome === 'partial' || c.outcome === 'origin'));

            // Remove chapters from goal object before spreading
            const { chapters: _, ...goalWithoutChapters } = goal;

            goalsWithStatus.push({
                ...goalWithoutChapters,
                streak: currentStreak,
                isDueToday: !hasCheckInToday,
                lastCheckInDate: sortedChapters[0]?.date
            });
        }
        return goalsWithStatus;
    },

    async fetchGoal(goalId: string): Promise<Goal> {
        const { data, error } = await withTimeoutAndRetry(
            () => supabase
                .from('goals')
                .select('*')
                .eq('id', goalId)
                .single(),
            API_TIMEOUTS.FAST,
            { maxAttempts: 2, operationName: 'fetchGoal' }
        );

        if (error) {
            logger.error('Error fetching goal:', error);
            throw error;
        }

        return data;
    },

    async fetchChapters(goalId: string): Promise<Chapter[]> {
        const { data, error } = await withTimeoutAndRetry(
            () => supabase
                .from('chapters')
                .select('*')
                .eq('goal_id', goalId)
                .order('chapter_index', { ascending: true }),
            API_TIMEOUTS.FAST,
            { maxAttempts: 2, operationName: 'fetchChapters' }
        );

        if (error) {
            logger.error('Error fetching chapters:', error);
            throw error;
        }

        return data || [];
    },

    async fetchChapter(chapterId: string): Promise<Chapter | null> {
        const { data, error } = await withTimeoutAndRetry(
            () => supabase
                .from('chapters')
                .select('*')
                .eq('id', chapterId)
                .single(),
            API_TIMEOUTS.FAST,
            { maxAttempts: 2, operationName: 'fetchChapter' }
        );

        if (error) {
            logger.error('Error fetching chapter:', error);
            return null;
        }

        return data;
    },

    async updateNotificationPreferences(enabled: boolean): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await withTimeout(
            supabase
                .from('users')
                .update({ notifications_enabled: enabled })
                .eq('id', user.id),
            API_TIMEOUTS.FAST,
            'Notification update timed out'
        );

        if (error) logger.error('Error updating notifications:', error);
    },

    async updatePushToken(token: string): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                logger.log('⚠️ No user found, skipping push token update');
                return;
            }

            logger.log('💾 Updating push token in database...');

            const { error } = await withTimeout(
                supabase
                    .from('users')
                    .update({ expo_push_token: token })
                    .eq('id', user.id),
                1000, // Keep short timeout for non-critical operation
                'Push token update timed out'
            );

            if (error) {
                logger.error('❌ Error updating push token:', error);
                logger.error('Error details:', JSON.stringify(error, null, 2));
            } else {
                logger.log('✅ Push token updated successfully');
            }
        } catch (error) {
            logger.error('❌ Push token update failed or timed out:', error);
        }
    },

    async updateCheckInTime(time: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await withTimeout(
            supabase
                .from('users')
                .update({ check_in_time: time })
                .eq('id', user.id),
            API_TIMEOUTS.FAST,
            'Check-in time update timed out'
        );

        if (error) logger.error('Error updating check-in time:', error);
    },

    async completeGoal(goalId: string): Promise<import('../types').CompleteGoalResponse> {
        const { data, error } = await withTimeout(
            supabase.functions.invoke('complete-goal', {
                body: { goal_id: goalId },
            }),
            API_TIMEOUTS.AI_OPERATION,
            'Goal completion timed out'
        );
        if (error) throw error;
        return data;
    },

    async startSeasonTwo(previousGoalId: string, durationWeeks: number): Promise<import('../types').StartSeasonTwoResponse> {
        const { data, error } = await withTimeout(
            supabase.functions.invoke('start-season-two', {
                body: { previous_goal_id: previousGoalId, duration_weeks: durationWeeks },
            }),
            API_TIMEOUTS.AI_OPERATION,
            'Season two start timed out'
        );
        if (error) throw error;
        return data;
    },

    async getGoalProgress(goalId: string): Promise<import('../types').GoalProgress> {
        const chapters = await this.fetchChapters(goalId);
        const goal = await this.fetchGoal(goalId);

        const totalChapters = chapters.length;
        const completedCheckins = chapters.filter(c => c.outcome === 'completed').length;
        const partialCheckins = chapters.filter(c => c.outcome === 'partial').length;
        const missedCheckins = chapters.filter(c => c.outcome === 'missed').length;

        // Sort by date descending (newest first)
        const sortedChapters = [...chapters].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Calculate Current Streak
        let currentStreak = 0;
        // We need to check consecutive days.
        // For simplicity in this MVP, we'll assume one check-in per day max, or just count consecutive successful entries
        // A more robust way is to check dates.

        if (sortedChapters.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Check if the most recent chapter is today or yesterday to keep streak alive
            const lastChapterDate = new Date(sortedChapters[0].date);
            lastChapterDate.setHours(0, 0, 0, 0);

            const diffDays = (today.getTime() - lastChapterDate.getTime()) / (1000 * 3600 * 24);

            // If last check-in was today or yesterday, streak is potentially active
            if (diffDays <= 1) {
                for (let i = 0; i < sortedChapters.length; i++) {
                    const chapter = sortedChapters[i];
                    if (chapter.outcome === 'completed' || chapter.outcome === 'partial' || chapter.outcome === 'origin') {
                        // Check if this chapter is consecutive to the previous one (or is the first one we're checking)
                        if (i === 0) {
                            currentStreak++;
                        } else {
                            const prevDate = new Date(sortedChapters[i - 1].date);
                            const currDate = new Date(chapter.date);
                            prevDate.setHours(0, 0, 0, 0);
                            currDate.setHours(0, 0, 0, 0);

                            const gap = (prevDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24);
                            if (gap === 1) {
                                currentStreak++;
                            } else if (gap === 0) {
                                // Same day, ignore (already counted)
                            } else {
                                break; // Streak broken
                            }
                        }
                    } else {
                        break; // Streak broken by missed/failed
                    }
                }
            } else {
                currentStreak = 0; // Streak broken if last check-in was > 1 day ago
            }
        }

        // Calculate Longest Streak
        let longestStreak = 0;
        let tempStreak = 0;

        // Sort ascending for longest streak calculation
        const chronologicalChapters = [...chapters].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (chronologicalChapters.length > 0) {
            for (let i = 0; i < chronologicalChapters.length; i++) {
                const chapter = chronologicalChapters[i];
                if (chapter.outcome === 'completed' || chapter.outcome === 'partial' || chapter.outcome === 'origin') {
                    if (i === 0) {
                        tempStreak = 1;
                    } else {
                        const prevDate = new Date(chronologicalChapters[i - 1].date);
                        const currDate = new Date(chapter.date);
                        prevDate.setHours(0, 0, 0, 0);
                        currDate.setHours(0, 0, 0, 0);

                        const gap = (currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);

                        if (gap === 1) {
                            tempStreak++;
                        } else if (gap > 1) {
                            tempStreak = 1; // Reset streak
                        }
                        // if gap === 0, same day, continue streak count (don't increment, don't reset)
                    }
                } else {
                    tempStreak = 0;
                }
                if (tempStreak > longestStreak) longestStreak = tempStreak;
            }
        }

        // Fallback if calculation fails or is 0 but we have completed chapters
        if (longestStreak === 0 && completedCheckins > 0) longestStreak = 1;


        const start = new Date(goal.created_at);
        const target = new Date(goal.target_date);
        const now = new Date();

        const diffTime = Math.abs(now.getTime() - start.getTime());
        const daysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const remainingTime = target.getTime() - now.getTime();
        const daysUntilTarget = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));

        // Check if due today
        const todayStr = new Date().toISOString().split('T')[0];
        const hasCheckInToday = sortedChapters.some(c => c.date.startsWith(todayStr) && (c.outcome === 'completed' || c.outcome === 'partial' || c.outcome === 'origin'));

        return {
            totalChapters,
            completedCheckins,
            partialCheckins,
            missedCheckins,
            currentStreak,
            longestStreak,
            daysUntilTarget,
            daysElapsed,
            isDueToday: !hasCheckInToday,
            lastCheckInDate: sortedChapters[0]?.date
        };
    },

    async getQuotaUsage(): Promise<import('../types').QuotaUsage> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: userRecord } = await withTimeoutAndRetry(
            () => supabase
                .from('users')
                .select('subscription_tier')
                .eq('id', user.id)
                .single(),
            API_TIMEOUTS.FAST,
            { maxAttempts: 2, operationName: 'getQuotaUsage' }
        );

        const tier = userRecord?.subscription_tier || 'free';
        const quotaLimits: Record<string, number> = { free: 4, plus: 10, premium: 30 };
        const limit = quotaLimits[tier] || 4;

        // Get usage
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let query = supabase
            .from('usage_panels')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (tier !== 'free') {
            query = query.gte('created_at', startOfMonth.toISOString());
        }

        const { count } = await withTimeout(
            query,
            API_TIMEOUTS.FAST,
            'Quota usage fetch timed out'
        );

        return {
            used: count || 0,
            limit,
            resetDate: tier !== 'free' ? new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString() : undefined
        };
    }
};
