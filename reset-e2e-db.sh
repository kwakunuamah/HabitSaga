#!/bin/bash

# Reset E2E Test Database
# This script resets the database to a clean state for E2E testing

set -e  # Exit on error

echo "🔄 Resetting E2E test database..."

# Check if Supabase is running
if ! supabase status &>/dev/null; then
    echo "❌ Supabase is not running. Please start it with 'supabase start'"
    exit 1
fi

# Get database URL
DB_URL=$(supabase status | grep 'DB URL' | awk '{print $3}')

if [ -z "$DB_URL" ]; then
    echo "❌ Could not find database URL"
    exit 1
fi

echo "📍 Using database: $DB_URL"

# Clean up existing E2E test data
echo "🧹 Cleaning up existing E2E test data..."
psql "$DB_URL" <<SQL
-- Delete chapters for E2E test goals
DELETE FROM public.chapters 
WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid;

-- Delete goals for E2E test user
DELETE FROM public.goals 
WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid;

-- Delete usage tracking for E2E test user
DELETE FROM public.usage_panels 
WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid;

-- Note: We don't delete the user record as it's linked to auth
-- The seed script will update it instead
SQL

echo "✅ Cleanup complete"

# Run E2E seed data
echo "🌱 Seeding E2E test data..."
psql "$DB_URL" < supabase/e2e-seed.sql

echo "✅ E2E database reset complete!"
echo ""
echo "You can now run E2E tests with:"
echo "  npm run test:e2e"
