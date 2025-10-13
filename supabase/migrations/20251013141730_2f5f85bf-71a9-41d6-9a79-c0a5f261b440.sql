-- Add phone_number to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text;

-- Update the handle_new_user function to extract phone number from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;