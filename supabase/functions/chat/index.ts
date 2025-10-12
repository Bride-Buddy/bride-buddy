import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, message } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get conversation history
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (messagesError) throw messagesError;

    // Call AI
    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are Bride Buddy, a warm and enthusiastic 24/7 wedding planning companion. Conversationally guide couples through their wedding planning journey with:
- Personalized checklists tailored to their timeline
- Vendor questions and suggestions
- Budget tracking tips and cost-saving ideas
- Wedding etiquette advice
- Timeline and milestone planning
- Theme and decoration inspiration

Be supportive, detail-oriented, conversational, and help them feel confident in every decision. Ask clarifying questions when needed and provide actionable recommendations based on their budget, style preferences, and wedding date.`,
            },
            ...messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices[0].message.content;

    // Save assistant response
    const { error: insertError } = await supabase.from("messages").insert({
      session_id: sessionId,
      role: "assistant",
      content: assistantMessage,
    });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log detailed error server-side for debugging
    console.error('Chat function error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Return safe generic message to client
    return new Response(JSON.stringify({ 
      error: 'Unable to process your request. Please try again.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});