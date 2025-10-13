-- Add partner contact fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS partner_email TEXT,
ADD COLUMN IF NOT EXISTS partner_phone TEXT;

-- Create partner_invitations table to track invitation status
CREATE TABLE IF NOT EXISTS public.partner_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_email TEXT,
  partner_phone TEXT,
  partner_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  invitation_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  partner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on partner_invitations
ALTER TABLE public.partner_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own sent invitations
CREATE POLICY "Users can view their sent invitations"
ON public.partner_invitations
FOR SELECT
USING (auth.uid() = inviter_user_id);

-- Policy: Users can create their own invitations
CREATE POLICY "Users can create invitations"
ON public.partner_invitations
FOR INSERT
WITH CHECK (auth.uid() = inviter_user_id);

-- Policy: Users can update their own invitations
CREATE POLICY "Users can update their invitations"
ON public.partner_invitations
FOR UPDATE
USING (auth.uid() = inviter_user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_partner_invitations_inviter 
ON public.partner_invitations(inviter_user_id);

CREATE INDEX IF NOT EXISTS idx_partner_invitations_status 
ON public.partner_invitations(status);

COMMENT ON TABLE public.partner_invitations IS 'Tracks partner invitation status and links partners to main users';
COMMENT ON COLUMN public.partner_invitations.partner_user_id IS 'Set when partner accepts invitation and creates their account';