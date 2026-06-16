-- PATHFINDER AI — COMPLETE SUPABASE DATABASE SCHEMA
-- Copy and paste this script directly into the Supabase SQL Editor to initialize your database tables.

-- 1. ENABLE UUID GENERATOR EXTENSION (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE STUDENT PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    current_level VARCHAR(50) NOT NULL, -- class_10, class_11, class_12, ug, pg, graduate
    state VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- general, obc, sc, st, ews
    gender VARCHAR(50) NOT NULL,
    income_range VARCHAR(50) NOT NULL, -- below_1, 1_3, 3_6, 6_10, above_10 (LPA)
    stream VARCHAR(50) NOT NULL, -- pcm, pcb, commerce, arts, na
    class_10_score NUMERIC(5,2),
    class_12_score NUMERIC(5,2),
    current_college VARCHAR(255),
    current_branch VARCHAR(255),
    current_cgpa NUMERIC(4,2),
    exam_scores JSONB DEFAULT '{}'::jsonb, -- {'jee_mains': {'score': '94.5', 'rank': '45000'}, ...}
    interests TEXT[] DEFAULT '{}'::text[],
    preferred_work_style VARCHAR(50) DEFAULT 'collaborative',
    career_goal TEXT,
    location_preference VARCHAR(100) DEFAULT 'anywhere',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- 3. CREATE CAREER RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS public.career_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendations JSONB NOT NULL, -- array of career matching objects
    input_snapshot JSONB NOT NULL, -- snap of profile during calculation
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CREATE COLLEGE PREDICTIONS TABLE
CREATE TABLE IF NOT EXISTS public.college_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_type VARCHAR(50) NOT NULL,
    score_or_rank INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL,
    home_state VARCHAR(100) NOT NULL,
    preferred_branch VARCHAR(100),
    predictions JSONB NOT NULL, -- array of predicted colleges
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CREATE SCHOLARSHIP MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.scholarship_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    matches JSONB NOT NULL, -- array of eligible scholarships
    total_value VARCHAR(100),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CREATE SKILL ROADMAPS TABLE
CREATE TABLE IF NOT EXISTS public.skill_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_career VARCHAR(255) NOT NULL,
    roadmap JSONB NOT NULL, -- phase-wise task lists, resources
    skill_gaps JSONB NOT NULL, -- comparison radar graph data
    progress JSONB DEFAULT '{}'::jsonb, -- tracker status of checked items
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CREATE RESUME ANALYSES TABLE
CREATE TABLE IF NOT EXISTS public.resume_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    target_role VARCHAR(255) NOT NULL,
    overall_score INTEGER NOT NULL,
    section_scores JSONB NOT NULL,
    suggestions JSONB NOT NULL,
    keywords JSONB NOT NULL, -- missing / present list
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. CREATE CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    role VARCHAR(50) NOT NULL, -- user, assistant
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. CREATE SAVED COLLEGES TABLE (WISHLIST)
CREATE TABLE IF NOT EXISTS public.saved_colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    college_name VARCHAR(255) NOT NULL,
    branch VARCHAR(255),
    details JSONB DEFAULT '{}'::jsonb,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_college UNIQUE (user_id, college_name, branch)
);

-- 10. CREATE SAVED SCHOLARSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.saved_scholarships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scholarship_name VARCHAR(255) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'saved', -- saved, applied, received
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_scholarship UNIQUE (user_id, scholarship_name)
);

-- 11. CREATE ACTIVITY LOG TABLE
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL, -- career_explored, college_predicted, etc.
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_career_recs_user_id ON public.career_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_college_preds_user_id ON public.college_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_scholarship_matches_user_id ON public.scholarship_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_roadmaps_user_id ON public.skill_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON public.resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id_session ON public.chat_messages(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_saved_colleges_user_id ON public.saved_colleges(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_scholarships_user_id ON public.saved_scholarships(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
-- Enable RLS on all tables
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- 1. Student Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.student_profiles 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.student_profiles 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.student_profiles 
    FOR UPDATE USING (auth.uid() = user_id);

-- 2. Career Recommendations Policies
CREATE POLICY "Users can view their own recommendations" ON public.career_recommendations 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own recommendations" ON public.career_recommendations 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. College Predictions Policies
CREATE POLICY "Users can view their own predictions" ON public.college_predictions 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own predictions" ON public.college_predictions 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Scholarship Matches Policies
CREATE POLICY "Users can view their own matches" ON public.scholarship_matches 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own matches" ON public.scholarship_matches 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Skill Roadmaps Policies
CREATE POLICY "Users can view their own roadmaps" ON public.skill_roadmaps 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create/update their own roadmaps" ON public.skill_roadmaps 
    FOR ALL USING (auth.uid() = user_id);

-- 6. Resume Analyses Policies
CREATE POLICY "Users can view their own resume analyses" ON public.resume_analyses 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload/analyze their own resume" ON public.resume_analyses 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Chat Messages Policies
CREATE POLICY "Users can view their own chat messages" ON public.chat_messages 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can send chat messages" ON public.chat_messages 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Saved Colleges Policies
CREATE POLICY "Users can manage their saved colleges" ON public.saved_colleges 
    FOR ALL USING (auth.uid() = user_id);

-- 9. Saved Scholarships Policies
CREATE POLICY "Users can manage their saved scholarships" ON public.saved_scholarships 
    FOR ALL USING (auth.uid() = user_id);

-- 10. Activity Log Policies
CREATE POLICY "Users can view their own activity logs" ON public.activity_log 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can log user activities" ON public.activity_log 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
