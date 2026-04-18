import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Copy, Check, Terminal, Plug, BookOpen, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AGENT_API_ENDPOINT, MCP_ENDPOINT, SUPABASE_ANON_KEY } from "@/config";
import { copyToClipboard } from "@/lib/utils";

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group rounded-lg border border-border bg-muted/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/30">
        <span className="text-xs font-mono text-muted-foreground">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1.5"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-foreground/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
        {icon}
        {title}
      </h2>
      <div className="space-y-4 text-foreground/80 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default function ApiDocsPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isZh = i18n.language === "zh-CN";

  const curlExample = `curl -X POST "${AGENT_API_ENDPOINT}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY.slice(0, 20)}..." \\
  -d '{
    "question": "如何理解无为？",
    "enable_web_search": false,
    "locale": "zh-CN",
    "stream": false
  }'`;

  const jsExample = `const response = await fetch("${AGENT_API_ENDPOINT}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_ANON_KEY",
  },
  body: JSON.stringify({
    question: "What does Laozi say about water?",
    enable_web_search: false,
    locale: "en",
    stream: false,
  }),
});

const data = await response.json();
console.log(data.answer);
// Optional: data.sources (when web search is enabled)`;

  const streamExample = `// Stream mode — receive SSE events
const response = await fetch("${AGENT_API_ENDPOINT}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_ANON_KEY",
  },
  body: JSON.stringify({
    question: "道可道也，非恒道也，请解读",
    stream: true,
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value);
  process.stdout.write(text);
}`;

  const multiTurnExample = `// Multi-turn conversation
const response = await fetch("${AGENT_API_ENDPOINT}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_ANON_KEY",
  },
  body: JSON.stringify({
    question: "那帛书版有什么不同？",
    conversation_history: [
      { role: "user", content: "什么是道？" },
      { role: "assistant", content: "帛书第45章..." }
    ],
    stream: false,
  }),
});`;

  const mcpCursorConfig = `// .cursor/mcp.json
{
  "mcpServers": {
    "daoyan": {
      "url": "${MCP_ENDPOINT}",
      "headers": {
        "Authorization": "Bearer YOUR_ANON_KEY"
      }
    }
  }
}`;

  const mcpClaudeConfig = `// claude_desktop_config.json
{
  "mcpServers": {
    "daoyan": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "${MCP_ENDPOINT}",
        "--header",
        "Authorization: Bearer YOUR_ANON_KEY"
      ]
    }
  }
}`;

  const mcpTestExample = `# Test MCP initialize
curl -X POST "${MCP_ENDPOINT}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY.slice(0, 20)}..." \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {}
  }'

# List tools
curl -X POST "${MCP_ENDPOINT}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY.slice(0, 20)}..." \\
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'

# Call ask_daoyan tool
curl -X POST "${MCP_ENDPOINT}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY.slice(0, 20)}..." \\
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "ask_daoyan",
      "arguments": { "question": "什么是道？" }
    }
  }'`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{isZh ? "道衍 API & MCP" : "Daoyan API & MCP"}</h1>
            <p className="text-xs text-muted-foreground">
              {isZh ? "让其他智能体和网站使用道衍的智慧" : "Let other agents and websites use Daoyan's wisdom"}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* Overview */}
        <section className="space-y-3">
          <p className="text-foreground/80 leading-relaxed">
            {isZh
              ? "道衍提供两种接入方式：Agent API（REST 接口，适合网站和应用集成）和 MCP Server（Model Context Protocol，适合 AI 智能体如 Claude Desktop、Cursor 等直接调用）。"
              : "Daoyan provides two integration methods: Agent API (REST interface for websites and apps) and MCP Server (Model Context Protocol for AI agents like Claude Desktop, Cursor, etc.)."}
          </p>
        </section>

        {/* Agent API */}
        <Section
          title={isZh ? "Agent API（REST 接口）" : "Agent API (REST)"}
          icon={<Terminal className="h-5 w-5 text-primary" />}
        >
          <div className="space-y-2">
            <h3 className="font-medium text-foreground">{isZh ? "端点" : "Endpoint"}</h3>
            <code className="block px-3 py-2 rounded-md bg-muted text-sm font-mono break-all">
              POST {AGENT_API_ENDPOINT}
            </code>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-foreground">{isZh ? "请求参数" : "Request Parameters"}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium border-b border-border">{isZh ? "参数" : "Parameter"}</th>
                    <th className="text-left px-4 py-2 font-medium border-b border-border">{isZh ? "类型" : "Type"}</th>
                    <th className="text-left px-4 py-2 font-medium border-b border-border">{isZh ? "必填" : "Required"}</th>
                    <th className="text-left px-4 py-2 font-medium border-b border-border">{isZh ? "说明" : "Description"}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="px-4 py-2 font-mono text-xs border-b border-border/50">question</td><td className="px-4 py-2 border-b border-border/50">string</td><td className="px-4 py-2 border-b border-border/50">{isZh ? "是" : "Yes"}</td><td className="px-4 py-2 border-b border-border/50">{isZh ? "提问内容" : "The question to ask"}</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs border-b border-border/50">conversation_history</td><td className="px-4 py-2 border-b border-border/50">array</td><td className="px-4 py-2 border-b border-border/50">{isZh ? "否" : "No"}</td><td className="px-4 py-2 border-b border-border/50">{isZh ? "多轮对话历史" : "Conversation history"}</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs border-b border-border/50">enable_web_search</td><td className="px-4 py-2 border-b border-border/50">boolean</td><td className="px-4 py-2 border-b border-border/50">{isZh ? "否" : "No"}</td><td className="px-4 py-2 border-b border-border/50">{isZh ? "是否联网搜索（默认 false）" : "Enable web search (default: false)"}</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs border-b border-border/50">locale</td><td className="px-4 py-2 border-b border-border/50">string</td><td className="px-4 py-2 border-b border-border/50">{isZh ? "否" : "No"}</td><td className="px-4 py-2 border-b border-border/50">{isZh ? '语言（默认 "zh-CN"）' : 'Language (default: "zh-CN")'}</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs">stream</td><td className="px-4 py-2">boolean</td><td className="px-4 py-2">{isZh ? "否" : "No"}</td><td className="px-4 py-2">{isZh ? "是否流式返回（默认 false）" : "Stream response (default: false)"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-foreground">cURL</h3>
            <CodeBlock code={curlExample} language="bash" />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-foreground">JavaScript</h3>
            <CodeBlock code={jsExample} language="javascript" />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-foreground">{isZh ? "流式调用" : "Streaming"}</h3>
            <CodeBlock code={streamExample} language="javascript" />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-foreground">{isZh ? "多轮对话" : "Multi-turn Conversation"}</h3>
            <CodeBlock code={multiTurnExample} language="javascript" />
          </div>
        </Section>

        {/* MCP Server */}
        <Section
          title={isZh ? "MCP Server（智能体协议）" : "MCP Server (Agent Protocol)"}
          icon={<Plug className="h-5 w-5 text-primary" />}
        >
          <p>
            {isZh
              ? "MCP (Model Context Protocol) 让 AI 智能体能直接发现和调用道衍的能力。支持 Claude Desktop、Cursor、以及任何兼容 MCP 的客户端。"
              : "MCP (Model Context Protocol) allows AI agents to discover and use Daoyan's capabilities. Compatible with Claude Desktop, Cursor, and any MCP-compatible client."}
          </p>

          <div className="space-y-2">
            <h3 className="font-medium text-foreground">{isZh ? "端点" : "Endpoint"}</h3>
            <code className="block px-3 py-2 rounded-md bg-muted text-sm font-mono break-all">
              POST {MCP_ENDPOINT}
            </code>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              {isZh ? "可用工具" : "Available Tools"}
            </h3>
            <div className="grid gap-3">
              {[
                {
                  name: "ask_daoyan",
                  desc: isZh ? "向道衍提问，获取基于帛书老子智慧的回答" : "Ask Daoyan a question based on Boshu Laozi wisdom",
                  params: "question (string), enable_web_search? (boolean)",
                },
                {
                  name: "search_chapters",
                  desc: isZh ? "按关键词搜索帛书81章" : "Search through 81 Boshu chapters by keyword",
                  params: "keyword (string)",
                },
                {
                  name: "get_chapter",
                  desc: isZh ? "获取指定帛书章节信息" : "Get info about a specific Boshu chapter",
                  params: "chapter_number (1-81)",
                },
              ].map(tool => (
                <div key={tool.name} className="p-3 rounded-lg border border-border bg-muted/20">
                  <div className="font-mono text-sm font-medium text-primary">{tool.name}</div>
                  <p className="text-sm text-foreground/70 mt-1">{tool.desc}</p>
                  <p className="text-xs text-muted-foreground mt-1">{isZh ? "参数" : "Params"}: {tool.params}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {isZh ? "Cursor 配置" : "Cursor Configuration"}
            </h3>
            <CodeBlock code={mcpCursorConfig} language="json" />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-foreground">{isZh ? "Claude Desktop 配置" : "Claude Desktop Configuration"}</h3>
            <CodeBlock code={mcpClaudeConfig} language="json" />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-foreground">{isZh ? "手动测试 (cURL)" : "Manual Testing (cURL)"}</h3>
            <CodeBlock code={mcpTestExample} language="bash" />
          </div>
        </Section>

        {/* Authentication */}
        <Section
          title={isZh ? "认证说明" : "Authentication"}
          icon={<BookOpen className="h-5 w-5 text-primary" />}
        >
          <p>
            {isZh
              ? "所有 API 请求需在 Header 中携带 Authorization: Bearer <anon_key>。Anon Key 是可公开的前端密钥，受后端安全策略保护。"
              : "All API requests require an Authorization: Bearer <anon_key> header. The anon key is a publishable frontend key protected by backend security policies."}
          </p>
          <div className="space-y-1">
            <h3 className="font-medium text-foreground">Anon Key</h3>
            <CodeBlock code={SUPABASE_ANON_KEY} language="text" />
          </div>
        </Section>
      </main>
    </div>
  );
}
