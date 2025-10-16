-- Add location_text column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location_text TEXT;