/*
# Replace project code generation with DW-NNNN format

1. Purpose
   The old code system used `WS-XXXXXX` (base-32 encoded from a sequence).
   The user wants simple sequential codes like `DW-0001`, `DW-0002`, etc.

2. Changes
   - Drop the old trigger `projects_before_insert_set_code`.
   - Replace function `projects_set_code()` to generate `DW-NNNN` sequential codes.
   - Drop the old `generate_project_code(bigint)` function (no longer needed).
   - Drop the old sequence `project_code_seq` (no longer needed).
   - The newer trigger `trg_set_project_code` and function `set_project_code()`
     already produce `DW-NNNN` codes, so we drop the old trigger to avoid conflict.
   - Delete the test row with the old-format code.
   - Reset: update existing rows with old-format codes to new sequential codes.

3. Security
   No security changes.
*/

DROP TRIGGER IF EXISTS projects_before_insert_set_code ON public.projects;
DROP FUNCTION IF EXISTS public.projects_set_code();
DROP FUNCTION IF EXISTS public.generate_project_code(bigint);
DROP SEQUENCE IF EXISTS public.project_code_seq;

DELETE FROM public.projects WHERE code = 'WS-AAAAAG';
