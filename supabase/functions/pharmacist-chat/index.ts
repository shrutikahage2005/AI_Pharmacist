import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MEDICINE_CONTEXT = `You are PharmaCare AI, an expert AI pharmacist assistant. You help customers order medicines, check availability, enforce prescription rules, and provide health guidance.

CRITICAL RULES:
1. You have access to a pharmacy inventory. When a user asks about medicines, check availability and stock.
2. If a medicine requires a prescription (prescription_required = true), you MUST ask for prescription verification before proceeding.
3. Never recommend dosages beyond what's on the label. Always suggest consulting a doctor for prescription medicines.
4. Be warm, professional, and proactive. If you detect a user might need a refill based on conversation, suggest it.
5. You can process orders: extract medicine name, quantity, and confirm with the user.
6. For safety: flag drug interactions, allergies if mentioned, and always err on the side of caution.
7. Format responses clearly with medicine names, prices, and availability.
8. If stock is low (< 20 units), warn the customer about limited availability.
9. You speak both English and German, responding in the language the customer uses.

AVAILABLE ACTIONS (mention these naturally):
- Check medicine availability and pricing
- Place an order (after prescription verification if needed)
- Check order history for a patient
- Suggest refills based on purchase history
- Provide general health guidance (non-diagnostic)

Always be concise but thorough. Use emoji sparingly for warmth (💊, ✅, ⚠️).`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Handle tool actions
    if (action === "process_order") {
      // Mock order processing
      return new Response(JSON.stringify({
        success: true,
        order_id: crypto.randomUUID().slice(0, 8).toUpperCase(),
        message: "Order placed successfully",
        webhook_triggered: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: MEDICINE_CONTEXT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("pharmacist-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
