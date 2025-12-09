# Security Warnings Fix Guide

This document outlines the steps to fix all Supabase security warnings before App Store submission.

## ✅ Fixed via SQL Migrations

### 1. Function Search Path Mutable (17 functions)
**Status:** Fixed via migrations

**Files:**
- `supabase/migrations/20251127000000_fix_function_search_paths.sql` - Main migration
- `supabase/migrations/20251127000001_fix_remaining_search_paths.sql` - Follow-up fix

**What it does:**
- Sets `SET search_path = public, pg_catalog` on all functions
- Prevents search_path injection attacks
- Uses explicit `ALTER FUNCTION` statements to ensure the three SECURITY DEFINER functions are fixed

**To apply:**
1. Run `20251127000000_fix_function_search_paths.sql` in Supabase SQL Editor
2. If warnings persist for `get_plan_state`, `track_plan_event`, or `confirm_plan`, run `20251127000001_fix_remaining_search_paths.sql`

## ⚠️ Requires Manual Action

### 2. Extension in Public Schema (http extension)
**Status:** Known limitation - cannot be moved

**Issue:** The `http` extension is installed in the `public` schema, which is a security risk. However, the extension itself does not support `SET SCHEMA` operations.

**Why it can't be moved:**
- The `http` extension is actively used by your notification dispatcher functions
- PostgreSQL extensions that don't support schema relocation cannot be moved
- This is a limitation of the extension itself, not a permissions issue

**Solution Options:**

**Option A: Accept the Warning (Recommended)**
- This is a known limitation of the `http` extension
- The extension is required for your notification system
- Document this as an accepted risk in your security assessment
- The warning may not block App Store submission if properly documented

**Option B: Contact Supabase Support**
- Contact Supabase support to see if they have a workaround
- They may be able to suppress this specific warning for your project
- Or they may have guidance on whether this blocks App Store submission

**Option C: Alternative Implementation (Not Recommended)**
- Refactor notification dispatcher to use Supabase Edge Functions directly
- This would require significant code changes and may not be worth it

### 3. Leaked Password Protection Disabled
**Status:** Requires dashboard configuration

**Issue:** Supabase Auth can check passwords against HaveIBeenPwned.org, but it's currently disabled.

**Solution:**
1. Go to Supabase Dashboard → Authentication → Settings
2. Scroll to "Password" section
3. Enable "Check for leaked passwords" or "Leaked password protection"
4. Save changes

**Reference:** https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

### 4. Vulnerable Postgres Version
**Status:** Managed by Supabase (informational)

**Issue:** Current version `supabase-postgres-15.8.1.131` has security patches available.

**Solution:**
1. Go to Supabase Dashboard → Settings → Database
2. Check for available database upgrades
3. If an upgrade is available, schedule it during a maintenance window
4. Follow Supabase's upgrade guide: https://supabase.com/docs/guides/platform/upgrading

**Note:** This is typically managed by Supabase automatically, but you may need to manually trigger an upgrade if one is available.

## Summary Checklist

- [x] Run `20251127000000_fix_function_search_paths.sql` migration
- [ ] Run `20251127000001_fix_remaining_search_paths.sql` if needed
- [ ] Move `http` extension to `extensions` schema (via dashboard or support)
- [ ] Enable leaked password protection in Auth settings
- [ ] Check for Postgres version upgrades in dashboard
- [ ] Verify all warnings are resolved in Supabase dashboard

## Verification

After completing all steps:
1. Go to Supabase Dashboard → Database → Linter
2. Verify that all security warnings are resolved
3. Check that only informational warnings remain (if any)

## Notes

- The SQL migrations are idempotent and can be run multiple times safely
- Function search_path fixes are critical for security and should be applied before App Store submission
- Extension and password protection warnings are important but less critical than function security
- Postgres version is typically managed automatically by Supabase

