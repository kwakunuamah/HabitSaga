/**
 * Generate Missed Chapter Image
 * 
 * Finds a "missed" chapter from demo accounts and generates the panel image.
 * 
 * Usage:
 *   npx tsx seed-missed-image.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

async function main() {
    console.log('🎨 Generating Missed Chapter Image');
    console.log('===================================\n');

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
    }

    // Demo accounts to check
    const demoAccounts = [
        { email: 'demo1@demo.com', password: 'test1234$' },
        { email: 'demo2@demo.com', password: 'test1234$' },
        { email: 'demo3@demo.com', password: 'test1234$' },
        { email: 'demo4@demo.com', password: 'test1234$' },
    ];

    for (const account of demoAccounts) {
        console.log(`\n📧 Checking ${account.email}...`);

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Sign in
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: account.email,
            password: account.password,
        });

        if (authError) {
            console.log(`  ⚠️ Couldn't sign in: ${authError.message}`);
            continue;
        }

        // Find a missed chapter without an image
        const { data: missedChapters, error: chaptersError } = await supabase
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
            .eq('outcome', 'missed')
            .is('image_url', null)
            .limit(1);

        if (chaptersError) {
            console.log(`  ⚠️ Error fetching chapters: ${chaptersError.message}`);
            continue;
        }

        if (!missedChapters || missedChapters.length === 0) {
            console.log(`  ℹ️ No missed chapters without images`);
            continue;
        }

        const chapter = missedChapters[0];
        const goal = (chapter as any).goals;

        console.log(`\n  ✅ Found missed chapter!`);
        console.log(`     Goal: ${goal.title}`);
        console.log(`     Chapter: ${chapter.chapter_title}`);
        console.log(`     Theme: ${goal.theme}`);

        // Get user profile for avatar
        const { data: userProfile } = await supabase
            .from('users')
            .select('display_name, avatar_url, age_range, bio')
            .eq('id', authData.user!.id)
            .single();

        console.log(`\n  🎨 Generating missed panel image...`);
        console.log(`     Avatar: ${userProfile?.avatar_url ? 'Yes' : 'No'}`);

        // Call the generate-chapter-image function
        const { data: imageResult, error: imageError } = await supabase.functions.invoke(
            'generate-chapter-image',
            {
                body: {
                    chapter_id: chapter.id,
                    goal_id: chapter.goal_id,
                    hero_profile: goal.hero_profile || 'A determined hero facing a setback',
                    theme_profile: goal.theme_profile || `A ${goal.theme} world`,
                    theme: goal.theme,
                    outcome: 'missed',
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
            console.error(`\n  ❌ Image generation failed:`, imageError);
            continue;
        }

        if (imageResult.skipped) {
            console.log(`\n  ℹ️ Image already exists (skipped)`);
        } else if (imageResult.success) {
            console.log(`\n  ✅ Missed panel image generated!`);
            console.log(`     URL: ${imageResult.image_url}`);
        }

        console.log('\n🎉 Done! Check the chapter in the app to see the missed image.');
        return; // Only need one
    }

    console.log('\n⚠️ No missed chapters found to generate images for.');
    console.log('   Try creating a check-in with "missed" outcome first.');
}

main().catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
