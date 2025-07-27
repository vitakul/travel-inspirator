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

docker exec supabase_db_travel-inspirator psql -U postgres -d postgres << 'EOF'
-- Delete existing test data
DELETE FROM public.photos WHERE created_by IN ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d480');
DELETE FROM public.route_places WHERE route_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d495';
DELETE FROM public.routes WHERE created_by IN ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d480');
DELETE FROM public.places WHERE created_by IN ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d480');
DELETE FROM public.family_members WHERE user_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d480');
DELETE FROM public.family_groups WHERE admin_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d480');
DELETE FROM public.users WHERE id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d480');
DELETE FROM auth.identities WHERE user_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d480');
DELETE FROM auth.users WHERE email IN ('john@example.com', 'jane@example.com');
EOF

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

# Create user profiles and sample data
echo "📊 Creating sample data..."

docker exec supabase_db_travel-inspirator psql -U postgres -d postgres << EOF
-- Insert user profiles
INSERT INTO public.users (id, email, name) VALUES 
('${JOHN_ID}', 'john@example.com', 'John Smith'),
('${JANE_ID}', 'jane@example.com', 'Jane Doe')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email;

-- Create family group
INSERT INTO public.family_groups (id, name, admin_id) VALUES 
('f47ac10b-58cc-4372-a567-0e02b2c3d490', 'Smith Family', '${JOHN_ID}')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    admin_id = EXCLUDED.admin_id;

-- Add family members
INSERT INTO public.family_members (group_id, user_id, role) VALUES 
('f47ac10b-58cc-4372-a567-0e02b2c3d490', '${JOHN_ID}', 'admin'),
('f47ac10b-58cc-4372-a567-0e02b2c3d490', '${JANE_ID}', 'member')
ON CONFLICT (group_id, user_id) DO UPDATE SET role = EXCLUDED.role;

-- Add sample places
INSERT INTO public.places (
    id, name, location, category, rating, description, 
    created_by, family_id, is_public, practical_info
) VALUES 
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d491',
    'Prague Castle',
    ST_GeogFromText('POINT(14.4009 50.0909)'),
    'monuments',
    5,
    'Historic castle complex and former residence of Bohemian kings',
    '${JOHN_ID}',
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    '{"entrance_fee": 15, "parking": false, "opening_hours": "9:00-17:00"}'
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d492',
    'Charles Bridge',
    ST_GeogFromText('POINT(14.4136 50.0865)'),
    'monuments',
    4,
    'Famous historic bridge over the Vltava River',
    '${JOHN_ID}',
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    '{"entrance_fee": 0, "parking": false, "best_time": "early morning"}'
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d493',
    'Petřín Hill',
    ST_GeogFromText('POINT(14.3916 50.0848)'),
    'natural_attractions',
    4,
    'Beautiful park with panoramic views of Prague',
    '${JANE_ID}',
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    '{"entrance_fee": 0, "parking": true, "best_time": "sunset"}'
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d494',
    'U Fleků Brewery',
    ST_GeogFromText('POINT(14.4198 50.0739)'),
    'restaurants',
    5,
    'Historic brewery serving traditional Czech beer and food',
    '${JOHN_ID}',
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    false,
    '{"entrance_fee": 0, "parking": false, "reservation": "recommended"}'
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    category = EXCLUDED.category,
    rating = EXCLUDED.rating,
    description = EXCLUDED.description,
    practical_info = EXCLUDED.practical_info;

-- Create a sample route
INSERT INTO public.routes (
    id, name, description, created_by, family_id, is_public
) VALUES 
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d495',
    'Prague Historic Walk',
    'A walking tour covering the main historic attractions of Prague',
    '${JOHN_ID}',
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Add places to route
INSERT INTO public.route_places (route_id, place_id, order_index) VALUES 
('f47ac10b-58cc-4372-a567-0e02b2c3d495', 'f47ac10b-58cc-4372-a567-0e02b2c3d491', 1),
('f47ac10b-58cc-4372-a567-0e02b2c3d495', 'f47ac10b-58cc-4372-a567-0e02b2c3d492', 2),
('f47ac10b-58cc-4372-a567-0e02b2c3d495', 'f47ac10b-58cc-4372-a567-0e02b2c3d493', 3)
ON CONFLICT (route_id, place_id) DO UPDATE SET order_index = EXCLUDED.order_index;

EOF

echo "✅ Test data recreated successfully!"
echo ""
echo "🎯 Test accounts created:"
echo "  📧 john@example.com (password: password123) - Family Admin"
echo "  📧 jane@example.com (password: password123) - Family Member"
echo ""
echo "📊 Sample data includes:"
echo "  👥 Smith Family group"
echo "  📍 4 sample places in Prague"
echo "  🗺️ 1 sample route"
echo ""
echo "🚀 You can now sign in to the application at http://localhost:5173"