/*
# Create projects table for Deco Workshops

## Purpose
Stores workshop/decoration project requests submitted by customers.
Each project gets a unique human-readable code (e.g. "WS-A1B2C3") generated
automatically by the database on insert, so it can NEVER be null or duplicate.

## New Tables
- `projects`
  - `id` (uuid, primary key)
  - `code` (text, unique, not null) — auto-generated, customer-facing reference
  - `name` (text, not null) — customer full name
  - `phone` (text, not null) — contact phone
  - `email` (text) — optional contact email
  - `workshop_type` (text, not null) — e.g. interior/exterior/furniture
  - `space_size` (text) — optional size of the space
  - `budget` (numeric) — optional budget
  - `description` (text, not null) — project details / requirements
  - `status` (text, not null default 'new') — new / in_review / approved / completed
  - `preferred_date` (date) — optional preferred start date
  - `created_at` (timestamptz, default now)

## Auto-Code Generation
- A sequence `project_code_seq` provides an incrementing number.
- A trigger `projects_before_insert_set_code` fires BEFORE INSERT and sets
  `code` to 'WS-' + 6 chars from a 32-symbol alphabet derived from the sequence.
  Because it derives from a monotonic sequence, the code is guaranteed unique
  and removes the possibility of the duplicate-null error from the old setup.

## Security
- Enable RLS on `projects`.
- Single-tenant (no sign-in) app: allow anon + authenticated full CRUD so the
  public order form can submit and an admin can read/manage.
*/

CREATE SEQUENCE IF NOT EXISTS project_code_seq START 1;

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  workshop_type text NOT NULL,
  space_size text,
  budget numeric,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  preferred_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE
  TO anon, authenticated USING (true);

-- Generate a unique readable code from a sequence value.
-- Uses a 32-symbol alphabet without ambiguous chars (O/0/I/1).
-- Derived from a monotonic sequence, so guaranteed unique.
CREATE OR REPLACE FUNCTION generate_project_code(seq_val bigint)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v bigint := seq_val;
  ch char;
  result text := '';
  i int;
BEGIN
  FOR i IN 1..6 LOOP
    ch := substr(alphabet, (v % 32) + 1, 1);
    result := ch || result;
    v := v / 32;
  END LOOP;
  RETURN 'WS-' || result;
END;
$$;

-- Trigger: set code automatically before insert if not provided
CREATE OR REPLACE FUNCTION projects_set_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  next_val bigint;
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    next_val := nextval('project_code_seq');
    NEW.code := generate_project_code(next_val);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS projects_before_insert_set_code ON projects;
CREATE TRIGGER projects_before_insert_set_code
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION projects_set_code();

CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(code);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
