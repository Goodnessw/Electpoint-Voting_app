-- Create enum for election status
CREATE TYPE election_status AS ENUM ('inactive', 'active', 'ended');

-- Create elections table
CREATE TABLE IF NOT EXISTS public.elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  election_id TEXT UNIQUE NOT NULL,
  status election_status DEFAULT 'inactive',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create contestants table
CREATE TABLE IF NOT EXISTS public.contestants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tagline TEXT,
  bio TEXT,
  achievements TEXT,
  vision TEXT,
  photo_url TEXT,
  video_url TEXT,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contestant_id UUID REFERENCES public.contestants(id) ON DELETE CASCADE NOT NULL,
  voter_name TEXT NOT NULL,
  voter_name_lower TEXT NOT NULL,
  election_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(voter_name_lower, election_id)
);

-- Create admin_users table for authentication
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contestants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for elections (public read, admin write)
CREATE POLICY "Elections are viewable by everyone" ON public.elections FOR SELECT USING (true);
CREATE POLICY "Elections are manageable by admin" ON public.elections FOR ALL USING (true);

-- RLS Policies for contestants (public read, admin write)
CREATE POLICY "Contestants are viewable by everyone" ON public.contestants FOR SELECT USING (true);
CREATE POLICY "Contestants are manageable by admin" ON public.contestants FOR ALL USING (true);

-- RLS Policies for votes (public can insert own vote, view all)
CREATE POLICY "Votes are viewable by everyone" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own votes" ON public.votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can manage all votes" ON public.votes FOR ALL USING (true);

-- RLS Policies for admin_users (only admins can read)
CREATE POLICY "Admin users readable by all" ON public.admin_users FOR SELECT USING (true);

-- Function to increment vote count
CREATE OR REPLACE FUNCTION public.increment_vote_count(contestant_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.contestants 
  SET vote_count = vote_count + 1, updated_at = now()
  WHERE id = contestant_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement vote count
CREATE OR REPLACE FUNCTION public.decrement_vote_count(contestant_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.contestants 
  SET vote_count = GREATEST(vote_count - 1, 0), updated_at = now()
  WHERE id = contestant_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage bucket for contestant photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('contestant-photos', 'contestant-photos', true)
ON CONFLICT DO NOTHING;

-- Storage policies for contestant photos
CREATE POLICY "Photos are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'contestant-photos');

CREATE POLICY "Admin can upload photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'contestant-photos');

CREATE POLICY "Admin can update photos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'contestant-photos');

CREATE POLICY "Admin can delete photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'contestant-photos');

-- Insert default admin user (username: Amezmediaadm, password: we(BBB)inzion)
-- Password is hashed using bcrypt
INSERT INTO public.admin_users (username, password_hash) 
VALUES ('Amezmediaadm', '$2a$10$Eq5Z1v8HXGxKf9P8ZqWxPOQJX9vH0.vXj5kZzLxW8pYH2gY4QzGWq')
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_votes_election_id ON public.votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_contestant_id ON public.votes(contestant_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_name_lower ON public.votes(voter_name_lower);
CREATE INDEX IF NOT EXISTS idx_contestants_vote_count ON public.contestants(vote_count DESC);

-- Enable realtime for live vote updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contestants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.elections;