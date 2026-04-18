
/**
 * Daoyan Agent API — A public REST endpoint for third-party agents/websites
 * to query the Daoyan AI (帛书老子智慧问答).
 *
 * Internally proxies to the existing ai-chat Edge Function so all logic
 * (system prompt, web search, retry, streaming) is reused.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Internal URL of the existing ai-chat Edge Function
const AI_CHAT_FN = "https://spb-t4nnhrh7ch7j2940.supabase.opentrust.net/functions/v1/ai-chat-167c2bc1450e";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: { message } }, status);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body");
    }

    const {
      question,
      conversation_history = [],
      enable_web_search = false,
      locale = "zh-CN",
      stream = false,
    } = body as {
      question?: string;
      conversation_history?: Array<{ role: string; content: string }>;
      enable_web_search?: boolean;
      locale?: string;
      stream?: boolean;
    };

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return errorResponse("'question' is required and must be a non-empty string");
    }

    if (question.length > 10000) {
      return errorResponse("'question' exceeds max length of 10000 characters");
    }

    // Build messages array
    const messages = [
      ...((Array.isArray(conversation_history) ? conversation_history : []).map(m => ({
        role: m.role,
        content: m.content,
      }))),
      { role: "user", content: question.trim() },
    ];

    // Forward auth header
    const authHeader = req.headers.get("Authorization") || "";

    // Call the internal ai-chat function
    const chatResponse = await fetch(AI_CHAT_FN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        messages,
        enable_web_search,
        locale,
        // system prompt is injected by ai-chat when no custom system is provided
      }),
    });

    if (!chatResponse.ok) {
      const text = await chatResponse.text();
      console.error("[agent-api] upstream error:", chatResponse.status, text);
      return errorResponse("AI service error", chatResponse.status);
    }

    // Stream mode: forward the SSE stream directly
    if (stream) {
      return new Response(chatResponse.body, {
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Non-stream mode: collect the full response
    const text = await chatResponse.text();
    const lines = text.split("\n");

    let answer = "";
    let sources: Array<{ title: string; url: string; snippet: string }> = [];

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const dataStr = line.slice(6).trim();
      if (!dataStr) continue;

      let data;
      try {
        data = JSON.parse(dataStr);
      } catch {
        continue;
      }

      if (data.type === "search_results" && Array.isArray(data.results)) {
        sources = data.results;
      }

      if (data.type === "content_block_delta") {
        if (data.delta?.text) {
          answer += data.delta.text;
        }
      }

      if (data.type === "error") {
        return jsonResponse({
          error: { message: data.error?.message || "AI service error" },
        }, 500);
      }
    }

    const result: Record<string, unknown> = { answer };
    if (sources.length > 0) {
      result.sources = sources;
    }

    return jsonResponse(result);

  } catch (error) {
    console.error("[agent-api] error:", error);
    return errorResponse((error as Error).message, 500);
  }
});
