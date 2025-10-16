import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(() => {
  return new Response(
    JSON.stringify({
      PRIVATE_SUPABASE_URL: !!Deno.env.get("PRIVATE_SUPABASE_URL"),
      PRIVATE_SUPABASE_SERVICE_ROLE_KEY: !!Deno.env.get("PRIVATE_SUPABASE_SERVICE_ROLE_KEY"),
      STRIPE_SECRET_KEY: !!Deno.env.get("STRIPE_SECRET_KEY"),
      RESEND_API_KEY: !!Deno.env.get("RESEND_API_KEY"),
      CLAUDE_API_KEY: !!Deno.env.get("CLAUDE_API_KEY"),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
