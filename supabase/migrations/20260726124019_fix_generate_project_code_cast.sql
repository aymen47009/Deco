/*
# Fix generate_project_code function cast

## Changes
- Cast the modulo result to integer for substr() compatibility.
- No table changes; only the function is corrected.
*/

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
    ch := substr(alphabet, ((v % 32)::int) + 1, 1);
    result := ch || result;
    v := v / 32;
  END LOOP;
  RETURN 'WS-' || result;
END;
$$;
