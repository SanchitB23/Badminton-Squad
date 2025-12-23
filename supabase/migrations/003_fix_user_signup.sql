-- Fix for user signup trigger - add INSERT policy for new profile creation
-- This allows the database trigger to insert new profiles when users sign up

-- Add INSERT policy to allow new profile creation during signup
CREATE POLICY "Allow profile creation during signup"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Update the trigger function to handle edge cases
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, ''), '@', 1), 'User'),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, just return
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error and still return NEW to not break auth flow
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;