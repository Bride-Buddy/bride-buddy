import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const inputSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(5000),
  isOnboarding: z.boolean().optional(),
 userLocation: z.object({
  latitude: z.number(),
  longitude: z.number(),
}).nullable().optional(),

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("🚀 Chat function called");

  try {
    // Validate input
    const body = await req.json();
    console.log("📨 Request body:", { sessionId: body.sessionId, messageLength: body.message?.length });
    const parsed = inputSchema.safeParse(body);

    if (!parsed.success) {
      console.error("❌ Input validation failed:", parsed.error);
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: parsed.error.errors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { sessionId, message, isOnboarding, userLocation } = parsed.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    console.log("🔐 Auth header present:", !!authHeader);
    if (!authHeader) {
      console.error("❌ No auth header");
      return new Response(
        JSON.stringify({
          error: "Unauthorized - No auth header provided",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT token
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    console.log("👤 User authenticated:", user?.id);
    console.log("📍 User location provided:", !!userLocation);

    if (authError || !user) {
      console.error("❌ Auth error:", authError);
      return new Response(
        JSON.stringify({
          error: "Unauthorized - Invalid token",
          details: authError?.message,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .single();

    console.log("📂 Session check:", { sessionId, found: !!session, error: sessionError?.message });

    if (sessionError || !session || session.user_id !== user.id) {
      console.error("❌ Session validation failed:", { sessionError, sessionUserId: session?.user_id, actualUserId: user.id });
      return new Response(
        JSON.stringify({
          error: "Forbidden - Session not found or access denied",
          details: sessionError?.message,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check subscription tier and message limits (server-side enforcement)
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_tier, messages_today, last_message_date, trial_start_date, full_name")
      .eq("user_id", user.id)
      .single();

    console.log("👤 Profile fetch:", { found: !!profile, error: profileError?.message });

    // CRITICAL FIX: If profile doesn't exist, create it now
    if (profileError?.code === 'PGRST116') { // No rows returned
      console.log("🔧 Creating missing profile for user:", user.id);
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          phone_number: user.phone,
        })
        .select()
        .single();
      
      if (createError) {
        console.error("❌ Failed to create profile:", createError);
        return new Response(
          JSON.stringify({
            error: "Failed to create user profile",
            details: createError.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      
      // Also create timeline
      await supabase.from("timeline").insert({ user_id: user.id });
      console.log("✅ Profile and timeline created");
      
      // Use the new profile
      profile = newProfile;
    } else if (profileError || !profile) {
      console.error("❌ Profile fetch error:", profileError);
      return new Response(
        JSON.stringify({
          error: "Unable to verify subscription status",
          details: profileError?.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // At this point, profile is guaranteed to exist (TypeScript assertion)
    if (!profile) {
      throw new Error("Profile unexpectedly null after creation/fetch");
    }
    
    const userName = profile.full_name?.split(" ")[0] || "beautiful bride";

    // Enforce message limits for free tier
    if (profile.subscription_tier === "free") {
      const today = new Date().toISOString().split("T")[0];
      const messageCount = profile.last_message_date === today ? profile.messages_today : 0;

      if (messageCount >= 20) {
        return new Response(
          JSON.stringify({
            error: "Daily message limit reached. Upgrade to VIP for unlimited messages.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Trial expiration handling
    if (profile.subscription_tier === "trial" && profile.trial_start_date) {
      const trialStart = new Date(profile.trial_start_date);
      const daysSinceTrial = Math.floor((Date.now() - trialStart.getTime()) / (1000 * 60 * 60 * 24));

      // Day 7: Send expiration message and downgrade to free
      if (daysSinceTrial === 7) {
        const expirationMessage = `⏰ **Your free trial expires today!**

You have two options, ${userName}:

✨ **Upgrade to VIP** - Save all your progress and continue unlimited planning!
  • Unlimited messages & full access
  • Keep all your vendors, tasks, and timeline
  • Continue where you left off

💝 **Downgrade to Basic (Free)** - Lose all your data
  • Limited to 20 messages/day
  • All vendors, checklists, and timeline will be deleted
  • Start fresh with basic features

What would you like to do? 💕`;

        // Insert expiration message
        await supabase.from("messages").insert({
          session_id: sessionId,
          role: "assistant",
          content: expirationMessage,
        });

        // Downgrade to free tier (this will trigger data cleanup via database trigger)
        await supabase
          .from("profiles")
          .update({ subscription_tier: "free" })
          .eq("user_id", user.id);

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // After day 7: Block if still on trial (shouldn't happen due to trigger)
      if (daysSinceTrial > 7) {
        return new Response(
          JSON.stringify({
            error: "Trial period expired. Please upgrade to continue.",
          }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
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
    // userName already defined earlier for trial expiration message
    const weddingDate = timelineData?.wedding_date || userData?.wedding_date;
    const completedTasks = checklistData?.filter((t: any) => t.completed).length || 0;
    const totalTasks = checklistData?.length || 0;
    const totalBudget = vendorData?.reduce((sum: number, v: any) => sum + (Number(v.amount) || 0), 0) || 0;
    const paidAmount =
      vendorData?.filter((v: any) => v.paid).reduce((sum: number, v: any) => sum + (Number(v.amount) || 0), 0) || 0;

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
      personalContext += `\n- Vendors booked: ${vendorData.map((v: any) => v.service).join(", ")}`;
    }
    personalContext += `\n\nALWAYS reference this personal data to make responses specific to ${userName}'s journey!`;

    // Check total user count for early adopter bonus
    const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });

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
- Use emojis moderately throughout your responses! ✨💕🎉
- Celebrate every achievement, big or small! 🎊
- Be genuinely excited about THEIR SPECIFIC wedding journey 💑
- Use playful and affectionate language (call them by their first name!)
- Keep responses conversational and warm

COMMUNICATION STYLE:
- Start with "${userName}!" or enthusiastic greetings
- Reference their actual progress: "I see you've completed ${completedTasks} tasks!"
- Celebrate specific milestones based on their wedding date
- Use phrases like: "You've got this, ${userName}!", "Amazing work!", "So proud of you!"

VENDOR AUTO-DETECTION:
- When users mention a vendor (e.g., "My photographer is Sarah's Studio", "We booked Elite Catering"), AUTOMATICALLY use the search_vendors tool
- Extract the vendor name and service type from their message
- Search for the vendor near their location
- Auto-add vendor details (phone, address, website) to their vendor tracker
- Confirm what was added with emoji-rich formatting

HELP WITH:
- Personalized checklists tailored to THEIR timeline 📋
- Vendor suggestions based on THEIR budget and booked vendors 🏰📸💐
- Budget tracking using THEIR actual numbers 💰
- Wedding etiquette advice specific to THEIR situation 💌
- Timeline planning based on THEIR wedding date 🗓️
- Theme and decoration inspiration 🌸✨
- Stress relief and encouragement 💕
- Automatic vendor lookup and contact information retrieval 📞🌐
${personalContext}

SUBSCRIPTION UPSELL:
${
  isEarlyAdopter
    ? `- When user indicates they want to continue with VIP access, congratulate them as one of the first 100 brides
- Explain they're eligible for exclusive early adopter pricing
- Present two options:
  1. Monthly Plan: $19.99/month (normally $29.99) - FOREVER grandfathered rate
  2. "Until I Do" Plan: $249 one-time (normally $299) - Most popular, includes postponement protection
- Use the exact format: "EARLY_ADOPTER_OFFER" to trigger the pricing display`
    : `- When user expresses interest in continuing after trial or needs more messages
- Use warm, conversational approach to explain VIP benefits
- Present standard pricing:
  1. Monthly Plan: $29.99/month - Cancel anytime
  2. "Until I Do" Plan: $299 one-time - Most popular, includes postponement protection
- Emphasize unlimited messages, full access to all features, and ongoing support
- Keep it friendly and low-pressure`
}

IMPORTANT:
- Be detail-oriented but keep it fun!
- Ask clarifying questions when needed
- Provide actionable recommendations based on their budget, style, and wedding date
- Reference their personal data (wedding date, completed tasks, vendors) when relevant
- Always end on a positive, encouraging note! 🚀💖

Remember: You're not just a planner, you're their wedding BFF! 💕✨`;
    }

    console.log("💬 Preparing AI request with system prompt length:", systemPrompt.length);

    // Store user message
    const { error: userMsgError } = await supabase.from("messages").insert({
      session_id: sessionId,
      role: "user",
      content: message,
    });

    if (userMsgError) {
      console.error("❌ Failed to store user message:", userMsgError);
      throw userMsgError;
    }

    console.log("✅ User message stored");

    // Build conversation for AI (include history)
    const conversationHistory = messages?.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    })) || [];

    // Define vendor search tool
    const tools = [
      {
        type: "function",
        function: {
          name: "search_vendors",
          description: "Search for wedding vendors near the user's location using OpenStreetMap data. Use this when the user mentions a vendor name (e.g., 'My photographer is Sarah's Studio', 'We booked Elite Catering'). Returns vendor details including name, address, phone, and website, then automatically adds them to the vendor tracker.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Vendor name or search query (e.g., 'Sarah Studio', 'Elite Catering', 'wedding venue', 'photographer')",
              },
              category: {
                type: "string",
                description: "Vendor service type (e.g., 'Photography', 'Catering', 'Venue', 'Flowers', 'DJ', 'Makeup', 'Cake', 'Videography')",
              },
              radius_km: {
                type: "number",
                description: "Search radius in kilometers (default: 50)",
                default: 50,
              },
            },
            required: ["query", "category"],
          },
        },
      },
    ];

    // Call AI with tool support
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        tools: tools,
        tool_choice: "auto",
      }),
    });

    console.log("🤖 AI API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ AI API error:", response.status, errorText);
      
      // Handle specific error codes
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "We're experiencing high demand right now. Please try again in a moment! 💕",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Our AI service needs attention. Please contact support! 💖",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    console.log("🤖 AI response received:", { hasChoices: !!aiResponse.choices, choicesLength: aiResponse.choices?.length });
    
    if (!aiResponse.choices || aiResponse.choices.length === 0) {
      console.error("❌ No choices in AI response:", aiResponse);
      throw new Error("AI returned no response choices");
    }
    
    let assistantMessage = aiResponse.choices[0].message?.content || "";
    const toolCalls = aiResponse.choices[0].message?.tool_calls;
    
    console.log("📝 Assistant message:", { 
      messageLength: assistantMessage.length, 
      hasToolCalls: !!toolCalls,
      toolCallsCount: toolCalls?.length || 0
    });

    // Handle tool calls (vendor search)
    if (toolCalls && toolCalls.length > 0) {
      console.log("Tool calls detected:", toolCalls);
      
      for (const toolCall of toolCalls) {
        if (toolCall.function.name === "search_vendors") {
          const args = JSON.parse(toolCall.function.arguments);
          const { query, category, radius_km = 50 } = args;

          if (!userLocation?.latitude || !userLocation?.longitude) {
            assistantMessage += "\n\n⚠️ I need your location to search for vendors nearby. Please enable location access in your profile settings.";
            continue;
          }

          // Search OpenStreetMap
          const osmQuery = `
            [out:json];
            (
              node["name"~"${query}",i](around:${radius_km * 1000},${userLocation.latitude},${userLocation.longitude});
              way["name"~"${query}",i](around:${radius_km * 1000},${userLocation.latitude},${userLocation.longitude});
            );
            out body;
          `;

          try {
            const osmResponse = await fetch("https://overpass-api.de/api/interpreter", {
              method: "POST",
              body: osmQuery,
            });

            const osmData = await osmResponse.json();
            
            if (osmData.elements && osmData.elements.length > 0) {
              const vendors = osmData.elements.slice(0, 5).map((element: any) => {
                const tags = element.tags || {};
                return {
                  name: tags.name || query,
                  address: [
                    tags["addr:housenumber"],
                    tags["addr:street"],
                    tags["addr:city"],
                    tags["addr:state"],
                    tags["addr:postcode"],
                  ].filter(Boolean).join(", "),
                  phone: tags.phone || tags["contact:phone"] || "",
                  website: tags.website || tags["contact:website"] || "",
                  service_type: category || tags.amenity || tags.shop || query,
                };
              });

              // Auto-add vendors to database (for both onboarding and regular chat)
              if (vendors.length > 0) {
                const vendorInserts = vendors.map((v: any) => ({
                  user_id: user.id,
                  name: v.name,
                  service: v.service_type,
                  notes: `📞 ${v.phone || "Not available"}\n🌐 ${v.website || "Not available"}\n📍 ${v.address || "Not available"}`,
                  amount: 0,
                  paid: false,
                }));

                try {
                  // Use upsert to prevent duplicates based on user_id and name
                  // Check for existing vendors to avoid duplicates
                  const existingVendorsCheck = await supabase
                    .from("vendors")
                    .select("name")
                    .eq("user_id", user.id)
                    .in("name", vendors.map((v: any) => v.name));
                  
                  const existingNames = new Set(existingVendorsCheck.data?.map(v => v.name) || []);
                  const newVendors = vendorInserts.filter((v: any) => !existingNames.has(v.name));
                  
                  if (newVendors.length > 0) {
                    const { error: insertError } = await supabase
                      .from("vendors")
                      .insert(newVendors)
                      .select();
                    
                    if (insertError) {
                      console.error("Vendor insert error:", insertError);
                    } else {
                      console.log(`Added ${newVendors.length} new vendors for user ${user.id}`);
                    }
                  } else {
                    console.log("All vendors already exist in tracker");
                  }
                } catch (err) {
                  console.error("Vendor upsert failed:", err);
                }
              }

              // Format vendor results for the AI response with emoji-rich confirmation
              if (vendors.length === 1) {
                const v = vendors[0];
                assistantMessage += `\n\n✅ Added **${v.name}** to your vendor tracker!\n\n📸 **Service:** ${v.service_type}\n📞 **Phone:** ${v.phone || "Not available"}\n🌐 **Website:** ${v.website || "Not available"}\n📍 **Address:** ${v.address || "Not available"}\n\nYou can view and edit this in your Vendor Tracker! 💕`;
              } else if (vendors.length > 1) {
                const vendorList = vendors.map((v: any, idx: number) => 
                  `${idx + 1}. **${v.name}**\n   📸 Service: ${v.service_type}\n   📍 ${v.address || "Not available"}\n   📞 ${v.phone || "Not available"}`
                ).join("\n\n");
                assistantMessage += `\n\n✅ I found ${vendors.length} vendors matching "${query}":\n\n${vendorList}\n\nI've added ${vendors.length === 1 ? 'this' : 'these'} to your vendor tracker! You can view details in your Vendor Tracker. 💕`;
              }
            } else {
              assistantMessage += `\n\n😊 I couldn't find any vendors matching "${query}" within ${radius_km}km of your location. Try searching with different keywords or expand your search radius!`;
            }
          } catch (osmError) {
            console.error("OSM search error:", osmError);
            assistantMessage += `\n\n⚠️ I had trouble searching for vendors right now. Please try again in a moment!`;
          }
        }
      }
    }

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
          if (key === "budget") {
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
          await supabase.from("profiles").update(profileUpdates).eq("user_id", user.id);
        }

        if (Object.keys(timelineUpdates).length > 0) {
          await supabase.from("timeline").update(timelineUpdates).eq("user_id", user.id);
        }

        // Save tasks if provided
        if (updates.tasks) {
          const taskList = updates.tasks.split("|").filter((t: string) => t.trim());
          const taskInserts = taskList.map((task: string) => ({
            user_id: user.id,
            task_name: task.trim(),
            completed: true,
            emoji: "✅",
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
    cleanedMessage = cleanedMessage.replace(saveMarkerPattern, "").trim();

    // Save assistant response
    const { error: insertError } = await supabase.from("messages").insert({
      session_id: sessionId,
      role: "assistant",
      content: cleanedMessage,
    });

    if (insertError) {
      console.error("❌ Failed to save assistant message:", insertError);
      throw insertError;
    }

    console.log("✅ Assistant message saved successfully");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log detailed error server-side for debugging
    console.error("Chat function error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Return helpful error message to client
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(
      JSON.stringify({
        error: "I'm having trouble connecting right now 💙 Please try again in a moment!",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
