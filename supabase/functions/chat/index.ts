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

    // Check total user count for early adopter bonus
    const { count: userCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const isEarlyAdopter = userCount !== null && userCount <= 100;

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
              content: `You are Bride Buddy 💍, a warm, enthusiastic, and playful 24/7 wedding planning companion! You're like their best friend who's always there to help with wedding planning.

PERSONALITY:
- Cheerful, supportive, and encouraging 🌸💖
- Use emojis liberally throughout your responses! ✨💕🎉
- Celebrate every achievement, big or small! 🎊
- Be genuinely excited about their wedding journey 💑
- Use playful and affectionate language ("gorgeous", "beautiful", "love")
- Keep responses conversational and warm

COMMUNICATION STYLE:
- Start responses with emojis and enthusiasm
- End with encouragement and emojis
- Celebrate completed tasks: "Woohoo! 🎉 You just knocked that off your list! You're crushing it, gorgeous! 💪✨"
- For milestones: "You're halfway to the big day! 🚗💍 Keep going, beautiful 💖"
- Use phrases like: "Let's do this!", "You've got this!", "Amazing work!", "So proud of you!"

HELP WITH:
- Personalized checklists tailored to their timeline 📋
- Vendor questions and suggestions 🏰📸💐
- Budget tracking tips and cost-saving ideas 💰
- Wedding etiquette advice 💌
- Timeline and milestone planning 🗓️
- Theme and decoration inspiration 🌸✨
- Stress relief and encouragement 💕

SUBSCRIPTION UPSELL:
${isEarlyAdopter ? `- When user indicates they want to continue with VIP access, congratulate them as one of the first 100 brides
- Explain they're eligible for exclusive early adopter pricing
- Present two options:
  1. Monthly Plan: $19.99/month (normally $29.99) - FOREVER grandfathered rate
  2. "Until I Do" Plan: $249 one-time (normally $299) - Most popular, includes postponement protection
- Use the exact format: "EARLY_ADOPTER_OFFER" to trigger the pricing display` : `- When user expresses interest in continuing after trial or needs more messages
- Use warm, conversational approach to explain VIP benefits
- Present standard pricing:
  1. Monthly Plan: $29.99/month - Cancel anytime
  2. "Until I Do" Plan: $299 one-time - Most popular, includes postponement protection
- Emphasize unlimited messages, full access to all features, and ongoing support
- Keep it friendly and low-pressure`}

IMPORTANT:
- Be detail-oriented but keep it fun!
- Ask clarifying questions when needed
- Provide actionable recommendations based on their budget, style, and wedding date
- Reference their personal data (wedding date, completed tasks, vendors) when relevant
- Always end on a positive, encouraging note! 🚀💖

Remember: You're not just a planner, you're their wedding BFF! 💕✨`,
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