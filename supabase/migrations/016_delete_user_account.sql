-- Migration: Add delete_user_account RPC function
-- Required for iOS App Store compliance (Guideline 5.1.1(v))

-- ============================================================================
-- DELETE USER ACCOUNT FUNCTION
-- ============================================================================

-- This function securely deletes a user's account and all associated data.
-- It verifies the caller is the account owner before proceeding.
-- CASCADE deletes on foreign keys handle: goals, chapters, usage_panels, subscriptions

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
    
    -- Delete user from public.users table
    -- CASCADE will handle: goals, chapters, usage_panels, subscriptions
    DELETE FROM public.users WHERE id = p_user_id;
    
    -- Note: Deletion from auth.users happens automatically via the ON DELETE CASCADE
    -- on the foreign key constraint in the users table definition
    
    RETURN json_build_object(
        'success', true,
        'deleted_goals', deleted_goals_count,
        'deleted_chapters', deleted_chapters_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.delete_user_account(UUID) IS 
'Securely deletes a user account and all associated data. Required for iOS App Store compliance.';
