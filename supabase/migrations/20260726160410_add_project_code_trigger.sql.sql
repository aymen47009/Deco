/*
# Add auto-generated project code trigger

1. Purpose
   The `projects` table has a `code` column but no default or trigger to populate
   it. When a customer submits the order form, the code should be auto-generated
   as `DW-0001`, `DW-0002`, etc. so the customer can track their project.

2. Changes
   - Create function `set_project_code()` as a trigger function that sets
     NEW.code to the next sequential code (DW-0001, DW-0002, ...) when it is null.
   - Create trigger `trg_set_project_code` that fires BEFORE INSERT on `projects`.

3. Security
   No security changes — this is a data-integrity trigger only.
*/

CREATE OR REPLACE FUNCTION public.set_project_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  max_num integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 4) AS integer)), 0)
  INTO max_num
  FROM public.projects
  WHERE code ~ '^DW-[0-9]+$';

  NEW.code := 'DW-' || lpad(CAST(max_num + 1 AS text), 4, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_project_code ON public.projects;

CREATE TRIGGER trg_set_project_code
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  WHEN (NEW.code IS NULL)
  EXECUTE FUNCTION public.set_project_code();
