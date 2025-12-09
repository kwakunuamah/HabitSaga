# Testing Guide: Habit Plan End-to-End

## Prerequisites

1. **Supabase Project Running**
   ```bash
   cd supabase
   supabase start
   ```

2. **Apply Migrations**
   ```bash
   supabase db reset  # This will also run seed.sql if configured
   # OR manually:
   psql $DATABASE_URL < supabase/seed.sql
   ```

3. **Environment Variables Set**
   - `GEMINI_API_KEY` - For AI narrative and habit generation
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Test Flow

### 1. Database Seed Data

The `seed.sql` creates:
- ✅ Test user (Premium tier for full feature access)
- ✅ Goal: "Read 12 Books This Year" (Fantasy theme)
- ✅ 2 Habits:
  - "Read 5 pages before bed" (8 full, 3 tiny, 2 missed)
  - "Take reading notes" (5 full, 6 tiny, 2 missed)
- ✅ 5 Sample chapters showing all outcome types

**Important:** Update the `user_id` in `seed.sql` to match your actual auth user ID after signup.

### 2. Test Scenarios

#### Scenario A: View Existing Habit Plan

1. Open app and navigate to Saga Home for the seeded goal
2. **Verify:**
   - Habit plan section shows both habits
   - Metrics displayed: "Read 5 pages — ✅ 8  🌓 3  ❌ 2"
   - Stats show: 4 check-ins, streak, etc.
   - Recent chapters visible with correct outcomes

#### Scenario B: Create New Goal (Tests AI Generation)

1. Create new goal with details:
   ```
   Title: "Exercise 5 days a week"
   Description: "Build a consistent workout routine"
   Theme: superhero
   Cadence: 3x per week
   Target: 60 days from now
   
   Context:
   - Current frequency: "I work out maybe once a month"
   - Biggest blocker: "I'm too tired after work"
   - Past efforts: "I tried a gym membership but never went"
   ```

2. **Verify in response:**
   - ✅ Goal created with `habit_plan` array
   - ✅ 1-3 habits generated
   - Each habit has:
     - `label`, `tiny_version`, `full_version`
     - `if_then` or `habit_stack` cue
     - `suggested_frequency` matches cadence
     - Metrics initialized to 0

3. **Check AI prompt quality:**
   - Habits should be SMALL (e.g., "Do 5 pushups" not "Complete full workout")
   - Implementation intentions present ("If X, then Y")
   - Contextspecific (mentions "after work" based on blocker)

#### Scenario C: Task-Based Check-In (Tests All Outcomes)

**Test 1: All Full**
1. Navigate to check-in for your new goal
2. Select "Full" (✅) for all tasks
3. Add optional note: "Felt energized today!"
4. Submit

**Verify:**
- ✅ Chapter narrative mentions ALL tasks completed
- ✅ Encouragement is celebratory
- ✅ Metrics updated: full_completions incremented
- ✅ Image generated (if quota remaining)

**Test 2: Mixed Outcomes**
1. Check in again next day
2. Select:
   - Task 1: "Tiny" (🌓)
   - Task 2: "Full" (✅)
   - Task 3: "None" (❌)
3. Reflection shows:
   - Note field (some success)
   - Barrier selector (some missed)
   - "What small change?" field
4. Select barrier: "Too tired / stressed"
5. Write adjustment: "Try morning workouts instead"
6. Submit

**Verify:**
- ✅ Chapter narrative acknowledges partial effort
- ✅ Mentions specific tasks completed/missed
- ✅ Encouragement includes micro-plan suggestion
- ✅ Reflects user's adjustment idea
- ✅ Metrics updated correctly per task

**Test 3: All Missed**
1. Check in third day
2. Select "None" (❌) for all tasks
3. Reflection shows:
   - Barrier selector
   - "Any other thoughts?" note
4. Select barrier: "Unexpected event"
5. Submit

**Verify:**
- ✅ Chapter narrative is empathetic not judgmental
- ✅ Acknowledges setback as part of journey
- ✅ Encouragement focuses on getting back on track
- ✅ All missed counts incremented

#### Scenario D: Check Narrative Quality

For each check-in above, review the generated chapter text:

**Narrative Should:**
- ✅ Match the theme (superhero/fantasy/etc)
- ✅ Reference hero_profile details
- ✅ Mention specific habit actions
- ✅ Reflect the outcome tone (celebratory/supportive/empathetic)
- ✅ Incorporate user notes naturally
- ✅ Build on previous saga_summary
- ✅ Be engaging and story-like (not robotic)

**Red Flags:**
- ❌ Generic text that doesn't mention habits
- ❌ Tone mismatch (celebratory for missed, harsh for partial)
- ❌ Repetitive phrases across chapters
- ❌ Breaking character/theme

#### Scenario E: Image Generation Quality

**For Premium users on eligible chapters:**

1. Check which chapters should get images:
   -  Chapter 1 (origin): Always
   - Mid-journey: Every 3rd (free/plus) or 2nd (premium)

2. **Verify image generation called:**
   - Check Edge Function logs for `generatePanelImage()` call
   - Image prompt should include:
     - Theme description
     - Outcome context
     - Chapter title and key moment

3. **Image quality checks:**
   - ✅ Matches theme aesthetic
   - ✅ Reflects the chapter's mood
   - ✅ Visually engaging
   - ❌ No text/words in image (common AI artifact)

#### Scenario F: Backward Compatibility

1. Create goal WITHOUT waiting for habit plan generation
   - Or manually set `habit_plan = null` in database

2. Navigate to check-in
3. **Verify:**
   - ✅ Shows legacy "Yes/Partly/No" selector
   - ✅ No task checklist
   - ✅ Normal reflection flow
   - ✅ Check-in succeeds
   - ✅ Narrative generated (without task details)

### 3. Edge Cases to Test

**A. Habit Plan with 1 Task Only**
- Should display single task
- Reflection adapts correctly

**B. Habit Plan with 3 Tasks**
- All three show in checklist
- Metrics tracked independently

**C. Inactive Habits**
- Set `active: false` for one habit
- Should NOT appear in check-in

**D. Multiple Check-Ins Same Day**
- Try checking in twice on same date
- Should allow (updates existing or creates new chapter)

**E. Quota Exhaustion**
- For free tier: Check 5th image generation fails gracefully
- Chapter still created without image

### 4. Monitoring & Logs

**Check Supabase Function Logs:**
```bash
# Watch Edge Function logs in real-time
supabase functions log check-in --follow
supabase functions log create-goal-and-origin --follow
```

**Look for:**
- ✅ Successful Gemini API calls
- ✅ Habit plan JSON validation
- ✅ Task metrics updates
- ❌ Any error traces

**Common Issues:**
- `GEMINI_API_KEY` not set → narrative generation fails
- Malformed JSON from Gemini → check fallback logic
- Image quota errors → verify subscription tier

### 5. Performance Checks

**Goal Creation Time:**
- With habit plan: ~5-8 seconds (AI generation)
- Should show loading state in UI

**Check-In Time:**
- Task-based: ~3-5 seconds
- Should show "Saving..." state

**Edge Function Response Times:**
- `create-goal-and-origin`: < 10s
- `check-in`: < 8s
- Image generation adds ~10-15s when triggered

## Success Criteria

✅ **All scenarios pass**
✅ **AI narratives are engaging and contextual**
✅ **Images match theme and mood**
✅ **Metrics track accurately**
✅ **UI responsive and intuitive**
✅ **No errors in function logs**
✅ **Backward compatibility works**

## Troubleshooting

**Habit plan not showing?**
- Check `goal.habit_plan` in database
- Verify active tasks exist
- Look for UI console errors

**Narrative seems generic?**
- Check if context fields passed to AI
- Review Gemini prompt in `geminiText.ts`
- Verify hero_profile and theme_profile saved

**Images not generating?**
- Confirm GEMINI_API_KEY set
- Check quota limits
- Review `generatePanelImage` logs

**Task metrics not updating?**
- Verify `checkInWithTasks` called
- Check `tasks_results` in chapter table
- Review metric update logic in check-in function
