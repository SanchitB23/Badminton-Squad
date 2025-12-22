-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view approved profiles"
  ON profiles FOR SELECT
  USING (approved = true);

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Super admins can manage all profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'super_admin' 
      AND p.approved = true
    )
  );

-- Sessions policies  
CREATE POLICY "Approved users can view all sessions"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.approved = true
    )
  );

CREATE POLICY "Approved users can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.approved = true
    )
  );

CREATE POLICY "Session creators can update their own sessions"
  ON sessions FOR UPDATE
  USING (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.approved = true
    )
  );

CREATE POLICY "Session creators can delete their own sessions"
  ON sessions FOR DELETE
  USING (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.approved = true
    )
  );

-- Responses policies
CREATE POLICY "Approved users can view all responses"
  ON responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.approved = true
    )
  );

CREATE POLICY "Approved users can manage their own responses"
  ON responses FOR ALL
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.approved = true
    )
  );

-- Comments policies
CREATE POLICY "Approved users can view all comments"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.approved = true
    )
  );

CREATE POLICY "Approved users can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.approved = true
    )
  );

CREATE POLICY "Users can manage their own comments"
  ON comments FOR ALL
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.approved = true
    )
  );

CREATE POLICY "Session creators can moderate all comments on their sessions"
  ON comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sessions s 
      JOIN profiles p ON p.id = auth.uid()
      WHERE s.id = session_id 
      AND s.created_by = auth.uid()
      AND p.approved = true
    )
  );

-- Analytics policies
CREATE POLICY "Users can view their own analytics"
  ON user_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all analytics"
  ON user_analytics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'super_admin' 
      AND p.approved = true
    )
  );