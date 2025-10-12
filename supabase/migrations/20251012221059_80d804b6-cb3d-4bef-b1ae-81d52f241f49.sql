-- Fix security warnings by recreating functions with search_path
-- Drop trigger first, then function, then recreate both

DROP TRIGGER IF EXISTS check_trial_status ON public.profiles;
DROP FUNCTION IF EXISTS public.check_trial_expired();

-- Recreate check_trial_expired with search_path
CREATE OR REPLACE FUNCTION public.check_trial_expired()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If trial period (7 days) has passed and still on trial, move to free tier
  IF NEW.subscription_tier = 'trial' AND 
     NEW.trial_start_date IS NOT NULL AND 
     NOW() > (NEW.trial_start_date + INTERVAL '7 days') THEN
    NEW.subscription_tier = 'free';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER check_trial_status
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_trial_expired();

-- Recreate reset_daily_messages with search_path
DROP FUNCTION IF EXISTS public.reset_daily_messages();
CREATE OR REPLACE FUNCTION public.reset_daily_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET messages_today = 0,
      last_message_date = CURRENT_DATE
  WHERE last_message_date < CURRENT_DATE;
END;
$$;