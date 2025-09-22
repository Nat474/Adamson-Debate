-- Adamson Debate Society Database Schema
-- Run this SQL in your Supabase SQL Editor to create the database structure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Members table
CREATE TABLE members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) UNIQUE,
    college VARCHAR(100),
    year_level VARCHAR(20),
    membership_type VARCHAR(20) CHECK (membership_type IN ('resident', 'varsity')) DEFAULT 'resident',
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'graduated', 'transferred')) DEFAULT 'active',
    phone_number VARCHAR(20),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    skills TEXT[], -- Array of skills/interests
    achievements TEXT[], -- Array of achievements
    position VARCHAR(50), -- Executive positions
    bio TEXT,
    profile_image_url TEXT,
    date_joined DATE DEFAULT CURRENT_DATE,
    semester_joined VARCHAR(20),
    academic_year VARCHAR(9), -- Format: 2023-2024
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News posts table
CREATE TABLE news_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image_url TEXT,
    author_id UUID REFERENCES members(id),
    author_name VARCHAR(100) NOT NULL, -- Fallback for non-member authors
    category VARCHAR(50) DEFAULT 'general',
    tags TEXT[], -- Array of tags
    published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false, -- For featured posts
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    event_type VARCHAR(50) NOT NULL, -- competition, workshop, meeting, social
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    venue_details TEXT,
    organizer_id UUID REFERENCES members(id),
    organizer_name VARCHAR(100) NOT NULL,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    registration_required BOOLEAN DEFAULT false,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    registration_fee DECIMAL(10,2) DEFAULT 0,
    featured_image_url TEXT,
    additional_images TEXT[], -- Array of image URLs
    status VARCHAR(20) CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
    is_public BOOLEAN DEFAULT true,
    external_link TEXT, -- For external event pages
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    tags TEXT[], -- Array of tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event registrations table
CREATE TABLE event_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id),
    participant_name VARCHAR(100) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    participant_phone VARCHAR(20),
    participant_college VARCHAR(100),
    participant_year VARCHAR(20),
    special_requirements TEXT,
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'waived')) DEFAULT 'pending',
    payment_reference VARCHAR(100),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attendance_status VARCHAR(20) CHECK (attendance_status IN ('registered', 'attended', 'absent')) DEFAULT 'registered',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact form submissions
CREATE TABLE contact_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    inquiry_type VARCHAR(50) DEFAULT 'general', -- general, membership, events, collaboration
    status VARCHAR(20) CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')) DEFAULT 'new',
    response TEXT,
    responded_by UUID REFERENCES members(id),
    responded_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements and awards table
CREATE TABLE achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    achievement_type VARCHAR(50) NOT NULL, -- individual, team, organization
    competition_name VARCHAR(255),
    position VARCHAR(50), -- 1st place, Champion, Finalist, etc.
    date_achieved DATE NOT NULL,
    participants UUID[], -- Array of member IDs
    participant_names TEXT[], -- Names for non-members or alumni
    coach_id UUID REFERENCES members(id),
    coach_name VARCHAR(100),
    certificate_url TEXT,
    photo_urls TEXT[], -- Array of photo URLs
    news_coverage_urls TEXT[], -- Array of news article URLs
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training sessions/programs table
CREATE TABLE training_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    session_type VARCHAR(50) NOT NULL, -- workshop, practice, lecture, assessment
    trainer_id UUID REFERENCES members(id),
    trainer_name VARCHAR(100) NOT NULL,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER, -- Duration in minutes
    location VARCHAR(255),
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    materials_required TEXT[],
    skill_level VARCHAR(20) CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'all')) DEFAULT 'all',
    status VARCHAR(20) CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')) DEFAULT 'scheduled',
    notes TEXT,
    recording_url TEXT,
    materials_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session attendance tracking
CREATE TABLE session_attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id),
    attendee_name VARCHAR(100) NOT NULL,
    attendance_status VARCHAR(20) CHECK (attendance_status IN ('present', 'absent', 'excused')) DEFAULT 'present',
    performance_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resource library table
CREATE TABLE resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL, -- document, video, link, file
    category VARCHAR(50) NOT NULL, -- guidelines, training, constitution, templates
    file_url TEXT,
    external_url TEXT,
    file_size BIGINT, -- File size in bytes
    file_format VARCHAR(10), -- pdf, docx, mp4, etc.
    access_level VARCHAR(20) CHECK (access_level IN ('public', 'members', 'executives')) DEFAULT 'members',
    download_count INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES members(id),
    uploader_name VARCHAR(100) NOT NULL,
    tags TEXT[],
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table
CREATE TABLE system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) CHECK (setting_type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_public BOOLEAN DEFAULT false, -- Whether this setting can be read by anonymous users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_membership_type ON members(membership_type);
CREATE INDEX idx_news_published ON news_posts(published);
CREATE INDEX idx_news_created_at ON news_posts(created_at DESC);
CREATE INDEX idx_news_slug ON news_posts(slug);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_contact_status ON contact_submissions(status);
CREATE INDEX idx_achievements_date ON achievements(date_achieved DESC);
CREATE INDEX idx_training_date ON training_sessions(session_date);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_posts_updated_at BEFORE UPDATE ON news_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_sessions_updated_at BEFORE UPDATE ON training_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
('site_name', 'Adamson Debate Society', 'string', 'Name of the organization', 'general', true),
('site_description', 'Fostering academic discourse and intellectual excellence through the power of reasoned argumentation', 'string', 'Site description', 'general', true),
('contact_email', 'auds@adamson.edu.ph', 'string', 'Main contact email', 'contact', true),
('contact_phone', '+63 2 524 2011', 'string', 'Main contact phone', 'contact', true),
('address', 'Adamson University, 900 San Marcelino Street, Ermita, Manila, Philippines', 'string', 'Organization address', 'contact', true),
('facebook_url', 'https://www.facebook.com/AdamsonDebateSociety', 'string', 'Facebook page URL', 'social', true),
('instagram_url', 'https://www.instagram.com/adamson_debatesociety', 'string', 'Instagram page URL', 'social', true),
('tiktok_url', 'https://tiktok.com/@adamson_debatesociety', 'string', 'TikTok page URL', 'social', true),
('membership_fee_resident', '0', 'number', 'Membership fee for resident members', 'membership', false),
('membership_fee_varsity', '0', 'number', 'Membership fee for varsity members', 'membership', false),
('current_academic_year', '2024-2025', 'string', 'Current academic year', 'academic', true),
('current_semester', 'First Semester', 'string', 'Current semester', 'academic', true);

-- Row Level Security (RLS) policies
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can view published news" ON news_posts
    FOR SELECT USING (published = true);

CREATE POLICY "Public can view public events" ON events
    FOR SELECT USING (is_public = true);

CREATE POLICY "Public can view achievements" ON achievements
    FOR SELECT USING (true);

CREATE POLICY "Public can view public system settings" ON system_settings
    FOR SELECT USING (is_public = true);

-- Members can view their own data
CREATE POLICY "Members can view own profile" ON members
    FOR SELECT USING (auth.uid()::text = id::text);

-- Contact form submissions (anyone can insert)
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- Admin policies (you'll need to set up proper authentication)
-- These are basic examples - adjust based on your authentication setup

CREATE POLICY "Authenticated users can view all members" ON members
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage news" ON news_posts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage events" ON events
    FOR ALL USING (auth.role() = 'authenticated');