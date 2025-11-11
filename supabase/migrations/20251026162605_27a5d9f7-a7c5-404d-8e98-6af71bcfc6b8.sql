-- Add first_name and last_name columns to votes table
ALTER TABLE public.votes 
ADD COLUMN first_name text,
ADD COLUMN last_name text;

-- Update existing data by splitting voter_name (if any exists)
UPDATE public.votes 
SET 
  first_name = split_part(voter_name, ' ', 1),
  last_name = CASE 
    WHEN array_length(string_to_array(voter_name, ' '), 1) > 1 
    THEN substring(voter_name from position(' ' in voter_name) + 1)
    ELSE ''
  END;

-- Make first_name and last_name NOT NULL after populating existing data
ALTER TABLE public.votes 
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

-- Drop the old unique constraint on phone_number + election_id
ALTER TABLE public.votes 
DROP CONSTRAINT IF EXISTS votes_phone_number_election_id_key;

-- Drop phone_number column
ALTER TABLE public.votes 
DROP COLUMN phone_number;

-- Add new unique constraint on voter_name_lower + election_id to prevent duplicate votes
ALTER TABLE public.votes 
ADD CONSTRAINT votes_voter_name_election_unique UNIQUE (voter_name_lower, election_id);