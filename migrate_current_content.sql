-- Migration SQL: Current News & Events Page Content to Supabase
-- Run this AFTER running database_setup.sql
-- This will replace the sample data with your actual content

-- Clear existing sample data first (optional)
-- DELETE FROM news_community;
-- DELETE FROM news_training;
-- DELETE FROM news_tournaments;
-- DELETE FROM events;

-- FEATURED ARTICLE (Tournaments category)
INSERT INTO news_tournaments (
    id,
    title,
    slug,
    content,
    excerpt,
    image_url,
    author,
    featured,
    link,
    created_at
) VALUES (
    gen_random_uuid(),
    'Adamson Debate Society Wins National Parliamentary Championship 2024',
    'national-parliamentary-championship-2024-victory',
    'Our varsity squad captured its third consecutive national title with a unanimous panel decision in the grand finals, showcasing strategic depth and polished delivery against the top universities in the country. This remarkable achievement demonstrates the dedication of our coaches, the talent of our debaters, and the strength of our training programs. The team overcame fierce competition from over 50 universities nationwide, proving once again that Adamson University stands at the forefront of collegiate debate in the Philippines.',
    'Our varsity squad captured its third consecutive national title with a unanimous panel decision in the grand finals, showcasing strategic depth and polished delivery against the top universities in the country.',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'AUDS Tournament Committee',
    true,
    'https://www.facebook.com/AdamsonDebateSociety/posts/championship2024',
    NOW() - INTERVAL '2 days'
);

-- NEWS ARTICLES

-- 1. Training News: Advanced Argumentation Techniques
INSERT INTO news_training (
    id,
    title,
    slug,
    content,
    excerpt,
    image_url,
    author,
    published,
    link,
    created_at
) VALUES (
    gen_random_uuid(),
    'New Program: Advanced Argumentation Techniques',
    'advanced-argumentation-techniques-program',
    'Weekly labs with Prof. David Chen now cover layered weighing, collapsing strategies, and judge calibration drills. These advanced sessions are designed to elevate our debaters'' analytical skills and strategic thinking. The program includes intensive practice rounds, personalized feedback sessions, and masterclasses on complex debate mechanics. Students learn to construct multi-layered arguments, effectively collapse opposing cases, and adapt their strategies based on judge preferences and panel composition.',
    'Weekly labs with Prof. David Chen now cover layered weighing, collapsing strategies, and judge calibration drills.',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'Prof. David Chen',
    true,
    'https://www.facebook.com/AdamsonDebateSociety/posts/advanced-training-program',
    NOW() - INTERVAL '1 day'
);

-- 2. Community News: Alumni Spotlight
INSERT INTO news_community (
    id,
    title,
    slug,
    content,
    excerpt,
    image_url,
    author,
    published,
    link,
    created_at
) VALUES (
    gen_random_uuid(),
    'Alumni Spotlight: Where Are They Now?',
    'alumni-spotlight-where-are-they-now',
    'Discover how former AUDS debaters lead in law, policy, tech, and education while mentoring current members. Our alumni have gone on to become Supreme Court clerks, policy advisors, startup founders, and university professors. This feature series highlights their journeys and how their debate experience shaped their careers. Many of them continue to give back to the society through mentorship programs, guest lectures, and career guidance sessions. Their success stories inspire our current members and demonstrate the lasting impact of debate education.',
    'Discover how former AUDS debaters lead in law, policy, tech, and education while mentoring current members.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'AUDS Alumni Relations',
    true,
    'https://www.instagram.com/adamson_debatesociety/posts/alumni-spotlight-series',
    NOW() - INTERVAL '3 days'
);

-- 3. Community News: High School Outreach
INSERT INTO news_community (
    id,
    title,
    slug,
    content,
    excerpt,
    image_url,
    author,
    published,
    link,
    created_at
) VALUES (
    gen_random_uuid(),
    'Community Outreach: Debate Workshops for High Schools',
    'debate-workshops-high-schools-outreach',
    'Volunteer mentors hosted back-to-back introductory debate sessions with partner campuses across Manila. Over 200 high school students participated in these workshops, learning the fundamentals of argumentation, research techniques, and public speaking. The program aims to democratize access to quality debate education and identify promising talent for future recruitment. Sessions covered basic debate formats, argument construction, and critical thinking skills. Many participating schools have expressed interest in establishing their own debate programs.',
    'Volunteer mentors hosted back-to-back introductory debate sessions with partner campuses across Manila.',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'AUDS Community Outreach Team',
    true,
    'https://www.facebook.com/AdamsonDebateSociety/posts/high-school-outreach-workshops',
    NOW() - INTERVAL '5 days'
);

-- 4. Tournament News: International Debate Summit
INSERT INTO news_tournaments (
    id,
    title,
    slug,
    content,
    excerpt,
    image_url,
    author,
    published,
    link,
    created_at
) VALUES (
    gen_random_uuid(),
    'AUDS Hosts International Debate Summit',
    'international-debate-summit-hosting',
    'Delegates from 15 countries gathered at Adamson University for three days of panels, scrimmages, and motion clinics. This prestigious event positioned AUDS as a regional leader in debate education and international academic exchange. The summit featured workshops on global debate trends, cross-cultural argumentation styles, and international tournament formats. Participants engaged in friendly competition while building lasting diplomatic and academic relationships. The event showcased Filipino hospitality and the high caliber of Philippine collegiate debate.',
    'Delegates from 15 countries gathered at Adamson University for three days of panels, scrimmages, and motion clinics.',
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'AUDS International Relations Committee',
    true,
    'https://tiktok.com/@adamson_debatesociety/international-debate-summit',
    NOW() - INTERVAL '1 week'
);

-- EVENTS

-- 1. Inter-University Debate Championship
INSERT INTO events (
    id,
    title,
    slug,
    description,
    short_description,
    location,
    event_date,
    organizer_name,
    link,
    created_at
) VALUES (
    gen_random_uuid(),
    'Inter-University Debate Championship',
    'inter-university-debate-championship-2024',
    'Annual invitational featuring the top debate societies nationwide. Registration deadline is October 10. This prestigious tournament brings together the most talented debaters from across the Philippines to compete in British Parliamentary format. Teams will engage in preliminary rounds followed by elimination debates, with awards for best speakers, best teams, and overall champions. The event promotes academic excellence and friendly competition among universities.',
    'Annual invitational featuring the top debate societies nationwide. Registration deadline is October 10.',
    'Adamson University Auditorium',
    '2024-10-15 09:00:00+08:00',
    'AUDS Tournament Committee',
    'https://forms.google.com/inter-university-championship-registration',
    NOW()
);

-- 2. Public Speaking Workshop
INSERT INTO events (
    id,
    title,
    slug,
    description,
    short_description,
    location,
    event_date,
    organizer_name,
    link,
    created_at
) VALUES (
    gen_random_uuid(),
    'Public Speaking Workshop',
    'public-speaking-workshop-oct-2024',
    'Persuasive delivery lab led by varsity coaches with drills on cadence, emphasis, and storytelling. This hands-on workshop focuses on developing confident public speaking skills through practical exercises. Participants will learn voice projection techniques, body language mastery, and audience engagement strategies. The session includes individual coaching, peer feedback, and video analysis of speaking performances.',
    'Persuasive delivery lab led by varsity coaches with drills on cadence, emphasis, and storytelling.',
    'Room 304, Ozanam Building',
    '2024-10-22 14:00:00+08:00',
    'AUDS Training Committee',
    'https://bit.ly/auds-public-speaking-workshop',
    NOW()
);

-- 3. AUDS Alumni Homecoming
INSERT INTO events (
    id,
    title,
    slug,
    description,
    short_description,
    location,
    event_date,
    organizer_name,
    link,
    created_at
) VALUES (
    gen_random_uuid(),
    'AUDS Alumni Homecoming',
    'auds-alumni-homecoming-2024',
    'Celebrating alumni mentors, with networking sessions and a showcase scrimmage. This special event reconnects former members with the current society, fostering mentorship opportunities and professional networks. The program includes a formal dinner, awards ceremony recognizing outstanding alumni contributions, and exhibition debates featuring mixed teams of current members and alumni. It''s an opportunity to celebrate our shared legacy and plan for the future.',
    'Celebrating alumni mentors, with networking sessions and a showcase scrimmage.',
    'University Function Hall',
    '2024-11-05 17:00:00+08:00',
    'AUDS Alumni Relations Committee',
    'https://www.eventbrite.com/e/auds-alumni-homecoming-2024',
    NOW()
);

-- 4. Weekly Varsity Training
INSERT INTO events (
    id,
    title,
    slug,
    description,
    short_description,
    location,
    event_date,
    organizer_name,
    link,
    created_at
) VALUES (
    gen_random_uuid(),
    'Weekly Varsity Training',
    'weekly-varsity-training-nov-12',
    'Focus on British Parliamentary reply speeches and adjudicator feedback rotations. This intensive training session is designed for varsity team members to refine their competitive skills. The workshop covers advanced reply speech strategies, effective use of points of information, and adapting to different adjudication styles. Sessions include practice rounds with detailed feedback from experienced coaches and peer evaluation.',
    'Focus on British Parliamentary reply speeches and adjudicator feedback rotations.',
    'Conference Room B',
    '2024-11-12 19:00:00+08:00',
    'AUDS Varsity Coaching Staff',
    'https://calendar.google.com/varsity-training-schedule',
    NOW()
);

-- Create recurring weekly training events for the next 8 weeks
INSERT INTO events (title, slug, description, short_description, location, event_date, organizer_name, link, created_at)
SELECT
    'Weekly Varsity Training',
    'weekly-varsity-training-' || to_char(date '2024-11-12' + (s.i * interval '1 week'), 'YYYY-MM-DD'),
    'Focus on British Parliamentary reply speeches and adjudicator feedback rotations. This intensive training session is designed for varsity team members to refine their competitive skills.',
    'Focus on British Parliamentary reply speeches and adjudicator feedback rotations.',
    'Conference Room B',
    date '2024-11-12' + (s.i * interval '1 week') + time '19:00:00',
    'AUDS Varsity Coaching Staff',
    'https://calendar.google.com/varsity-training-schedule',
    NOW()
FROM generate_series(1, 8) AS s(i);

-- Update system statistics based on current content
UPDATE system_settings
SET setting_value = 'National Parliamentary Champions 2024'
WHERE setting_key = 'latest_achievement';

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('total_news_articles', '4', 'Total news articles'),
('upcoming_events_count', '12', 'Number of upcoming events'),
('active_outreach_projects', '9', 'Number of active community outreach projects'),
('latest_achievement', 'National Parliamentary Champions 2024', 'Most recent major achievement')
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();


COMMIT;