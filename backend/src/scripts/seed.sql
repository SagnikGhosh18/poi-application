-- database/init/02-seed.sql
-- Sample data for development and testing

-- Insert sample users (passwords are hashed versions of 'password123')
INSERT INTO users (username, password_hash) VALUES 
    ('demo_user', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj7mSEQJbq6G'),
    ('nature_lover', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    ('photographer', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj7mSEQJbq6G'),
    ('traveler', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (username) DO NOTHING;

-- Insert sample posts with realistic POI content
INSERT INTO posts (username, image_url, caption) VALUES
    -- Demo user posts
    ('demo_user', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1080&fit=crop', 'Beautiful mountain vista from this morning hike! The sunrise was absolutely breathtaking 🌄'),
    ('demo_user', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1080&h=1080&fit=crop', 'Found this hidden waterfall on my weekend adventure. Nature never ceases to amaze me! 💧'),
    
    -- Nature lover posts
    ('nature_lover', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080&h=1080&fit=crop', 'Deep in the forest, where time seems to stand still. The tranquility here is unmatched 🌲'),
    ('nature_lover', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1080&fit=crop', 'Morning mist rolling through the valley. This spot is my new favorite meditation location 🧘‍♀️'),
    ('nature_lover', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1080&h=1080&fit=crop', 'Stunning sunset over the lake. Perfect end to a perfect day of hiking!'),
    
    -- Photographer posts
    ('photographer', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1080&fit=crop', 'Golden hour magic at this incredible viewpoint. The light was just perfect! ✨'),
    ('photographer', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080&h=1080&fit=crop', 'Captured this amazing forest scene during my morning photo walk. Love how the light filters through the trees 📸'),
    
    -- Traveler posts
    ('traveler', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1080&h=1080&fit=crop', 'Discovered this incredible cascade while exploring off the beaten path. Adventure is out there! 🎒'),
    ('traveler', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1080&fit=crop', 'Nothing beats a good summit view after a challenging climb. Every step was worth it! ⛰️'),
    ('traveler', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1080&h=1080&fit=crop', 'Evening reflections at the mountain lake. This place feels like paradise 🏞️')
ON CONFLICT DO NOTHING;

-- Add some sample likes to make the feed more realistic
INSERT INTO likes (post_id, username) 
SELECT p.id, u.username 
FROM posts p 
CROSS JOIN users u 
WHERE p.username != u.username 
AND random() > 0.3  -- 70% chance of liking
ON CONFLICT (post_id, username) DO NOTHING;

-- Add some sample shares
INSERT INTO shares (post_id, username) 
SELECT p.id, u.username 
FROM posts p 
CROSS JOIN users u 
WHERE p.username != u.username 
AND random() > 0.7  -- 30% chance of sharing
ON CONFLICT DO NOTHING;

-- Update statistics
ANALYZE;

-- Print summary
DO $$
DECLARE
    user_count INTEGER;
    post_count INTEGER;
    like_count INTEGER;
    share_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO post_count FROM posts;
    SELECT COUNT(*) INTO like_count FROM likes;
    SELECT COUNT(*) INTO share_count FROM shares;
    
    RAISE NOTICE 'Database seeded successfully!';
    RAISE NOTICE 'Users: %', user_count;
    RAISE NOTICE 'Posts: %', post_count;
    RAISE NOTICE 'Likes: %', like_count;
    RAISE NOTICE 'Shares: %', share_count;
END $$;