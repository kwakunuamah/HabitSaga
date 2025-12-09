// Habit Saga - Habit Plan Generation using Gemini AI
// Generates 1-3 structured habit tasks based on goal and context

import type { HabitTask, Cadence, HabitFrequency, CueType } from './types.ts';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function getGeminiApiKey(): string {
    const key = Deno.env.get('GEMINI_API_KEY');
    if (!key) {
        throw new Error('Missing GEMINI_API_KEY environment variable');
    }
    return key;
}

export interface HabitPlanInput {
    goalText: string;
    goalDescription?: string;
    cadence: Cadence;
    targetDate: string;
    context?: {
        currentFrequency?: string;
        biggestBlocker?: string;
        currentStatus?: string;
        notes?: string;
        pastEfforts?: string;
    };
    habitCueContext?: {
        timeWindow?: string;
        location?: string;
    };
    userProfile?: {
        name?: string;
        age?: string;
    };
}

/**
 * Generates a Habit Plan of 1-3 tasks using Gemini AI
 * Follows Atomic Habits (implementation intentions) and Tiny Habits principles
 */
export async function generateHabitPlan(input: HabitPlanInput): Promise<HabitTask[]> {
    const systemInstruction = `You are an expert habit coach trained in behavior design, implementation intentions, and habit stacking.

Your task: Generate 1-3 specific, actionable habit tasks to help the user achieve their goal.

PRINCIPLES TO FOLLOW:
1. **Tiny Habits**: Start very small - tasks should be easy enough to do even on a difficult day
2. **Implementation Intentions**: Use "if-then" format: "If it is [TIME] and I am [LOCATION], then I will [ACTION]"
3. **Habit Stacking**: When possible, anchor new habits to existing routines: "After I [EXISTING HABIT], I will [NEW HABIT]"
4. **Frequency**: Match the goal's cadence (daily/3x per week/weekly)

TASK STRUCTURE:
- Label: Clear, specific action (e.g., "Read 5 pages of your book")
- Tiny version: Even smaller version for hard days (e.g., "Read 2 pages")
- Full version: What success looks like (e.g., "Read 10+ pages")
- Cue type: Either "time_location" or "habit_stack"
- If-then: Complete implementation intention statement
- Habit stack (optional): If using habit stacking, the existing habit anchor
- Suggested frequency: "daily" | "three_per_week" | "weekly"
- Difficulty: 1 (very easy) to 5 (challenging)

IMPORTANT:
- Generate 1-3 tasks (not more)
- Make tasks SMALL and SPECIFIC
- Use concrete times, places, or existing habits as cues
- Ensure tiny version is trivially easy
- Return ONLY valid JSON matching the schema

Return JSON array of tasks with this exact structure:
[
  {
    "label": "string",
    "tiny_version": "string",
    "full_version": "string",
    "cue_type": "time_location" | "habit_stack",
    "if_then": "string",
    "habit_stack": "string or null",
    "suggested_frequency": "daily" | "three_per_week" | "weekly",
    "difficulty": number
  }
]`;

    const userPrompt = `Goal: ${input.goalText}
${input.goalDescription ? `Description: ${input.goalDescription}` : ''}
Cadence: ${input.cadence.type}${input.cadence.details ? ` (${input.cadence.details})` : ''}
Target Date: ${input.targetDate}
${input.context?.currentFrequency ? `Current Frequency: ${input.context.currentFrequency}` : ''}
${input.context?.biggestBlocker ? `Biggest Blocker: ${input.context.biggestBlocker}` : ''}
${input.context?.currentStatus ? `Current Status: ${input.context.currentStatus}` : ''}
${input.context?.pastEfforts ? `Past Efforts: ${input.context.pastEfforts}` : ''}
${input.context?.notes ? `Notes: ${input.context.notes}` : ''}
${input.userProfile?.name ? `User Name: ${input.userProfile.name}` : ''}
${input.userProfile?.age ? `User Age: ${input.userProfile.age}` : ''}
${input.habitCueContext?.timeWindow ? `Preferred Time Window: ${input.habitCueContext.timeWindow}` : ''}
${input.habitCueContext?.location ? `Typical Location: ${input.habitCueContext.location}` : ''}
${input.habitCueContext?.timeWindow || input.habitCueContext?.location ? `
IMPORTANT: When generating implementation intentions (if-then statements) and habit stacks, incorporate the user's specified time window and location to make them concrete and personalized. For example: "After I [existing habit at that time/location], I will [new habit]" or "If it's [time window] and I'm at [location], then I will [action]".` : ''}

Generate a habit plan with 1-3 specific tasks.`;

    const apiKey = getGeminiApiKey();
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            system_instruction: {
                parts: [{ text: systemInstruction }],
            },
            contents: [
                {
                    role: 'user',
                    parts: [{ text: userPrompt }],
                },
            ],
            generationConfig: {
                temperature: 0.7, // Slightly lower for more consistent structure
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2000, // Increased from 1000 to prevent truncation
                responseMimeType: 'application/json',
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API request failed:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Log the raw response for debugging
    console.log('📝 Gemini habit plan raw response length:', text?.length || 0);
    console.log('📝 Gemini habit plan response (first 500 chars):', text?.slice(0, 500));

    if (!text) {
        console.error('❌ No text in Gemini response. Full response:', JSON.stringify(data).slice(0, 500));
        throw new Error('No text generated from Gemini API');
    }

    try {
        const parsed = JSON.parse(text);
        console.log('✅ Successfully parsed habit plan JSON. Habits count:', parsed?.length || 0);

        // Validate it's an array
        if (!Array.isArray(parsed)) {
            throw new Error('Response is not an array');
        }

        // Validate we have 1-3 tasks
        if (parsed.length < 1 || parsed.length > 3) {
            console.warn(`Expected 1-3 tasks, got ${parsed.length}. Using first 3.`);
        }

        // Convert to HabitTask format and add required fields
        const habits: HabitTask[] = parsed.slice(0, 3).map((task, index) => ({
            id: crypto.randomUUID(),
            label: task.label || 'Unnamed habit',
            tiny_version: task.tiny_version || task.label || 'Do one small thing',
            full_version: task.full_version || task.label || 'Complete the full task',
            cue_type: (task.cue_type === 'habit_stack' || task.cue_type === 'time_location')
                ? task.cue_type
                : 'time_location',
            if_then: task.if_then || `I will ${task.label || 'work on my goal'}`,
            habit_stack: task.habit_stack || undefined,
            suggested_frequency: validateFrequency(task.suggested_frequency, input.cadence),
            difficulty: Math.min(5, Math.max(1, parseInt(task.difficulty) || 2)),
            active: true,
            metrics: {
                total_full_completions: 0,
                total_tiny_completions: 0,
                total_missed: 0,
            },
        }));

        return habits;
    } catch (parseError) {
        // Enhanced error logging for debugging truncation issues
        console.error('❌ Failed to parse Gemini habit plan JSON');
        console.error('   Response length:', text?.length || 0);
        console.error('   Parse error:', parseError instanceof Error ? parseError.message : parseError);
        console.error('   Last 100 chars of response:', text?.slice(-100));
        console.error('   Full response (first 800 chars):', text?.slice(0, 800));

        // Check if response appears truncated
        const trimmedText = text?.trim() || '';
        if (!trimmedText.endsWith(']') && !trimmedText.endsWith('}')) {
            console.error('   ⚠️ Response appears TRUNCATED (does not end with ] or })');
        }

        console.log('📋 Using fallback habit for goal:', input.goalText.slice(0, 50));
        // Return a fallback habit based on the goal
        return createFallbackHabit(input);
    }
}

/**
 * Validates and maps frequency to one of the expected values
 */
function validateFrequency(
    suggested: string | undefined,
    cadence: Cadence
): HabitFrequency {
    if (suggested === 'daily' || suggested === 'three_per_week' || suggested === 'weekly') {
        return suggested;
    }

    // Map cadence type to frequency
    switch (cadence.type) {
        case 'daily':
            return 'daily';
        case '3x_week':
            return 'three_per_week';
        default:
            return 'weekly';
    }
}

/**
 * Creates a simple fallback habit if AI generation fails
 */
function createFallbackHabit(input: HabitPlanInput): HabitTask[] {
    const frequency = validateFrequency(undefined, input.cadence);

    return [
        {
            id: crypto.randomUUID(),
            label: `Work on: ${input.goalText.slice(0, 50)}`,
            tiny_version: 'Take one small step toward your goal',
            full_version: 'Complete a meaningful session',
            cue_type: 'time_location',
            if_then: `I will work on my goal at a specific time and place`,
            suggested_frequency: frequency,
            difficulty: 2,
            active: true,
            metrics: {
                total_full_completions: 0,
                total_tiny_completions: 0,
                total_missed: 0,
            },
        },
    ];
}
