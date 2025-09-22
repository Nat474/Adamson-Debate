-- Sample data for Adamson Debate Society
-- Run this after setting up the main schema to populate with example data

-- Sample members
INSERT INTO members (
    email, first_name, last_name, student_id, college, year_level,
    membership_type, phone_number, position, bio, date_joined, academic_year
) VALUES
('john.martinez@adamson.edu.ph', 'John', 'Martinez', 'ADU2022001', 'College of Liberal Arts', '3rd Year', 'varsity', '+639123456789', 'President', 'Passionate debater with 3 years of competitive experience. Specializes in parliamentary and Asian parliamentary formats.', '2022-08-15', '2022-2023'),
('maria.santos@adamson.edu.ph', 'Maria', 'Santos', 'ADU2021002', 'College of Engineering', '4th Year', 'varsity', '+639987654321', 'Vice President', 'Engineering student with a passion for logical argumentation and critical thinking.', '2021-08-20', '2021-2022'),
('david.chen@adamson.edu.ph', 'David', 'Chen', 'ADU2023003', 'College of Business Administration', '2nd Year', 'resident', '+639111222333', 'Secretary', 'Business student interested in debate and public speaking development.', '2023-08-10', '2023-2024'),
('sarah.reyes@adamson.edu.ph', 'Sarah', 'Reyes', 'ADU2022004', 'College of Liberal Arts', '3rd Year', 'varsity', '+639444555666', 'Training Director', 'Debate coach and mentor with expertise in research and argumentation techniques.', '2022-08-18', '2022-2023'),
('miguel.garcia@adamson.edu.ph', 'Miguel', 'Garcia', 'ADU2023005', 'College of Sciences', '1st Year', 'resident', '+639777888999', NULL, 'New member eager to learn debate skills and participate in competitions.', '2024-08-25', '2024-2025');

-- Sample news posts
INSERT INTO news_posts (
    title, slug, content, excerpt, author_name, category, published, featured, published_at
) VALUES
(
    'Adamson Debate Society Wins National Parliamentary Championship 2024',
    'auds-wins-national-parliamentary-championship-2024',
    'The Adamson University Debate Society has achieved an outstanding victory at the National Parliamentary Debate Championship 2024, held at the University of the Philippines Diliman. Our varsity team, composed of John Martinez and Maria Santos, demonstrated exceptional skill in argumentation and critical thinking throughout the three-day competition.

The championship featured 32 teams from universities across the Philippines, making this victory particularly significant for our organization. The team successfully navigated through preliminary rounds, quarter-finals, and semi-finals before securing the championship title in a closely contested final round.

This marks our third consecutive national title and solidifies our position as one of the premier debate societies in the Philippines. The victory is a testament to the rigorous training programs and dedication of our members and coaches.

President John Martinez expressed his gratitude: "This victory belongs to every member of our society. It represents years of hard work, countless hours of practice, and the unwavering support of our coaches and the university administration."

The society will represent the Philippines in the upcoming Asian Universities Debate Championship to be held in Singapore next month.',
    'Our team has achieved an outstanding victory at the National Parliamentary Debate Championship, demonstrating excellence in argumentation and critical thinking.',
    'John Martinez',
    'achievements',
    true,
    true,
    '2024-09-15 10:00:00'
),
(
    'Upcoming: Inter-University Debate Championship',
    'upcoming-inter-university-debate-championship',
    'The Adamson University Debate Society is proud to announce the upcoming Inter-University Debate Championship scheduled for October 15-17, 2024. This prestigious event will bring together the finest debate teams from universities across Metro Manila and nearby provinces.

The championship will feature both novice and varsity divisions, ensuring participation opportunities for debaters of all skill levels. Registration is now open for all interested participants, with early bird rates available until September 30, 2024.

Tournament Director Maria Santos announced: "We are excited to host this championship and showcase the talent of young debaters from across the region. This event promises to be highly competitive and educational for all participants."

The tournament will follow Asian Parliamentary format rules and will cover contemporary topics relevant to current social, political, and economic issues. Prizes and recognition will be awarded to top-performing teams and individual speakers.

For registration and more information, please contact our events committee at events@auds.org or visit our registration portal.',
    'Join us for the upcoming Inter-University Debate Championship on October 15-17, 2024. Registration is now open for all interested debaters.',
    'Maria Santos',
    'events',
    true,
    false,
    '2024-09-10 14:30:00'
),
(
    'New Training Program: Advanced Argumentation Techniques',
    'new-training-program-advanced-argumentation-techniques',
    'The Adamson University Debate Society is launching a comprehensive new training program focused on advanced argumentation techniques and critical analysis skills. This program, designed by our experienced coaches and alumni, aims to elevate the skill level of our members and prepare them for high-level competitions.

The program consists of eight modules covering:
- Advanced logical reasoning and fallacy identification
- Sophisticated rebuttal techniques
- Case construction and analysis
- Cross-examination strategies
- Time management in competitive debates
- Research methodology and evidence evaluation
- Persuasive speaking techniques
- Tournament preparation and mental conditioning

Sessions will be held every Saturday afternoon, with additional practice sessions scheduled throughout the week. The program is open to all members who have completed our basic training requirements.

Professor David Chen, who will be leading the program, stated: "This curriculum represents the culmination of years of competitive experience and coaching expertise. We believe it will significantly enhance our members\' abilities and contribute to their success in future competitions."

Registration for the program begins on September 20, 2024. Limited slots are available to ensure personalized attention and quality instruction.',
    'We are launching a new advanced training program focusing on sophisticated argumentation techniques and critical analysis skills.',
    'Prof. David Chen',
    'training',
    true,
    false,
    '2024-09-05 09:15:00'
);

-- Sample events
INSERT INTO events (
    title, slug, description, short_description, event_type, event_date, end_date,
    location, organizer_name, max_participants, registration_required, registration_deadline,
    status, contact_email
) VALUES
(
    'Inter-University Debate Championship 2024',
    'inter-university-debate-championship-2024',
    'Annual championship featuring top debate teams from universities across the Philippines. The event includes both novice and varsity divisions with Asian Parliamentary format debates covering contemporary social, political, and economic issues.',
    'Annual championship featuring top debate teams from across the Philippines.',
    'competition',
    '2024-10-15 08:00:00',
    '2024-10-17 18:00:00',
    'Adamson University Conference Center',
    'Maria Santos',
    64,
    true,
    '2024-10-10 23:59:59',
    'upcoming',
    'events@auds.org'
),
(
    'Public Speaking Workshop: Persuasive Communication',
    'public-speaking-workshop-persuasive-communication',
    'Advanced workshop focusing on persuasive communication techniques, presentation skills, and audience engagement. Led by experienced coaches and featuring guest speakers from professional fields.',
    'Advanced workshop on persuasive communication and presentation skills.',
    'workshop',
    '2024-10-22 14:00:00',
    '2024-10-22 17:00:00',
    'Adamson University Room 301',
    'Sarah Reyes',
    30,
    true,
    '2024-10-20 17:00:00',
    'upcoming',
    'training@auds.org'
),
(
    'Alumni Homecoming and Recognition Night',
    'alumni-homecoming-recognition-night-2024',
    'Annual gathering celebrating the achievements of current members and distinguished alumni. The event includes awards ceremony, networking session, and dinner. Open to all members, alumni, and special guests.',
    'Annual gathering of current members and distinguished alumni with awards ceremony.',
    'social',
    '2024-11-05 18:00:00',
    '2024-11-05 22:00:00',
    'Adamson University Gymnasium',
    'Alumni Committee',
    100,
    true,
    '2024-11-01 17:00:00',
    'upcoming',
    'alumni@auds.org'
);

-- Sample achievements
INSERT INTO achievements (
    title, description, achievement_type, competition_name, position, date_achieved,
    participant_names, featured
) VALUES
(
    'National Parliamentary Debate Championship 2024 - Champions',
    'First place victory at the most prestigious debate competition in the Philippines',
    'team',
    'National Parliamentary Debate Championship 2024',
    'Champion',
    '2024-09-15',
    ARRAY['John Martinez', 'Maria Santos'],
    true
),
(
    'Asian Universities Debate Championship 2023 - Semi-Finalists',
    'Reached semi-finals in international competition representing the Philippines',
    'team',
    'Asian Universities Debate Championship 2023',
    'Semi-Finalist',
    '2023-11-20',
    ARRAY['John Martinez', 'Maria Santos', 'David Chen'],
    true
),
(
    'Best Speaker Award - Metro Manila Inter-University Tournament',
    'Individual recognition for outstanding speaking performance',
    'individual',
    'Metro Manila Inter-University Tournament 2024',
    'Best Speaker',
    '2024-03-10',
    ARRAY['Sarah Reyes'],
    false
);

-- Sample contact submissions
INSERT INTO contact_submissions (
    name, email, phone, subject, message, inquiry_type, status
) VALUES
(
    'Alex Thompson',
    'alex.thompson@email.com',
    '+639123456789',
    'Membership Inquiry',
    'Hi, I am a transfer student from UP Diliman and would like to join the debate society. I have previous experience in parliamentary debate and would like to know about the application process.',
    'membership',
    'new'
),
(
    'Professor Lisa Wong',
    'lisa.wong@university.edu',
    '+639987654321',
    'Collaboration Proposal',
    'Hello, I represent the Communication Department and would like to discuss potential collaboration opportunities for debate workshops and training programs.',
    'collaboration',
    'new'
);

-- Sample training sessions
INSERT INTO training_sessions (
    title, description, session_type, trainer_name, session_date, duration,
    location, max_attendees, skill_level
) VALUES
(
    'Introduction to Parliamentary Debate',
    'Basic introduction to parliamentary debate format, rules, and speaking order',
    'workshop',
    'Sarah Reyes',
    '2024-09-28 14:00:00',
    120,
    'Room 205',
    25,
    'beginner'
),
(
    'Advanced Case Construction',
    'Advanced techniques for building strong debate cases and arguments',
    'lecture',
    'John Martinez',
    '2024-10-05 15:00:00',
    90,
    'Room 301',
    15,
    'advanced'
),
(
    'Weekly Practice Session',
    'Regular practice session with mock debates and feedback',
    'practice',
    'Maria Santos',
    '2024-09-30 16:00:00',
    120,
    'Conference Room A',
    20,
    'all'
);

-- Sample resources
INSERT INTO resources (
    title, description, resource_type, category, file_url, access_level,
    uploader_name, tags
) VALUES
(
    'AUDS Constitution and Bylaws',
    'Official constitution and bylaws of the Adamson University Debate Society',
    'document',
    'constitution',
    '/resources/auds-constitution.pdf',
    'public',
    'Admin',
    ARRAY['constitution', 'bylaws', 'governance']
),
(
    'Parliamentary Debate Guidelines',
    'Comprehensive guide to parliamentary debate format and rules',
    'document',
    'guidelines',
    '/resources/parliamentary-guidelines.pdf',
    'members',
    'Sarah Reyes',
    ARRAY['parliamentary', 'rules', 'format']
),
(
    'Research and Evidence Handbook',
    'Guide to effective research methods and evidence evaluation for debates',
    'document',
    'training',
    '/resources/research-handbook.pdf',
    'members',
    'David Chen',
    ARRAY['research', 'evidence', 'methodology']
);