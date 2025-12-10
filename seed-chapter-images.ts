/**
 * Generate Missing Chapter Images for Demo Account
 * 
 * Finds all chapters without images and triggers generation.
 * 
 * Usage:
 *   npx tsx seed-chapter-images.ts [email]
 *   npx tsx seed-chapter-images.ts demo1@demo.com
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const DEFAULT_EMAIL = 'demo1@demo.com';
const PASSWORD = 'test1234$';

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const email = process.argv[2] || DEFAULT_EMAIL;

    console.log('🎨 Generating Missing Chapter Images');
    console.log('=====================================\n');
    console.log(`📧 Account: ${email}\n`);

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Sign in
    console.log('🔐 Signing in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: PASSWORD,
    });

    if (authError) {
        throw new Error(`Authentication failed: ${authError.message}`);
    }
    console.log('✅ Signed in\n');

    // Get user profile
    const { data: userProfile } = await supabase
        .from('users')
        .select('display_name, avatar_url, age_range, bio')
        .eq('id', authData.user!.id)
        .single();

    console.log(`👤 User: ${userProfile?.display_name || 'Unknown'}`);
    console.log(`📸 Avatar: ${userProfile?.avatar_url ? 'Yes' : 'No'}\n`);

    // Find all chapters without images
    const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select(`
      id,
      goal_id,
      chapter_index,
      chapter_title,
      chapter_text,
      outcome,
      image_url,
      goals!inner (
        id,
        title,
        theme,
        hero_profile,
        theme_profile
      )
    `)
        .is('image_url', null)
        .order('chapter_index', { ascending: true });

    if (chaptersError) {
        throw new Error(`Error fetching chapters: ${chaptersError.message}`);
    }

    if (!chapters || chapters.length === 0) {
        console.log('✨ All chapters already have images!');
        return;
    }

    console.log(`📝 Found ${chapters.length} chapters without images\n`);

    // Generate images for each
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const goal = (chapter as any).goals;

        console.log(`[${i + 1}/${chapters.length}] ${goal.title} - ${chapter.chapter_title}`);
        console.log(`    Theme: ${goal.theme}, Outcome: ${chapter.outcome}`);

        try {
            const { data: imageResult, error: imageError } = await supabase.functions.invoke(
                'generate-chapter-image',
                {
                    body: {
                        chapter_id: chapter.id,
                        goal_id: chapter.goal_id,
                        hero_profile: goal.hero_profile || 'A determined hero on their journey',
                        theme_profile: goal.theme_profile || `A ${goal.theme} world`,
                        theme: goal.theme,
                        outcome: chapter.outcome,
                        chapter_title: chapter.chapter_title,
                        chapter_text: chapter.chapter_text,
                        avatar_url: userProfile?.avatar_url,
                        user_profile: {
                            name: userProfile?.display_name,
                            age: userProfile?.age_range,
                            bio: userProfile?.bio,
                        },
                    },
                }
            );

            if (imageError) {
                console.log(`    ❌ Failed: ${imageError.message}`);
                failCount++;
            } else if (imageResult.skipped) {
                console.log(`    ⏭️ Skipped (already has image)`);
            } else if (imageResult.success) {
                console.log(`    ✅ Generated!`);
                successCount++;
            }
        } catch (err) {
            console.log(`    ❌ Error: ${err}`);
            failCount++;
        }

        // Throttle to avoid rate limits
        if (i < chapters.length - 1) {
            console.log('    ⏳ Waiting 3s...');
            await sleep(3000);
        }
    }

    console.log('\n=====================================');
    console.log('🎉 Done!');
    console.log(`✅ Generated: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📊 Total: ${chapters.length}`);
}

main().catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
