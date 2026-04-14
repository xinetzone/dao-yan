# Session Memory -- 2026-04-14

## Project: dao-research-assistant (xinetzone/dao-research-assistant)

## Session Summary
Full-day session with 12 user requests spanning repository management, bug fixes, UI redesign, Markdown rendering, and documentation.

## Chronological Commits (31 total today)

### Phase 1: Foundation & Bug Fixes (00:00-07:45)
- Cultivation system, responsive UI, navigation sidebar, cultivation guide tutorial
- AI chat web search, README, LICENSE, .gitignore
- Git push guides and troubleshooting docs
- Stream timeout fix V1 & V2 (added AbortController timeouts to edge functions)
- Daodejing quote correction: "非常道" -> "非恒道" (帛书版)

### Phase 2: UI Redesign (09:47-11:03)
- `9fe38b9` Chinese scholarly aesthetic (warm cream + cinnabar red + sketch cards)
- `592ca8b` Markdown rendering (react-markdown + remark-gfm + rehype-highlight)
- `585c591` Cultivation page polish (glass-morphism, spirit orb, custom progress)
- `aed65f2` Switch to marked (react-markdown -> marked, -250KB bundle)
- `5313f49` Layout consistency (2-col questions, lighter SearchBar, icon unification)

## Key Architecture Decisions

### 1. Dual Theme System
- **Scholarly warm** (Index/Chat): cream bg, red primary, sketch-border cards
- **Cosmic dark** (Cultivation): deep blue gradient, glass-morphism, star field
- Shared: design tokens (--primary, --foreground), i18n, MarkdownRenderer

### 2. Markdown Stack: marked + highlight.js + DOMPurify
- Rejected react-markdown (too heavy, +250KB)
- Custom renderer with: code copy button (event delegation), syntax highlight, XSS protection
- Works in both themes via .dao-markdown + .cult-guidance CSS overrides

### 3. Web Search Toggle
- Moved from sidebar-only to dual entry: sidebar + SearchBar toolbar
- Both toggle the same `webSearchEnabled` state

### 4. Dynamic Colors in Cultivation
- Cannot use Tailwind template literals (`bg-${color}`)
- All realm-based colors use `style={{ color: currentRealm.color }}`

## Bug History
1. Stream timeout: Added layered timeouts (15s search, 10s URL, 8s fetch-url-content)
2. Stale props: Removed `onCollectionSelect` (should be `onSelectCollection`)
3. Duplicate DocumentPanel: Removed second instance in Index.tsx
4. Duplicate ChatMessageProps: Removed duplicate interface definition
5. Tailwind dynamic color: Switched to inline styles

## File Inventory (key files)

| File | Purpose | Last Modified |
|------|---------|---------------|
| src/index.css | Dual theme tokens + 7 custom CSS systems | 5313f49 |
| src/pages/Index.tsx | Hero card + chat view | 5313f49 |
| src/pages/CultivationPage.tsx | 5 views: home/checkin/result/records/tutorial | 585c591 |
| src/components/MarkdownRenderer.tsx | marked + hljs + DOMPurify | aed65f2 |
| src/components/SearchBar.tsx | Textarea + toolbar (web/docs/send) | 5313f49 |
| src/components/SuggestedPrompts.tsx | 4 tags + 4 question pills (2-col grid) | 5313f49 |
| src/components/NavigationSidebar.tsx | Sidebar nav (BookOpen icon) | 5313f49 |
| src/components/ChatMessage.tsx | User (text) + AI (Markdown) messages | 592ca8b |
| src/i18n/locales/zh-CN.json | Dao-themed Chinese translations | 9fe38b9 |
| src/i18n/locales/en-US.json | Dao-themed English translations | 9fe38b9 |
| supabase/functions/ai-chat-*/index.ts | AI chat + web search (timeout-protected) | Earlier |
| supabase/functions/fetch-url-content/index.ts | URL fetcher (8s AbortController) | Earlier |

## CSS Class Systems in index.css

1. **dao-card / dao-tape**: Sketch-border card + tape decoration
2. **dao-tag**: Yellow pill button (feature categories)
3. **dao-question**: Rounded question card (2-col grid)
4. **dao-float-square**: Floating decoration squares (4 positions)
5. **dao-markdown**: Full prose styling (headings, lists, code, tables, quotes)
6. **cult-***: Cultivation dark theme (card-glow, progress, mood-card, btn-glow, stat, record)
7. **hljs-***: Syntax highlight color overrides (light + dark)

## I18n Prompt Keys (Dao-themed)
- creative: 原文解读 / Original Text
- market: 版本对比 / Versions
- research: 思想阐发 / Philosophy
- coding: 生活应用 / Application
- problem: 佛道对话 / Buddhist-Daoist
- tech: 量子视角 / Quantum View

## Known Limitations
- Preview cache can be 2-5 minutes behind code changes
- Bundle size ~1277KB (highlight.js is largest contributor)
- Cultivation data is localStorage only (no cloud sync)
- Web search has 15s total timeout, may fail on slow networks
