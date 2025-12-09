# Security Warnings - Manual Fixes Required

This document outlines the remaining Supabase security warnings that require manual intervention via the Supabase dashboard or support tickets.

## ✅ Automated Fixes Applied

The following security warnings have been **automatically fixed** via migrations:

1. ✅ **function_search_path_mutable** - Fixed in:
   - `20251121000001_fix_update_completed_function_search_path.sql`
   - `017_fix_function_search_paths.sql` (update_updated_at_column, handle_new_user, delete_user_account)
2. ✅ **RLS performance warnings** - Fixed in migration `20251121000000_denormalize_user_id_to_date_plan_steps.sql`

---

## ⚠️ Manual Fixes Required

### 1. Enable Leaked Password Protection

**Warning ID:** `auth_leaked_password_protection`
**Severity:** WARN
**Category:** SECURITY

**Description:**
Supabase Auth can prevent users from using passwords that have been compromised in known data breaches by checking against the HaveIBeenPwned.org database. This feature is currently disabled.

**How to Fix:**

1. Log into your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project
3. Go to **Authentication** → **Providers** (in the left sidebar)
4. Scroll down to **Password Security** section
5. Enable the toggle for **"Check passwords against HaveIBeenPwned"**
6. Click **Save**

**Expected Result:**
Users will be prevented from using passwords that appear in known breach databases, significantly improving account security.

**Reference:**
https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

---

### 2. Move HTTP Extension from Public Schema

**Warning ID:** `extension_in_public`
**Severity:** WARN
**Category:** SECURITY

**Description:**
The `http` extension is currently installed in the `public` schema. Best practice is to install extensions in a dedicated schema (e.g., `extensions`) to prevent potential schema pollution and security issues.

**Why This Requires Manual Action:**
Moving extensions between schemas requires superuser privileges, which are not available in standard Supabase migrations.

**How to Fix:**

**Option A: Via Supabase Dashboard (if available)**
1. Log into your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Database** → **Extensions**
3. Look for the `http` extension
4. If there's an option to change the schema, select `extensions` or another non-public schema
5. Save changes

**Option B: Contact Supabase Support**
1. Submit a support ticket at [Supabase Support](https://supabase.com/dashboard/support)
2. Request: "Please move the `http` extension from the `public` schema to the `extensions` schema"
3. Provide your project reference ID

**Expected Result:**
The `http` extension will be installed in a dedicated schema, following security best practices.

**Reference:**
https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public

**Note:**
Migration `20251127000001_fix_remaining_search_paths.sql` (lines 27-54) attempted this fix but requires superuser privileges:
```sql
-- This migration attempted the fix but requires superuser privileges
ALTER EXTENSION http SET SCHEMA extensions;
```

---

### 3. Upgrade PostgreSQL Version

**Warning ID:** `vulnerable_postgres_version`
**Severity:** WARN
**Category:** SECURITY

**Description:**
Your PostgreSQL version (`supabase-postgres-15.8.1.131`) has outstanding security patches available. Upgrading ensures you have the latest security fixes.

**How to Fix:**

Supabase typically handles PostgreSQL upgrades automatically during maintenance windows. However, you can request or schedule an upgrade:

1. Log into your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Settings** → **Infrastructure**
3. Check if there's an available upgrade option
4. If not available:
   - Contact Supabase support to request a scheduled upgrade
   - Or wait for the automatic upgrade during the next maintenance window

**Important Considerations:**
- Schedule upgrades during low-traffic periods
- Test in a staging environment first if possible
- Review the PostgreSQL release notes for any breaking changes

**Expected Result:**
Your database will be running the latest secure version of PostgreSQL with all security patches applied.

**Reference:**
https://supabase.com/docs/guides/platform/upgrading

---

## Summary of Security Posture

| Warning | Status | Action Required |
|---------|--------|----------------|
| function_search_path_mutable | ✅ Fixed | None - Migration applied |
| RLS performance | ✅ Fixed | None - Migration applied |
| auth_leaked_password_protection | ⚠️ Manual | Enable in Dashboard |
| extension_in_public | ⚠️ Manual | Contact Support |
| vulnerable_postgres_version | ⚠️ Manual | Dashboard or Support |

**Priority:**
1. **HIGH**: Enable leaked password protection (5 min via dashboard)
2. **MEDIUM**: Upgrade PostgreSQL (scheduled with Supabase)
3. **LOW**: Move HTTP extension (optional, requires support ticket)

---

## Verification

After applying manual fixes, you can verify the security warnings are resolved by:

1. Running the Supabase database linter
2. Checking the Dashboard → **Database** → **Advisors** section
3. Confirming the warnings no longer appear in the linter output
