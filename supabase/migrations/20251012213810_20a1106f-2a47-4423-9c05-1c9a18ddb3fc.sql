-- Add relationship_years to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS relationship_years text;