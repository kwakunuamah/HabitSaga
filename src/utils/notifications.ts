import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Goal, Cadence } from '../types';
import { supabase } from '../api/supabaseClient';
import { logger } from './logger';

// Configure how notifications are handled when app is foregrounded
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        sticky: false,
        vibrationPattern: [0, 250, 250, 250],
        channelId: 'default',
    }),
});

/**
 * Request notification permissions and get Expo push token
 * Returns the token if successful, undefined otherwise
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
    try {
        // Wrap the entire function with a timeout to prevent indefinite hangs
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Push token registration timed out after 2s')), 2000);
        });

        const registrationPromise = (async () => {
            let token;

            // Android requires a notification channel
            if (Platform.OS === 'android') {
                logger.log('📱 Setting up Android notification channel...');
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'Habit Reminders',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            logger.log('🔐 Checking notification permissions...');
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                logger.log('❓ Requesting notification permissions...');
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                logger.log('⛔ Notification permission not granted');
                return undefined;
            }

            logger.log('✅ Permissions granted, getting push token...');
            try {
                // For managed workflow, projectId is not needed (auto-detected from app.json)
                token = (await Notifications.getExpoPushTokenAsync()).data;
                logger.log('✅ Expo Push Token obtained:', token);
            } catch (e) {
                logger.error('❌ Error getting push token:', e);
                return undefined;
            }

            return token;
        })();

        // Race against timeout
        const result = await Promise.race([registrationPromise, timeoutPromise]);
        return result;
    } catch (error) {
        logger.error('❌ Push notification registration failed:', error);
        return undefined;
    }
}

/**
 * Schedule check-in reminders for a goal based on its cadence
 * Uses science-backed messaging: encouraging, identity-affirming
 */
export async function scheduleCheckInReminders(
    goal: Goal,
    reminderTime: string // format: "HH:MM:SS" e.g. "20:00:00"
): Promise<void> {
    try {
        // Parse reminder time
        const [hours, minutes] = reminderTime.split(':').map(Number);

        // Cancel existing notifications for this goal first
        await cancelGoalNotifications(goal.id);

        const notificationMessages = [
            `It's time to add a new chapter to your ${goal.title} story.`,
            `Quick check-in for your story — keep your streak alive!`,
            `Time to continue your journey in ${goal.title}.`,
            `Your story awaits — ready to log today's chapter?`,
        ];

        // Schedule notifications based on cadence
        const { type } = goal.cadence;
        const today = new Date();

        if (type === 'daily') {
            // Schedule daily notifications for next 7 days (rolling window)
            for (let i = 1; i <= 7; i++) {
                const triggerDate = new Date();
                triggerDate.setDate(today.getDate() + i);
                triggerDate.setHours(hours, minutes, 0, 0);

                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: 'Time to Check In',
                        body: notificationMessages[i % notificationMessages.length],
                        data: {
                            goalId: goal.id,
                            type: 'check_in_reminder'
                        },
                    },
                    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
                    identifier: `${goal.id}-day-${i}`,
                });
            }
        } else if (type === '3x_week') {
            // Schedule for next 14 days, Mon/Wed/Fri pattern
            const daysOfWeek = [1, 3, 5]; // Mon, Wed, Fri
            let scheduled = 0;
            let dayOffset = 1;

            while (scheduled < 6 && dayOffset < 15) { // Schedule 6 reminders
                const triggerDate = new Date();
                triggerDate.setDate(today.getDate() + dayOffset);

                if (daysOfWeek.includes(triggerDate.getDay())) {
                    triggerDate.setHours(hours, minutes, 0, 0);

                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: 'Check-In Day',
                            body: notificationMessages[scheduled % notificationMessages.length],
                            data: {
                                goalId: goal.id,
                                type: 'check_in_reminder'
                            },
                        },
                        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
                        identifier: `${goal.id}-3x-${scheduled}`,
                    });
                    scheduled++;
                }
                dayOffset++;
            }
        }

        logger.log(`Scheduled reminders for goal: ${goal.title}`);
    } catch (error) {
        logger.error('Error scheduling reminders:', error);
    }
}

/**
 * Cancel all scheduled notifications for a specific goal
 */
export async function cancelGoalNotifications(goalId: string): Promise<void> {
    try {
        const allNotifications = await Notifications.getAllScheduledNotificationsAsync();

        // Filter to notifications for this goal
        const goalNotifications = allNotifications.filter(
            notif => notif.identifier?.startsWith(goalId)
        );

        // Cancel each one
        for (const notif of goalNotifications) {
            await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }

        logger.log(`Canceled ${goalNotifications.length} notifications for goal ${goalId}`);
    } catch (error) {
        logger.error('Error canceling notifications:', error);
    }
}

/**
 * Reschedule reminders for all active goals
 * Useful when user changes their global reminder time
 */
export async function rescheduleAllActiveGoals(reminderTime: string): Promise<void> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch all active goals
        const { data: goals, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active');

        if (error || !goals) {
            logger.error('Error fetching goals:', error);
            return;
        }

        // Cancel all existing notifications first
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Reschedule for each goal
        for (const goal of goals) {
            await scheduleCheckInReminders(goal, reminderTime);
        }

        logger.log(`Rescheduled reminders for ${goals.length} active goals`);
    } catch (error) {
        logger.error('Error rescheduling all goals:', error);
    }
}

/**
 * Schedule a "Season 2" nudge after goal completion
 * Uses "Don't miss twice" philosophy: encouraging a fresh start
 */
export async function schedulePostCompletionNudge(
    goalId: string,
    goalTitle: string,
    delayHours: number = 36 // 1.5 days
): Promise<void> {
    try {
        const triggerDate = new Date();
        triggerDate.setHours(triggerDate.getHours() + delayHours);

        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Ready for Your Next Adventure?',
                body: `Your ${goalTitle} story wrapped up beautifully. Ready for Season 2 or a new adventure?`,
                data: {
                    goalId,
                    type: 'post_completion_nudge'
                },
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
            identifier: `${goalId}-completion-nudge`,
        });

        logger.log(`Scheduled post-completion nudge for: ${goalTitle}`);
    } catch (error) {
        logger.error('Error scheduling post-completion nudge:', error);
    }
}

/**
 * Simple notification for immediate delivery (used for testing)
 */
export async function scheduleLocalNotification(
    title: string,
    body: string,
    seconds: number
): Promise<void> {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds,
            repeats: false,
        },
    });
}
