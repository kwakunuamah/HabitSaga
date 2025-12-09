-- Migration: 005_add_avatar_url.sql
-- Description: Adds avatar_url to users table.

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN public.users.avatar_url IS 'URL to user avatar image';
