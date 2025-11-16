/*
  # Create Content Tables and Policies

  This migration creates the 'events' and 'announcements' tables to store user-generated content.
  It also establishes Row Level Security (RLS) policies to control access.

  ## Query Description:
  This script is safe to run. It creates new tables and does not modify or delete any existing data.
  - Creates `events` table for club events.
  - Creates `announcements` table for club announcements.
  - Enables RLS on both tables.
  - Creates policies to allow:
    - Admins to perform all actions (SELECT, INSERT, UPDATE, DELETE).
    - Any authenticated user to view content (SELECT).

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true (by dropping the tables and policies)

  ## Structure Details:
  - Tables created: `public.events`, `public.announcements`
  - Columns added:
    - events: id, created_at, title, event_date, venue, description, club_id
    - announcements: id, created_at, title, description, club_id
  - Foreign Keys: `club_id` references `clubs(id)` (Note: Assumes a `clubs` table exists or will be created). For now, it's text.

  ## Security Implications:
  - RLS Status: Enabled on `events` and `announcements`.
  - Policy Changes: Yes, new policies are created.
  - Auth Requirements: Policies rely on the `get_user_role()` function and `auth.uid()`.

  ## Performance Impact:
  - Indexes: Primary key indexes are automatically created.
  - Triggers: None.
  - Estimated Impact: Low.
*/

-- Create the events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ,
  venue TEXT,
  description TEXT,
  club_id TEXT NOT NULL
);
COMMENT ON TABLE public.events IS 'Stores event information for various clubs.';

-- Create the announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT,
  club_id TEXT NOT NULL
);
COMMENT ON TABLE public.announcements IS 'Stores announcement information for various clubs.';

-- Enable RLS for the new tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the events table
CREATE POLICY "Allow admin full access on events"
ON public.events
FOR ALL
USING ((get_user_role(auth.uid()) = 'admin'::user_role))
WITH CHECK ((get_user_role(auth.uid()) = 'admin'::user_role));

CREATE POLICY "Allow authenticated users to read events"
ON public.events
FOR SELECT
USING (auth.role() = 'authenticated');

-- Create RLS policies for the announcements table
CREATE POLICY "Allow admin full access on announcements"
ON public.announcements
FOR ALL
USING ((get_user_role(auth.uid()) = 'admin'::user_role))
WITH CHECK ((get_user_role(auth.uid()) = 'admin'::user_role));

CREATE POLICY "Allow authenticated users to read announcements"
ON public.announcements
FOR SELECT
USING (auth.role() = 'authenticated');
