-- Manual fix for existing users who signed up but don't have profiles

-- Insert profiles for users who don't have them yet
INSERT INTO public.profiles (id, name, email, approved, created_at)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'User') as name,
    u.email,
    false as approved,
    u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Verify the profiles were created
SELECT 
    u.id,
    u.email,
    u.created_at as user_created,
    p.name,
    p.approved,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;