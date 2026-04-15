# Session Memory -- 2026-04-14

## Project: 道衍 (dao-yan / xinetzone/dao-yan)

## Session Summary
Full-day session with 20+ user requests spanning repository management, bug fixes, UI redesign, Markdown rendering, documentation, web search fix, locale fix, comprehensive code review, and UX optimization.

## Chronological Commits (40+ total today)

### Phase 1: Foundation & Bug Fixes (00:00-07:45)
- Cultivation system, responsive UI, navigation sidebar, cultivation guide tutorial
- AI chat web search, README, LICENSE, .gitignore
- Git push guides and troubleshooting docs
- Stream timeout fix V1 & V2 (added AbortController timeouts to edge functions)
- Daodejing quote correction: "non-constant Dao" -> "non-eternal Dao" (silk text)

### Phase 2: UI Redesign (09:47-11:03)
- `9fe38b9` Chinese scholarly aesthetic (warm cream + cinnabar red + sketch cards)
- `592ca8b` Markdown rendering (react-markdown + remark-gfm + rehype-highlight)
- `585c591` Cultivation page polish (glass-morphism, spirit orb, custom progress)
- `aed65f2` Switch to marked (react-markdown -> marked, -250KB bundle)
- `5313f49` Layout consistency (2-col questions, lighter SearchBar, icon unification)

### Phase 3: Theme Unification & Bug Fixes (11:03-11:50)
- `80d154d` Unify Cultivation to warm scholarly theme (removed dark cosmic)
- `2d033d4` **Critical**: Rebuilt edge function with actual DuckDuckGo web search + frontend timeout/FatalError
- `5cd2c33` Pass i18n.language to edge function for locale-aware AI responses
- `86d994a` Fix 5 critical bugs from full code review (see Bug History)

### Phase 6: 品牌重命名 道研助手 → 道衍 (2026-04-15 02:00–02:52)
- `26b679e` feat: 全站 4 处名称 → 道衍（zh-CN.json, en-US.json, index.html）
- `ae6aada` fix: landing.subtitle → 陪你问道的智慧伙伴
- `1ad325e` fix: SearchBar placeholder 向大师兄提问 → 向道衍提问
- `a14fc18` docs: README clone URLs dao-research-assistant → dao-yan
- `fa9217e` refactor: 全项目批量替换（21 files, 0 残留）; 道衍/dao-yan/README-EN 各处
- `7ed671a` docs: README 副标题 + 简介改写为道衍定位语
- `bc40a40` docs: 新建 README-EN.md（228 行完整英文文档）

### Phase 7: AllTheory ψ=ψ(ψ) 替换量子场论 (2026-04-15 02:48–02:52)
- `a81696c` refactor: 3 files 5 locations — 量子场论 → ψ=ψ(ψ)万物理论（zh-CN + en-US + CultivationPage）
- `cd7a1b5` docs: README.md 中英文 量子场论 → ψ=ψ(ψ)万物理论
- `49a6d8d` User edit: README 微调


- `ccb192d` Retrospect + update README + session memory (all phases documented)
- `1d6bd2f` Security hardening (9 files, based on external security report):
  - S1: `src/config.ts` new — single source for SUPABASE_URL, SUPABASE_ANON_KEY, AI_CHAT_ENDPOINT, MAX_MESSAGE_LENGTH, ALLOWED_URL_SCHEMES
  - S1: `useAIChat.ts` — removed `supabaseUrl`/`supabaseAnonKey` params, imports from config
  - S1: `Index.tsx` / `CultivationPage.tsx` — hardcoded constants removed, use config
  - S1: `.env.example` — documents credential pattern for new devs
  - S2: Edge function `ai-chat-167c2bc1450e` — model allowlist (7 IDs), MAX_MESSAGES=50, MAX_MESSAGE_LENGTH=10000, MAX_SYSTEM_LENGTH=5000, MAX_SEARCH_QUERY_LENGTH=500, security headers (X-Content-Type-Options/X-Frame-Options/X-XSS-Protection/Referrer-Policy), `errorResponse()` helper
  - S3: `MarkdownRenderer.tsx` — DOMPurify FORBID_TAGS, FORBID_ATTR (all event handlers), ALLOWED_URI_REGEXP (http/https/mailto only), FORCE_BODY
  - S3: `DocumentPanel.tsx` — URL validation (must start http:// or https://, uses `new URL()` parse + scheme check)
  - S4: `SearchBar.tsx` — char counter when >80% of limit, red destructive at limit, submit blocked
- `c9d4c95` Accessibility fix: suppress `aria-describedby` warnings in 3 dialog components
  - `command.tsx` CommandDialog's DialogContent
  - `DocumentPanel.tsx` SheetContent (has SheetTitle but no SheetDescription)
  - `sidebar.tsx` mobile sidebar SheetContent
  - Pattern: `aria-describedby={undefined}` (Radix UI recommended)
- Full test verified: lint 0 errors, build clean, web search 200 OK, locale passed, no Bearer undefined

### Phase 4: Web Search Deep Fix & UX Optimization (11:50-12:30)
- `dbe4049` Rebuild web search with 3-layer strategy (SearXNG → DDG HTML → DDG Lite)
  - Root cause: DuckDuckGo HTML returns empty in Deno runtime (bot detection)
  - AI was responding "I can't search" because search results were always empty
  - Fix: SearXNG JSON API as primary (4 public instances, 6s each), DDG as fallback
  - System prompt now explicitly tells AI "you HAVE search results, do NOT say you can't search"
- `ce8682c` Comprehensive UX optimization (9 files changed):
  - SearchBar textarea auto-resize (1-6 rows)
  - Stop generation button (red Square, replaces Send when isLoading)
  - Web search progress indicator: "Searching the web..." + Search icon (not generic dots)
  - Scroll-to-bottom button (fixed position, appears >300px from bottom)
  - Copy button on AI messages (hover reveal, CheckCheck 2s confirm)
  - Regenerate button on last AI message
  - Dark mode toggle in sidebar (Moon/Sun, localStorage persistence)
  - Source cards with favicon (Google S2 API)
  - SuggestedPrompts: tags now filter questions (2 per category, click to filter/reset)
  - Theme utility extracted to src/lib/theme.ts

## Key Architecture Decisions

### 1. Unified Warm Theme (changed from dual)
- **Before**: Scholarly warm (Index/Chat) + Cosmic dark (Cultivation)
- **After**: Single warm cream scholarly theme for all pages
- Shared: design tokens (--primary, --foreground), i18n, MarkdownRenderer
- Cultivation retains realm-specific accent colors via inline styles

### 2. Markdown Stack: marked + highlight.js + DOMPurify
- Rejected react-markdown (too heavy, +250KB)
- Custom renderer with: code copy button (event delegation), syntax highlight, XSS protection
- Works via .dao-markdown CSS class system

### 3. Web Search Architecture (3-layer fallback)
- **Strategy 1**: SearXNG JSON API (4 public instances: search.sapti.me, searx.tiekoetter.com, search.bus-hit.me, searx.be) - 6s timeout each
- **Strategy 2**: DuckDuckGo HTML scraping (html.duckduckgo.com) - 8s timeout
- **Strategy 3**: DuckDuckGo Lite (lite.duckduckgo.com) - 8s timeout
- System prompt: explicit "you HAVE search results" + "do NOT say you can't search"
- Frontend: FatalError prevents fetchEventSource auto-retry; 60s/30s timeouts
- search_results SSE event emitted before AI stream for source card display

### 4. Locale-Aware AI Responses
- Frontend passes `i18n.language` to edge function as `locale` parameter
- Edge function adds `"You MUST respond in English."` (or Chinese) to system prompt
- Applied to both main chat (useAIChat) and cultivation guidance (CultivationPage)

### 5. Dynamic Colors in Cultivation
- Cannot use Tailwind template literals (`bg-${color}`)
- All realm-based colors use `style={{ color: currentRealm.color }}`

### 6. Theme Toggle
- src/lib/theme.ts: `getStoredTheme()`, `applyTheme()`, `initTheme()`
- ThemeToggle component in sidebar footer (Moon/Sun icon)
- initTheme() called at module scope in Index.tsx for instant apply on load
- localStorage key: "theme", values: "light" | "dark"

## Bug History (cumulative)

| # | Bug | Root Cause | Fix | Commit |
|---|-----|-----------|-----|--------|
| 1 | Stream timeout | Edge function had no timeout | Added layered AbortController timeouts | Earlier |
| 2 | Stale props name | `onCollectionSelect` vs `onSelectCollection` | Corrected prop name | 9fe38b9 |
| 3 | Duplicate DocumentPanel | Two instances in Index.tsx | Removed duplicate | 9fe38b9 |
| 4 | Duplicate ChatMessageProps | Interface defined twice | Removed duplicate | 9fe38b9 |
| 5 | Tailwind dynamic color | Template literals not compiled | Switched to inline styles | 585c591 |
| 6 | Web search freezing | Edge function just passed flag through + fetchEventSource auto-retry | DuckDuckGo scraping + FatalError class | 2d033d4 |
| 7 | AI always Chinese | No language instruction sent to AI | Pass locale to edge function | 5cd2c33 |
| 8 | Cultivation `Bearer undefined` | `supabase.supabaseAnonKey` not a valid property | Hardcoded constants | 86d994a |
| 9 | Cultivation JSON.parse crash | `nexus_usage` SSE events crash JSON.parse | try/catch around JSON.parse | 86d994a |
| 10 | Cultivation no timeout | fetchEventSource hangs forever | 30s AbortController timeout | 86d994a |
| 11 | Cultivation auto-retry | `onerror` throws plain Error -> infinite retry | FatalError class | 86d994a |
| 12 | App.tsx router recreation | `createBrowserRouter` inside component | Moved to module scope | 86d994a |
| 13 | Web search empty results | DuckDuckGo HTML blocked in Deno runtime | SearXNG JSON API as primary strategy | dbe4049 |
| 14 | AI says "can't search" | No prompt telling AI it HAS results | Explicit system prompt instruction | dbe4049 |
| 15 | `aria-describedby` warning | Radix UI requires description or explicit `aria-describedby={undefined}` for all Dialog/Sheet | Added `aria-describedby={undefined}` to CommandDialog, DocumentPanel SheetContent, sidebar mobile SheetContent | c9d4c95 |

## Critical Lessons

### Supabase JS v2 Client Property Access
The client does NOT expose `supabaseUrl` or `supabaseAnonKey` as reliable public properties.
- **Wrong**: `supabase.supabaseUrl`, `supabase.supabaseAnonKey` -> may be undefined
- **Correct**: Import/define hardcoded URL/key constants for raw fetch

### fetchEventSource Pattern (MUST follow all 5)
1. Use hardcoded URL/key constants (not supabase client properties)
2. Wrap error in `FatalError` class to prevent auto-retry
3. Add `try/catch` around `JSON.parse` in `onmessage`
4. Add `AbortController` with timeout (30s normal, 60s web search)
5. Add `openWhenHidden: true` for background tab support

### Web Search in Deno Edge Runtime
- DuckDuckGo HTML (`html.duckduckgo.com`) is blocked/returns empty pages in Deno runtime
- Use SearXNG JSON API as primary (returns structured JSON, no bot detection)
- Always have 2+ fallback strategies
- When search fails, still tell AI to acknowledge failure (don't just silently skip)

### React Router
- `createBrowserRouter(routes)` must be defined at MODULE scope, not inside a component
- Defining inside component causes full remount on every state change

### Security Hardening Pattern
- Centralize all runtime constants in `src/config.ts`; never duplicate URL/key across files
- Supabase anon key is **intentionally public** (by Supabase design); security is enforced by RLS
- DOMPurify needs both FORBID_TAGS + FORBID_ATTR + ALLOWED_URI_REGEXP for real XSS protection
- Edge function input validation: always validate message count, length, model allowlist
- Security response headers go on **every** non-OPTIONS response (not just error responses)
- `errorResponse()` helper pattern: centralize JSON 4xx response construction

### Radix UI Accessibility
- Every Dialog/Sheet/AlertDialog content needs either:
  - A visible `<Description>` component, OR
  - `aria-describedby={undefined}` on the content component to suppress warning
- `AlertDialogContent` with `AlertDialogDescription` is correct ✅
- `SheetContent` without `SheetDescription` needs `aria-describedby={undefined}`
- `CommandDialog`'s inner `DialogContent` needs `aria-describedby={undefined}`

## File Inventory (key files)

| File | Purpose | Last Modified |
|------|---------|---------------|
| src/index.css | Unified warm theme tokens + 7 custom CSS systems | 80d154d |
| src/config.ts | **NEW** — Runtime constants hub: URL, anon key, endpoints, limits | 1d6bd2f |
| src/lib/theme.ts | Theme utility (getStoredTheme, applyTheme, initTheme) | ce8682c |
| src/pages/Index.tsx | Hero card + chat view + scroll/cancel/regenerate | 1d6bd2f |
| src/pages/CultivationPage.tsx | 5 views: home/checkin/result/records/tutorial | 1d6bd2f |
| src/App.tsx | Router + providers (router now module-scoped) | 86d994a |
| src/components/MarkdownRenderer.tsx | marked + hljs + DOMPurify (with security FORBID rules) | 1d6bd2f |
| src/components/SearchBar.tsx | Auto-resize textarea + stop button + char limit counter | 1d6bd2f |
| src/components/DocumentPanel.tsx | Doc collections + URL validation + aria fix | c9d4c95 |
| src/components/SuggestedPrompts.tsx | 4 category tags (filter) + 8 questions (2 per category) | ce8682c |
| src/components/NavigationSidebar.tsx | Sidebar nav + ThemeToggle | ce8682c |
| src/components/ChatMessage.tsx | Copy + Regenerate + Search progress + Source cards | ce8682c |
| src/components/ThemeToggle.tsx | Dark/Light mode toggle (localStorage) | ce8682c |
| src/components/ui/command.tsx | CommandDialog — aria-describedby fix | c9d4c95 |
| src/components/ui/sidebar.tsx | Mobile sidebar SheetContent — aria-describedby fix | c9d4c95 |
| src/hooks/useAIChat.ts | SSE streaming + cancel + FatalError + timeout (no params) | 1d6bd2f |
| src/hooks/useCultivation.ts | localStorage state management | 585c591 |
| src/i18n/locales/zh-CN.json | Dao-themed Chinese translations | ce8682c |
| src/i18n/locales/en-US.json | Dao-themed English translations | a81696c |
| supabase/functions/ai-chat-*/index.ts | AI chat + web search + locale + security validation | 1d6bd2f |
| .env.example | **NEW** — Documents credential pattern | 1d6bd2f |
| README-EN.md | **NEW** — 完整英文文档 (228 lines, 道衍品牌 + AllTheory) | bc40a40 |

## CSS Class Systems in index.css

1. **dao-card / dao-tape**: Sketch-border card + tape decoration
2. **dao-tag**: Yellow pill button (feature categories, active state uses primary color)
3. **dao-question**: Rounded question card (2-col grid)
4. **dao-float-square**: Floating decoration squares (4 positions)
5. **dao-markdown**: Full prose styling (headings, lists, code, tables, quotes)
6. **cult-***: Warm theme cultivation (card-glow, progress, mood-card, btn-glow, stat, record)
7. **hljs-***: Syntax highlight color overrides (light + dark)

## Known Limitations
- Preview cache can be 2-5 minutes behind code changes
- Bundle size ~1295KB (highlight.js is largest contributor, could lazy-load)
- Cultivation data is localStorage only (no cloud sync)
- Web search SearXNG instances may be intermittently unavailable (4 instances provide redundancy)
- Dark mode applies globally but some custom CSS class colors may need dark: variants review
- LanguageSwitcher dropdown label "Language" is hardcoded English (minor)
- Web search timeout is 60s (SearXNG 4 × 6s + DDG fallbacks); slow on all-fail scenarios

---

## Phase 8 — 品牌完善：仙师点拨 → 道衍回响 (2026-04-15 commit e7a1ba0)

### 问题
"仙师点拨"在道衍品牌下语义突兀，用户提出优化

### 改动
5处替换：
| 位置 | 旧 | 新 |
|---|---|---|
| system prompt | 你是一位高阶仙师 | 你是道衍，一面智慧镜子 |
| loading text | 仙师正在感应天机 | 道衍正在感应 |
| result header | 仙师点拨 / Master's Wisdom | 道衍回响 / Dao Yan's Reflection |
| records | 查看点拨 / View Guidance | 查看回响 / View Reflection |
| zh-CN.json | 仙师给予专属点拨 | 道衍给予智慧回响 |

**文件：** `src/pages/CultivationPage.tsx`, `src/i18n/locales/zh-CN.json`

---

## Phase 9 — GitHub 推送基础设施 (2026-04-15 commit 9fbb29c)

### 背景
Enter Pro workspace 无法通过 SSH/HTTPS 直接 push 到外部 GitHub。
`git remote -v` 仅有 Enter 内部 origin，没有 GitHub remote。

### 解决方案：两个 Supabase Edge Functions

#### `github-push` (supabase/functions/github-push/index.ts)
```
POST → 接收 {owner, repo, branch, message, files[{path,content,encoding}]}
1. 每文件创建 blob（批次10）→ 2. 创建 tree → 3. 创建 commit → 4. update ref
CORS: * | GITHUB_TOKEN 来自 Deno.env.get("GITHUB_TOKEN")
```

#### `github-tag` (supabase/functions/github-tag/index.ts)
```
POST → 接收 {owner, repo, tag, message, sha(可选)}
自动用 heads/main SHA 打 annotated tag
```

#### 调用方式（workspace shell）
```python
# 1. 读取所有 git 跟踪文件（-z 解决中文路径问题）
result = subprocess.run(["git","ls-files","-z"], capture_output=True)
files = [f for f in result.stdout.decode("utf-8").split("\0") if f]
# 2. base64 编码，调用 Edge Function
requests.post(EDGE_URL, json={owner,repo,branch,message,files:[{path,content,encoding:"base64"}]})
```

**关键坑：** `git ls-files` 默认对中文文件名输出反斜杠转义（`\345\270\233...`），
导致 `os.path.exists()` 失败。**修复：** 用 `-z` 参数输出 null 分隔的原始 UTF-8 路径。

---

## Phase 10 — 复制按钮修复 (clipboard fix)

### 问题
Perplexity iframe 环境中 `navigator.clipboard.writeText()` 因 Permission Policy 被阻断，
copy 按钮点击无反应。

### 修复
**新增** `src/lib/utils.ts` — `copyToClipboard(text: string): Promise<boolean>`
```typescript
// 先尝试 Clipboard API（现代浏览器）
// 失败则用 textarea + document.execCommand('copy')（兼容 iframe）
```

**更新：**
- `src/components/ChatMessage.tsx` — `handleCopy` 改为调用 `copyToClipboard()`
- `src/components/MarkdownRenderer.tsx` — code block copy 改为调用 `copyToClipboard()`

---

## Phase 11 — PDF → 82个 Markdown 文件 (2026-04-15)

### 任务
"将文件'帛书老子注读.pdf'不遗漏的全部转化为markdown文件，一章一个文件的形式，组织在独立的文件夹中"

### PDF 来源
- OSS key: `resources/uid_100032143/2883.pdf`
- CDN URL: `https://cdn.enter.pro/resources/uid_100032143/2883.pdf`（HTTP 200, 4.1MB, 297页）
- `read_remote_file` 报 pdfcpu SMask 错误 → 改用 `PyMuPDF (fitz)`

### 结构分析
- 前3页：书名/版权/目录开头
- 第3-8页：目录（每章两行：序号+标题 + 对应今本）
- 第10-11页：注读说明
- 第12-13页：德经注读标题+第一章
- 德经：帛书第1-44章，对应今本第38-81章
- 道经：帛书第45-81章，对应今本第1-37章

### 章节检测三次迭代
| 迭代 | 方法 | 结果 | 问题 |
|---|---|---|---|
| 1 | 正则 `r'（.+?）（今\d+章）'` 全文搜索 | 51章 | TOC 与正文重复 |
| 2 | 从第12页起 + 去重 | 74章 | 缺20,30,40,50,60,70,80 |
| 3 | `re.finditer(cn+'、')` + 200字内找`帛书版`确认 | **81章 ✅** | 无 |

**根本原因：** 整十章节（二十, 三十...）恰好在 PDF 新页面顶部开始，
行结构为 `二十、标题（今57\n章）`，章号跨行拆分；
直接搜索 `cn+'、'` 而非按行匹配即可绕过。

### 输出结构
```
docs/帛书老子注读/
├── index.md              ← 双表格索引（德经+道经，含今本章号+链接）
├── 德经/
│   ├── 001_一.md         ← 第1章（一）道、德是这样沦丧的 → 今本第38章
│   └── ... 044_四十四.md
└── 道经/
    ├── 045_四十五.md     ← 第45章（四十五）道，不是玄 → 今本第1章
    └── ... 081_八十一.md
```

### 每章 Markdown 格式
```markdown
# 第N章（CN）标题
> **对应今本**：第 XX 章
---
## 帛书版原文
## 传世版原文
## 版本差异
## 直译
## 解读
```

### GitHub 推送
- 14:00 首次推送只有132文件（中文路径 bug）
- 修复 `git ls-files -z` 后：**214文件** 全量推送到 `xinetzone/dao-yan`

---

## Known Limitations（更新）
- docs/ 目录内的帛书老子注读章节为静态 Markdown，尚未集成到道衍 App UI
- 章节识别使用启发式方法（帛书版关键词确认），若版本不同可能需要调整
