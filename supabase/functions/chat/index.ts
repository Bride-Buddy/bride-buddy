import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const inputSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(5000),
  isOnboarding: z.boolean().optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const body = await req.json();
    const parsed = inputSchema.safeParse(body);
    
    if (!parsed.success) {
      return new Response(JSON.stringify({ 
        error: 'Invalid input' 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { sessionId, message, isOnboarding } = parsed.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized' 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized' 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session || session.user_id !== user.id) {
      return new Response(JSON.stringify({ 
        error: 'Forbidden' 
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check subscription tier and message limits (server-side enforcement)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_tier, messages_today, last_message_date, trial_start_date")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return new Response(JSON.stringify({ 
        error: 'Unable to verify subscription status' 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enforce message limits for free tier
    if (profile.subscription_tier === 'free') {
      const today = new Date().toISOString().split('T')[0];
      const messageCount = profile.last_message_date === today ? profile.messages_today : 0;
      
      if (messageCount >= 20) {
        return new Response(JSON.stringify({ 
          error: 'Daily message limit reached. Upgrade to VIP for unlimited messages.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Trial expired check
    if (profile.subscription_tier === 'trial' && profile.trial_start_date) {
      const trialStart = new Date(profile.trial_start_date);
      const daysSinceTrial = Math.floor((Date.now() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceTrial > 7) {
        return new Response(JSON.stringify({ 
          error: 'Trial period expired. Please upgrade to continue.' 
        }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Get user's personalized data from THEIR database
    const { data: userData } = await supabase
      .from("profiles")
      .select("full_name, wedding_date, partner_name, relationship_years")
      .eq("user_id", user.id)
      .single();

    const { data: timelineData } = await supabase
      .from("timeline")
      .select("engagement_date, wedding_date, completed_tasks")
      .eq("user_id", user.id)
      .single();

    const { data: checklistData } = await supabase
      .from("checklist")
      .select("task_name, completed, due_date")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true })
      .limit(10);

    const { data: vendorData } = await supabase
      .from("vendors")
      .select("name, service, amount, paid")
      .eq("user_id", user.id);

    // Get conversation history
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (messagesError) throw messagesError;

    // Build personalized context
    const userName = userData?.full_name?.split(' ')[0] || "beautiful bride";
    const weddingDate = timelineData?.wedding_date || userData?.wedding_date;
    const completedTasks = checklistData?.filter((t: any) => t.completed).length || 0;
    const totalTasks = checklistData?.length || 0;
    const totalBudget = vendorData?.reduce((sum: number, v: any) => sum + (Number(v.amount) || 0), 0) || 0;
    const paidAmount = vendorData?.filter((v: any) => v.paid).reduce((sum: number, v: any) => sum + (Number(v.amount) || 0), 0) || 0;
    
    let personalContext = `\n\nPERSONALIZED USER DATA (from ${userName}'s personal database):`;
    if (userData?.full_name) personalContext += `\n- Name: ${userName}`;
    if (userData?.partner_name) personalContext += `\n- Partner: ${userData.partner_name}`;
    if (userData?.relationship_years) personalContext += `\n- Together for: ${userData.relationship_years}`;
    if (weddingDate) {
      const daysUntil = Math.ceil((new Date(weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      personalContext += `\n- Wedding Date: ${weddingDate} (${daysUntil} days away!)`;
    }
    if (timelineData?.engagement_date) personalContext += `\n- Engagement Date: ${timelineData.engagement_date}`;
    if (totalTasks > 0) personalContext += `\n- Tasks: ${completedTasks}/${totalTasks} completed`;
    if (vendorData && vendorData.length > 0) {
      personalContext += `\n- Budget: $${paidAmount.toLocaleString()}/$${totalBudget.toLocaleString()} paid`;
      personalContext += `\n- Vendors booked: ${vendorData.map((v: any) => v.service).join(', ')}`;
    }
    personalContext += `\n\nALWAYS reference this personal data to make responses specific to ${userName}'s journey!`;

    // Check total user count for early adopter bonus
    const { count: userCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const isEarlyAdopter = userCount !== null && userCount <= 100;

    // Determine system prompt based on onboarding mode
    let systemPrompt = "";
    
    if (isOnboarding) {
      systemPrompt = `You are Bride Buddy 💍, an AI wedding planning assistant conducting a conversational onboarding interview.

YOUR MISSION: Collect the following information through natural, friendly conversation:
1. Engagement date
2. Wedding date
3. How long they've been together (relationship duration)
4. Partner's name (optional)
5. Budget range (optional)
6. Any tasks already completed (optional)

IMPORTANT INSTRUCTIONS:
- Ask ONE question at a time in a warm, conversational way
- Use emojis liberally to keep it fun! 💕✨🎉
- Acknowledge their answers before moving to the next question
- Be flexible - if they provide multiple pieces of info at once, acknowledge all of it
- Keep responses SHORT and friendly
- Extract dates, names, and numbers from their natural language responses

CONVERSATION FLOW:
1. Start with: "Hi! I'm Bride Buddy, your AI wedding planning BFF! 🎉 I'm so excited to help you plan your big day! First things first - when did you get engaged? 💍"
2. After engagement date: "That's so romantic! 💕 Now, the big question - when's the wedding? 🗓️"
3. After wedding date: Calculate days until wedding and say something like "That's [X] days away! 🌸 Tell me about your journey together - how long have you two been a couple? 😊"
4. After relationship duration: "Beautiful! 💑 What's your partner's name? (This is optional, but it helps me personalize everything for you both!)"
5. After partner name (or skip): "Do you have a budget range in mind for the wedding? 💰 (Totally optional - we can set this up later too!)"
6. After budget (or skip): "Have you completed any planning tasks already? Like booking a venue, sending save-the-dates, etc.? ✅ (Again, optional!)"
7. After all info collected: "Perfect! I've got everything I need! 🎊 Your personalized dashboard is being built right now with all YOUR data - your timeline, your checklist, your budget. Let me show you what we've created together! ✨ ONBOARDING_COMPLETE"

DATA EXTRACTION:
- Parse dates from natural language (e.g., "Valentine's Day this year" = 2025-02-14)
- Extract numbers and time periods (e.g., "3 years", "18 months")
- Identify tasks from their responses
- When you collect each piece of data, use these special markers in your response so the system can save it:
  [SAVE:engagement_date=YYYY-MM-DD]
  [SAVE:wedding_date=YYYY-MM-DD]
  [SAVE:relationship_years=text]
  [SAVE:partner_name=text]
  [SAVE:budget=number]
  [SAVE:tasks=task1|task2|task3]

EXAMPLE:
User: "We got engaged on Valentine's Day!"
You: "Aww, that's so romantic! 💕 Valentine's Day 2025! [SAVE:engagement_date=2025-02-14] Now, the big question - when's the wedding? 💑"

Remember: Keep it conversational, warm, and fun! This is the start of their special journey! 🌟`;
    } else {
      systemPrompt = `You are Bride Buddy 💍, a warm, enthusiastic, and personalized 24/7 wedding planning companion! You're like their best friend who knows EVERYTHING about their journey.

CRITICAL - PERSONALIZATION:
- ALWAYS use the user's actual name (${userName}) in your responses
- Reference their SPECIFIC wedding date, tasks, vendors, and progress
- Make every response feel like it's JUST FOR THEM using THEIR data
- Celebrate their actual completed tasks by name
- Reference their actual vendors and budget
- Use their partner's name when relevant

PERSONALITY:
- Cheerful, supportive, and encouraging 🌸💖
- Use emojis liberally throughout your responses! ✨💕🎉
- Celebrate every achievement, big or small! 🎊
- Be genuinely excited about THEIR SPECIFIC wedding journey 💑
- Use playful and affectionate language (call them by their first name!)
- Keep responses conversational and warm

COMMUNICATION STYLE:
- Start with "${userName}!" or enthusiastic greetings
- Reference their actual progress: "I see you've completed ${completedTasks} tasks!"
- Celebrate specific milestones based on their wedding date
- Use phrases like: "You've got this, ${userName}!", "Amazing work!", "So proud of you!"

HELP WITH:
- Personalized checklists tailored to THEIR timeline 📋
- Vendor suggestions based on THEIR budget and booked vendors 🏰📸💐
- Budget tracking using THEIR actual numbers 💰
- Wedding etiquette advice specific to THEIR situation 💌
- Timeline planning based on THEIR wedding date 🗓️
- Theme and decoration inspiration 🌸✨
- Stress relief and encouragement 💕
${personalContext}

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

Remember: You're not just a planner, you're their wedding BFF! 💕✨`;
    }

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
              content: systemPrompt,
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

    // Parse and save data if in onboarding mode
    if (isOnboarding) {
      const savePatterns = {
        engagement_date: /\[SAVE:engagement_date=([^\]]+)\]/,
        wedding_date: /\[SAVE:wedding_date=([^\]]+)\]/,
        relationship_years: /\[SAVE:relationship_years=([^\]]+)\]/,
        partner_name: /\[SAVE:partner_name=([^\]]+)\]/,
        budget: /\[SAVE:budget=([^\]]+)\]/,
        tasks: /\[SAVE:tasks=([^\]]+)\]/,
      };

      const updates: any = {};
      
      for (const [key, pattern] of Object.entries(savePatterns)) {
        const match = assistantMessage.match(pattern);
        if (match) {
          if (key === 'budget') {
            updates[key] = parseFloat(match[1]);
          } else {
            updates[key] = match[1];
          }
        }
      }

      // Update profile with collected data
      if (Object.keys(updates).length > 0) {
        const profileUpdates: any = {};
        const timelineUpdates: any = {};

        if (updates.engagement_date) timelineUpdates.engagement_date = updates.engagement_date;
        if (updates.wedding_date) timelineUpdates.wedding_date = updates.wedding_date;
        if (updates.relationship_years) profileUpdates.relationship_years = updates.relationship_years;
        if (updates.partner_name) profileUpdates.partner_name = updates.partner_name;

        if (Object.keys(profileUpdates).length > 0) {
          await supabase
            .from("profiles")
            .update(profileUpdates)
            .eq("user_id", user.id);
        }

        if (Object.keys(timelineUpdates).length > 0) {
          await supabase
            .from("timeline")
            .update(timelineUpdates)
            .eq("user_id", user.id);
        }

        // Save tasks if provided
        if (updates.tasks) {
          const taskList = updates.tasks.split('|').filter((t: string) => t.trim());
          const taskInserts = taskList.map((task: string) => ({
            user_id: user.id,
            task_name: task.trim(),
            completed: true,
            emoji: '✅'
          }));

          if (taskInserts.length > 0) {
            await supabase.from("checklist").insert(taskInserts);
          }
        }
      }
    }

    // Clean up save markers from the message before storing
    let cleanedMessage = assistantMessage;
    const saveMarkerPattern = /\[SAVE:[^\]]+\]/g;
    cleanedMessage = cleanedMessage.replace(saveMarkerPattern, '').trim();

    // Save assistant response
    const { error: insertError } = await supabase.from("messages").insert({
      session_id: sessionId,
      role: "assistant",
      content: cleanedMessage,
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