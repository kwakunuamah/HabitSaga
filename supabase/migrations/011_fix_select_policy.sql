-- Ensure the SELECT policy exists and is correct
-- This is required for the client to fetch the profile after saving it via RPC

-- Drop existing SELECT policy to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own profile" ON users;

-- Create SELECT policy
-- Allows authenticated users to read their own row
CREATE POLICY "Users can read their own profile"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);
