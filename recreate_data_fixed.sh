#!/bin/bash

# Recreate test users and seed data for Travel Inspirator
# This script is DESTRUCTIVE - it will recreate test data

set -e

echo "🔄 Recreating test data for Travel Inspirator..."

# Check if Supabase is running
if ! curl -s http://127.0.0.1:54321/health > /dev/null; then
    echo "Error: Supabase is not running. Please run 'supabase start' first."
    exit 1
fi

# Clear existing auth users and data
echo "🗑️ Clearing existing test data..."

docker exec supabase_db_travel-inspirator psql -U postgres -d postgres -c "
-- Delete existing test data
DELETE FROM public.photos WHERE created_by IN (SELECT id FROM auth.users WHERE email IN ('john@example.com', 'jane@example.com'));
DELETE FROM public.route_places WHERE route_id IN (SELECT id FROM public.routes WHERE created_by IN (SELECT id FROM auth.users WHERE email IN ('john@example.com', 'jane@example.com')));
DELETE FROM public.routes WHERE created_by IN (SELECT id FROM auth.users WHERE email IN ('john@example.com', 'jane@example.com'));
DELETE FROM public.places WHERE created_by IN (SELECT id FROM auth.users WHERE email IN ('john@example.com', 'jane@example.com'));
DELETE FROM public.family_members WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('john@example.com', 'jane@example.com'));
DELETE FROM public.family_groups WHERE admin_id IN (SELECT id FROM auth.users WHERE email IN ('john@example.com', 'jane@example.com'));
DELETE FROM public.users WHERE id IN (SELECT id FROM auth.users WHERE email IN ('john@example.com', 'jane@example.com'));
DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('john@example.com', 'jane@example.com'));
DELETE FROM auth.users WHERE email IN ('john@example.com', 'jane@example.com');
"

echo "✅ Test data cleared"

# Create test users using Supabase Auth API
echo "👤 Creating test users via Auth API..."

# Create John Smith
curl -X POST http://127.0.0.1:54321/auth/v1/admin/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU" \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "email_confirm": true,
    "user_metadata": {
      "name": "John Smith"
    }
  }' > /dev/null 2>&1

echo "✅ John Smith created"

# Create Jane Doe  
curl -X POST http://127.0.0.1:54321/auth/v1/admin/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU" \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -d '{
    "email": "jane@example.com", 
    "password": "password123",
    "email_confirm": true,
    "user_metadata": {
      "name": "Jane Doe"
    }
  }' > /dev/null 2>&1

echo "✅ Jane Doe created"

# Wait a moment for user creation to complete
sleep 2

# Get the actual user IDs from the auth system
echo "🔍 Getting user IDs..."

JOHN_ID=$(docker exec supabase_db_travel-inspirator psql -U postgres -d postgres -t -c "SELECT id FROM auth.users WHERE email = 'john@example.com';" | tr -d ' \n')
JANE_ID=$(docker exec supabase_db_travel-inspirator psql -U postgres -d postgres -t -c "SELECT id FROM auth.users WHERE email = 'jane@example.com';" | tr -d ' \n')

if [[ -z "$JOHN_ID" || -z "$JANE_ID" ]]; then
    echo "❌ Failed to create users or get user IDs"
    exit 1
fi

echo "✅ User IDs obtained: John($JOHN_ID), Jane($JANE_ID)"

# Create user profiles first
echo "📊 Creating user profiles..."

docker exec supabase_db_travel-inspirator psql -U postgres -d postgres -c "
INSERT INTO public.users (id, email, name) VALUES 
('$JOHN_ID', 'john@example.com', 'John Smith'),
('$JANE_ID', 'jane@example.com', 'Jane Doe')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email;
"

echo "✅ User profiles created"

# Execute the comprehensive test data SQL file with variable substitution
echo "📊 Creating comprehensive test data..."

# Create a temporary SQL file with substituted variables
TEMP_SQL="/tmp/create_test_data_substituted.sql"
sed -e "s/:john_id/'$JOHN_ID'/g" -e "s/:jane_id/'$JANE_ID'/g" create_test_data.sql > "$TEMP_SQL"

# Execute the SQL file
docker exec -i supabase_db_travel-inspirator psql -U postgres -d postgres < "$TEMP_SQL"

# Clean up temp file
rm "$TEMP_SQL"

echo "✅ Test data recreated successfully!"
echo ""
echo "🎯 Test accounts created:"
echo "  📧 john@example.com (password: password123) - Family Admin"
echo "  📧 jane@example.com (password: password123) - Family Member"
echo ""
echo "📊 Sample data includes:"
echo "  👥 Smith Family group"
echo "  📍 13 sample places (4 in Prague, 4 in Czech Republic, 5 in Poland)"
echo "  🗺️ 3 sample routes:"
echo "    • Prague Historic Walk (3 waypoints, walking)"
echo "    • Czech Republic Heritage Trail (6 waypoints, mixed transport)"
echo "    • Poland Highlights Adventure (5 waypoints, mixed transport)"
echo ""
echo "🚀 You can now sign in to the application at http://localhost:5173"