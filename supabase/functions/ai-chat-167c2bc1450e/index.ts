
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_API_URL = "https://api.enter.pro/code/api/v1/ai/messages";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// Multiple search strategies for reliability
async function webSearch(query: string): Promise<SearchResult[]> {
  // Strategy 1: SearXNG public instances (JSON API)
  const searxInstances = [
    "https://search.sapti.me",
    "https://searx.tiekoetter.com",
    "https://search.bus-hit.me",
    "https://searx.be",
  ];

  for (const instance of searxInstances) {
    try {
      const results = await searxSearch(instance, query);
      if (results.length > 0) {
        console.log(`[web-search] searx=${instance} query="${query}" results=${results.length}`);
        return results;
      }
    } catch (err) {
      console.warn(`[web-search] searx ${instance} failed:`, err.message);
    }
  }

  // Strategy 2: DuckDuckGo HTML fallback
  try {
    const results = await duckduckgoSearch(query);
    if (results.length > 0) {
      console.log(`[web-search] ddg query="${query}" results=${results.length}`);
      return results;
    }
  } catch (err) {
    console.warn("[web-search] ddg failed:", err.message);
  }

  // Strategy 3: DuckDuckGo Lite
  try {
    const results = await duckduckgoLiteSearch(query);
    if (results.length > 0) {
      console.log(`[web-search] ddg-lite query="${query}" results=${results.length}`);
      return results;
    }
  } catch (err) {
    console.warn("[web-search] ddg-lite failed:", err.message);
  }

  console.error(`[web-search] ALL strategies failed for query="${query}"`);
  return [];
}

async function searxSearch(instance: string, query: string): Promise<SearchResult[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  const url = `${instance}/search?q=${encodeURIComponent(query)}&format=json&categories=general&language=auto`;
  const resp = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

  const data = await resp.json();
  const results: SearchResult[] = [];

  if (data.results && Array.isArray(data.results)) {
    for (const r of data.results.slice(0, 5)) {
      if (r.title && r.url) {
        results.push({
          title: r.title,
          url: r.url,
          snippet: (r.content || "").substring(0, 300),
        });
      }
    }
  }
  return results;
}

async function duckduckgoSearch(query: string): Promise<SearchResult[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  const resp = await fetch(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8",
      },
      signal: controller.signal,
    }
  );
  clearTimeout(timeout);

  const html = await resp.text();
  const results: SearchResult[] = [];

  const resultBlocks = html.split('class="result__body"');
  for (let i = 1; i < Math.min(resultBlocks.length, 6); i++) {
    const block = resultBlocks[i];
    const titleMatch = block.match(/class="result__a"[^>]*>([^<]+)</);
    const title = titleMatch ? decodeHTMLEntities(titleMatch[1]).trim() : "";
    const urlMatch = block.match(/href="\/\/duckduckgo\.com\/l\/\?uddg=([^&"]+)/);
    const url = urlMatch ? decodeURIComponent(urlMatch[1]) : "";
    const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
    let snippet = snippetMatch ? decodeHTMLEntities(snippetMatch[1].replace(/<[^>]+>/g, "")).trim() : "";
    snippet = snippet.substring(0, 300);
    if (title && url) {
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

  // DDG Lite format: <a rel="nofollow" href="URL" class='result-link'>Title</a>
  // then <td class="result-snippet">Snippet</td>
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AI_API_TOKEN = Deno.env.get("AI_API_TOKEN_167c2bc1450e");
    if (!AI_API_TOKEN) {
      throw new Error("AI_API_TOKEN is not configured");
    }

    const { messages, model, system, enable_web_search, locale } = await req.json();

    // Build system prompt: user-provided system + language instruction + search context
    const parts: string[] = [];

    if (system) {
      parts.push(system);
    }

    const langInstruction = getLanguageInstruction(locale);
    if (langInstruction) {
      parts.push(langInstruction);
    }

    let searchResults: SearchResult[] = [];

    if (enable_web_search) {
      const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
      if (lastUserMsg) {
        searchResults = await webSearch(lastUserMsg.content);
        const searchCtx = buildSearchContext(searchResults);
        if (searchCtx) {
          parts.push(searchCtx);
          parts.push("IMPORTANT: You have access to the web search results above. Use them to provide accurate, up-to-date information. Always cite your sources by mentioning the source URL. Do NOT say you cannot access the internet or search the web — you already have the search results.");
        } else {
          // Search was attempted but returned no results
          parts.push("Note: A web search was attempted for the user's query but returned no results. Please answer based on your knowledge and let the user know the search returned no results.");
        }
      }
    }

    const finalSystem = parts.join("\n\n");

    const body: Record<string, unknown> = {
      model: model || "anthropic/claude-sonnet-4.5",
      messages,
      stream: true,
      max_tokens: 4096,
    };

    if (finalSystem) {
      body.system = finalSystem;
    }

    console.log(`[ai-chat] model=${body.model} web_search=${!!enable_web_search} search_results=${searchResults.length} system_len=${finalSystem.length}`);

    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

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
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    if (searchResults.length > 0) {
      const searchEvent = `event: search_results\ndata: ${JSON.stringify({
        type: "search_results",
        results: searchResults,
      })}\n\n`;
      const encoder = new TextEncoder();
      const searchChunk = encoder.encode(searchEvent);
      const upstreamBody = response.body!;
      const readable = new ReadableStream({
        async start(controller) {
          controller.enqueue(searchChunk);
          const reader = upstreamBody.getReader();
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
      return new Response(readable, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (error) {
    console.error("[ai-chat] error:", error);
    const errorSSE = `event: error\ndata: ${JSON.stringify({
      type: "error",
      error: { type: "api_error", message: error.message },
    })}\n\n`;
    return new Response(errorSSE, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  }
});
