# 联网搜索功能实现计划

## 上下文
用户需要在 AI 研究助手中添加完整的联网搜索功能，包括：
1. **AI 自动联网搜索** - AI 回答问题时自动搜索网络并引用来源（类似 Perplexity）
2. **手动网页搜索** - 用户输入关键词搜索网页，选择结果添加到对话上下文

## 现有基础设施
- ✅ `fetch-url-content` Edge Function - 已存在，用于抓取单个网页内容
- ✅ AI 聊天系统 - 通过 `ai-chat-167c2bc1450e` Edge Function 和 `useAIChat` hook 实现
- ✅ 文档上下文支持 - 已支持将文档内容注入 system message
- ✅ Claude Sonnet 4.5 - 支持工具调用 (function calling)

## 技术方案

### 1. 创建 Web 搜索 Edge Function
**文件**: `supabase/functions/web-search/index.ts`

**功能**:
- 接受搜索查询，返回搜索结果（标题、URL、摘要）
- 使用 DuckDuckGo HTML 搜索（无需 API key，免费）
- 解析 HTML 返回结构化数据
- 支持限制结果数量（默认 5-8 条）

**输入**: `{ query: string, limit?: number }`
**输出**: `{ results: Array<{ title: string, url: string, snippet: string }> }`

### 2. 增强 AI 聊天支持工具调用
**文件**: `supabase/functions/ai-chat-167c2bc1450e/index.ts`

**变更**:
- 在请求中添加 `tools` 定义（web_search 工具）
- 接受 `enable_web_search: boolean` 参数控制是否启用联网
- 处理 AI 返回的 `tool_use` blocks：
  - 检测到 `web_search` 工具调用时，调用 web-search Edge Function
  - 获取搜索结果后，并行调用 fetch-url-content 获取前 3 个结果的完整内容
  - 将搜索结果和网页内容组合成 `tool_result` 返回给 AI
  - 继续流式传输 AI 的最终回答

**工具定义示例**:
```typescript
tools: [{
  name: "web_search",
  description: "Search the web for current information. Use this when you need real-time data, recent events, or information not in your training data.",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query" }
    },
    required: ["query"]
  }
}]
```

### 3. 前端：增强 Message 类型支持来源引用
**文件**: `src/hooks/useAIChat.ts`

**变更**:
```typescript
export interface Message {
  role: "user" | "assistant";
  content: string;
  thinking?: string;
  sources?: Array<{ title: string; url: string; snippet: string }>; // 新增
  isStreaming?: boolean;
}
```

- 修改 `sendMessage` 函数接受 `enableWebSearch?: boolean` 参数
- 在 SSE 流中解析 `tool_use` 和 `tool_result` events
- 从 tool_result 中提取搜索来源并存储到 message.sources

### 4. 前端：创建搜索界面组件
**文件**: `src/components/WebSearchPanel.tsx`

**功能**:
- Sheet/Drawer 组件，从底部或侧边滑出
- 搜索输入框 + 搜索按钮
- 显示搜索结果列表（标题、URL、摘要）
- 每个结果有"添加到上下文"按钮
- 已添加的结果显示勾选标记
- 底部显示当前已选中的网页数量
- "清除全部"和"关闭"按钮

**状态管理**:
```typescript
const [searchQuery, setSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
const [isSearching, setIsSearching] = useState(false);
```

### 5. 前端：消息组件显示来源
**文件**: `src/components/ChatMessage.tsx`

**变更**:
- 在 AI 消息底部添加"来源"区域
- 使用小卡片展示每个来源：
  - 网站图标（通过 favicon API 或 Globe 图标）
  - 标题（可点击，打开新标签页）
  - 域名显示
  - 摘要（可折叠）
- 美观的布局，使用 masonry 或 grid

### 6. 前端：主页面集成
**文件**: `src/pages/Index.tsx`

**变更**:
- 在聊天界面头部添加"搜索网页"按钮（Search 图标）
- 添加"启用联网搜索"开关（Toggle）到右上角按钮组
- 状态：`const [webSearchEnabled, setWebSearchEnabled] = useState(false)`
- 状态：`const [webSearchPanelOpen, setWebSearchPanelOpen] = useState(false)`
- 状态：`const [selectedWebPages, setSelectedWebPages] = useState<WebPage[]>([])`
- 发送消息时：
  - 如果启用联网搜索，传递 `enableWebSearch: true`
  - 如果有手动选择的网页，将其内容添加到 `documentContext`

### 7. 国际化文案
**文件**: `src/i18n/locales/en-US.json`, `src/i18n/locales/zh-CN.json`

**新增**:
```json
{
  "webSearch": {
    "title": "Search Web / 搜索网页",
    "placeholder": "Enter search query... / 输入搜索关键词...",
    "searching": "Searching... / 搜索中...",
    "noResults": "No results found / 未找到结果",
    "addToContext": "Add to context / 添加到上下文",
    "removeFromContext": "Remove / 移除",
    "sources": "Sources / 来源",
    "enableAutoSearch": "Auto web search / 自动联网搜索",
    "selectedPages": "{{count}} pages selected / 已选 {{count}} 个网页",
    "clearAll": "Clear all / 清除全部"
  }
}
```

## 关键文件清单
### 创建
- `supabase/functions/web-search/index.ts` - 搜索 API
- `src/components/WebSearchPanel.tsx` - 手动搜索界面
- `src/hooks/useWebSearch.ts` - 搜索逻辑封装

### 修改
- `supabase/functions/ai-chat-167c2bc1450e/index.ts` - 添加工具调用支持
- `src/hooks/useAIChat.ts` - 支持来源和联网参数
- `src/components/ChatMessage.tsx` - 显示来源卡片
- `src/pages/Index.tsx` - 集成搜索按钮和开关
- `src/i18n/locales/en-US.json` - 英文文案
- `src/i18n/locales/zh-CN.json` - 中文文案

### 复用
- `supabase/functions/fetch-url-content/index.ts` - 复用现有抓取功能
- `src/hooks/useDocumentCollections.ts` - 参考文档管理模式

## 验证步骤
1. **搜索 Edge Function**: 调用 web-search 端点，验证返回结构化结果
2. **AI 自动搜索**: 
   - 启用联网搜索开关
   - 询问实时信息（如"今天的新闻"）
   - 验证 AI 自动调用搜索工具
   - 验证消息底部显示来源卡片
3. **手动搜索**:
   - 点击"搜索网页"按钮打开面板
   - 输入关键词搜索
   - 选择结果添加到上下文
   - 发送消息验证 AI 参考了选中的网页
4. **响应式**: 测试移动端和桌面端显示
5. **国际化**: 切换语言验证所有文案

## 实现优先级
1. **Phase 1**: Web 搜索 Edge Function（核心基础）
2. **Phase 2**: AI 工具调用支持（自动联网）
3. **Phase 3**: 来源显示（用户体验）
4. **Phase 4**: 手动搜索面板（可选功能）
5. **Phase 5**: 国际化和优化
