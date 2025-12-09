// Habit Saga - Gemini Image Generation Helper
// Uses Gemini 3 Pro Image Preview for comic panel generation via Google AI Studio API
// Docs: https://ai.google.dev/gemini-api/docs/gemini-3

const GEMINI_IMAGE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent';

/**
 * Fetches an image from a URL and returns it as base64
 */
async function fetchImageAsBase64(imageUrl: string): Promise<{ base64: string; mimeType: string } | null> {
    try {
        console.log('📷 Fetching avatar image:', imageUrl.substring(0, 80) + '...');
        const response = await fetch(imageUrl);
        if (!response.ok) {
            console.warn('⚠️ Could not fetch avatar image:', response.status);
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        // Convert to base64
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        // Determine MIME type from content-type header or URL
        let mimeType = response.headers.get('content-type') || 'image/jpeg';
        if (mimeType.includes(';')) {
            mimeType = mimeType.split(';')[0];
        }

        console.log('✅ Avatar fetched successfully (', bytes.length, 'bytes )');
        return { base64, mimeType };
    } catch (error) {
        console.warn('⚠️ Failed to fetch avatar image:', error);
        return null;
    }
}

function getGeminiApiKey(): string {
    const key = Deno.env.get('GEMINI_API_KEY');
    if (!key) {
        console.error('❌ GEMINI_API_KEY not found in environment for image generation');
        throw new Error('Missing GEMINI_API_KEY environment variable');
    }
    console.log('✅ GEMINI_API_KEY found for image generation (length:', key.length, ')');
    return key;
}

interface PanelImageInput {
    heroProfile: string;
    themeProfile: string;
    theme?: string; // The theme key (e.g., 'superhero', 'noir', 'action_adventure')
    outcome: 'completed' | 'partial' | 'missed' | 'origin';
    chapterTitle: string;
    chapterText: string;
    avatarUrl?: string | null;
    userProfile?: {
        name?: string;
        age?: string;
        bio?: string;
    };
}

/**
 * Visual style prompts for each theme to ensure images match the theme thumbnails.
 * - action_adventure & pop_regency: Photorealistic film/TV show aesthetics
 * - Others: Comic book/graphic novel illustration styles
 */
const IMAGE_STYLE_PROMPTS: Record<string, { style: string; medium: string }> = {
    superhero: {
        style: 'Classic American comic book illustration style with bold ink lines, dynamic superhero poses, dramatic lighting with strong shadows, and vivid primary colors (red, blue, yellow). Think Marvel/DC comics aesthetic.',
        medium: 'comic book illustration',
    },
    fantasy: {
        style: 'High-fantasy magical illustration style with ethereal magical lighting, soft glowing effects, detailed fantasy environments (castles, enchanted forests, mystical libraries), rich jewel-tone color palette with magical purples, golds, and deep blues.',
        medium: 'fantasy illustration',
    },
    'sci-fi': {
        style: 'Cyberpunk sci-fi graphic novel style with neon lighting (cyan, magenta, electric blue), holographic UI elements, sleek metallic surfaces, dark futuristic cityscapes, high-tech environments with glowing accents.',
        medium: 'sci-fi graphic novel illustration',
    },
    anime: {
        style: 'Classic anime/manga illustration style with expressive character designs, dynamic speed lines for action, dramatic emotional expressions, clean line art, and vibrant saturated colors typical of Japanese animation.',
        medium: 'anime/manga illustration',
    },
    noir: {
        style: 'Mystery film noir graphic novel style with high contrast black and white with selective color accents, dramatic chiaroscuro shadows, rain-slicked urban environments, moody atmospheric lighting, fedoras and trench coats aesthetic.',
        medium: 'noir graphic novel illustration',
    },
    action_adventure: {
        style: 'Cinematic photorealistic style like a blockbuster action-adventure movie still. Think Indiana Jones, Uncharted, or Tomb Raider. Dramatic cinematic lighting, epic landscapes, adventurer protagonist in action poses, warm earthy tones with golden hour lighting, dust particles in the air.',
        medium: 'photorealistic cinematic film still',
    },
    pop_regency: {
        style: 'Photorealistic Regency-era drama style like Bridgerton or Pride and Prejudice adaptations. Elegant period costumes, ornate ballroom/estate settings, soft romantic lighting, pastel color palette (blush pink, powder blue, cream, gold accents), shallow depth of field for dreamy atmosphere.',
        medium: 'photorealistic period drama film still',
    },
    custom: {
        style: 'Versatile illustrated style appropriate for the goal context, with clean composition and engaging visual storytelling.',
        medium: 'illustration',
    },
};

/**
 * Attempts to detect theme from themeProfile string as fallback
 */
function detectThemeFromProfile(themeProfile: string): string {
    const profile = themeProfile.toLowerCase();
    if (profile.includes('superhero') || profile.includes('superpower')) return 'superhero';
    if (profile.includes('fantasy') || profile.includes('magic') || profile.includes('mythical')) return 'fantasy';
    if (profile.includes('sci-fi') || profile.includes('cyber') || profile.includes('futuristic')) return 'sci-fi';
    if (profile.includes('anime') || profile.includes('manga')) return 'anime';
    if (profile.includes('noir') || profile.includes('detective') || profile.includes('mystery')) return 'noir';
    if (profile.includes('action') || profile.includes('adventure') || profile.includes('quest')) return 'action_adventure';
    if (profile.includes('regency') || profile.includes('elegance') || profile.includes('romantic drama')) return 'pop_regency';
    return 'custom';
}

/**
 * Generates a comic panel image based on chapter context using Gemini 3 Pro Image Preview
 * Returns raw PNG bytes as Uint8Array
 */
export async function generatePanelImage(
    input: PanelImageInput
): Promise<Uint8Array> {
    const outcomeMood = {
        origin: 'optimistic and hopeful, beginning of an epic journey',
        completed: 'triumphant and victorious, celebrating success',
        partial: 'determined and focused, making steady progress',
        missed: 'resilient and reflective, learning from setbacks',
    };

    // Determine theme from input.theme or try to extract from themeProfile
    const themeKey = input.theme || detectThemeFromProfile(input.themeProfile);
    const styleConfig = IMAGE_STYLE_PROMPTS[themeKey] || IMAGE_STYLE_PROMPTS.custom;

    // Build hero description with avatar guidance
    let heroDescription = `Hero: ${input.heroProfile}`;
    let avatarImageData: { base64: string; mimeType: string } | null = null;

    if (input.avatarUrl) {
        // Fetch the avatar image to include as multimodal input
        avatarImageData = await fetchImageAsBase64(input.avatarUrl);
        if (avatarImageData) {
            heroDescription += `\nIMPORTANT: Use the attached reference photo as the basis for the hero's appearance. The hero should closely resemble this person - match their facial features, skin tone, hair style, and overall look while transforming them into the story's visual style.`;
        } else {
            heroDescription += `\nHero appearance should match their profile description.`;
        }
    } else if (input.userProfile?.name || input.userProfile?.age || input.userProfile?.bio) {
        const profileDetails = [];
        if (input.userProfile.name) profileDetails.push(`name: ${input.userProfile.name}`);
        if (input.userProfile.age) profileDetails.push(`age range: ${input.userProfile.age}`);
        if (input.userProfile.bio) profileDetails.push(`background: ${input.userProfile.bio}`);
        heroDescription += `\nHero Identity: ${profileDetails.join(', ')}. Make the hero's appearance appropriate for these characteristics.`;
    }

    const prompt = `Generate a single ${styleConfig.medium} panel image.

VISUAL STYLE (CRITICAL - match this exactly):
${styleConfig.style}

${heroDescription}
Setting: ${input.themeProfile}
Mood: ${outcomeMood[input.outcome]}
Chapter Title: "${input.chapterTitle}"

Scene: ${input.chapterText.substring(0, 300)}...

Composition requirements:
- Single panel/frame composition
- Dynamic and visually engaging
- Include the chapter title "${input.chapterTitle}" as stylized text integrated into the image design
- Colors and lighting appropriate for the specified style
- High quality, detailed ${styleConfig.medium}`;

    try {
        const apiKey = getGeminiApiKey();
        console.log('🎨 Generating panel image for outcome:', input.outcome, '| Theme:', themeKey);
        console.log('🚀 Calling Gemini 3 Pro Image Preview API...');
        if (avatarImageData) {
            console.log('👤 Including avatar reference image in request');
        }

        // Build the parts array - include avatar image if available
        const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

        // Add avatar image first if available (for reference)
        if (avatarImageData) {
            parts.push({
                inlineData: {
                    mimeType: avatarImageData.mimeType,
                    data: avatarImageData.base64,
                },
            });
        }

        // Add the text prompt
        parts.push({ text: prompt });

        const response = await fetch(GEMINI_IMAGE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: parts,
                    },
                ],
                generationConfig: {
                    imageConfig: {
                        aspectRatio: '1:1',
                    },
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Gemini 3 Image API error:', response.status, errorText);
            throw new Error(`Gemini 3 Image API error: ${response.status} - ${errorText}`);
        }

        console.log('✅ Gemini 3 Image API responded successfully');
        const data = await response.json();

        // Extract image from response - Gemini 3 returns inline_data in parts
        const responseParts = data.candidates?.[0]?.content?.parts || [];
        let imageBase64: string | null = null;

        for (const part of responseParts) {
            if (part.inlineData?.data) {
                imageBase64 = part.inlineData.data;
                break;
            }
        }

        if (!imageBase64) {
            console.error('❌ No image data in API response. Response:', JSON.stringify(data).substring(0, 500));
            throw new Error('No image data in Gemini 3 API response');
        }

        console.log('✅ Image data extracted successfully');

        // Convert base64 to Uint8Array
        const binaryString = atob(imageBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return bytes;
    } catch (error) {
        console.error('Error generating panel image:', error);
        throw new Error(`Failed to generate panel image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
