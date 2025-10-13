import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PartnerInviteRequest {
  partnerName: string;
  partnerEmail: string | null;
  partnerPhone: string | null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authenticated user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { partnerName, partnerEmail, partnerPhone }: PartnerInviteRequest = await req.json();

    console.log("Processing partner invite for:", { partnerName, partnerEmail, partnerPhone });

    if (!partnerEmail && !partnerPhone) {
      throw new Error("Either email or phone number is required");
    }

    // Generate and send OTP for partner
    let otpResponse;
    if (partnerEmail) {
      otpResponse = await supabase.auth.signInWithOtp({
        email: partnerEmail,
        options: {
          data: {
            full_name: partnerName,
            invited_by: user.id,
          },
          emailRedirectTo: `${Deno.env.get("SUPABASE_URL")}/auth/v1/verify`
        }
      });
    } else if (partnerPhone) {
      otpResponse = await supabase.auth.signInWithOtp({
        phone: partnerPhone,
        options: {
          data: {
            full_name: partnerName,
            invited_by: user.id,
          }
        }
      });
    }

    if (otpResponse?.error) {
      console.error("Error generating OTP:", otpResponse.error);
      throw new Error(`Failed to send OTP: ${otpResponse.error.message}`);
    }

    // Create invitation record
    const { data: invitation, error: inviteError } = await supabase
      .from("partner_invitations")
      .insert({
        inviter_user_id: user.id,
        partner_name: partnerName,
        partner_email: partnerEmail,
        partner_phone: partnerPhone,
        status: "pending"
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Error creating invitation:", inviteError);
      throw inviteError;
    }

    console.log("Partner invitation created successfully:", invitation.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitationId: invitation.id,
        message: "Partner OTP sent successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-partner-invite function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
