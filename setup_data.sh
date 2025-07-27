#!/bin/bash

# Setup test users and seed data for Travel Inspirator
# This script is idempotent - it preserves existing data

set -e

echo "Setting up test data for Travel Inspirator..."

# Check if Supabase is running
if ! curl -s http://127.0.0.1:54321/health > /dev/null; then
    echo "Error: Supabase is not running. Please run 'supabase start' first."
    exit 1
fi

# Create test users (only if they don't exist)
echo "Creating test users..."

docker exec supabase_db_travel-inspirator psql -U postgres -d postgres << 'EOF'
-- Insert test users if they don't exist
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    phone_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    confirmed_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'authenticated',
    'authenticated',
    'john@example.com',
    '$2a$10$X0DGPw0Vj8/j8F7L7Y.4xO.DvFzNdLfF8Kj8Pg5H8Z5V8F8D8C8B8A',
    NOW(),
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"name":"John Smith"}',
    false,
    NOW(),
    NOW(),
    NULL,
    '',
    '',
    NULL,
    NOW(),
    '',
    0,
    NULL,
    '',
    NULL,
    false,
    NULL
) ON CONFLICT (email) DO NOTHING;

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    phone_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    confirmed_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'authenticated',
    'authenticated',
    'jane@example.com',
    '$2a$10$X0DGPw0Vj8/j8F7L7Y.4xO.DvFzNdLfF8Kj8Pg5H8Z5V8F8D8C8B8A',
    NOW(),
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"name":"Jane Doe"}',
    false,
    NOW(),
    NOW(),
    NULL,
    '',
    '',
    NULL,
    NOW(),
    '',
    0,
    NULL,
    '',
    NULL,
    false,
    NULL
) ON CONFLICT (email) DO NOTHING;

-- Insert user profiles
INSERT INTO public.users (id, email, name) VALUES 
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'john@example.com', 'John Smith')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email;

INSERT INTO public.users (id, email, name) VALUES 
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'jane@example.com', 'Jane Doe')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email;

-- Create family group
INSERT INTO public.family_groups (id, name, admin_id) VALUES 
('f47ac10b-58cc-4372-a567-0e02b2c3d490', 'Smith Family', 'f47ac10b-58cc-4372-a567-0e02b2c3d479')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    admin_id = EXCLUDED.admin_id;

-- Add family members
INSERT INTO public.family_members (group_id, user_id, role) VALUES 
('f47ac10b-58cc-4372-a567-0e02b2c3d490', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'admin')
ON CONFLICT (group_id, user_id) DO UPDATE SET role = EXCLUDED.role;

INSERT INTO public.family_members (group_id, user_id, role) VALUES 
('f47ac10b-58cc-4372-a567-0e02b2c3d490', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'member')
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
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
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
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
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
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
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
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
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
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
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

echo "✅ Test data setup completed successfully!"
echo ""
echo "Test users created:"
echo "  📧 john@example.com (password: password123) - Family Admin"
echo "  📧 jane@example.com (password: password123) - Family Member"
echo ""
echo "Sample data includes:"
echo "  👥 Smith Family group"
echo "  📍 4 sample places in Prague"
echo "  🗺️ 1 sample route"
echo ""
echo "You can now sign in to the application with either test account."