-- BP Debate Training Schedule Migration Script
-- Recreates training_sessions table and migrates BP training data from October 2025 to January 2026

-- Drop existing table if it exists
DROP TABLE IF EXISTS training_sessions CASCADE;

-- Create training_sessions table with comprehensive structure
CREATE TABLE training_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 180, -- 3 hours default
    location VARCHAR(255),
    trainer VARCHAR(255),
    skill_level VARCHAR(50) CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    max_participants INTEGER,
    materials TEXT[], -- Array of required materials
    category VARCHAR(100) DEFAULT 'BP Debate',
    format VARCHAR(100) DEFAULT 'British Parliamentary',
    objectives TEXT[], -- Learning objectives
    prerequisites TEXT,
    status VARCHAR(50) CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON training_sessions
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON training_sessions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON training_sessions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON training_sessions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert BP Debate Training Schedule data
INSERT INTO training_sessions (
    title,
    description,
    session_date,
    duration_minutes,
    skill_level,
    category,
    format,
    objectives,
    materials,
    max_participants
) VALUES
-- October 2025 Sessions
(
    'Foundations of BP Debate',
    'Speaker roles, argument layering, and intro to flowing for opening benches.',
    '2025-10-11 14:00:00+08',
    180,
    'beginner',
    'BP Debate',
    'British Parliamentary',
    ARRAY['Learn speaker roles in BP format', 'Understand argument layering techniques', 'Introduction to flowing methods'],
    ARRAY['Notebook', 'Pen', 'Timer', 'BP role cards'],
    25
),
(
    'Roles & Case Construction',
    'Modeling first half discipline with primer drills on burdens and split logic.',
    '2025-10-18 14:00:00+08',
    180,
    'beginner',
    'BP Debate',
    'British Parliamentary',
    ARRAY['Master first half roles', 'Understand burden distribution', 'Learn case construction logic'],
    ARRAY['Notebook', 'Pen', 'Case construction worksheets'],
    25
),
(
    'Argumentation & Rebuttal',
    'Refutation ladders, framing answers, and targeted micro-clash rounds.',
    '2025-10-25 14:00:00+08',
    180,
    'beginner',
    'BP Debate',
    'British Parliamentary',
    ARRAY['Build effective refutation strategies', 'Frame strong responses', 'Practice micro-clash techniques'],
    ARRAY['Notebook', 'Pen', 'Argument templates', 'Timer'],
    25
),

-- November 2025 Sessions
(
    'Advanced Rebuttal & Clash',
    'Second half focus on responsive bench strategies and depth weighing.',
    '2025-11-01 14:00:00+08',
    180,
    'advanced',
    'BP Debate',
    'British Parliamentary',
    ARRAY['Master second half strategies', 'Advanced rebuttal techniques', 'Depth weighing methods'],
    ARRAY['Notebook', 'Pen', 'Advanced strategy guides', 'Weighing frameworks'],
    20
),
(
    'Value Frameworks (Ethics)',
    'Moral metric development and util/rights balancing through drills.',
    '2025-11-08 14:00:00+08',
    180,
    'beginner',
    'BP Debate',
    'British Parliamentary',
    ARRAY['Develop moral frameworks', 'Understand utilitarian vs rights-based arguments', 'Practice ethical reasoning'],
    ARRAY['Notebook', 'Pen', 'Ethics frameworks handout', 'Case studies'],
    25
),
(
    'Justice & Cultural Constructs',
    'High context motions, narrative nuance, and judge adaptation labs.',
    '2025-11-15 14:00:00+08',
    180,
    'advanced',
    'BP Debate',
    'British Parliamentary',
    ARRAY['Navigate high-context motions', 'Understand cultural nuances', 'Adapt to different judging styles'],
    ARRAY['Notebook', 'Pen', 'Cultural context guides', 'Motion analysis sheets'],
    20
),
(
    'Policy & Governance Systems',
    'Analytical frameworks for state actor motions and comparative models.',
    '2025-11-22 14:00:00+08',
    180,
    'beginner',
    'BP Debate',
    'British Parliamentary',
    ARRAY['Analyze policy mechanisms', 'Understand governance systems', 'Compare different models'],
    ARRAY['Notebook', 'Pen', 'Policy analysis templates', 'Government structure charts'],
    25
),
(
    'Economic Theories in Debate',
    'Macro/micro briefings, trade-offs, and economic weighing techniques.',
    '2025-11-29 14:00:00+08',
    180,
    'advanced',
    'BP Debate',
    'British Parliamentary',
    ARRAY['Apply economic theories', 'Understand macro/micro concepts', 'Master economic weighing'],
    ARRAY['Notebook', 'Pen', 'Economic theory summaries', 'Trade-off analysis sheets'],
    20
),

-- December 2025 Sessions
(
    'International Relations & Ideologies',
    'Global affairs motions, ideological framing, and actor analysis.',
    '2025-12-06 14:00:00+08',
    180,
    'beginner',
    'BP Debate',
    'British Parliamentary',
    ARRAY['Navigate global affairs topics', 'Understand ideological frameworks', 'Analyze international actors'],
    ARRAY['Notebook', 'Pen', 'World affairs briefings', 'Ideology comparison charts'],
    25
),
(
    'Strategy & Extensions',
    'Second bench strategy: outflanking, wrapping, and stakeholder extensions.',
    '2025-12-13 14:00:00+08',
    180,
    'advanced',
    'BP Debate',
    'British Parliamentary',
    ARRAY['Master second bench tactics', 'Learn outflanking strategies', 'Practice stakeholder extensions'],
    ARRAY['Notebook', 'Pen', 'Strategy playbooks', 'Extension templates'],
    20
),
(
    'Whips & Team Dynamics',
    'Closing half synergy, whip collapse techniques, and time management.',
    '2025-12-20 14:00:00+08',
    180,
    'advanced',
    'BP Debate',
    'British Parliamentary',
    ARRAY['Optimize team coordination', 'Master whip techniques', 'Improve time management'],
    ARRAY['Notebook', 'Pen', 'Team coordination guides', 'Time management tools'],
    20
),

-- January 2026 Session
(
    'Tournament Simulation & Feedback',
    'Full BP rounds with panel adjudication, rankings, and development plans.',
    '2026-01-10 14:00:00+08',
    180,
    'advanced',
    'BP Debate',
    'British Parliamentary',
    ARRAY['Experience tournament conditions', 'Receive comprehensive feedback', 'Create development plans'],
    ARRAY['Notebook', 'Pen', 'Feedback forms', 'Development planning sheets'],
    20
);

-- Create indexes for better performance
CREATE INDEX idx_training_sessions_date ON training_sessions(session_date);
CREATE INDEX idx_training_sessions_level ON training_sessions(skill_level);
CREATE INDEX idx_training_sessions_category ON training_sessions(category);
CREATE INDEX idx_training_sessions_status ON training_sessions(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_training_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_training_sessions_updated_at
    BEFORE UPDATE ON training_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_training_sessions_updated_at();

-- View for upcoming sessions
CREATE VIEW upcoming_training_sessions AS
SELECT
    id,
    title,
    description,
    session_date,
    duration_minutes,
    skill_level,
    category,
    format,
    max_participants,
    EXTRACT(EPOCH FROM (session_date - NOW())) / 3600 AS hours_until_session
FROM training_sessions
WHERE session_date > NOW()
  AND status = 'scheduled'
ORDER BY session_date ASC;

-- View for training statistics
CREATE VIEW training_session_stats AS
SELECT
    skill_level,
    COUNT(*) as session_count,
    AVG(duration_minutes) as avg_duration,
    MIN(session_date) as first_session,
    MAX(session_date) as last_session
FROM training_sessions
GROUP BY skill_level;

COMMENT ON TABLE training_sessions IS 'Training sessions table storing BP Debate training schedule and session information';
COMMENT ON COLUMN training_sessions.objectives IS 'Array of learning objectives for the session';
COMMENT ON COLUMN training_sessions.materials IS 'Array of required materials for participants';
COMMENT ON COLUMN training_sessions.prerequisites IS 'Prerequisites or recommended background for the session';

-- Grant permissions (adjust based on your user roles)
GRANT ALL ON training_sessions TO authenticated;
GRANT SELECT ON upcoming_training_sessions TO anon, authenticated;
GRANT SELECT ON training_session_stats TO anon, authenticated;