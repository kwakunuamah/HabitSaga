#!/bin/bash

# Habit Saga - Seed Database Script
# This script sets up test data for end-to-end testing

set -e

echo "🌱 Seeding Habit Saga database..."

# Check if supabase is running
if ! supabase status &> /dev/null; then
    echo "❌ Supabase is not running. Starting..."
    supabase start
fi

# Get the database URL
DB_URL=$(supabase status | grep "DB URL" | awk '{print $3}')

if [ -z "$DB_URL" ]; then
    echo "❌ Could not get database URL"
    exit 1
fi

echo "📊 Database URL: $DB_URL"

# Run the seed file
echo "📝 Running seed.sql..."
psql "$DB_URL" -f supabase/seed.sql

echo ""
echo "✅ Seed data inserted successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Sign up in the app with: test@habitsaga.com"
echo "2. Copy your auth user ID from Supabase dashboard"
echo "3. Update user_id in supabase/seed.sql"
echo "4. Run this script again: ./seed-db.sh"
echo ""
echo "🧪 Test goal ID: 10000000-0000-0000-0000-000000000001"
echo "📖 See TESTING_GUIDE.md for full end-to-end testing scenarios"
