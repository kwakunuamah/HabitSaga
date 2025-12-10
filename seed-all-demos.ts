/**
 * Seed Multiple Demo Accounts for App Store Screenshots
 * 
 * Cost-optimized version: 3 goals with 3 chapters each per account
 * 
 * Usage:
 *   npx tsx seed-all-demos.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config({ path: '.env.local' });

// Types
type Outcome = 'completed' | 'partial' | 'missed';
type ThemeType = 'superhero' | 'fantasy' | 'scifi' | 'anime' | 'noir' | 'pop_regency' | 'action_adventure';
type Cadence = 'daily' | 'weekly' | { custom: { days_per_week: number } };

interface GoalConfig {
    title: string;
    description: string;
    theme: ThemeType;
    cadence: Cadence;
    targetDateOffset: number;
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

interface DemoAccount {
    email: string;
    password: string;
    selfie: string;
    displayName: string;
    goals: GoalConfig[];
}

// Demo account configurations
const DEMO_ACCOUNTS: DemoAccount[] = [
    {
        email: 'demo1@demo.com',
        password: 'test1234$',
        selfie: './DemoAssets/demo1.jpg',
        displayName: 'Alex Chen',
        goals: [
            {
                title: 'Exercise Daily',
                description: 'Build strength and endurance through consistent workouts',
                theme: 'superhero',
                cadence: 'daily',
                targetDateOffset: 30,
                context: {
                    currentFrequency: 'I exercise 2-3 times per week',
                    biggestBlocker: 'Finding time in my busy schedule',
                    currentStatus: 'Beginner - building consistency',
                },
                checkIns: [
                    { outcome: 'completed', note: '30 min morning workout!', daysAgo: 2 },
                    { outcome: 'completed', note: 'Pushed through - felt great', daysAgo: 1 },
                    { outcome: 'completed', note: 'New personal best!', daysAgo: 0 },
                ],
            },
            {
                title: 'Read 10 Books',
                description: 'Expand knowledge through daily reading',
                theme: 'fantasy',
                cadence: 'daily',
                targetDateOffset: 90,
                context: {
                    currentFrequency: 'Read 1-2 books per year',
                    biggestBlocker: 'Screen time distractions',
                },
                checkIns: [
                    { outcome: 'completed', note: '20 pages before bed', daysAgo: 2 },
                    { outcome: 'partial', note: 'Only 5 pages today', daysAgo: 1 },
                    { outcome: 'completed', note: 'Finished chapter 3!', daysAgo: 0 },
                ],
            },
            {
                title: 'Meditation Practice',
                description: 'Daily mindfulness and meditation',
                theme: 'anime',
                cadence: 'daily',
                targetDateOffset: 60,
                checkIns: [
                    { outcome: 'completed', note: '10 min morning meditation', daysAgo: 2 },
                    { outcome: 'completed', note: 'Feeling more centered', daysAgo: 1 },
                    { outcome: 'completed', note: 'Best session yet', daysAgo: 0 },
                ],
            },
        ],
    },
    {
        email: 'demo2@demo.com',
        password: 'test1234$',
        selfie: './DemoAssets/demo2.jpg',
        displayName: 'Jordan Martinez',
        goals: [
            {
                title: 'Learn Guitar',
                description: 'Practice guitar daily to master basics',
                theme: 'action_adventure',
                cadence: 'daily',
                targetDateOffset: 90,
                context: {
                    currentFrequency: 'Complete beginner',
                    biggestBlocker: 'Finger pain and frustration',
                },
                checkIns: [
                    { outcome: 'completed', note: 'Practiced chords for 20 min', daysAgo: 2 },
                    { outcome: 'partial', note: 'Quick 10 min practice', daysAgo: 1 },
                    { outcome: 'completed', note: 'Nailed the G chord!', daysAgo: 0 },
                ],
            },
            {
                title: 'Morning Routine',
                description: 'Consistent 6am wake up and routine',
                theme: 'superhero',
                cadence: 'daily',
                targetDateOffset: 30,
                checkIns: [
                    { outcome: 'completed', note: 'Up at 6am - feeling energized', daysAgo: 2 },
                    { outcome: 'missed', note: 'Overslept - need better alarm', daysAgo: 1 },
                    { outcome: 'completed', note: 'Back on track!', daysAgo: 0 },
                ],
            },
            {
                title: 'Healthy Eating',
                description: 'Cook healthy meals at home',
                theme: 'fantasy',
                cadence: { custom: { days_per_week: 5 } },
                targetDateOffset: 60,
                checkIns: [
                    { outcome: 'completed', note: 'Made a great salad', daysAgo: 2 },
                    { outcome: 'completed', note: 'Meal prepped for the week', daysAgo: 1 },
                    { outcome: 'completed', note: 'Trying new recipes', daysAgo: 0 },
                ],
            },
        ],
    },
    {
        email: 'demo3@demo.com',
        password: 'test1234$',
        selfie: './DemoAssets/demo3.jpg',
        displayName: 'Sam Taylor',
        goals: [
            {
                title: 'Learn Spanish',
                description: 'Practice Spanish daily for fluency',
                theme: 'noir',
                cadence: 'daily',
                targetDateOffset: 90,
                context: {
                    currentFrequency: 'Studied in high school',
                    biggestBlocker: 'Remembering vocabulary',
                },
                checkIns: [
                    { outcome: 'completed', note: '15 min Duolingo session', daysAgo: 2 },
                    { outcome: 'completed', note: 'Learned 10 new words', daysAgo: 1 },
                    { outcome: 'completed', note: 'Had my first conversation!', daysAgo: 0 },
                ],
            },
            {
                title: 'Write Daily',
                description: 'Journal and creative writing practice',
                theme: 'pop_regency',
                cadence: 'daily',
                targetDateOffset: 60,
                checkIns: [
                    { outcome: 'completed', note: 'Wrote 500 words', daysAgo: 2 },
                    { outcome: 'partial', note: 'Quick journal entry', daysAgo: 1 },
                    { outcome: 'completed', note: 'Finished a short story!', daysAgo: 0 },
                ],
            },
            {
                title: 'Yoga Practice',
                description: 'Daily yoga for flexibility and peace',
                theme: 'anime',
                cadence: 'daily',
                targetDateOffset: 30,
                checkIns: [
                    { outcome: 'completed', note: '20 min morning flow', daysAgo: 2 },
                    { outcome: 'completed', note: 'Feeling more flexible', daysAgo: 1 },
                    { outcome: 'completed', note: 'Nailed a new pose!', daysAgo: 0 },
                ],
            },
        ],
    },
    {
        email: 'demo4@demo.com',
        password: 'test1234$',
        selfie: './DemoAssets/demo4.jpg',
        displayName: 'Riley Kim',
        goals: [
            {
                title: 'Code Every Day',
                description: 'Build coding skills through daily practice',
                theme: 'scifi',
                cadence: 'daily',
                targetDateOffset: 90,
                context: {
                    currentFrequency: 'Learning to code',
                    biggestBlocker: 'Complex concepts',
                },
                checkIns: [
                    { outcome: 'completed', note: 'Completed 2 coding challenges', daysAgo: 2 },
                    { outcome: 'partial', note: 'Struggled but learned', daysAgo: 1 },
                    { outcome: 'completed', note: 'Built my first app!', daysAgo: 0 },
                ],
            },
            {
                title: 'Running Streak',
                description: 'Run every day to build endurance',
                theme: 'action_adventure',
                cadence: 'daily',
                targetDateOffset: 30,
                checkIns: [
                    { outcome: 'completed', note: '3 mile morning run', daysAgo: 2 },
                    { outcome: 'completed', note: 'Beat my personal record!', daysAgo: 1 },
                    { outcome: 'completed', note: 'Feeling unstoppable', daysAgo: 0 },
                ],
            },
            {
                title: 'Photography Project',
                description: 'Take one photo every day',
                theme: 'noir',
                cadence: 'daily',
                targetDateOffset: 60,
                checkIns: [
                    { outcome: 'completed', note: 'Captured a beautiful sunset', daysAgo: 2 },
                    { outcome: 'completed', note: 'Street photography session', daysAgo: 1 },
                    { outcome: 'completed', note: 'My best shot yet!', daysAgo: 0 },
                ],
            },
        ],
    },
];

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function seedAccount(account: DemoAccount, accountNum: number, totalAccounts: number) {
    console.log('\n' + '='.repeat(70));
    console.log(`📱 ACCOUNT ${accountNum}/${totalAccounts}: ${account.displayName} (${account.email})`);
    console.log('='.repeat(70));

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Step 1: Sign in
    console.log('\n📧 Signing in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
    });

    if (authError) {
        console.error('❌ Authentication failed:', authError.message);
        throw authError;
    }

    console.log('✅ Signed in');

    // Step 2: Upload selfie
    console.log('\n📸 Uploading selfie...');
    if (!fs.existsSync(account.selfie)) {
        throw new Error(`Selfie not found: ${account.selfie}`);
    }

    const selfieBuffer = fs.readFileSync(account.selfie);
    const selfieExt = path.extname(account.selfie);
    const fileName = `${authData.user!.id}/${Date.now()}${selfieExt}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, selfieBuffer, {
            contentType: selfieExt === '.jpg' ? 'image/jpeg' : `image/${selfieExt.replace('.', '')}`,
            upsert: true,
        });

    if (uploadError) {
        throw new Error(`Failed to upload selfie: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
    const selfiePublicUrl = urlData.publicUrl;

    console.log('✅ Selfie uploaded');

    // Step 3: Update profile
    console.log('\n👤 Updating profile...');
    const { error: profileError } = await supabase
        .from('users')
        .update({
            avatar_url: selfiePublicUrl,
            subscription_tier: 'plus',
            display_name: account.displayName,
            age_range: '25-34',
        })
        .eq('id', authData.user!.id);

    if (profileError) {
        console.warn('⚠️ Profile update warning:', profileError.message);
    } else {
        console.log('✅ Profile updated (Plus tier)');
    }

    // Step 4: Create goals
    console.log(`\n🎯 Creating ${account.goals.length} goals...\n`);

    for (let i = 0; i < account.goals.length; i++) {
        const goalConfig = account.goals[i];
        const goalNum = i + 1;

        console.log(`  [${'▓'.repeat(goalNum)}${'░'.repeat(account.goals.length - goalNum)}] Goal ${goalNum}/${account.goals.length}: ${goalConfig.title}`);

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + goalConfig.targetDateOffset);

        // Create goal and origin
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
            console.error(`    ❌ Failed:`, goalError);
            continue;
        }

        const goal = goalData.goal;
        console.log(`    ✅ Created (${goalConfig.theme} theme)`);

        // Create check-ins
        for (let j = 0; j < goalConfig.checkIns.length; j++) {
            const checkIn = goalConfig.checkIns[j];
            const checkInDate = new Date();
            checkInDate.setDate(checkInDate.getDate() - checkIn.daysAgo);

            const { error: checkInError } = await supabase.functions.invoke('check-in', {
                body: {
                    goal_id: goal.id,
                    outcome: checkIn.outcome,
                    note: checkIn.note,
                    checkin_date: checkInDate.toISOString().split('T')[0],
                },
            });

            if (checkInError) {
                console.error(`    ❌ Check-in ${j + 1} failed:`, checkInError);
            }

            await sleep(1500); // Throttle to avoid rate limits
        }

        console.log(`    ✅ ${goalConfig.checkIns.length} check-ins completed`);
        await sleep(3000); // Pause between goals
    }

    console.log(`\n✅ Account ${accountNum} complete!\n`);
}

async function main() {
    console.log('🚀 Habit Chronicle - Batch Demo Account Seeding');
    console.log('================================================');
    console.log(`📊 Seeding ${DEMO_ACCOUNTS.length} accounts`);
    console.log(`📈 ${DEMO_ACCOUNTS[0].goals.length} goals per account`);
    console.log(`📝 ${DEMO_ACCOUNTS[0].goals[0].checkIns.length} chapters per goal`);
    console.log(`⏱️  Estimated time: ${DEMO_ACCOUNTS.length * 3}-${DEMO_ACCOUNTS.length * 5} minutes\n`);

    const startTime = Date.now();

    for (let i = 0; i < DEMO_ACCOUNTS.length; i++) {
        try {
            await seedAccount(DEMO_ACCOUNTS[i], i + 1, DEMO_ACCOUNTS.length);
        } catch (error) {
            console.error(`\n❌ Failed to seed account ${i + 1}:`, error);
            console.log('Continuing with next account...\n');
        }

        // Pause between accounts
        if (i < DEMO_ACCOUNTS.length - 1) {
            console.log('⏸️  Pausing 5 seconds before next account...\n');
            await sleep(5000);
        }
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    console.log('\n' + '='.repeat(70));
    console.log('🎉 ALL ACCOUNTS SEEDED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log(`\n⏱️  Total time: ${minutes}m ${seconds}s`);
    console.log(`\n📋 Summary:`);
    DEMO_ACCOUNTS.forEach((account, i) => {
        console.log(`   ${i + 1}. ${account.displayName} (${account.email})`);
        console.log(`      - ${account.goals.length} goals created`);
        console.log(`      - ${account.goals.length * (account.goals[0].checkIns.length + 1)} total chapters`);
        console.log(`      - Themes: ${account.goals.map(g => g.theme).join(', ')}`);
    });
    console.log('\n💡 Next Steps:');
    console.log('   1. Wait 5-10 minutes for AI images to generate');
    console.log('   2. Sign in to each account to verify');
    console.log('   3. Capture screenshots using /capture-app-store-media');
    console.log('\n🎬 Ready for App Store submission!\n');
}

main().catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
