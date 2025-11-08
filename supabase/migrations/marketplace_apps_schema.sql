-- ============================================================================
-- MARKETPLACE APPS DATA PERSISTENCE SCHEMA
-- ============================================================================
-- Database tables for 6 pre-installed marketplace apps
-- Version: 1.0.0
-- Date: 2025-10-21
-- ============================================================================

-- ============================================================================
-- TODO LIST APP
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_todos_user_id ON app_todos(user_id);
CREATE INDEX IF NOT EXISTS idx_app_todos_completed ON app_todos(completed);

-- ============================================================================
-- EXPENSE TRACKER APP
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_transactions_user_id ON app_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_app_transactions_type ON app_transactions(type);
CREATE INDEX IF NOT EXISTS idx_app_transactions_date ON app_transactions(date);

-- ============================================================================
-- POMODORO TIMER APP
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_pomodoro_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL DEFAULT 25,
    type TEXT NOT NULL CHECK (type IN ('work', 'break')),
    completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_pomodoro_user_id ON app_pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_app_pomodoro_completed ON app_pomodoro_sessions(completed);
CREATE INDEX IF NOT EXISTS idx_app_pomodoro_started_at ON app_pomodoro_sessions(started_at);

-- ============================================================================
-- NOTES APP
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_notes_user_id ON app_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_app_notes_updated_at ON app_notes(updated_at);

-- ============================================================================
-- HABIT TRACKER APP
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '🎯',
    color TEXT DEFAULT 'from-blue-600 to-cyan-600',
    streak INTEGER DEFAULT 0,
    total_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_habit_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID REFERENCES app_habits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    completed_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(habit_id, completed_date)
);

CREATE INDEX IF NOT EXISTS idx_app_habits_user_id ON app_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_app_habit_completions_habit_id ON app_habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_app_habit_completions_date ON app_habit_completions(completed_date);

-- ============================================================================
-- MOBILE APP BUILDER
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_builder_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📱',
    database_type TEXT CHECK (database_type IN ('built-in', 'company', 'custom')),
    database_config JSONB,
    screens JSONB DEFAULT '[]'::jsonb,
    logic TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_builder_projects_user_id ON app_builder_projects(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE app_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_builder_projects ENABLE ROW LEVEL SECURITY;

-- Todos policies
CREATE POLICY "Users can view their own todos" ON app_todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own todos" ON app_todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own todos" ON app_todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own todos" ON app_todos FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON app_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON app_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON app_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON app_transactions FOR DELETE USING (auth.uid() = user_id);

-- Pomodoro sessions policies
CREATE POLICY "Users can view their own pomodoro sessions" ON app_pomodoro_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pomodoro sessions" ON app_pomodoro_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pomodoro sessions" ON app_pomodoro_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pomodoro sessions" ON app_pomodoro_sessions FOR DELETE USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Users can view their own notes" ON app_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notes" ON app_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON app_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON app_notes FOR DELETE USING (auth.uid() = user_id);

-- Habits policies
CREATE POLICY "Users can view their own habits" ON app_habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own habits" ON app_habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits" ON app_habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits" ON app_habits FOR DELETE USING (auth.uid() = user_id);

-- Habit completions policies
CREATE POLICY "Users can view their own habit completions" ON app_habit_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own habit completions" ON app_habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habit completions" ON app_habit_completions FOR DELETE USING (auth.uid() = user_id);

-- App builder projects policies
CREATE POLICY "Users can view their own app builder projects" ON app_builder_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own app builder projects" ON app_builder_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own app builder projects" ON app_builder_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own app builder projects" ON app_builder_projects FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_app_todos_updated_at BEFORE UPDATE ON app_todos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_transactions_updated_at BEFORE UPDATE ON app_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_notes_updated_at BEFORE UPDATE ON app_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_habits_updated_at BEFORE UPDATE ON app_habits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_builder_projects_updated_at BEFORE UPDATE ON app_builder_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

