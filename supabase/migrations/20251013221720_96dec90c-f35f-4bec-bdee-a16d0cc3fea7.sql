-- Add DELETE policy for messages table so users can delete their own chat history
CREATE POLICY "Users can delete messages from their sessions"
ON public.messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM chat_sessions
    WHERE chat_sessions.id = messages.session_id
    AND chat_sessions.user_id = auth.uid()
  )
);

-- Add DELETE policy for profiles table (GDPR compliance - right to deletion)
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Add DELETE policy for partner_invitations table
CREATE POLICY "Users can delete their invitations"
ON public.partner_invitations
FOR DELETE
USING (auth.uid() = inviter_user_id);

-- Add SELECT policy so partners can view invitations sent to them
CREATE POLICY "Partners can view their invitations"
ON public.partner_invitations
FOR SELECT
USING (
  auth.uid() = inviter_user_id OR
  auth.uid() = partner_user_id OR
  (SELECT email FROM auth.users WHERE id = auth.uid()) = partner_email
);