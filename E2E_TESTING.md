# End-to-End Testing Guide

Complete guide for running automated E2E tests for the HabitSaga application using Maestro.

## Overview

The E2E test suite covers the complete user journey:

1. **Onboarding** - Signup → Avatar → Profile → Tutorial
2. **Goal Creation** - Complete wizard flow with AI generation
3. **Check-ins** - All three outcomes (completed, partial, missed)
4. **Saga Finale** - Goal completion and season options
5. **New Saga** - Creating additional goals
6. **Profile Editing** - Updating user information

## Prerequisites

### 1. Install Maestro

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

After installation, restart your terminal or run:
```bash
export PATH="$PATH:$HOME/.maestro/bin"
```

Verify installation:
```bash
maestro --version
```

### 2. Setup Test User

The E2E tests use a dedicated test account:
- **Email**: `E2E@test.com`
- **Password**: `test1234$`

> [!IMPORTANT]
> **First-Time Setup Required**
> 
> 1. Start your app and manually sign up with `E2E@test.com` / `test1234$`
> 2. After signup, get the user UUID from Supabase Auth Dashboard:
>    - Go to `http://localhost:54323` (Supabase Studio)
>    - Navigate to Authentication → Users
>    - Find `E2E@test.com` and copy the UUID
> 3. Update [`supabase/e2e-seed.sql`](file:///Users/nathand/Documents/HabitSaga/supabase/e2e-seed.sql) line 20 with the actual UUID
> 4. Run the seed script: `npm run test:reset-db`

### 3. Start Supabase and App

```bash
# Terminal 1: Start Supabase
cd supabase
supabase start

# Terminal 2: Start the app
npm start
# Then press 'i' for iOS simulator or 'a' for Android emulator
```

## Running Tests

### Run All Tests

```bash
npm run test:e2e
```

This runs all individual test flows sequentially.

### Run Complete Journey Test

```bash
npm run test:e2e:complete
```

Runs the full user journey as a single test flow (fastest option).

### Run Individual Flows

```bash
# Onboarding flow
npm run test:e2e:onboarding

# Goal creation
npm run test:e2e:goal

# Check-in (completed outcome)
npm run test:e2e:checkin

# Or run any specific flow directly
maestro test .maestro/flows/04-check-in-partial.yaml
maestro test .maestro/flows/05-check-in-missed.yaml
maestro test .maestro/flows/06-saga-finale.yaml
maestro test .maestro/flows/07-new-saga.yaml
maestro test .maestro/flows/08-profile-edit.yaml
```

### Reset Test Database

Between test runs, reset the database to a clean state:

```bash
npm run test:reset-db
```

This will:
- Clean up existing E2E test data (goals, chapters, usage tracking)
- Re-seed the test goal and chapters
- Preserve the auth user account

## Test Flows Details

### 01 - Onboarding

**File**: [`.maestro/flows/01-onboarding.yaml`](file:///Users/nathand/Documents/HabitSaga/.maestro/flows/01-onboarding.yaml)

**Covers**:
- Navigate to signup
- Create account with test credentials
- Skip avatar/selfie selection
- Fill profile information
- Complete tutorial screens
- Verify landing on saga start screen

**Duration**: ~30 seconds

---

### 02 - Goal Creation

**File**: [`.maestro/flows/02-goal-creation.yaml`](file:///Users/nathand/Documents/HabitSaga/.maestro/flows/02-goal-creation.yaml)

**Covers**:
- Start goal wizard
- Select theme (Fantasy)
- Enter goal details (title, description)
- Answer context questions (frequency, blockers, past efforts, when/where, motivation)
- Set cadence and target date
- Wait for AI generation
- Verify origin reveal screen

**Duration**: ~20 seconds + AI generation time (~15 seconds)

**Note**: AI generation adds significant time; tests wait up to 15 seconds.

---

### 03-05 - Check-in Flows

**Files**:
- [`.maestro/flows/03-check-in-completed.yaml`](file:///Users/nathand/Documents/HabitSaga/.maestro/flows/03-check-in-completed.yaml)
- [`.maestro/flows/04-check-in-partial.yaml`](file:///Users/nathand/Documents/HabitSaga/.maestro/flows/04-check-in-partial.yaml)
- [`.maestro/flows/05-check-in-missed.yaml`](file:///Users/nathand/Documents/HabitSaga/.maestro/flows/05-check-in-missed.yaml)

**Covers**:

**03 - Completed**:
- Select "full" completion for all habits
- Add positive reflection note
- Verify celebratory chapter generation

**04 - Partial**:
- Select mixed outcomes (full + tiny + none)
- Identify barriers
- Suggest micro-adjustment
- Verify chapter includes micro-plan suggestion

**05 - Missed**:
- Select "none" for all habits
- Identify barrier (unexpected event)
- Add reflection note
- Verify empathetic (not judgmental) chapter

**Duration**: ~15-20 seconds each + AI generation

**Note**: Tests handle both task-based and legacy check-in flows automatically.

---

### 06 - Saga Finale

**File**: [`.maestro/flows/06-saga-finale.yaml`](file:///Users/nathand/Documents/HabitSaga/.maestro/flows/06-saga-finale.yaml)

**Covers**:
- Complete final check-in for nearly-complete goal
- Verify finale screen appears
- Check finale stats display (total chapters, streak, completion rate)
- Test both CTA buttons (Start Season 2, New Saga)

**Duration**: ~25 seconds

**Prerequisites**: Requires a goal near completion (seeded by `e2e-seed.sql`)

---

### 07 - New Saga

**File**: [`.maestro/flows/07-new-saga.yaml`](file:///Users/nathand/Documents/HabitSaga/.maestro/flows/07-new-saga.yaml)

**Covers**:
- Navigate to new saga creation
- Complete wizard with different theme (Superhero)
- Create "Exercise 5 Days a Week" goal
- Verify new saga created successfully

**Duration**: ~30 seconds + AI generation

---

### 08 - Profile Edit

**File**: [`.maestro/flows/08-profile-edit.yaml`](file:///Users/nathand/Documents/HabitSaga/.maestro/flows/08-profile-edit.yaml)

**Covers**:
- Navigate to profile tab
- Edit name and bio
- Save changes
- Verify persistence
- Test theme preferences (if available)
- Test avatar changes (if available)

**Duration**: ~15 seconds

---

## Test Configuration

Configuration is stored in [`.maestro/config.yaml`](file:///Users/nathand/Documents/HabitSaga/.maestro/config.yaml):

```yaml
appId: com.habitsaga.app
env:
  TEST_EMAIL: E2E@test.com
  TEST_PASSWORD: test1234$
  SHORT_WAIT: 2000
  MEDIUM_WAIT: 5000
  LONG_WAIT: 10000
  AI_GENERATION_WAIT: 15000
```

**Wait Times**:
- `SHORT_WAIT` (2s) - Form submissions, navigation
- `MEDIUM_WAIT` (5s) - Complex UI updates
- `LONG_WAIT` (10s) - Not currently used
- `AI_GENERATION_WAIT` (15s) - Gemini text/image generation

## Understanding Test Results

### Successful Test

```
✅ Flow completed successfully
```

All assertions passed, test completed without errors.

### Failed Test

```
❌ Flow failed
   at command <line number>:
   Expected to see "Some Text" but it was not found
```

Check:
1. Is the app running?
2. Is Supabase running?
3. Did you reset the database before running tests?
4. Are AI generation API keys set?

### View Test Recordings

Maestro automatically records videos of test runs:

```bash
open ~/.maestro/tests/
```

Navigate to the most recent timestamp folder and view the `.mp4` file.

## Troubleshooting

### Test user signup fails

**Issue**: "Email already in use" or auth errors

**Solution**: 
- The test user was already created but UUID wasn't updated in seed data
- Follow the "First-Time Setup Required" steps above

---

### Tests timeout during AI generation

**Issue**: Tests fail at "Wait for AI generation" steps

**Solution**:
- Verify `GEMINI_API_KEY` is set in `.env.local`
- Check Supabase Edge Function logs:
  ```bash
  supabase functions log create-goal-and-origin --follow
  ```
- Increase `AI_GENERATION_WAIT` in `.maestro/config.yaml` if needed

---

### "Element not found" errors

**Issue**: Tests can't find UI elements

**Solution**:
- UI text may have changed - update test flows to match actual UI
- Wait times may be too short - increase relevant wait values
- Check simulator/emulator is in correct state (not on different screen)

---

### Database state issues

**Issue**: Tests fail because data already exists or is missing

**Solution**:
```bash
npm run test:reset-db
```

Always reset database between test runs for consistent results.

---

### Maestro not found

**Issue**: `command not found: maestro`

**Solution**:
```bash
# Reinstall Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Add to PATH (choose your shell)
echo 'export PATH="$PATH:$HOME/.maestro/bin"' >> ~/.zshrc
source ~/.zshrc
```

---

## Adding New Tests

### 1. Create New Test Flow

Create a new YAML file in `.maestro/flows/`:

```yaml
appId: com.habitsaga.app
---
# Test: Your Test Name
# Covers: What this test verifies

- launchApp
- assertVisible: "Some Text"
- tapOn: "Button"
# ... more commands
```

### 2. Add npm Script (Optional)

In `package.json`:
```json
"test:e2e:yourtest": "maestro test .maestro/flows/your-test.yaml"
```

### 3. Maestro Command Reference

Common commands:
```yaml
- launchApp                          # Launch the app
- assertVisible: "Text"              # Assert text is visible
- tapOn: "Button"                    # Tap on element with text
- tapOn:                             # Tap by ID
    id: "element-id"
- inputText: "Text"                  # Type text into focused field
- swipe:                             # Swipe gesture
    direction: UP|DOWN|LEFT|RIGHT
- waitForAnimationToEnd:             # Wait for animations
    timeout: 5000
- runFlow:                           # Conditional flow
    when:
      visible: "Text"
    commands:
      - tapOn: "Button"
```

Full documentation: https://maestro.mobile.dev/reference/commands

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Start Supabase
        run: |
          cd supabase
          supabase start
          
      - name: Setup test user
        run: npm run test:reset-db
        
      - name: Install Maestro
        run: curl -Ls "https://get.maestro.mobile.dev" | bash
        
      - name: Build app
        run: npm run ios # or android
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload test recordings
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: maestro-recordings
          path: ~/.maestro/tests/
```

---

## Best Practices

1. **Reset database between runs** - Ensures consistent starting state
2. **Use specific element IDs when possible** - More reliable than text matching
3. **Add appropriate waits** - Account for animations and async operations
4. **Keep tests isolated** - Each test should be runnable independently
5. **Name tests descriptively** - Clear file names and comments
6. **Update tests when UI changes** - Keep tests in sync with app development

---

## Maintenance

### When to Update Tests

- **UI text changes** - Update `assertVisible` and `tapOn` text selectors
- **Flow changes** - Update test steps to match new user flows
- **New features** - Add new test flows for new functionality
- **Wait time adjustments** - If tests become flaky, adjust wait times

### Test Health Checklist

Run this checklist weekly:

- [ ] All tests pass on clean database
- [ ] Test recordings look correct (no weird UI glitches)
- [ ] Wait times are appropriate (not too long, not causing failures)
- [ ] New features have corresponding tests
- [ ] Documentation is up to date

---

## Additional Resources

- **Maestro Documentation**: https://maestro.mobile.dev
- **Maestro Cloud** (CI/CD): https://cloud.mobile.dev
- **Existing Manual Testing Guide**: [`TESTING_GUIDE.md`](file:///Users/nathand/Documents/HabitSaga/TESTING_GUIDE.md)
- **Supabase Local Dev**: https://supabase.com/docs/guides/cli/local-development

---

## Support

If you encounter issues with the E2E test suite:

1. Check this documentation's Troubleshooting section
2. Review Maestro logs and recordings
3. Verify Supabase and app are running correctly
4. Check that test data is properly seeded
