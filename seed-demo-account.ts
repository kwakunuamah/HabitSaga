/**
 * Seed Demo Account for App Store Screenshots
 * 
 * This script creates a comprehensive demo account with:
 * - 3 active goals with different themes
 * - Multiple chapters per goal (10-15)
 * - Realistic streaks and progress
 * - Personalized AI content using provided selfie
 * 
 * Usage:
 *   npx tsx seed-demo-account.ts --email demo@test.com --password yourpassword --selfie ./path/to/selfie.jpg
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Types
type Outcome = 'completed' | 'partial' | 'missed';
type ThemeType = 'superhero' | 'fantasy' | 'scifi' | 'anime' | 'noir' | 'pop-regency' | 'action-adventure';
type Cadence = 'daily' | 'weekly' | { custom: { days_per_week: number } };

interface GoalConfig {
    title: string;
    description: string;
    theme: ThemeType;
    cadence: Cadence;
    targetDateOffset: number; // days from now
    checkIns: {
        outcome: Outcome;
        note?: string;
        daysAgo: number;
    }[];
    context?: {
        currentFrequency?: string;
        biggestBlocker?: string;
        currentStatus?: string;
        notes?: string;
        pastEfforts?: string;
    };
}

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const config: {
        email?: string;
        password?: string;
        selfie?: string;
    } = {};

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--email' && args[i + 1]) {
            config.email = args[i + 1];
            i++;
        } else if (args[i] === '--password' && args[i + 1]) {
            config.password = args[i + 1];
            i++;
        } else if (args[i] === '--selfie' && args[i + 1]) {
            config.selfie = args[i + 1];
            i++;
        }
    }

    if (!config.email || !config.password || !config.selfie) {
        console.error('❌ Missing required arguments');
        console.log('\nUsage:');
        console.log('  npx tsx seed-demo-account.ts --email EMAIL --password PASSWORD --selfie PATH_TO_SELFIE');
        console.log('\nExample:');
        console.log('  npx tsx seed-demo-account.ts --email demo@test.com --password mypassword --selfie ./selfie.jpg');
        process.exit(1);
    }

    return config as Required<typeof config>;
}

// Goal configurations for demo account
const DEMO_GOALS: GoalConfig[] = [
    {
        title: 'Exercise Daily',
        description: 'Build strength and endurance through consistent daily workouts',
        theme: 'superhero',
        cadence: 'daily',
        targetDateOffset: 30,
        context: {
            currentFrequency: 'I exercise 2-3 times per week',
            biggestBlocker: 'Finding time in my busy schedule',
            currentStatus: 'Beginner - trying to build consistency',
            notes: 'Want to feel stronger and more energized',
            pastEfforts: 'Tried gym memberships but struggled with consistency',
        },
        checkIns: [
            { outcome: 'completed', note: '30 minute morning workout - felt great!', daysAgo: 14 },
            { outcome: 'completed', note: 'Quick 20 min session before work', daysAgo: 13 },
            { outcome: 'completed', note: 'Pushed through even though I was tired', daysAgo: 12 },
            { outcome: 'partial', note: 'Only had time for 10 minutes', daysAgo: 11 },
            { outcome: 'completed', note: 'Full workout - new personal best!', daysAgo: 10 },
            { outcome: 'completed', note: 'Morning run around the neighborhood', daysAgo: 9 },
            { outcome: 'missed', note: 'Sick day - needed rest', daysAgo: 8 },
            { outcome: 'completed', note: 'Back at it! Felt good to move again', daysAgo: 7 },
            { outcome: 'completed', note: 'Evening workout after work', daysAgo: 6 },
            { outcome: 'completed', note: 'Tried a new routine - challenging but fun', daysAgo: 5 },
            { outcome: 'completed', note: 'Consistent workout - feeling stronger', daysAgo: 4 },
            { outcome: 'partial', note: 'Quick 15 min session, better than nothing', daysAgo: 3 },
            { outcome: 'completed', note: 'Full workout - on a roll!', daysAgo: 2 },
            { outcome: 'completed', note: 'Morning session - great start to the day', daysAgo: 1 },
            { outcome: 'completed', note: 'Crushed today\'s workout!', daysAgo: 0 },
        ],
    },
    {
        title: 'Read 10 Books in 2025',
        description: 'Expand knowledge and imagination through consistent daily reading',
        theme: 'fantasy',
        cadence: 'daily',
        targetDateOffset: 365,
        context: {
            currentFrequency: 'I read occasionally, about 1-2 books per year',
            biggestBlocker: 'Screen time and distractions',
            currentStatus: 'Want to read more consistently',
            notes: 'Love fantasy and sci-fi novels',
            pastEfforts: 'Set reading goals before but fell off after a few weeks',
        },
        checkIns: [
            { outcome: 'completed', note: '20 pages before bed', daysAgo: 11 },
            { outcome: 'completed', note: 'Got into a really good chapter!', daysAgo: 10 },
            { outcome: 'partial', note: 'Only read 5 pages, was too tired', daysAgo: 9 },
            { outcome: 'completed', note: 'Couldn\'t put it down - read for an hour', daysAgo: 8 },
            { outcome: 'completed', note: 'Finished chapter 5', daysAgo: 7 },
            { outcome: 'completed', note: 'Reading during lunch break now', daysAgo: 6 },
            { outcome: 'completed', note: 'Plot is getting intense!', daysAgo: 5 },
            { outcome: 'completed', note: 'Daily reading is becoming a habit', daysAgo: 4 },
            { outcome: 'partial', note: 'Quick 10 min read', daysAgo: 3 },
            { outcome: 'completed', note: 'Long reading session - so good', daysAgo: 2 },
            { outcome: 'completed', note: 'Almost done with book 1!', daysAgo: 1 },
            { outcome: 'completed', note: 'Finished first book! Starting book 2', daysAgo: 0 },
        ],
    },
    {
        title: 'Learn Spanish',
        description: 'Practice Spanish daily to achieve conversational fluency',
        theme: 'anime',
        cadence: { custom: { days_per_week: 5 } },
        targetDateOffset: 90,
        context: {
            currentFrequency: 'Studied in high school but haven\'t practiced in years',
            biggestBlocker: 'Remembering vocabulary and staying consistent',
            currentStatus: 'Beginner - relearning basics',
            notes: 'Want to be able to have conversations when traveling',
            pastEfforts: 'Used apps before but lost motivation',
        },
        checkIns: [
            { outcome: 'completed', note: '15 min Duolingo + vocabulary practice', daysAgo: 9 },
            { outcome: 'completed', note: 'Learned 10 new words today', daysAgo: 8 },
            { outcome: 'completed', note: 'Practiced conjugations', daysAgo: 6 },
            { outcome: 'partial', note: 'Quick 5 min review', daysAgo: 5 },
            { outcome: 'completed', note: 'Watched Spanish TV with subtitles', daysAgo: 4 },
            { outcome: 'completed', note: 'Had a short conversation with a native speaker!', daysAgo: 2 },
            { outcome: 'completed', note: 'Completed 2 lessons', daysAgo: 1 },
            { outcome: 'completed', note: 'Feeling more confident with pronunciation', daysAgo: 0 },
        ],
    },
];

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const config = parseArgs();

    console.log('🚀 Starting Habit Chronicle Demo Account Seeding');
    console.log('================================================\n');

    // Load environment variables
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ Missing Supabase environment variables');
        console.error('Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
        process.exit(1);
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Step 1: Sign in
    console.log('📧 Signing in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: config.email,
        password: config.password,
    });

    if (authError) {
        console.error('❌ Authentication failed:', authError.message);
        console.log('\nTip: Make sure the account exists. You may need to create it first in the app.');
        process.exit(1);
    }

    console.log('✅ Signed in as:', authData.user?.email);

    // Step 2: Upload selfie
    console.log('\n📸 Uploading selfie...');
    if (!fs.existsSync(config.selfie)) {
        console.error('❌ Selfie file not found:', config.selfie);
        process.exit(1);
    }

    const selfieBuffer = fs.readFileSync(config.selfie);
    const selfieExt = path.extname(config.selfie);
    const fileName = `${authData.user!.id}/${Date.now()}${selfieExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, selfieBuffer, {
            contentType: `image/${selfieExt.replace('.', '')}`,
            upsert: true,
        });

    if (uploadError) {
        console.error('❌ Failed to upload selfie:', uploadError.message);
        process.exit(1);
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
    const selfiePublicUrl = urlData.publicUrl;

    console.log('✅ Selfie uploaded:', selfiePublicUrl);

    // Step 3: Update user profile with avatar and Plus subscription
    console.log('\n👤 Updating user profile...');
    const { error: profileError } = await supabase
        .from('users')
        .update({
            avatar_url: selfiePublicUrl,
            subscription_tier: 'plus',
            display_name: 'Demo User',
            age_range: '25-34',
            bio: 'Building better habits, one day at a time',
        })
        .eq('id', authData.user!.id);

    if (profileError) {
        console.error('⚠️ Failed to update profile:', profileError.message);
    } else {
        console.log('✅ Profile updated with Plus subscription');
    }

    // Step 4: Create goals with check-ins
    console.log('\n🎯 Creating demo goals with AI-generated content...\n');

    for (let i = 0; i < DEMO_GOALS.length; i++) {
        const goalConfig = DEMO_GOALS[i];
        const goalNum = i + 1;

        console.log(`\n${'='.repeat(60)}`);
        console.log(`📚 Goal ${goalNum}/3: ${goalConfig.title}`);
        console.log(`${'='.repeat(60)}\n`);

        // Calculate target date
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + goalConfig.targetDateOffset);

        // Create goal and origin chapter
        console.log('  🌟 Creating goal and generating origin story...');
        const { data: goalData, error: goalError } = await supabase.functions.invoke(
            'create-goal-and-origin',
            {
                body: {
                    title: goalConfig.title,
                    description: goalConfig.description,
                    target_date: targetDate.toISOString().split('T')[0],
                    cadence: goalConfig.cadence,
                    theme: goalConfig.theme,
                    selfie_public_url: selfiePublicUrl,
                    context_current_frequency: goalConfig.context?.currentFrequency,
                    context_biggest_blocker: goalConfig.context?.biggestBlocker,
                    context_current_status: goalConfig.context?.currentStatus,
                    context_notes: goalConfig.context?.notes,
                    context_past_efforts: goalConfig.context?.pastEfforts,
                },
            }
        );

        if (goalError) {
            console.error('  ❌ Failed to create goal:', goalError);
            continue;
        }

        const goal = goalData.goal;
        const originChapter = goalData.originChapter;

        console.log(`  ✅ Goal created: ${goal.id}`);
        console.log(`  ✅ Origin chapter: "${originChapter.chapter_title}"`);
        console.log(`  ⏳ Waiting for AI image generation (async)...`);

        // Wait a bit for the origin image to generate
        await sleep(5000);

        // Check if image was generated
        const { data: updatedOrigin } = await supabase
            .from('chapters')
            .select('image_url')
            .eq('id', originChapter.id)
            .single();

        if (updatedOrigin?.image_url) {
            console.log(`  ✅ Origin image generated!`);
        } else {
            console.log(`  ⏳ Origin image still generating (check back later)`);
        }

        // Create check-ins
        console.log(`\n  📝 Creating ${goalConfig.checkIns.length} check-ins...`);

        for (let j = 0; j < goalConfig.checkIns.length; j++) {
            const checkIn = goalConfig.checkIns[j];
            const checkInNum = j + 1;

            // Calculate check-in date
            const checkInDate = new Date();
            checkInDate.setDate(checkInDate.getDate() - checkIn.daysAgo);
            const dateStr = checkInDate.toISOString().split('T')[0];

            process.stdout.write(`    [${checkInNum}/${goalConfig.checkIns.length}] ${checkIn.outcome} (${checkIn.daysAgo} days ago)... `);

            const { data: checkInData, error: checkInError } = await supabase.functions.invoke(
                'check-in',
                {
                    body: {
                        goal_id: goal.id,
                        outcome: checkIn.outcome,
                        note: checkIn.note,
                        checkin_date: dateStr,
                    },
                }
            );

            if (checkInError) {
                console.log('❌ Failed');
                console.error('      Error:', checkInError);
            } else {
                const chapter = checkInData.chapter;
                console.log(`✅ "${chapter.chapter_title}"`);
            }

            // Small delay to avoid rate limiting
            await sleep(2000);
        }

        console.log(`\n  ✅ Completed ${goalConfig.title}`);
        console.log(`  📊 Final streak: ${goalConfig.checkIns.filter((c, idx) => idx >= goalConfig.checkIns.length - 7 && (c.outcome === 'completed' || c.outcome === 'partial')).length} days`);

        // Longer delay between goals to allow images to generate
        if (i < DEMO_GOALS.length - 1) {
            console.log('\n  ⏸️  Waiting 10 seconds before next goal...');
            await sleep(10000);
        }
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('🎉 Demo Account Seeding Complete!');
    console.log('='.repeat(60));
    console.log('\n📋 Summary:');
    console.log(`   ✅ Account: ${config.email}`);
    console.log(`   ✅ Subscription: Plus`);
    console.log(`   ✅ Avatar: Uploaded`);
    console.log(`   ✅ Goals created: ${DEMO_GOALS.length}`);
    console.log(`   ✅ Total chapters: ${DEMO_GOALS.reduce((sum, g) => sum + g.checkIns.length + 1, 0)}`);
    console.log('\n💡 Next Steps:');
    console.log('   1. Open the app and sign in with the demo account');
    console.log('   2. Wait a few minutes for all AI images to finish generating');
    console.log('   3. Capture screenshots and videos for the App Store');
    console.log('\n🎬 Ready for your App Store submission!\n');
}

main().catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
