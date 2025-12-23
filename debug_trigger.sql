-- Debug query to check trigger status and test the function

-- 1. Check if trigger exists and is enabled
SELECT 
    schemaname,
    tablename, 
    triggername,
    def
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE triggername = 'on_auth_user_created';

-- 2. Check if the function exists
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. Check RLS policies on profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. Test inserting a profile manually (replace with actual user ID from auth.users)
-- SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- 5. Check profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';