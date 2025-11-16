/*
# [Add Registration Link to Events]
This operation adds a new column `registration_link` to the `events` table to store an optional URL for event registration.

## Query Description:
- This is a non-destructive operation that adds a new, nullable column.
- Existing data will not be affected; the new column will be `NULL` for all existing rows.
- No data backup is strictly required, but it's always good practice before any schema change.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (The column can be dropped)

## Structure Details:
- Table: `public.events`
- Column Added: `registration_link` (type: `text`, nullable: `true`)

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None for this migration.

## Performance Impact:
- Indexes: None added.
- Triggers: None added.
- Estimated Impact: Negligible.
*/
ALTER TABLE public.events
ADD COLUMN registration_link TEXT;
