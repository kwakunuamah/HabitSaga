// Habit Saga - Gemini Text Generation Helper
// Uses Gemini 2.5 Flash for narrative generation

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function getGeminiApiKey(): string {
    const key = Deno.env.get('GEMINI_API_KEY');
    if (!key) {
        console.error('❌ GEMINI_API_KEY not found in environment');
        throw new Error('Missing GEMINI_API_KEY environment variable');
    }
    console.log('✅ GEMINI_API_KEY found (length:', key.length, ')');
    return key;
}

/**
 * Sanitizes user input before including in AI prompts.
 * Prevents prompt injection and ensures clean text.
 */
function sanitizeForPrompt(text: string | undefined | null, maxLength = 1000): string {
    if (!text) return '';
    return text
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
        .replace(/```/g, '') // Remove code block markers (potential injection)
        .trim()
        .slice(0, maxLength);
}

import type { CheckInBarrier } from './types.ts';

export interface OriginStoryInput {
    selfiePublicUrl: string;
    theme: 'superhero' | 'fantasy' | 'sci-fi' | 'anime' | 'noir' | 'action_adventure' | 'pop_regency' | 'custom';
    goalTitle: string;
    goalDescription?: string;
    context?: {
        currentFrequency?: string;
        biggestBlocker?: string;
        notes?: string;
        pastEfforts?: string;
        currentStatus?: string;
    };
    userProfile?: {
        name?: string;
        age?: string;
        bio?: string;
    };
}

export interface OriginStoryOutput {
    heroProfile: string;
    themeProfile: string;
    originChapterTitle: string;
    originChapterText: string;
    sagaSummaryShort: string;
    lastChapterSummary: string;
}

interface ChapterNarrativeInput {
    heroProfile: string;
    themeProfile: string;
    sagaSummaryShort: string | null;
    lastChapterSummary: string | null;
    // N+2 context: richer chapter history for better narrative continuity
    previousChapterText?: string | null;
    previousChapterTitle?: string | null;
    olderChapterSummary?: string | null;
    outcome: 'completed' | 'partial' | 'missed' | 'origin';
    note?: string;
    barrier?: CheckInBarrier | null;
    retryPlan?: string | null;
    goalTitle?: string;
    context?: {
        currentFrequency?: string;
        biggestBlocker?: string;
        notes?: string;
        pastEfforts?: string;
        currentStatus?: string;
    };
    userProfile?: {
        name?: string;
        age?: string;
        bio?: string;
    };
}

interface ChapterNarrativeOutput {
    chapterTitle: string;
    chapterText: string;
    newSagaSummaryShort: string;
    newLastChapterSummary: string;
    encouragement: {
        headline: string;
        body: string;
    };
    microPlan: string;
}

/**
 * Theme prompts with visual style AND writing style guidance.
 * - action_adventure & pop_regency: Cinematic film/TV prose style
 * - Others: Comic book/graphic novel narrative style
 */
const THEME_PROMPTS: Record<string, string> = {
    superhero: `Title: Comic Superhero
Description: A classic comic book world of heroes, villains, and superpowers.
Writing Style: Write with bold, heroic comic book prose. Use punchy dialogue, dramatic internal monologue, and action-packed descriptions. Channel the energy of Marvel/DC comics with triumphant language and larger-than-life moments.`,

    fantasy: `Title: Magical Fantasy  
Description: A high-fantasy world of magic, mythical creatures, and epic quests.
Writing Style: Write with rich, evocative fantasy prose. Use poetic descriptions, mystical terminology, and a sense of ancient wonder. Channel the elegance of classic fantasy epics with detailed world-building and magical atmosphere.`,

    'sci-fi': `Title: Cyber Sci-Fi
Description: A futuristic sci-fi world of advanced technology, neon lights, and cybernetics.
Writing Style: Write with sleek, technological prose. Use cyberpunk vernacular, tech jargon, and descriptions of digital/mechanical elements. Channel the gritty future-noir of cyberpunk with sharp, modern language.`,

    anime: `Title: Classic Anime
Description: A high-energy anime style world with dramatic battles and emotional moments.
Writing Style: Write with expressive, dynamic anime prose. Use dramatic exclamations, intense emotional beats, and vivid action descriptions. Channel the energy of shonen/shoujo manga with passionate character moments and epic confrontations.`,

    noir: `Title: Mystery Noir
Description: A dark, moody world of shadows, detectives, and solving mysteries.
Writing Style: Write in hard-boiled detective prose. Use terse sentences, cynical observations, and metaphors about shadows, rain, and city streets. Channel classic noir with atmospheric descriptions and a world-weary narrative voice.`,

    action_adventure: `Title: Action Adventure
Description: A thrilling world of daring heroes, epic quests, and pulse-pounding action sequences. Think Indiana Jones, Uncharted, or Tomb Raider.
Writing Style: Write like a blockbuster action-adventure movie. Use cinematic descriptions with dramatic pacing, witty one-liners, and thrilling action sequences. The prose should feel like watching an adventure film - globe-trotting, high-stakes, and charming.`,

    pop_regency: `Title: Pop Regency
Description: A glamorous world of refined elegance, witty social intrigue, and romantic drama. Think Bridgerton or Pride and Prejudice.
Writing Style: Write like a Regency-era romance drama. Use elegant, witty prose with sharp social observations, romantic tension, and period-appropriate flourishes. The narrative should feel like narration from a prestige period drama - sophisticated, dramatic, and swoon-worthy.`,

    custom: `Title: Custom
Description: A unique world based on the user's specific goal.
Writing Style: Write with engaging, versatile prose appropriate for the goal context. Maintain a motivating and narrative-driven tone.`,
};

/**
 * Generates hero profile, theme profile, and origin chapter in a single call
 */
export async function generateOriginStory(
    input: OriginStoryInput
): Promise<OriginStoryOutput> {
    const themeDescription = THEME_PROMPTS[input.theme] || THEME_PROMPTS.custom;

    const systemInstruction = `You are a creative writer and narrative engine for a personalized habit-tracking comic.
Generate the origin story for a new saga. Return ONLY valid JSON with these exact keys:
- heroProfile: A 2-3 sentence description of the hero character (based on the selfie, goal, and user profile).
- themeProfile: A 2-3 sentence description of the world/setting (based on the selected theme).
- originChapterTitle: A short, engaging title for the first chapter (e.g., "The Awakening").
- originChapterText: A 3-5 paragraph narrative describing the hero embarking on their quest.
- sagaSummaryShort: A 2-3 sentence summary of the saga's beginning.
- lastChapterSummary: A 1-2 sentence summary of this origin chapter.

Keep the tone engaging, appropriate for a comic book, and aligned with the theme.`;

    const userPrompt = `Goal: ${sanitizeForPrompt(input.goalTitle)}
Theme: ${themeDescription}
${input.goalDescription ? `Description: ${sanitizeForPrompt(input.goalDescription)}` : ''}
${input.context?.currentFrequency ? `Current Frequency: ${sanitizeForPrompt(input.context.currentFrequency, 200)}` : ''}
${input.context?.biggestBlocker ? `Biggest Blocker: ${sanitizeForPrompt(input.context.biggestBlocker, 300)}` : ''}
${input.context?.currentStatus ? `Current Status: ${sanitizeForPrompt(input.context.currentStatus, 200)}` : ''}
${input.context?.pastEfforts ? `Past Efforts: ${sanitizeForPrompt(input.context.pastEfforts, 300)}` : ''}
${input.context?.notes ? `Notes: ${sanitizeForPrompt(input.context.notes, 500)}` : ''}
${input.userProfile?.name ? `User Name: ${sanitizeForPrompt(input.userProfile.name, 50)}` : ''}
${input.userProfile?.age ? `User Age: ${sanitizeForPrompt(input.userProfile.age, 50)}` : ''}
${input.userProfile?.bio ? `User Bio: ${sanitizeForPrompt(input.userProfile.bio, 300)}` : ''}
Selfie URL: ${input.selfiePublicUrl}

Generate the origin story.`;

    const apiKey = getGeminiApiKey();
    console.log('🚀 Calling Gemini API for origin story generation...');
    console.log('📝 Goal:', input.goalTitle, '| Theme:', input.theme);

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
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2500,
                responseMimeType: 'application/json',
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    console.log('✅ Gemini API responded successfully');
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error('No text generated from Gemini API');
    }

    try {
        const parsed = JSON.parse(text);
        return {
            heroProfile: parsed.heroProfile || 'A determined hero ready to begin their journey.',
            themeProfile: parsed.themeProfile || `A ${input.theme} world filled with adventure.`,
            originChapterTitle: parsed.originChapterTitle || 'Chapter 1: The Beginning',
            originChapterText: parsed.originChapterText || 'Your journey begins here. The path ahead is filled with challenges and triumphs.',
            sagaSummaryShort: parsed.sagaSummaryShort || 'A new hero embarks on a quest to achieve their goal.',
            lastChapterSummary: parsed.lastChapterSummary || 'The hero takes their first step forward.',
        };
    } catch (parseError) {
        console.error('Failed to parse Gemini JSON response:', text);
        return {
            heroProfile: 'A determined hero ready to begin their journey.',
            themeProfile: `A ${input.theme} world filled with adventure.`,
            originChapterTitle: 'Chapter 1: The Beginning',
            originChapterText: 'Your journey begins here. The path ahead is filled with challenges and triumphs.',
            sagaSummaryShort: 'A new hero embarks on a quest to achieve their goal.',
            lastChapterSummary: 'The hero takes their first step forward.',
        };
    }
}

/**
 * Generates chapter narrative, title, and updated saga summaries
 */
export async function generateChapterNarrative(
    input: ChapterNarrativeInput
): Promise<ChapterNarrativeOutput> {
    const systemInstruction = `You are a narrative engine for a personal habit comic. 
    Generate a chapter for a habit-tracking comic saga. Return ONLY valid JSON with these exact keys:
        - chapterTitle: A short, engaging chapter title (e.g., "Chapter 5: The Test of Will")
        - chapterText: A 3-5 paragraph narrative describing the hero's experience (outcome: ${input.outcome})
        - newSagaSummaryShort: A 2-3 sentence summary of the entire saga so far (updated with this chapter)
        - newLastChapterSummary: A 1-2 sentence summary of this specific chapter
        - encouragement: An object with:
            - headline: A 1-line encouraging phrase
            - body: 1-3 short sentences of support or advice
        - micro_plan: A 1-sentence specific suggestion for next time

Keep the narrative engaging, appropriate for a comic book, and aligned with the theme.
For the encouragement, be supportive but realistic based on the outcome and barrier.`;

    const outcomeDescription = {
        origin: 'This is the origin story - the hero embarks on their quest.',
        completed: 'The hero successfully completed their goal today.',
        partial: 'The hero made partial progress toward their goal today.',
        missed: 'The hero faced a setback and did not complete their goal today.',
    };

    const userPrompt = `Hero Profile: ${input.heroProfile}
Theme: ${input.themeProfile}
${input.goalTitle ? `Goal: ${sanitizeForPrompt(input.goalTitle)}` : ''}
${input.sagaSummaryShort ? `Overall Saga Summary: ${input.sagaSummaryShort}` : 'This is the beginning of the saga.'}
${input.olderChapterSummary ? `Earlier Chapter: ${input.olderChapterSummary}` : ''}
${input.previousChapterTitle ? `Most Recent Chapter: "${input.previousChapterTitle}"` : ''}
${input.previousChapterText ? `Previous Chapter Full Text:\n${input.previousChapterText}` : ''}
${input.lastChapterSummary && !input.previousChapterText ? `Last Chapter Summary: ${input.lastChapterSummary}` : ''}
Outcome: ${outcomeDescription[input.outcome]}
${input.note ? `User Note: ${sanitizeForPrompt(input.note, 500)}` : ''}
${input.barrier ? `Barrier: ${sanitizeForPrompt(input.barrier, 200)}` : ''}
${input.retryPlan ? `Retry Plan: ${sanitizeForPrompt(input.retryPlan, 300)}` : ''}
${input.context?.currentFrequency ? `Current Frequency: ${sanitizeForPrompt(input.context.currentFrequency, 200)}` : ''}
${input.context?.biggestBlocker ? `Biggest Blocker: ${sanitizeForPrompt(input.context.biggestBlocker, 300)}` : ''}
${input.context?.currentStatus ? `Current Status: ${sanitizeForPrompt(input.context.currentStatus, 200)}` : ''}
${input.context?.pastEfforts ? `Past Efforts: ${sanitizeForPrompt(input.context.pastEfforts, 300)}` : ''}
${input.context?.notes ? `Context Notes: ${sanitizeForPrompt(input.context.notes, 500)}` : ''}
${input.userProfile?.name ? `User Name: ${sanitizeForPrompt(input.userProfile.name, 50)}` : ''}
${input.userProfile?.age ? `User Age: ${sanitizeForPrompt(input.userProfile.age, 50)}` : ''}
${input.userProfile?.bio ? `User Bio: ${sanitizeForPrompt(input.userProfile.bio, 300)}` : ''}

Generate the chapter narrative, encouragement, and micro_plan. Build upon the previous chapter to maintain story continuity.`;

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
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2500,
                responseMimeType: 'application/json',
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error('No text generated from Gemini API');
    }

    try {
        const parsed = JSON.parse(text);
        return {
            chapterTitle: parsed.chapterTitle || `Chapter: ${input.outcome}`,
            chapterText: parsed.chapterText || 'The hero continues their journey.',
            newSagaSummaryShort: parsed.newSagaSummaryShort || input.sagaSummaryShort || 'An ongoing saga of determination.',
            newLastChapterSummary: parsed.newLastChapterSummary || `The hero ${input.outcome === 'completed' ? 'achieved their goal' : input.outcome === 'partial' ? 'made progress' : 'faced a challenge'} on this day.`,
            encouragement: parsed.encouragement || {
                headline: 'Keep going!',
                body: 'Every step counts. You got this.',
            },
            microPlan: parsed.micro_plan || parsed.encouragement?.microPlan || 'Keep pushing forward!',
        };
    } catch (parseError) {
        console.error('Failed to parse Gemini JSON response:', text);
        // Fallback to basic narrative
        return {
            chapterTitle: `Chapter: ${input.outcome}`,
            chapterText: `The hero ${input.outcome === 'completed' ? 'succeeded' : input.outcome === 'partial' ? 'made progress' : 'faced a challenge'} today.${input.note ? ` ${input.note}` : ''}`,
            newSagaSummaryShort: input.sagaSummaryShort || 'An ongoing saga of determination.',
            newLastChapterSummary: `The hero ${input.outcome === 'completed' ? 'achieved their goal' : input.outcome === 'partial' ? 'made progress' : 'faced a setback'} on this day.`,
            encouragement: {
                headline: 'Keep going!',
                body: 'Every step counts. You got this.',
            },
            microPlan: 'Keep pushing forward!',
        };
    }
}

export interface FinaleNarrativeInput {
    heroProfile: string;
    themeProfile: string;
    sagaSummaryShort?: string;
    lastChapterSummary?: string;
    goalTitle: string;
    targetDate: string;
    totalChapters: number;
}

export interface FinaleNarrativeOutput {
    finaleChapterTitle: string;
    finaleChapterText: string;
    finalSagaSummary: string;
    celebrationMessage: {
        headline: string;
        body: string;
    };
}

/**
 * Generates the season finale narrative
 */
export async function generateFinaleNarrative(
    input: FinaleNarrativeInput
): Promise<FinaleNarrativeOutput> {
    const systemInstruction = `You are a narrative engine for a personal habit comic.
    Generate the Season Finale chapter for a completed saga. Return ONLY valid JSON with these exact keys:
        - finaleChapterTitle: A triumphant title for the final chapter (e.g., "The Final Victory")
        - finaleChapterText: A 3-5 paragraph narrative describing the hero's ultimate triumph and the conclusion of this journey.
        - finalSagaSummary: A 2-3 sentence summary of the entire completed saga, emphasizing the hero's growth and success.
        - celebrationMessage: An object with:
            - headline: A 1-line celebratory phrase (e.g., "Saga Complete!")
            - body: 1-3 sentences congratulating the user on finishing their goal.

    Keep the tone triumphant, rewarding, and aligned with the theme. This is the payoff for the user's hard work.`;

    const userPrompt = `Hero Profile: ${input.heroProfile}
Theme: ${input.themeProfile}
Goal: ${input.goalTitle}
Target Date: ${input.targetDate}
Total Chapters: ${input.totalChapters}
${input.sagaSummaryShort ? `Saga Summary: ${input.sagaSummaryShort}` : ''}
${input.lastChapterSummary ? `Last Chapter: ${input.lastChapterSummary}` : ''}

Generate the Season Finale.`;

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
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2500,
                responseMimeType: 'application/json',
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error('No text generated from Gemini API');
    }

    try {
        const parsed = JSON.parse(text);
        return {
            finaleChapterTitle: parsed.finaleChapterTitle || 'The Grand Finale',
            finaleChapterText: parsed.finaleChapterText || 'The hero stands triumphant, having achieved their goal against all odds.',
            finalSagaSummary: parsed.finalSagaSummary || 'The hero completed their quest and became a legend.',
            celebrationMessage: parsed.celebrationMessage || {
                headline: 'Congratulations!',
                body: 'You did it! You completed your goal.',
            },
        };
    } catch (parseError) {
        console.error('Failed to parse Gemini JSON response:', text);
        return {
            finaleChapterTitle: 'The Grand Finale',
            finaleChapterText: 'The hero stands triumphant, having achieved their goal against all odds. The journey was long, but the reward is sweet.',
            finalSagaSummary: 'The hero completed their quest and became a legend.',
            celebrationMessage: {
                headline: 'Congratulations!',
                body: 'You did it! You completed your goal.',
            },
        };
    }
}
