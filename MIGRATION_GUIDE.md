# Supabase Migration Guide

## ⚠️ Migration Conflict Detected

You have duplicate migration numbers:
- `002_add_habit_plan.sql` (**NEW** - for Habit Plan feature)
- `002_rls_policies.sql` (existing)
- `007_fix_users_rls.sql` (existing)
- `007_season2_and_notifications.sql` (existing)

## 📋 Correct Migration Order

### Option 1: Fresh Database (Recommended for Development)

If you're starting fresh or can reset your database:

```bash
# 1. Reset database (drops all data!)
cd supabase
supabase db reset

# This automatically runs migrations in alphabetical order:
# 001 → 002_add_habit_plan → 002_rls_policies → 003 → ... → 011
```

**Note:** Supabase runs migrations in **alphabetical order**, so both `002_*` files will run (habit_plan first, then rls_policies). Same for the two `007_*` files.

### Option 2: Rename Migrations (Clean Approach)

Renumber to avoid conflicts:

```bash
cd supabase/migrations

# Rename the new habit plan migration
mv 002_add_habit_plan.sql 012_add_habit_plan.sql

# Now the order is clean:
# 001 → 002 → 003 → 004 → 005 → 006 → 007(fix_users) → 007(season2) → 008 → 009 → 010 → 011 → 012
```

Then run:
```bash
supabase db reset  # Applies all migrations in order
```

### Option 3: Manual Migration (Production/Existing Data)

If you have existing data you don't want to lose:

```bash
# Apply only the new migration
psql $DATABASE_URL -f supabase/migrations/002_add_habit_plan.sql

# OR using Supabase CLI:
supabase db push
```

## 📝 Complete Migration Sequence

Here's what each migration does:

| # | File | Purpose |
|---|------|---------|
| 001 | `initial_schema.sql` | Core tables (users, goals, chapters, subscriptions) |
| 002 | `add_habit_plan.sql` | **NEW**: Adds `habit_plan` to goals, `tasks_results` to chapters |
| 002 | `rls_policies.sql` | Row Level Security policies for all tables |
| 003 | `user_trigger_and_storage.sql` | Auto-create user record, storage buckets |
| 004 | `onboarding_updates.sql` | User profile fields (display_name, age_range, bio) |
| 005 | `add_avatar_url.sql` | Adds `avatar_url` to users |
| 006 | `check_in_updates.sql` | Adds `barrier` and `retry_plan` to chapters |
| 007 | `fix_users_rls.sql` | Fixes user table RLS policies |
| 007 | `season2_and_notifications.sql` | Adds `parent_goal_id` and notification fields |
| 008 | `create_profile_rpc.sql` | RPC function for updating profiles |
| 009 | `fix_rpc_overload.sql` | Fixes RPC function signature |
| 010 | `fix_select_policy.sql` | Fixes select policy for users |
| 011 | `add_goal_context_status.sql` | Adds `context_current_status` to goals |

## ✅ Recommended Steps

**For your development environment:**

1. **Rename the new migration:**
   ```bash
   mv supabase/migrations/002_add_habit_plan.sql supabase/migrations/012_add_habit_plan.sql
   ```

2. **Reset database:**
   ```bash
   cd supabase
   supabase db reset
   ```

3. **Verify all tables exist:**
   ```bash
   supabase db diff
   ```

4. **Seed test data:**
   ```bash
   ./seed-db.sh
   ```

## 🔍 Verify Migrations

Check which migrations have been applied:

```sql
-- In psql or Supabase SQL editor:
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;
```

## 🚨 Important Notes

1. **Never modify existing migrations** - Only add new ones
2. **Use sequential numbering** - Avoid duplicates
3. **Test on local first** - Always verify before production
4. **Backup production data** - Before running migrations in prod

## 🎯 Quick Start (Fresh Setup)

If you just want to get started immediately:

```bash
# 1. Make sure Supabase is running
supabase start

# 2. Reset database (applies all migrations)
supabase db reset

# 3. Seed test data
./seed-db.sh

# 4. Verify
supabase db diff  # Should show "No schema changes detected"
```

Done! Your database is now ready with all migrations applied and test data loaded.
