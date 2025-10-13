import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOtpRequest {
  action: "send" | "verify";
  email: string;
  fullName?: string;
  otpCode?: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, email, fullName, otpCode }: SendOtpRequest = await req.json();

    // Handle OTP verification
    if (action === "verify") {
      console.log("Verifying OTP for:", email);

      if (!email || !otpCode) {
        throw new Error("Email and OTP code are required for verification");
      }

      // Check if OTP is valid
      const { data: otpData, error: otpError } = await supabase
        .from("email_otps")
        .select("*")
        .eq("email", email)
        .eq("otp_code", otpCode)
        .eq("verified", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (otpError || !otpData) {
        console.error("Invalid or expired OTP:", otpError);
        throw new Error("Invalid or expired verification code");
      }

      // Mark OTP as verified
      const { error: updateError } = await supabase
        .from("email_otps")
        .update({ verified: true })
        .eq("id", otpData.id);

      if (updateError) {
        console.error("Error updating OTP:", updateError);
        throw new Error("Failed to verify OTP");
      }

      // Check if user exists
      const { data: { users }, error: userListError } = await supabase.auth.admin.listUsers();
      
      if (userListError) {
        console.error("Error listing users:", userListError);
        throw new Error("Failed to check user existence");
      }

      const existingUser = users.find(u => u.email === email);

      let userId: string;

      if (existingUser) {
        // User exists, use their ID
        userId = existingUser.id;
        console.log("Existing user found:", userId);
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: otpData.full_name || fullName,
          },
        });

        if (createError || !newUser.user) {
          console.error("Error creating user:", createError);
          throw new Error(`Failed to create user: ${createError?.message}`);
        }

        userId = newUser.user.id;
        console.log("New user created:", userId);
      }

      // Generate session for the user
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
      });

      if (sessionError || !sessionData) {
        console.error("Error generating session:", sessionError);
        throw new Error("Failed to generate session");
      }

      console.log("OTP verified and session created for:", email);

      return new Response(
        JSON.stringify({
          success: true,
          session: sessionData,
          message: "OTP verified successfully"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Handle OTP sending (original flow)
    if (action === "send") {

      console.log("Processing OTP send request for:", email);

      if (!email) {
        throw new Error("Email is required");
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP in database
      const { error: dbError } = await supabase
        .from("email_otps")
        .insert({
          email,
          otp_code: otpCode,
          full_name: fullName,
        });

      if (dbError) {
        console.error("Error storing OTP:", dbError);
        throw new Error(`Failed to store OTP: ${dbError.message}`);
      }

      // Send email with OTP
      const emailResponse = await resend.emails.send({
        from: "Bride Buddy <onboarding@resend.dev>",
        to: [email],
        subject: "Your Bride Buddy Verification Code",
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                text-align: center;
                padding: 20px 0;
                border-bottom: 2px solid #f0f0f0;
              }
              .content {
                padding: 30px 0;
              }
              .otp-box {
                background: linear-gradient(135deg, #EA384C 0%, #F97583 100%);
                color: white;
                font-size: 36px;
                font-weight: bold;
                letter-spacing: 8px;
                text-align: center;
                padding: 20px;
                border-radius: 10px;
                margin: 30px 0;
              }
              .footer {
                text-align: center;
                padding-top: 20px;
                border-top: 2px solid #f0f0f0;
                color: #666;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="color: #EA384C; margin: 0;">Bride Buddy</h1>
            </div>
            <div class="content">
              <h2>Hi ${fullName || 'there'}! 👋</h2>
              <p>Your verification code is ready. Enter this code to log in to Bride Buddy:</p>
              <div class="otp-box">${otpCode}</div>
              <p><strong>This code will expire in 10 minutes.</strong></p>
              <p>If you didn't request this code, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>Happy planning! 💍</p>
              <p>© Bride Buddy - Your Wedding Planning Assistant</p>
            </div>
          </body>
        </html>
      `,
      });

      if (emailResponse.error) {
        console.error("Error sending email:", emailResponse.error);
        throw new Error(`Failed to send email: ${emailResponse.error.message}`);
      }

      console.log("OTP sent successfully to:", email);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: "OTP sent successfully"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    throw new Error("Invalid action specified");
  } catch (error: any) {
    console.error("Error in send-email-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
