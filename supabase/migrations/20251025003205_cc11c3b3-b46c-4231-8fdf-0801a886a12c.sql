-- Fix search_path security issues for existing functions
CREATE OR REPLACE FUNCTION public.increment_vote_count(contestant_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.contestants 
  SET vote_count = vote_count + 1, updated_at = now()
  WHERE id = contestant_uuid;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_vote_count(contestant_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.contestants 
  SET vote_count = GREATEST(vote_count - 1, 0), updated_at = now()
  WHERE id = contestant_uuid;
END;
$function$;