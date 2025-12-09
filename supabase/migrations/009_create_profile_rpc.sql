-- Create a secure function to update user profiles
-- This function runs with "SECURITY DEFINER" privileges, bypassing RLS on the users table
-- Updated to accept p_user_id explicitly to avoid auth.uid() null issues

CREATE OR REPLACE FUNCTION update_user_profile(
  p_user_id UUID,
  p_display_name TEXT,
  p_age_range TEXT,
  p_timezone TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
BEGIN
  -- Get the user's email from auth.users using the passed ID
  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;

  -- Upsert the user profile
  INSERT INTO public.users (id, email, display_name, age_range, timezone)
  VALUES (
    p_user_id,
    v_email,
    p_display_name,
    p_age_range,
    p_timezone
  )
  ON CONFLICT (id) DO UPDATE
  SET
    display_name = EXCLUDED.display_name,
    age_range = EXCLUDED.age_range,
    timezone = EXCLUDED.timezone;
END;
$$;
