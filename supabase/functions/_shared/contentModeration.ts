// Content Moderation Logging Utility
// Logs user-generated content for review by administrators

import { supabaseAdmin } from './supabaseAdmin.ts';

export type ContentType =
    | 'goal_title'
    | 'goal_description'
    | 'context_notes'
    | 'avatar_upload'
    | 'panel_upload';

export interface ModerationLogEntry {
    userId: string;
    contentType: ContentType;
    contentText?: string;
    storagePath?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Logs content for moderation review.
 * This is a non-blocking operation that logs asynchronously.
 * Failures are logged but don't interrupt the main flow.
 */
export async function logContentForReview(entry: ModerationLogEntry): Promise<void> {
    try {
        const { error } = await supabaseAdmin
            .from('moderation_logs')
            .insert({
                user_id: entry.userId,
                content_type: entry.contentType,
                content_text: entry.contentText || null,
                storage_path: entry.storagePath || null,
                metadata: entry.metadata || null,
            });

        if (error) {
            // Log error but don't throw - moderation logging should not block main flow
            console.error('Failed to log content for moderation:', error);
        }
    } catch (err) {
        console.error('Error in logContentForReview:', err);
    }
}

/**
 * Logs goal creation content for moderation review.
 * Logs title, description, and any context notes.
 */
export async function logGoalContentForReview(
    userId: string,
    goalId: string,
    content: {
        title: string;
        description?: string | null;
        contextNotes?: string | null;
        contextBlocker?: string | null;
        contextPastEfforts?: string | null;
    }
): Promise<void> {
    const logPromises: Promise<void>[] = [];

    // Always log title
    logPromises.push(
        logContentForReview({
            userId,
            contentType: 'goal_title',
            contentText: content.title,
            metadata: { goal_id: goalId },
        })
    );

    // Log description if provided
    if (content.description) {
        logPromises.push(
            logContentForReview({
                userId,
                contentType: 'goal_description',
                contentText: content.description,
                metadata: { goal_id: goalId },
            })
        );
    }

    // Log any context notes
    const contextText = [
        content.contextNotes,
        content.contextBlocker,
        content.contextPastEfforts,
    ]
        .filter(Boolean)
        .join(' | ');

    if (contextText) {
        logPromises.push(
            logContentForReview({
                userId,
                contentType: 'context_notes',
                contentText: contextText,
                metadata: { goal_id: goalId },
            })
        );
    }

    // Execute all log operations in parallel (non-blocking)
    await Promise.allSettled(logPromises);
}
