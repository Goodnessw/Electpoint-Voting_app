-- Add phone_number column to votes table
ALTER TABLE public.votes 
ADD COLUMN phone_number text NOT NULL DEFAULT '';

-- Create unique constraint on phone number and election
CREATE UNIQUE INDEX votes_phone_election_unique 
ON public.votes(phone_number, election_id);

-- Update the constraint comment
COMMENT ON INDEX votes_phone_election_unique IS 'Ensures one vote per phone number per election';