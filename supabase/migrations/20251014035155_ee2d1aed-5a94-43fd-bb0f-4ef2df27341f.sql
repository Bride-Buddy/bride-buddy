-- Update trial expiration trigger to handle data cleanup
CREATE OR REPLACE FUNCTION public.check_trial_expired_and_cleanup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Drop old trigger and create new one
DROP TRIGGER IF EXISTS check_trial_expired ON profiles;
CREATE TRIGGER check_trial_expired
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_trial_expired_and_cleanup();