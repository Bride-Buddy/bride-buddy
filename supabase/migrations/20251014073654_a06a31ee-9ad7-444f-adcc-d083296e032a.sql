-- Fix security warnings by adding search_path to all functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.check_trial_expired() CASCADE;
DROP FUNCTION IF EXISTS public.reset_daily_messages() CASCADE;
DROP FUNCTION IF EXISTS public.check_trial_expired_and_cleanup() CASCADE;

-- Recreate handle_new_user with proper security settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table with full_name and phone_number
  INSERT INTO public.profiles (user_id, full_name, phone_number)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.phone
  );
  
  -- Insert into timeline table
  INSERT INTO public.timeline (user_id, car_position, completed_tasks)
  VALUES (NEW.id, 0, 0);
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Recreate other functions with security settings
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

CREATE OR REPLACE FUNCTION public.check_trial_expired_and_cleanup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If subscription tier is changing from trial to free
  IF OLD.subscription_tier = 'trial' AND NEW.subscription_tier = 'free' THEN
    -- Delete all user data (vendors, checklist)
    DELETE FROM public.vendors WHERE user_id = NEW.user_id;
    DELETE FROM public.checklist WHERE user_id = NEW.user_id;
    
    -- Reset timeline but keep the record
    UPDATE public.timeline 
    SET car_position = 0, 
        completed_tasks = 0,
        engagement_date = NULL,
        wedding_date = NULL
    WHERE user_id = NEW.user_id;
  END IF;
  
  -- If trial period (7 days) has passed and still on trial, move to free tier
  IF NEW.subscription_tier = 'trial' AND 
     NEW.trial_start_date IS NOT NULL AND 
     NOW() > (NEW.trial_start_date + INTERVAL '7 days') THEN
    NEW.subscription_tier = 'free';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger for trial expiration
DROP TRIGGER IF EXISTS check_trial_status ON public.profiles;
CREATE TRIGGER check_trial_status
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_trial_expired_and_cleanup();