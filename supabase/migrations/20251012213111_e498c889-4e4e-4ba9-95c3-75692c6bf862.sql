-- Update profiles table to add username
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Create checklist table for task memory
CREATE TABLE IF NOT EXISTS public.checklist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  task_name text NOT NULL,
  emoji text,
  due_date date,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on checklist
ALTER TABLE public.checklist ENABLE ROW LEVEL SECURITY;

-- RLS policies for checklist
CREATE POLICY "Users can view their own checklist" 
ON public.checklist FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checklist items" 
ON public.checklist FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklist items" 
ON public.checklist FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklist items" 
ON public.checklist FOR DELETE 
USING (auth.uid() = user_id);

-- Create vendor tracker table
CREATE TABLE IF NOT EXISTS public.vendors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name text NOT NULL,
  service text NOT NULL,
  amount numeric,
  paid boolean NOT NULL DEFAULT false,
  due_date date,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on vendors
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- RLS policies for vendors
CREATE POLICY "Users can view their own vendors" 
ON public.vendors FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vendors" 
ON public.vendors FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendors" 
ON public.vendors FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendors" 
ON public.vendors FOR DELETE 
USING (auth.uid() = user_id);

-- Create timeline memory table
CREATE TABLE IF NOT EXISTS public.timeline (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE UNIQUE,
  engagement_date date,
  wedding_date date,
  car_position integer DEFAULT 0,
  completed_tasks integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on timeline
ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;

-- RLS policies for timeline
CREATE POLICY "Users can view their own timeline" 
ON public.timeline FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own timeline" 
ON public.timeline FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timeline" 
ON public.timeline FOR UPDATE 
USING (auth.uid() = user_id);

-- Add updated_at trigger to new tables
CREATE TRIGGER update_checklist_updated_at
BEFORE UPDATE ON public.checklist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timeline_updated_at
BEFORE UPDATE ON public.timeline
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();