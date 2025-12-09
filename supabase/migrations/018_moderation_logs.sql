-- Migration: Add moderation_logs table for content monitoring
-- This table stores user-generated content for administrative review

CREATE TABLE public.moderation_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    content_type text NOT NULL CHECK (content_type IN ('goal_title', 'goal_description', 'context_notes', 'avatar_upload', 'panel_upload')),
    content_text text,
    storage_path text,
    metadata jsonb,
    reviewed boolean DEFAULT false,
    flagged boolean DEFAULT false,
    action_taken text,
    created_at timestamptz DEFAULT now(),
    reviewed_at timestamptz
);

-- Add RLS policies
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Users cannot read their own moderation logs (admin only via service role)
-- No RLS policies for user access - table is admin-only

-- Create index for efficient querying
CREATE INDEX idx_moderation_logs_user_id ON public.moderation_logs(user_id);
CREATE INDEX idx_moderation_logs_created_at ON public.moderation_logs(created_at DESC);
CREATE INDEX idx_moderation_logs_reviewed ON public.moderation_logs(reviewed) WHERE NOT reviewed;

-- Add comment to table
COMMENT ON TABLE public.moderation_logs IS 'Stores user-generated content for administrative review and moderation';
