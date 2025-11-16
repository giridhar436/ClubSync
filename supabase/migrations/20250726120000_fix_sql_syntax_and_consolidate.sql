/*
# [Consolidated Schema and RLS Fix]
This script provides a complete and corrected setup for the events and announcements features. It resolves previous errors related to missing functions and incorrect SQL syntax in policy definitions.

## Query Description: [This script creates the necessary database functions, tables, and security policies for managing events and announcements. It replaces all previous, faulty migration scripts for this feature. This is a safe, structural change and should not affect existing user data in other tables.]

## Metadata:
- Schema-Category: ["Structural", "Safe"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true (by dropping the created objects)

## Structure Details:
- **Types Created:** `user_role` ENUM.
- **Functions Created:** `get_user_role(uuid)`.
- **Tables Created:** `events`, `announcements`.
- **Policies Created:** RLS policies for SELECT, INSERT, UPDATE, DELETE on both tables.

## Security Implications:
- RLS Status: Enabled on `events` and `announcements`.
- Policy Changes: Yes, this script defines the definitive RLS policies.
- Auth Requirements: Policies differentiate access for authenticated users vs. admins.

## Performance Impact:
- Indexes: Primary keys and foreign keys are indexed by default.
- Triggers: None.
- Estimated Impact: Low. Standard table creation.
*/

-- Step 1: Create the user_role type if it doesn't exist.
-- This handles cases where previous migrations might have partially run.
DO $$
BEGIN
    CREATE TYPE public.user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'type "user_role" already exists, skipping';
END
$$;


-- Step 2: Create the function to get a user's role from the profiles table.
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role user_role;
BEGIN
  SELECT p.role INTO role FROM public.profiles p WHERE p.id = user_id;
  RETURN role;
END;
$$;


-- Step 3: Create the 'events' table
CREATE TABLE IF NOT EXISTS public.events (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    title text NOT NULL,
    description text,
    event_date timestamp with time zone NOT NULL,
    venue text,
    club_id text NOT NULL
);
COMMENT ON TABLE public.events IS 'Stores event information for various clubs.';


-- Step 4: Create the 'announcements' table
CREATE TABLE IF NOT EXISTS public.announcements (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    title text NOT NULL,
    description text,
    club_id text NOT NULL
);
COMMENT ON TABLE public.announcements IS 'Stores announcements for various clubs.';


-- Step 5: Set up Row Level Security (RLS) for the 'events' table

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Allow all authenticated users to read events" ON public.events;
DROP POLICY IF EXISTS "Allow admins to insert events" ON public.events;
DROP POLICY IF EXISTS "Allow admins to update events" ON public.events;
DROP POLICY IF EXISTS "Allow admins to delete events" ON public.events;

-- Create policies with correct syntax
CREATE POLICY "Allow all authenticated users to read events"
ON public.events FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow admins to insert events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Allow admins to update events"
ON public.events FOR UPDATE
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Allow admins to delete events"
ON public.events FOR DELETE
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);


-- Step 6: Set up Row Level Security (RLS) for the 'announcements' table

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Allow all authenticated users to read announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow admins to insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow admins to update announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow admins to delete announcements" ON public.announcements;

-- Create policies with correct syntax
CREATE POLICY "Allow all authenticated users to read announcements"
ON public.announcements FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow admins to insert announcements"
ON public.announcements FOR INSERT
TO authenticated
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Allow admins to update announcements"
ON public.announcements FOR UPDATE
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Allow admins to delete announcements"
ON public.announcements FOR DELETE
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);
