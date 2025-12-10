-- Migration: Fix delete_user_account to also delete from auth.users
-- This allows users to re-register after deleting their account

-- ============================================================================
-- UPDATE DELETE USER ACCOUNT FUNCTION
-- ============================================================================

-- Drop the existing function first
DROP FUNCTION IF EXISTS public.delete_user_account(UUID);

-- Recreate with auth.users deletion and secure search_path
CREATE OR REPLACE FUNCTION public.delete_user_account(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    deleted_goals_count INTEGER;
    deleted_chapters_count INTEGER;
BEGIN
    -- Security check: Verify caller is the account owner
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    IF auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Cannot delete another user''s account';
    END IF;
    
    -- Count data being deleted for confirmation
    SELECT COUNT(*) INTO deleted_goals_count FROM public.goals WHERE user_id = p_user_id;
    SELECT COUNT(*) INTO deleted_chapters_count FROM public.chapters WHERE user_id = p_user_id;
    
    -- Delete user from public.users table first
    -- CASCADE will handle: goals, chapters, usage_panels, subscriptions
    DELETE FROM public.users WHERE id = p_user_id;
    
    -- Delete from auth.users to allow re-registration with same email
    -- This is the critical fix - without this, users cannot re-register
    DELETE FROM auth.users WHERE id = p_user_id;
    
    RETURN json_build_object(
        'success', true,
        'deleted_goals', deleted_goals_count,
        'deleted_chapters', deleted_chapters_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.delete_user_account(UUID) IS 
'Securely deletes a user account from both public.users and auth.users, allowing re-registration. Required for iOS App Store compliance.';
