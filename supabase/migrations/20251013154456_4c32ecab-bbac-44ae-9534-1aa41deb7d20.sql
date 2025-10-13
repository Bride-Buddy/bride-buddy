-- Drop unused email_otps table and cleanup function
-- This table was not referenced in any application code and had insecure RLS policies

DROP TABLE IF EXISTS public.email_otps CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_expired_otps();