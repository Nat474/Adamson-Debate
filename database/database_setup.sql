-- Adamson Debate Society Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable Row Level Security (RLS)
-- Note: You may need to configure RLS policies based on your authentication requirements

-- 1. NEWS_COMMUNITY TABLE
CREATE TABLE IF NOT EXISTS public.news_community (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    content TEXT,
    excerpt TEXT,
    image_url TEXT,
    author VARCHAR(100),
    featured BOOLEAN DEFAULT false,
    link TEXT, -- External link for clickable articles
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. NEWS_TRAINING TABLE
CREATE TABLE IF NOT EXISTS public.news_training (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    content TEXT,
    excerpt TEXT,
    image_url TEXT,
    author VARCHAR(100),
    featured BOOLEAN DEFAULT false,
    link TEXT, -- External link for clickable articles
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. NEWS_TOURNAMENTS TABLE
CREATE TABLE IF NOT EXISTS public.news_tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    content TEXT,
    excerpt TEXT,
    image_url TEXT,
    author VARCHAR(100),
    featured BOOLEAN DEFAULT false,
    link TEXT, -- External link for clickable articles
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. EVENTS TABLE (Updated to include link column)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    short_description TEXT,
    location VARCHAR(255),
    event_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    organizer_name VARCHAR(100),
    link TEXT, -- External link for clickable events
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 7. SYSTEM_SETTINGS TABLE (for site configuration)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'text',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 9. TRAINING_SESSIONS TABLE (for training program management)
CREATE TABLE IF NOT EXISTS public.training_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    session_date TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 60,
    trainer_name VARCHAR(100),
    location VARCHAR(255),
    max_participants INTEGER,
    skill_level VARCHAR(50) DEFAULT 'beginner',
    materials_needed TEXT[],
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. RESOURCES TABLE (for training materials and documents)
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50), -- 'document', 'video', 'link', 'book'
    file_url TEXT,
    category VARCHAR(100),
    access_level VARCHAR(20) DEFAULT 'public', -- 'public', 'members', 'varsity'
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CREATE INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_news_community_date ON news_community(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_training_date ON news_training(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_tournaments_date ON news_tournaments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

-- CREATE UPDATED_AT TRIGGERS (to automatically update updated_at fields)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_news_community_updated_at BEFORE UPDATE ON news_community FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_training_updated_at BEFORE UPDATE ON news_training FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_tournaments_updated_at BEFORE UPDATE ON news_tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- INSERT SAMPLE DATA FOR TESTING

-- Sample System Settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('site_title', 'Adamson Debate Society', 'Main site title'),
('contact_email', 'auds@adamson.edu.ph', 'Primary contact email'),
('facebook_url', 'https://www.facebook.com/AdamsonDebateSociety', 'Facebook page URL'),
('instagram_url', 'https://www.instagram.com/adamson_debatesociety', 'Instagram page URL'),
('tiktok_url', 'https://tiktok.com/@adamson_debatesociety', 'TikTok page URL')
ON CONFLICT (setting_key) DO NOTHING;

-- Sample Community News
INSERT INTO news_community (title, slug, content, excerpt, author, link) VALUES
('Community Outreach: Debate Workshops for High Schools', 'community-outreach-debate-workshops', 'Volunteer mentors hosted back-to-back introductory debate sessions with partner campuses across Manila. The program reached over 200 students and introduced them to the fundamentals of parliamentary debate.', 'Volunteer mentors hosted back-to-back introductory debate sessions with partner campuses across Manila.', 'AUDS Community Team', null),
('Alumni Mentorship Program Launch', 'alumni-mentorship-program-launch', 'We are excited to announce the launch of our Alumni Mentorship Program, connecting current members with successful graduates in various fields including law, policy, technology, and education.', 'We are excited to announce the launch of our Alumni Mentorship Program.', 'Maria Santos', 'https://example.com/mentorship-program');

-- Sample Training News
INSERT INTO news_training (title, slug, content, excerpt, author, link) VALUES
('New Program: Advanced Argumentation Techniques', 'advanced-argumentation-techniques', 'Weekly labs with Prof. David Chen now cover layered weighing, collapsing strategies, and judge calibration drills. These advanced techniques will help our debaters excel in competitive tournaments.', 'Weekly labs with Prof. David Chen now cover layered weighing, collapsing strategies, and judge calibration drills.', 'Prof. David Chen', null),
('Public Speaking Workshop Series', 'public-speaking-workshop-series', 'A comprehensive 6-week workshop series focusing on persuasive delivery, voice modulation, and stage presence. Open to all AUDS members.', 'A comprehensive 6-week workshop series focusing on persuasive delivery.', 'Training Committee', 'https://example.com/workshops');

-- Sample Tournament News
INSERT INTO news_tournaments (title, slug, content, excerpt, author, link) VALUES
('National Parliamentary Championship 2024 Victory', 'national-parliamentary-championship-2024', 'Our varsity squad captured its third consecutive national title with a unanimous panel decision in the grand finals, showcasing strategic depth and polished delivery against the top universities in the country.', 'Our varsity squad captured its third consecutive national title with a unanimous panel decision.', 'Tournament Committee', 'https://example.com/championship-results'),
('International Debate Summit Hosting', 'international-debate-summit', 'Delegates from 15 countries gathered at Adamson University for three days of panels, scrimmages, and motion clinics. AUDS served as the host organization for this prestigious event.', 'Delegates from 15 countries gathered at Adamson University for three days of panels and scrimmages.', 'International Relations', null);

-- Sample Events
INSERT INTO events (title, slug, description, location, event_date, organizer_name, link) VALUES
('Inter-University Debate Championship', 'inter-university-championship', 'Annual invitational featuring the top debate societies nationwide. Registration deadline is October 10.', 'Adamson University Auditorium', '2024-10-15 09:00:00+08', 'Tournament Committee', 'https://example.com/championship-registration'),
('Public Speaking Workshop', 'public-speaking-workshop', 'Persuasive delivery lab led by varsity coaches with drills on cadence, emphasis, and storytelling.', 'Room 304, Ozanam Building', '2024-10-22 14:00:00+08', 'Training Committee', null),
('AUDS Alumni Homecoming', 'alumni-homecoming', 'Celebrating alumni mentors, with networking sessions and a showcase scrimmage.', 'University Function Hall', '2024-11-05 17:00:00+08', 'Alumni Relations', 'https://example.com/homecoming-rsvp'),
('Weekly Varsity Training', 'weekly-varsity-training', 'Focus on British Parliamentary reply speeches and adjudicator feedback rotations.', 'Conference Room B', '2024-11-12 19:00:00+08', 'Varsity Coaches', null);


-- Note: After running this SQL, you may need to configure Row Level Security (RLS) policies
-- depending on your authentication and access control requirements.

-- Example RLS policies (adjust according to your needs):
-- ALTER TABLE news_community ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable read access for all users" ON news_community FOR SELECT USING (published = true);