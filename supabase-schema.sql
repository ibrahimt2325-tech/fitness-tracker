-- Fitness Challenge Tracker Schema
-- Run this in your Supabase SQL Editor

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily logs table
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  steps INTEGER,
  pages INTEGER,
  stretched BOOLEAN DEFAULT FALSE,
  lifted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Weekly logs table
CREATE TABLE weekly_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL, -- Always a Monday
  did_3_mile BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity TEXT NOT NULL, -- 'steps', 'reading', 'stretch', 'lifting', 'running'
  milestone TEXT NOT NULL, -- 'bronze', 'silver', 'gold', 'platinum'
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity, milestone)
);

-- Indexes for performance
CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, date);
CREATE INDEX idx_weekly_logs_user_week ON weekly_logs(user_id, week_start_date);
CREATE INDEX idx_achievements_user ON achievements(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all authenticated users to read everything (it's a shared challenge)
CREATE POLICY "Anyone can view users" ON users FOR SELECT USING (true);
CREATE POLICY "Anyone can view daily_logs" ON daily_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can view weekly_logs" ON weekly_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);

-- For now, allow all inserts/updates (in production, restrict to own user)
CREATE POLICY "Anyone can insert daily_logs" ON daily_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update daily_logs" ON daily_logs FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert weekly_logs" ON weekly_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update weekly_logs" ON weekly_logs FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert achievements" ON achievements FOR INSERT WITH CHECK (true);

-- Seed data: Two users
INSERT INTO users (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Thomas'),
  ('22222222-2222-2222-2222-222222222222', 'Nico');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER daily_logs_updated_at
  BEFORE UPDATE ON daily_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER weekly_logs_updated_at
  BEFORE UPDATE ON weekly_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
