

## **1\. Refining the model: from “big goal” → “Habit Plan” → check-ins**

### **A. Big goal vs Habit Plan**

Right now you have:

* User gives **big goal**:

  * “Save $2,000”  
  * “Quit vaping”  
  * “Read 10 books this year”

* You collect:

  * Some **context** (what they’ve tried, blockers).  
  * **Soft target date**  
  * **Cadence** (daily / 3× week / weekly).

What’s missing is a concrete **Habit Plan**: a small set of **tiny, repeatable actions** that actually move the needle.

From habit science:

* Implementation intentions \= “If situation X, then I will do behavior Y.”  
* Habit stacking \= “After \[current habit\], I will \[new habit\].”  
* Tiny habits \= start **very small** so it doesn’t rely on motivation.

So for each goal, Gemini should generate **1–3 core habits** with:

* A **specific behavior** (what to do).  
* A **cue** (time, place, or habit stack).  
* A **tiny version** (minimum viable action).  
* A **full version** (what “success” looks like when they’re on a roll).

Examples:

* **Goal:** Read 10 books this year

  * Habit 1: “I will read \[5 pages\] at \[10pm\] in \[bedroom\] after I plug in my phone.”

    * Tiny version: “Read 2 pages.”

    * Full version: “Read 10+ pages.”

* **Goal:** Quit vaping

  * Habit 1: “If I feel an urge to vape at home, I will drink a glass of water and do 10 slow breaths.”

    * Tiny version: “3 slow breaths.”  
    * Full version: “Glass of water \+ short walk.”

* **Goal:** Save $2,000

  * Habit 1: “Every payday, at 9am, I will move $X into my savings account.”

    * Tiny: “Even $5.”  
    * Full: “Target transfer amount.”

This “Habit Plan” becomes a structured object attached to the goal.

---

### **B. What actually happens *during* a check-in**

For each check-in, the app should:

1. **Determine which tasks are “due”**

   * Based on:

     * Goal’s cadence (daily / 3× / weekly).  
     * Each habit’s schedule (some may be weekly, some daily).  
     * Target date so you know you’re on pace.

2. **Show due tasks as a checklist**  
    For each habit in today’s plan:

   * “Did you complete this?” with options:

     * ✅ Full  
     * 🌓 Tiny version only  
     * ❌ Not at all

3. **Collect 1 small reflection** (only once per check-in, not per task)

   * If mostly ✅:

     * Optional note: “Anything you want to remember about today’s win?”

   * If any ❌ or mostly ❌:

     * “What got in the way most?” (time / energy / forgot / unexpected event)

     * “What’s one small adjustment you want to try?” (tiny free text)

4. **Backend: use that to update the story \+ the plan**

   * Feed into Gemini:

     * Big goal  
     * Habit Plan (tasks \+ cues)  
     * Today’s outcomes (full/tiny/missed)  
     * Barrier \+ adjustment note  
     * Previous saga summary

   * Gemini returns:

     * New **chapter title \+ text**  
     * Updated **saga summary**  
     * 1–2 **coach tips** (encouragement \+ maybe “if-then” adjustment)  
     * Optional suggestion to **shrink/shift a habit** if they’ve missed it multiple times.

       * This mirrors research that if-then plans can be revised when feedback shows they don’t help .

5. **(Sometimes) update the Habit Plan itself**

   * Example adaptive rules:

     * If user misses the same habit 3+ times:  
       * Make the default “tiny version” smaller and change the cue (“after lunch” → “after morning coffee”).

     * If user consistently does more than full version:  
       * Increase full target gently (e.g., 5 → 8 pages).

6. **Generate image if allowed**

   * Apply your existing quota rules (Free vs Plus vs Premium).

7. **Update progress metrics**

   * For each habit: count full vs tiny vs missed.  
   * For the goal: completion rate of planned tasks, streak, etc.

So the **check-in screen** is no longer just “yes/partly/no” in a vacuum – it’s:

“Here are the 1–3 tiny actions we agreed on. Did you do them? How much? What got in the way?”

That’s exactly how implementation intentions and tiny habits are meant to be used: a specific plan whose execution you repeatedly evaluate and tweak.

---

## **2\. Antigravity prompt: generate \+ wire “Habit Plan” and task-based check-ins**

Here’s a prompt you can paste into Antigravity / Gemini. It assumes your existing stack (Expo RN \+ Supabase \+ Gemini) and builds on the earlier specs we wrote.

You can title this something like:  
 **“Habit Plan \+ Task-Based Check-Ins”**

You are upgrading the Habit Saga app to make check-ins truly behavior-based, grounded in habit science concepts from Atomic Habits (implementation intentions, habit stacking) and Tiny Habits (tiny, easy actions).

The app already has:

\- Onboarding and profile creation  
\- First goal (“Saga”) creation:  
  \- User goal text  
  \- Context questions  
  \- Soft target date  
  \- Cadence (daily / 3x per week / weekly)  
  \- Theme selection  
  \- Origin chapter \+ optional origin image  
\- Tables (or equivalent):  
  \- users  
  \- goals  
  \- chapters  
  \- usage\_panels  
  \- subscriptions  
\- Edge Functions:  
  \- create\_goal\_and\_origin (already implemented)  
  \- check\_in\_and\_generate\_chapter (exists in some form)  
\- AI stack:  
  \- Gemini 2.5 Flash/Flash-Lite for text  
  \- Gemini 3 Pro Image Preview for images  
\- Image quotas per month per user:  
  \- Free: 4  
  \- Plus: 10  
  \- Premium: 30

Your job: implement a \*\*Habit Plan\*\* system and \*\*task-based check-ins\*\*, without breaking existing flows.

\========================================  
1\. DEFINE THE “HABIT PLAN” MODEL  
\========================================

\#\#\# 1.1 Habit Plan concept

For each goal, we now maintain a structured Habit Plan, made up of 1–3 small, repeatable tasks (“habits”) designed to help the user reach the bigger goal.

Each habit should include:

\- id: stable identifier (string/UUID)  
\- label: short description (e.g., “Read 5 pages of your book”)  
\- tiny\_version: even smaller version (e.g., “Read 2 pages”)  
\- full\_version: description of what “full” success means (e.g., “Read 10+ pages”)  
\- cue\_type: "time\_location" | "habit\_stack"  
\- if\_then: implementation intention phrase, e.g.,  
  \- "If it is 10pm and I am in bed, then I will read 5 pages."  
\- habit\_stack (optional): e.g., "After I plug in my phone, I will open my book."  
\- suggested\_frequency: "daily" | "three\_per\_week" | "weekly"  
\- difficulty: integer or small enum (1 \= very easy, 5 \= hard)  
\- active: boolean (may be toggled off later)  
\- metrics (may be updated over time):  
  \- total\_full\_completions  
  \- total\_tiny\_completions  
  \- total\_missed

Implementation detail:  
\- Store Habit Plan either as:  
  \- A dedicated table \`goal\_tasks\` linked to \`goals\`, OR  
  \- A JSONB column \`goals.habit\_plan\` if that’s simpler.  
\- For MVP, JSONB is acceptable, but ensure a clear TypeScript type in the front-end.

\#\#\# 1.2 Habit Plan generation (backend)

Extend \`create\_goal\_and\_origin\` Edge Function to:

1\. After the goal is created and you have:  
   \- goal text  
   \- context answers  
   \- target\_date  
   \- cadence  
   \- user profile (age range, focus area)  
2\. Call Gemini 2.5 Flash(-Lite) with a structured prompt to generate a Habit Plan JSON:  
   \- Input:  
     \- Big goal text  
     \- Context (what they’ve tried, biggest barrier, etc.)  
     \- Cadence and target date  
     \- Any useful user profile info (age\_range, focus area)  
   \- Instruct Gemini to:  
     \- Propose 1–3 habits.  
     \- Use \*\*small, realistic actions\*\* (tiny habits).  
     \- Express cues using either time/location or habit stacking:  
       \- “I will \[behavior\] at \[time\] in \[location\].”  
       \- OR “After \[existing habit\], I will \[new habit\].”  
   \- Output: Habit Plan JSON matching the schema above.  
3\. Validate and store the Habit Plan in the DB with the goal.

Return the Habit Plan as part of the \`create\_goal\_and\_origin\` payload to the client as well.

\========================================  
2\. CHECK-IN FLOW: TASK-BASED UX  
\========================================

We are replacing the generic “Yes / Partly / No” check-in with a \*\*task-based check-in\*\* that is still simple but grounded in the Habit Plan.

\#\#\# 2.1 Front-end: Check-in screen

When the user taps “Check in” for a goal:

1\. Fetch:  
   \- The goal  
   \- Its Habit Plan  
   \- Basic progress info (recent chapters)

2\. Determine which tasks are “due” for this check-in:  
   \- For MVP, use a simple rule:  
     \- If goal cadence \= daily → show all active habits as due daily.  
     \- If 3x per week / weekly → still show all active habits, but we may later tune which ones appear. For now, treat them all as due when the user taps check-in.

3\. UI:

Screen: “Today’s actions for \[Goal Title\]”

For each active habit in the Habit Plan:

\- Show:  
  \- label  
  \- a shortened cue (if\_then or habit\_stack compressed to one line)  
\- Show outcome selector with three options:  
  \- ✅ Full  
  \- 🌓 Tiny only  
  \- ❌ Not at all

Below the list, show a small reflection panel:

\- If the user has at least one ✅ or 🌓:  
  \- Optional note field: "Anything you want to remember about today?"  
\- If the user has at least one ❌ (and no ✅):  
  \- Single-choice barrier field:  
    \- "What got in the way most?"  
      \- Time got away from me  
      \- Too tired / stressed  
      \- Forgot until late  
      \- Something unexpected came up  
  \- Optional short text: "What small change will you try next time?"

Buttons:  
\- Primary: "Finish check-in"  
\- Back: return to saga home without saving.

\#\#\# 2.2 Payload for backend

On "Finish check-in", call \`check\_in\_and\_generate\_chapter\` Edge Function with:

\- goal\_id  
\- per-task results:  
  \- For each habit id in plan:  
    \- outcome: "full" | "tiny" | "missed"  
\- reflection:  
  \- barrier (enum or null)  
  \- note (string or null)  
  \- tiny\_adjustment (string or null)

\========================================  
3\. BACKEND: CHECK-IN, NARRATIVE & PLAN ADJUSTMENT  
\========================================

Extend \`check\_in\_and\_generate\_chapter\` to:

\#\#\# 3.1 Save raw check-in results

1\. Auth & validate:  
   \- User owns the goal.

2\. Insert new \`chapters\` row with:  
   \- user\_id, goal\_id  
   \- chapter\_index (next integer)  
   \- date (today)  
   \- store:  
     \- ANY existing fields from prior version (outcome, etc.)  
     \- NEW fields:  
       \- tasks\_results JSON (mapping habit\_id → outcome)  
       \- barrier  
       \- note  
       \- tiny\_adjustment

3\. Optionally update aggregate metrics per habit in Habit Plan:  
   \- For each habit:  
     \- If full → increment total\_full\_completions  
     \- If tiny → increment total\_tiny\_completions  
     \- If missed → increment total\_missed  
   \- Save back to \`goals.habit\_plan\`.

\#\#\# 3.2 Call Gemini for narrative \+ tips

Call Gemini 2.5 Flash(-Lite) with:

\- Goal overview and context  
\- Habit Plan (the tasks, cues, and difficulty)  
\- Today’s per-task outcomes  
\- barrier, note, tiny\_adjustment  
\- Previous saga summary and last chapter summary

Ask it to return structured JSON:

\- chapter\_title  
\- chapter\_text  
\- new\_saga\_summary\_short  
\- new\_last\_chapter\_summary  
\- encouragement:  
  \- headline  
  \- body  
  \- micro\_plan (optional, one sentence)

Additionally, ask it to \*\*optionally propose minor Habit Plan tweaks\*\* if the user is repeatedly missing the same task (e.g., based on total\_missed vs completions). For MVP you can:

\- Provide the aggregates to the model.  
\- Let it propose changes like:  
  \- “Reduce reading target from 10 pages to 5 pages.”  
  \- “Change cue from bedtime to after dinner.”

We do NOT auto-implement these suggestions in this iteration; just show them as text in the encouragement card. (Future version can let users accept/reject changes.)

Update DB:

\- Update the new \`chapters\` row with chapter\_title and chapter\_text.  
\- Update \`goals.saga\_summary\_short\` and \`goals.last\_chapter\_summary\`.

If Gemini fails:  
\- Fall back to generic text based on task outcomes.

\#\#\# 3.3 Image generation (unchanged rules)

Then run the existing image quota logic:

\- Check user tier & current month usage.  
\- Decide if this chapter is eligible for an image based on tier \+ chapter index.  
\- If eligible and under cap:  
  \- Call Gemini 3 Pro Image Preview with:  
    \- hero\_profile, theme\_profile  
    \- compact description of today’s progress and chapter tone.  
  \- Save to Storage \`panels/{user\_id}/{goal\_id}/chapter\_{index}.png\`.  
  \- Update chapter.image\_url and log in usage\_panels.  
\- If not eligible or over cap:  
  \- No image; text-only chapter.

Return payload:

\`\`\`ts  
{  
  goal: GoalWithHabitPlan,  
  chapter: ChapterWithTaskResults,  
  encouragement: {  
    headline: string  
    body: string  
    microPlan?: string  
  }  
}

# **\========================================**

# **4\. FRONT-END: CHAPTER REVEAL \+ UPDATED PROGRESS**

After response:

1. Show “New chapter unlocked” screen:

   * Optional image

   * chapter\_title \+ chapter\_text

   * A separate “Coach” card using encouragement fields and any suggested microPlan/tiny adjustment.

2. Update Saga Home:

   * Show:

     * Task progress summaries: e.g., "Read 5 pages" — 18 full, 6 tiny, 4 missed.

     * Streaks and completion rate based on task outcomes.

   * Existing CTA: “Check in now” or “View all chapters”.

Do NOT add heavy new navigation; integrate with existing saga home UI.

# **\========================================**

# **5\. CONSTRAINTS AND NON-GOALS**

* Do NOT redesign onboarding or goal-creation flows; they already exist.

* Do NOT expose raw Habit Plan JSON to users; show user-friendly labels and cues.

* Do NOT auto-change Habit Plan behind the scenes yet; for now, adaptation suggestions appear in “Coach” text only.

* All AI calls must stay in Edge Functions; no API keys in the client.

* All new logic should be added in small, composable functions and typed models (TypeScript) that are easy to reuse and test.

If you want, we can next iterate just on the \*\*prompt Gemini uses to generate the Habit Plan JSON\*\* (the LLM prompt inside \`create\_goal\_and\_origin\`), but this gives Antigravity the end-to-end wiring for “big goal → plan of tiny actions → task-based check-ins.”

