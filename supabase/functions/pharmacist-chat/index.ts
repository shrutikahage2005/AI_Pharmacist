import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

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

AVAILABLE TOOLS - When you detect the user wants to place an order, output a JSON block like:
\`\`\`json
{"action":"place_order","medicine":"NAME","quantity":N,"patient_id":"PATIENT_ID"}
\`\`\`
The system will process this automatically.

Always be concise but thorough. Use emoji sparingly for warmth (💊, ✅, ⚠️).`;

async function logTrace(sessionId: string, traceType: string, input: string | null, output: string | null, toolCalls: any[] = [], durationMs: number | null = null, status = "success", metadata: any = {}) {
  try {
    await supabase.from("agent_traces").insert({
      session_id: sessionId,
      trace_type: traceType,
      agent_name: "pharmacist",
      input,
      output,
      tool_calls: toolCalls,
      duration_ms: durationMs,
      status,
      metadata,
    });
  } catch (e) {
    console.error("Trace logging error:", e);
  }
}

async function triggerWebhook(webhookUrl: string, payload: any) {
  try {
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await supabase.from("webhook_logs").insert({
      webhook_type: "zapier_order",
      webhook_url: webhookUrl,
      payload,
      response_status: resp.status,
      status: resp.ok ? "sent" : "failed",
    });
  } catch (e) {
    console.error("Webhook error:", e);
    await supabase.from("webhook_logs").insert({
      webhook_type: "zapier_order",
      webhook_url: webhookUrl,
      payload,
      status: "failed",
    });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action, data, session_id, webhook_url } = await req.json();
    const sessionId = session_id || crypto.randomUUID();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Handle tool actions directly
    if (action === "process_order") {
      const startTime = Date.now();
      await logTrace(sessionId, "thought", `Processing order: ${JSON.stringify(data)}`, null, [{ name: "process_order", args: data }]);

      const orderId = crypto.randomUUID();
      // Insert order into database
      await supabase.from("orders").insert({
        id: orderId,
        patient_id: data.patient_id || "anonymous",
        items: [{ medicine: data.medicine, quantity: data.quantity }],
        total_price: data.total_price || 0,
        status: "confirmed",
        webhook_triggered: !!webhook_url,
      });

      // Update stock
      if (data.medicine) {
        const { data: med } = await supabase.from("medicines").select("stock_level, id").ilike("product_name", `%${data.medicine}%`).maybeSingle();
        if (med) {
          await supabase.from("medicines").update({ stock_level: Math.max(0, med.stock_level - (data.quantity || 1)) }).eq("id", med.id);
        }
      }

      // Log mock email
      await supabase.from("webhook_logs").insert({
        order_id: orderId,
        webhook_type: "mock_email",
        payload: { to: data.email || "customer@example.com", subject: "Order Confirmed", body: `Your order for ${data.medicine} x${data.quantity} has been confirmed.` },
        status: "sent",
      });

      // Log mock WhatsApp
      await supabase.from("webhook_logs").insert({
        order_id: orderId,
        webhook_type: "mock_whatsapp",
        payload: { to: data.phone || "+49123456789", message: `✅ PharmaCare: Your order #${orderId.slice(0, 8).toUpperCase()} for ${data.medicine} has been confirmed!` },
        status: "sent",
      });

      // Trigger real webhook if provided
      if (webhook_url) {
        await triggerWebhook(webhook_url, {
          event: "order_confirmed",
          order_id: orderId,
          medicine: data.medicine,
          quantity: data.quantity,
          timestamp: new Date().toISOString(),
          source: "PharmaCare AI Agent",
        });
      }

      const duration = Date.now() - startTime;
      await logTrace(sessionId, "tool_call", `Order placed for ${data.medicine}`, `Order ${orderId.slice(0, 8)} confirmed. Stock updated. Notifications sent.`, [
        { name: "insert_order", args: { medicine: data.medicine, quantity: data.quantity } },
        { name: "update_stock", args: { medicine: data.medicine } },
        { name: "send_email", args: { type: "confirmation" } },
        { name: "send_whatsapp", args: { type: "confirmation" } },
        ...(webhook_url ? [{ name: "trigger_webhook", args: { url: webhook_url } }] : []),
      ], duration);

      return new Response(JSON.stringify({
        success: true,
        order_id: orderId.slice(0, 8).toUpperCase(),
        message: "Order placed, stock updated, notifications sent.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Chat with AI
    const startTime = Date.now();
    const userMessage = messages[messages.length - 1]?.content || "";
    
    await logTrace(sessionId, "thought", userMessage, "Analyzing user request...", [], null, "success", { step: "input_analysis" });

    // Fetch inventory context from DB
    const { data: meds } = await supabase.from("medicines").select("product_name, price, stock_level, prescription_required, category").order("product_name");
    const inventoryContext = meds ? `\n\nCURRENT INVENTORY:\n${meds.map(m => `- ${m.product_name}: €${m.price}, Stock: ${m.stock_level}, Rx: ${m.prescription_required ? "Yes" : "No"}, Category: ${m.category}`).join("\n")}` : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: MEDICINE_CONTEXT + inventoryContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const duration = Date.now() - startTime;
    await logTrace(sessionId, "response", userMessage, "Streaming response to user", [], duration, "success", { model: "gemini-3-flash-preview" });

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
