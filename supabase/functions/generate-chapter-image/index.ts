// Habit Saga - Generate Chapter Image Edge Function
// POST /functions/v1/generate-chapter-image
//
// Async image generation for chapters - called after goal/chapter creation
// to generate and attach images without blocking the main response.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generatePanelImage } from '../_shared/geminiImage.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateChapterImageRequest {
    chapter_id: string;
    goal_id: string;
    hero_profile: string;
    theme_profile: string;
    theme: string;
    outcome: 'completed' | 'partial' | 'missed' | 'origin';
    chapter_title: string;
    chapter_text: string;
    avatar_url?: string | null;
    user_profile?: {
        name?: string;
        age?: string;
        bio?: string;
    };
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // Parse request - this can be called without JWT for background processing
        const body: GenerateChapterImageRequest = await req.json();

        console.log('🎨 Starting async image generation for chapter:', body.chapter_id);

        // Verify chapter exists
        const { data: chapter, error: chapterError } = await supabaseAdmin
            .from('chapters')
            .select('id, goal_id, image_url')
            .eq('id', body.chapter_id)
            .single();

        if (chapterError || !chapter) {
            console.error('Chapter not found:', body.chapter_id);
            return new Response(
                JSON.stringify({ error: 'Chapter not found', code: 'CHAPTER_NOT_FOUND' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Skip if image already exists
        if (chapter.image_url) {
            console.log('✅ Image already exists for chapter:', body.chapter_id);
            return new Response(
                JSON.stringify({ success: true, image_url: chapter.image_url, skipped: true }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get goal owner for quota tracking
        const { data: goal } = await supabaseAdmin
            .from('goals')
            .select('user_id')
            .eq('id', body.goal_id)
            .single();

        if (!goal) {
            return new Response(
                JSON.stringify({ error: 'Goal not found', code: 'GOAL_NOT_FOUND' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Generate the panel image
        console.log('🖼️ Generating panel image...');
        const imageBytes = await generatePanelImage({
            heroProfile: body.hero_profile,
            themeProfile: body.theme_profile,
            theme: body.theme,
            outcome: body.outcome,
            chapterTitle: body.chapter_title,
            chapterText: body.chapter_text,
            avatarUrl: body.avatar_url,
            userProfile: body.user_profile,
        });

        // Upload to storage
        const imagePath = `${goal.user_id}/${body.goal_id}/${body.outcome}-${Date.now()}.png`;
        const { error: uploadError } = await supabaseAdmin.storage
            .from('panels')
            .upload(imagePath, imageBytes, {
                contentType: 'image/png',
                upsert: false,
            });

        if (uploadError) {
            console.error('❌ Failed to upload image:', uploadError);
            return new Response(
                JSON.stringify({ error: 'Failed to upload image', code: 'UPLOAD_ERROR' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('panels')
            .getPublicUrl(imagePath);
        const imageUrl = urlData.publicUrl;

        // Update chapter with image URL
        const { error: updateError } = await supabaseAdmin
            .from('chapters')
            .update({ image_url: imageUrl })
            .eq('id', body.chapter_id);

        if (updateError) {
            console.error('❌ Failed to update chapter:', updateError);
            return new Response(
                JSON.stringify({ error: 'Failed to update chapter', code: 'UPDATE_ERROR' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Record panel usage
        await supabaseAdmin.from('usage_panels').insert({
            user_id: goal.user_id,
            chapter_id: body.chapter_id,
            generated_at: new Date().toISOString(),
        });

        console.log('✅ Image generated and attached successfully:', imageUrl);

        return new Response(
            JSON.stringify({ success: true, image_url: imageUrl }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('❌ Error generating chapter image:', error);
        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
                code: 'INTERNAL_ERROR'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
