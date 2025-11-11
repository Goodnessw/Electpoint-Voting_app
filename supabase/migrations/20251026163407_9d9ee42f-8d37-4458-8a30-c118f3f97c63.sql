-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create function to verify admin login
CREATE OR REPLACE FUNCTION public.verify_admin_login(
  p_username TEXT,
  p_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  
  -- Verify the password
  RETURN (v_password_hash = crypt(p_password, v_password_hash));
END;
$$;

-- Insert admin user with hashed password
Create extension if not exists pgcrypto;
INSERT INTO public.admin_users (username, password_hash)
VALUES ('Amezmediaadmin', crypt('we(BBB)inzion', public.gen_salt('bf')))
ON CONFLICT (username) DO UPDATE
SET password_hash = crypt('we(BBB)inzion', gen_salt('bf'));