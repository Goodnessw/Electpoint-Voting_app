-- Drop and recreate the function with correct search_path
DROP FUNCTION IF EXISTS public.verify_admin_login(text, text);

CREATE OR REPLACE FUNCTION public.verify_admin_login(
  p_username TEXT,
  p_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_password_hash TEXT;
BEGIN
  -- Get the password hash for the username
  SELECT password_hash INTO v_password_hash
  FROM public.admin_users
  WHERE username = p_username;
  
  -- If user not found, return false
  IF v_password_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verify the password using crypt from pgcrypto extension
  RETURN (v_password_hash = crypt(p_password, v_password_hash));
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in verify_admin_login: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Recreate admin user with proper password hash
DELETE FROM public.admin_users WHERE username = 'Amezmediaadmin';
INSERT INTO public.admin_users (username, password_hash)
VALUES ('Amezmediaadmin', crypt('we(BBB)inzion', gen_salt('bf')));