
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

const AI_API_URL = "https://api.enter.pro/code/api/v1/ai/messages";

const ALLOWED_MODELS = new Set([
  "anthropic/claude-sonnet-4.5",
  "anthropic/claude-haiku-4-5",
  "anthropic/claude-opus-4-5",
  "google/gemini-2.5-pro",
  "google/gemini-2.0-flash",
  "google/gemini-3.1-pro-preview",
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "openai/gpt-5.4",
  "anthropic/claude-opus-4.7",
  "z-ai/glm-5",
]);
const DEFAULT_MODEL = "anthropic/claude-sonnet-4.5";

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 10000;
const MAX_SYSTEM_LENGTH = 200000;
const MAX_SEARCH_QUERY_LENGTH = 500;

// Context window management: keep only the most recent messages to avoid
// overflowing the model's context and producing degraded / hallucinated output.
const MAX_CONTEXT_MESSAGES = 20;

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

async function webSearch(query: string): Promise<SearchResult[]> {
  const safeQuery = query.substring(0, MAX_SEARCH_QUERY_LENGTH).trim();
  try {
    const results = await duckduckgoSearch(safeQuery);
    if (results.length > 0) {
      console.log(`[web-search] ddg query="${safeQuery}" results=${results.length}`);
      return results;
    }
  } catch (err) {
    console.warn("[web-search] ddg failed:", (err as Error).message);
  }
  try {
    const results = await duckduckgoLiteSearch(safeQuery);
    if (results.length > 0) {
      console.log(`[web-search] ddg-lite query="${safeQuery}" results=${results.length}`);
      return results;
    }
  } catch (err) {
    console.warn("[web-search] ddg-lite failed:", (err as Error).message);
  }
  console.error(`[web-search] ALL strategies failed for query="${safeQuery}"`);
  return [];
}

async function duckduckgoSearch(query: string): Promise<SearchResult[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const resp = await fetch(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
    }
  );
  clearTimeout(timeout);
  const html = await resp.text();
  const results: SearchResult[] = [];
  const resultPattern = /<div class="result[^"]*">([\s\S]*?)<\/div>\s*<\/div>/gi;
  const matches = html.matchAll(resultPattern);
  for (const match of matches) {
    if (results.length >= 5) break;
    const resultHtml = match[1];
    const titleMatch = resultHtml.match(/<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!titleMatch) continue;
    const rawHref = titleMatch[1];
    const uddgMatch = rawHref.match(/uddg=([^&"]+)/);
    const url = uddgMatch ? decodeURIComponent(uddgMatch[1]) : rawHref;
    const title = titleMatch[2]
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
    const snippetMatch = resultHtml.match(/<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i);
    const snippet = snippetMatch
      ? snippetMatch[1]
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&nbsp;/g, " ")
          .trim()
          .substring(0, 300)
      : "";
    if (url && title) {
      results.push({ title, url, snippet });
    }
  }
  return results;
}

async function duckduckgoLiteSearch(query: string): Promise<SearchResult[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const resp = await fetch(
    `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html",
      },
      signal: controller.signal,
    }
  );
  clearTimeout(timeout);
  const html = await resp.text();
  const results: SearchResult[] = [];
  const linkRegex = /class='result-link'[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  const snippetRegex = /class="result-snippet">([^<]*)/g;
  const links: { url: string; title: string }[] = [];
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    links.push({ url: m[1], title: decodeHTMLEntities(m[2]).trim() });
  }
  const snippets: string[] = [];
  while ((m = snippetRegex.exec(html)) !== null) {
    snippets.push(decodeHTMLEntities(m[1]).trim().substring(0, 300));
  }
  for (let i = 0; i < Math.min(links.length, 5); i++) {
    if (links[i].title && links[i].url) {
      results.push({
        title: links[i].title,
        url: links[i].url,
        snippet: snippets[i] || "",
      });
    }
  }
  return results;
}

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function buildSearchContext(results: SearchResult[]): string {
  if (results.length === 0) return "";
  let ctx = "## Web Search Results\n\n";
  for (const r of results) {
    ctx += `### ${r.title}\nSource: ${r.url}\n${r.snippet}\n\n`;
  }
  return ctx;
}

function getLanguageInstruction(locale?: string): string {
  if (!locale) return "";
  if (locale.startsWith("zh")) {
    return "You MUST respond in Chinese (Simplified).";
  }
  if (locale.startsWith("en")) {
    return "You MUST respond in English.";
  }
  return `You MUST respond in the language matching locale: ${locale}.`;
}

function errorResponse(message: string, status: number): Response {
  const errorSSE = `event: error\ndata: ${JSON.stringify({
    type: "error",
    error: { type: "api_error", message },
  })}\n\n`;
  return new Response(errorSSE, {
    status,
    headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "text/event-stream" },
  });
}

async function peekFirstChunk(
  body: ReadableStream<Uint8Array>
): Promise<{ firstChunk: Uint8Array; reader: ReadableStreamDefaultReader<Uint8Array> } | null> {
  const reader = body.getReader();
  const timeoutPromise = new Promise<{ done: true; value: undefined }>((resolve) =>
    setTimeout(() => resolve({ done: true, value: undefined }), 3000)
  );
  const result = await Promise.race([reader.read(), timeoutPromise]);
  if (result.done || !result.value) {
    try { reader.cancel(); } catch { /* ignore */ }
    return null;
  }
  return { firstChunk: result.value, reader };
}

function buildStream(
  firstChunk: Uint8Array,
  reader: ReadableStreamDefaultReader<Uint8Array>,
  prependChunks: Uint8Array[] = []
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      for (const chunk of prependChunks) {
        controller.enqueue(chunk);
      }
      controller.enqueue(firstChunk);
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } catch (e) {
        console.error("[stream] read error:", e);
      } finally {
        controller.close();
      }
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
  }

  try {
    const AI_API_TOKEN = Deno.env.get("AI_API_TOKEN_167c2bc1450e");
    if (!AI_API_TOKEN) {
      throw new Error("AI_API_TOKEN is not configured");
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const { messages, model, system, enable_web_search, locale } = body as {
      messages: Array<{ role: string; content: string }>;
      model?: string;
      system?: string;
      enable_web_search?: boolean;
      locale?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return errorResponse("messages must be a non-empty array", 400);
    }
    if (messages.length > MAX_MESSAGES) {
      return errorResponse(`Too many messages (max ${MAX_MESSAGES})`, 400);
    }
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return errorResponse("Each message must have role and content", 400);
      }
      if (!["user", "assistant", "system"].includes(msg.role)) {
        return errorResponse(`Invalid message role: ${msg.role}`, 400);
      }
      if (typeof msg.content !== "string" || msg.content.length > MAX_MESSAGE_LENGTH) {
        return errorResponse(`Message content exceeds max length of ${MAX_MESSAGE_LENGTH}`, 400);
      }
    }

    const safeModel = (typeof model === "string" && ALLOWED_MODELS.has(model))
      ? model
      : DEFAULT_MODEL;

    // Trim conversation history to prevent context overflow
    let trimmedMessages = messages;
    if (messages.length > MAX_CONTEXT_MESSAGES) {
      trimmedMessages = messages.slice(-MAX_CONTEXT_MESSAGES);
      console.log(`[ai-chat] trimmed messages from ${messages.length} to ${trimmedMessages.length}`);
    }

    if (system && typeof system === "string" && system.length > MAX_SYSTEM_LENGTH) {
      return errorResponse(`System prompt exceeds max length of ${MAX_SYSTEM_LENGTH}`, 400);
    }

    const parts: string[] = [];

    if (system && typeof system === "string") {
      parts.push(system);
    }

    const langInstruction = getLanguageInstruction(typeof locale === "string" ? locale : undefined);
    if (langInstruction) {
      parts.push(langInstruction);
    }

    let searchResults: SearchResult[] = [];

    if (enable_web_search === true) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (lastUserMsg) {
        searchResults = await webSearch(lastUserMsg.content);
        const searchCtx = buildSearchContext(searchResults);
        if (searchCtx) {
          parts.push(searchCtx);
          parts.push("IMPORTANT: You have access to the web search results above. Use them to provide accurate, up-to-date information. Always cite your sources by mentioning the source URL. Do NOT say you cannot access the internet or search the web \u2014 you already have the search results.");
        } else {
          parts.push("Note: A web search was attempted for the user's query but returned no results. Please answer based on your knowledge and let the user know the search returned no results.");
        }
      }
    }

    const finalSystem = parts.join("\n\n");

    const requestBody: Record<string, unknown> = {
      model: safeModel,
      messages: trimmedMessages,
      stream: true,
      max_tokens: 8192,
    };

    if (finalSystem) {
      requestBody.system = finalSystem;
    }

    console.log(`[ai-chat] model=${safeModel} msgs=${trimmedMessages.length}/${messages.length} web_search=${!!enable_web_search} search_results=${searchResults.length} system_len=${finalSystem.length}`);

    const fetchAI = () =>
      fetch(AI_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

    let response = await fetchAI();

    if (!response.ok) {
      const text = await response.text();
      let errorMessage = "AI service error";
      let errorCode = "api_error";
      const dataMatch = text.match(/data: (.+)/);
      if (dataMatch) {
        try {
          const errorData = JSON.parse(dataMatch[1]);
          errorMessage = errorData.error?.message || errorMessage;
          errorCode = errorData.error?.type || errorCode;
        } catch { /* use defaults */ }
      }
      const errorSSE = `event: error\ndata: ${JSON.stringify({
        type: "error",
        error: { type: errorCode, message: errorMessage },
      })}\n\n`;
      return new Response(errorSSE, {
        status: response.status,
        headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const responseHeaders = {
      ...corsHeaders,
      ...securityHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    };

    const prependChunks: Uint8Array[] = [];
    if (searchResults.length > 0) {
      const searchEvent = `event: search_results\ndata: ${JSON.stringify({
        type: "search_results",
        results: searchResults,
      })}\n\n`;
      prependChunks.push(new TextEncoder().encode(searchEvent));
    }

    let peekResult = await peekFirstChunk(response.body!);

    if (!peekResult) {
      console.warn("[ai-chat] empty stream detected, retrying in 2 s...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      response = await fetchAI();

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = "AI service error on retry";
        let errorCode = "api_error";
        const dataMatch = text.match(/data: (.+)/);
        if (dataMatch) {
          try {
            const errorData = JSON.parse(dataMatch[1]);
            errorMessage = errorData.error?.message || errorMessage;
            errorCode = errorData.error?.type || errorCode;
          } catch { /* use defaults */ }
        }
        const errorSSE = `event: error\ndata: ${JSON.stringify({
          type: "error",
          error: { type: errorCode, message: errorMessage },
        })}\n\n`;
        return new Response(errorSSE, {
          status: response.status,
          headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "text/event-stream" },
        });
      }

      peekResult = await peekFirstChunk(response.body!);

      if (!peekResult) {
        console.error("[ai-chat] retry also returned empty stream");
        return errorResponse("AI \u670d\u52a1\u6682\u65f6\u65e0\u6cd5\u5904\u7406\u6b64\u8bf7\u6c42\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5", 503);
      }

      console.log("[ai-chat] retry succeeded, streaming response");
    }

    const { firstChunk, reader } = peekResult;
    const readable = buildStream(firstChunk, reader, prependChunks);
    return new Response(readable, { headers: responseHeaders });

  } catch (error) {
    console.error("[ai-chat] error:", error);
    return errorResponse((error as Error).message, 500);
  }
});
