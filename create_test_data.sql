-- Create comprehensive test data for Travel Inspirator
-- This file is executed by recreate_data.sh with user IDs as parameters

-- Create family group
INSERT INTO public.family_groups (id, name, admin_id) VALUES 
('f47ac10b-58cc-4372-a567-0e02b2c3d490', 'Smith Family', :john_id)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    admin_id = EXCLUDED.admin_id;

-- Add family members
INSERT INTO public.family_members (group_id, user_id, role) VALUES 
('f47ac10b-58cc-4372-a567-0e02b2c3d490', :john_id, 'admin'),
('f47ac10b-58cc-4372-a567-0e02b2c3d490', :jane_id, 'member')
ON CONFLICT (group_id, user_id) DO UPDATE SET role = EXCLUDED.role;

-- Add sample places including comprehensive route test data
INSERT INTO public.places (
    id, name, location, category, rating, description, 
    created_by, family_id, is_public, practical_info, location_name
) VALUES 
-- Original Prague places
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d491',
    'Prague Castle',
    ST_GeogFromText('POINT(14.4009 50.0909)'),
    'monuments',
    5,
    'Historic castle complex and former residence of Bohemian kings',
    :john_id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    '{"entrance_fee": 15, "parking": false, "opening_hours": "9:00-17:00"}',
    'Prague, Czech Republic'
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d492',
    'Charles Bridge',
    ST_GeogFromText('POINT(14.4136 50.0865)'),
    'monuments',
    4,
    'Famous historic bridge over the Vltava River',
    :john_id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    '{"entrance_fee": 0, "parking": false, "best_time": "early morning"}',
    'Prague, Czech Republic'
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d493',
    'Petřín Hill',
    ST_GeogFromText('POINT(14.3916 50.0848)'),
    'natural_attractions',
    4,
    'Beautiful park with panoramic views of Prague',
    :jane_id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    '{"entrance_fee": 0, "parking": true, "best_time": "sunset"}',
    'Prague, Czech Republic'
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d494',
    'U Fleků Brewery',
    ST_GeogFromText('POINT(14.4198 50.0739)'),
    'restaurants',
    5,
    'Historic brewery serving traditional Czech beer and food',
    :john_id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    false,
    '{"entrance_fee": 0, "parking": false, "reservation": "recommended"}',
    'Prague, Czech Republic'
),

-- Czech Republic Route Places (4 additional waypoints)
(
    '11111111-58cc-4372-a567-0e02b2c3d001',
    'Český Krumlov Castle',
    ST_GeogFromText('POINT(14.3175 48.8127)'),
    'monuments',
    5,
    'UNESCO World Heritage castle complex in South Bohemia, one of the most important historic monuments in Central Europe.',
    :john_id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    '{"entrance_fee": 180, "currency": "CZK", "opening_hours": "9:00-17:00", "unesco": true}',
    'Český Krumlov, Czech Republic'
),
(
    '11111111-58cc-4372-a567-0e02b2c3d002',
    'Karlštejn Castle',
    ST_GeogFromText('POINT(14.1881 49.9394)'),
    'monuments',
    4,
    'Gothic castle founded in 1348 by Charles IV, Holy Roman Emperor-elect and King of Bohemia, built to house the crown jewels.',
    :john_id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    '{"entrance_fee": 330, "currency": "CZK", "opening_hours": "9:00-16:00", "reservation_required": true}',
    'Karlštejn, Czech Republic'
),
(
    '11111111-58cc-4372-a567-0e02b2c3d003',
    'Bohemian Switzerland National Park',
    ST_GeogFromText('POINT(14.2744 50.8747)'),
    'natural_attractions',
    5,
    'Stunning national park known for its sandstone formations, deep valleys, and unique rock formations including the famous Pravčická brána arch.',
    :john_id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    '{"entrance_fee": 0, "currency": "CZK", "hiking_trails": true, "difficulty": "moderate"}',
    'Hřensko, Czech Republic'
),
(
    '11111111-58cc-4372-a567-0e02b2c3d004',
    'Kutná Hora Cathedral',
    ST_GeogFromText('POINT(15.2681 49.9484)'),
    'monuments',
    5,
    'Gothic cathedral of St. Barbara, UNESCO World Heritage Site, masterpiece of late Gothic architecture.',
    :john_id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    '{"entrance_fee": 120, "currency": "CZK", "opening_hours": "9:00-18:00", "unesco": true}',
    'Kutná Hora, Czech Republic'
),

-- Poland Route Places (5 waypoints)
(
    '22222222-58cc-4372-a567-0e02b2c3d001',
    'Wawel Castle',
    ST_GeogFromText('POINT(19.9356 50.0544)'),
    'monuments',
    5,
    'Royal castle in Krakow, residence of Polish kings for centuries. Important symbol of Polish statehood and UNESCO World Heritage Site.',
    :jane_id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    '{"entrance_fee": 25, "currency": "PLN", "opening_hours": "9:30-17:00", "unesco": true, "audio_guide": "available"}',
    'Krakow, Poland'
),
(
    '22222222-58cc-4372-a567-0e02b2c3d002',
    'Main Market Square Krakow',
    ST_GeogFromText('POINT(19.9375 50.0614)'),
    'monuments',
    5,
    'Medieval market square in Krakow Old Town, one of the largest in Europe, surrounded by historic townhouses and featuring St. Marys Basilica.',
    :jane_id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    '{"entrance_fee": 0, "currency": "PLN", "opening_hours": "24/7", "tower_climb": "15 PLN", "events": "flower market on Thursdays"}',
    'Krakow, Poland'
),
(
    '22222222-58cc-4372-a567-0e02b2c3d003',
    'Wieliczka Salt Mine',
    ST_GeogFromText('POINT(20.0631 49.9868)'),
    'monuments',
    5,
    'Historic salt mine dating to 13th century, UNESCO World Heritage Site featuring underground chambers, sculptures, and chapels carved from salt.',
    :jane_id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    '{"entrance_fee": 89, "currency": "PLN", "opening_hours": "7:30-19:30", "underground_tour": "2-3 hours", "temperature": "14°C"}',
    'Wieliczka, Poland'
),
(
    '22222222-58cc-4372-a567-0e02b2c3d004',
    'Zakopane Tatra Mountains',
    ST_GeogFromText('POINT(19.9495 49.2992)'),
    'natural_attractions',
    4,
    'Popular mountain resort town at the foot of Tatra Mountains, known for winter sports, hiking, and traditional highland culture.',
    :jane_id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    '{"entrance_fee": 0, "currency": "PLN", "cable_car": "39 PLN", "season": "year-round", "activities": "skiing, hiking, shopping"}',
    'Zakopane, Poland'
),
(
    '22222222-58cc-4372-a567-0e02b2c3d005',
    'Morskie Oko Lake',
    ST_GeogFromText('POINT(20.0708 49.2017)'),
    'natural_attractions',
    5,
    'Largest and most famous lake in Tatra Mountains, glacial lake surrounded by towering peaks, accessible by scenic hiking trail.',
    :jane_id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    '{"entrance_fee": 6, "currency": "PLN", "hiking_distance": "2km", "horse_cart": "available", "best_time": "morning for reflections"}',
    'Tatra National Park, Poland'
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    category = EXCLUDED.category,
    rating = EXCLUDED.rating,
    description = EXCLUDED.description,
    practical_info = EXCLUDED.practical_info;

-- Create sample routes
INSERT INTO public.routes (
    id, name, description, created_by, family_id, is_public, estimated_duration, difficulty_level, transport_mode, total_distance
) VALUES 
-- Original Prague route
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d495',
    'Prague Historic Walk',
    'A walking tour covering the main historic attractions of Prague',
    :john_id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    240,
    'easy',
    'walking',
    5.2
),
-- Czech Republic Heritage Trail
(
    '33333333-58cc-4372-a567-0e02b2c3d001',
    'Czech Republic Heritage Trail',
    'Comprehensive tour through Czech Republic most iconic castles and natural wonders, spanning multiple days through historic landmarks.',
    :john_id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    2880,
    'moderate',
    'mixed',
    485.5
),
-- Poland Highlights Adventure
(
    '44444444-58cc-4372-a567-0e02b2c3d001',
    'Poland Highlights Adventure',
    'Journey through southern Poland from Krakow historic sites to Tatra Mountains natural beauty, including underground salt mine exploration.',
    :jane_id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    true,
    2160,
    'moderate',
    'mixed',
    267.3
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    estimated_duration = EXCLUDED.estimated_duration,
    difficulty_level = EXCLUDED.difficulty_level,
    transport_mode = EXCLUDED.transport_mode,
    total_distance = EXCLUDED.total_distance;

-- Add places to routes with detailed waypoint information
INSERT INTO public.route_places (route_id, place_id, order_index, transport_to_next, notes, estimated_time) VALUES 
-- Original Prague route
('f47ac10b-58cc-4372-a567-0e02b2c3d495', 'f47ac10b-58cc-4372-a567-0e02b2c3d491', 1, 'walking', 'Start early to avoid crowds', 90),
('f47ac10b-58cc-4372-a567-0e02b2c3d495', 'f47ac10b-58cc-4372-a567-0e02b2c3d492', 2, 'walking', 'Great for photos, watch for crowds', 45),
('f47ac10b-58cc-4372-a567-0e02b2c3d495', 'f47ac10b-58cc-4372-a567-0e02b2c3d493', 3, null, 'Perfect for sunset views', 105),

-- Czech Republic Heritage Trail waypoints  
('33333333-58cc-4372-a567-0e02b2c3d001', 'f47ac10b-58cc-4372-a567-0e02b2c3d491', 1, 'walking', 'Start early morning to avoid crowds. Audio guide recommended for full historical context.', 180),
('33333333-58cc-4372-a567-0e02b2c3d001', 'f47ac10b-58cc-4372-a567-0e02b2c3d492', 2, 'driving', 'Perfect for sunrise/sunset photos. Watch for pickpockets, enjoy street musicians and artists.', 45),
('33333333-58cc-4372-a567-0e02b2c3d001', '11111111-58cc-4372-a567-0e02b2c3d002', 3, 'driving', 'Book guided tour in advance. Steep climb to castle entrance, wear comfortable shoes.', 240),
('33333333-58cc-4372-a567-0e02b2c3d001', '11111111-58cc-4372-a567-0e02b2c3d001', 4, 'driving', 'Stay overnight in old town. Castle theater and baroque theater are highlights. Try local beer.', 300),
('33333333-58cc-4372-a567-0e02b2c3d001', '11111111-58cc-4372-a567-0e02b2c3d004', 5, 'driving', 'UNESCO site with stunning Gothic architecture. Cathedral of St. Barbara is masterpiece.', 240),
('33333333-58cc-4372-a567-0e02b2c3d001', '11111111-58cc-4372-a567-0e02b2c3d003', 6, null, 'Hike to Pravčická brána arch. Bring water and snacks. Best views in morning light.', 360),

-- Poland Highlights Adventure waypoints
('44444444-58cc-4372-a567-0e02b2c3d001', '22222222-58cc-4372-a567-0e02b2c3d001', 1, 'walking', 'Visit State Rooms and Crown Treasury. Dragon cave beneath castle is fun for kids.', 150),
('44444444-58cc-4372-a567-0e02b2c3d001', '22222222-58cc-4372-a567-0e02b2c3d002', 2, 'driving', 'Climb St. Marys Basilica tower for panoramic views. Try traditional Polish pierogi from local vendors.', 90),
('44444444-58cc-4372-a567-0e02b2c3d001', '22222222-58cc-4372-a567-0e02b2c3d003', 3, 'driving', 'Underground tour takes 2-3 hours. Temperature is 14°C year-round, bring light jacket.', 180),
('44444444-58cc-4372-a567-0e02b2c3d001', '22222222-58cc-4372-a567-0e02b2c3d004', 4, 'walking', 'Take cable car up Kasprowy Wierch for mountain views. Visit Krupówki street for souvenirs.', 240),
('44444444-58cc-4372-a567-0e02b2c3d001', '22222222-58cc-4372-a567-0e02b2c3d005', 5, null, 'Easy 2km hike from parking. Horse cart available for those who prefer not to walk. Stunning reflections.', 180)
ON CONFLICT (route_id, place_id) DO UPDATE SET 
    order_index = EXCLUDED.order_index,
    transport_to_next = EXCLUDED.transport_to_next,
    notes = EXCLUDED.notes,
    estimated_time = EXCLUDED.estimated_time;