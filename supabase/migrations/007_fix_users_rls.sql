-- Enable RLS on users table (idempotent)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure a clean slate and avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can read their own profile" ON users;

-- Create INSERT policy
-- Allows authenticated users to insert a row if the id matches their auth.uid()
CREATE POLICY "Users can insert their own profile"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create UPDATE policy
-- Allows authenticated users to update their own row
CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create SELECT policy
-- Allows authenticated users to read their own row
CREATE POLICY "Users can read their own profile"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);
