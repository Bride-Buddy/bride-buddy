-- Add trial and subscription tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN trial_start_date timestamp with time zone DEFAULT now(),
ADD COLUMN subscription_tier text DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'free', 'vip')),
ADD COLUMN messages_today integer DEFAULT 0,
ADD COLUMN last_message_date date DEFAULT CURRENT_DATE;

-- Update existing users to have trial starting now
UPDATE public.profiles 
SET trial_start_date = now(), 
    subscription_tier = 'trial'
WHERE trial_start_date IS NULL;

-- Function to reset daily message count
CREATE OR REPLACE FUNCTION public.reset_daily_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET messages_today = 0,
      last_message_date = CURRENT_DATE
  WHERE last_message_date < CURRENT_DATE;
END;
$$;

-- Function to check and update trial status
CREATE OR REPLACE FUNCTION public.check_trial_expired()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Trigger to check trial status on profile updates
CREATE TRIGGER check_trial_status
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_trial_expired();