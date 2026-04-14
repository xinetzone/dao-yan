# Session Review -- 2026-04-14

## Overview
This session focused on transforming the dao-research-assistant from a generic AI chat UI into a visually distinctive Chinese scholarly-themed application, with a polished cosmic cultivation system.

## Changes Summary

### 1. Chinese Scholarly Aesthetic Redesign (9fe38b9)
**Scope**: 10 files, 525 additions
- Warm cream/beige palette (hsl 36 33% 95%) replacing default blue/white
- Cinnabar red primary accent (hsl 4 78% 52%)
- Custom CSS classes: `.dao-card` (sketch border), `.dao-tape` (decoration), `.dao-tag` (yellow pills), `.dao-question` (rounded pills)
- Floating rotated square decorations with animation
- Hero card with BookOpen icon, feature tags, suggested question pills
- SearchBar rewritten as card container with toolbar (web search toggle + doc panel + send)
- i18n updated: prompts now Dao research-themed (6 topics)
- **3 bugs fixed**: duplicate DocumentPanel, prop name mismatch, duplicate interface

### 2. Rich Markdown Rendering (592ca8b)
**Scope**: 5 files, 1291 additions
- Installed react-markdown + remark-gfm + rehype-highlight
- Created `MarkdownRenderer.tsx` with code copy button
- 300+ lines of `.dao-markdown` prose styles in index.css
- Syntax highlighting with warm color scheme (light + dark)
- Tables, blockquotes, code blocks, lists all styled
- User messages stay plain text; AI responses get full Markdown

### 3. Cultivation Page Polish (585c591)
**Scope**: 2 files, 476 additions
- Moved star field CSS from inline `<style>` to index.css
- Glass-morphism card system: `.cult-card-glow`, `.cult-card`
- Custom progress bar with realm-colored fill + shimmer animation
- Mood selection cards with glow effect on selection
- Dao field toggle with dynamic realm-colored styling (inline style, not Tailwind)
- Spirit orb pulse animation
- CTA button glow effect
- Record cards with expandable guidance using MarkdownRenderer
- Tutorial step indicators with smooth width transitions
- Level-up glow animation
- Removed unused shadcn Card/Progress imports

## Architecture Decisions
1. **Custom CSS classes over Tailwind**: For complex effects (glass morphism, sketch borders, animations), custom CSS classes in index.css provide better control than long Tailwind class strings
2. **Inline style for dynamic colors**: Cultivation realm colors are JS variables, so `style={{}}` is used instead of Tailwind (which can't compile dynamic values)
3. **Semantic design tokens**: All colors flow through CSS custom properties for theming consistency
4. **MarkdownRenderer as shared component**: Used in both ChatMessage (main chat) and CultivationPage (AI guidance), with `.cult-guidance` overrides for dark background

## Bugs Found & Fixed
| Bug | Root Cause | Fix |
|-----|-----------|-----|
| DocumentPanel rendered twice | Copy-paste duplication in Index.tsx | Removed duplicate instance |
| Document selection broken | Prop name `onCollectionSelect` vs `onSelectCollection` | Renamed to match interface |
| ChatMessageProps duplicate | Two identical interface declarations | Removed duplicate |
| Dao field toggle colors not working | Tailwind can't compile template literals like `border-[${color}]` | Changed to inline `style={{}}` |
| Star field inline `<style>` tag | React anti-pattern, causes re-renders | Moved to index.css |

## Quality Metrics
- **Lint**: All 3 commits pass ESLint clean
- **Build**: All 3 commits compile successfully
- **Bundle**: ~1528 KB JS (includes react-markdown ecosystem)
- **CSS**: 79.9 KB (includes all custom styles)

## Key Learnings
1. Platform may reset code changes -- always push to Git promptly
2. Tailwind cannot compile dynamic color values from JS variables -- use inline styles
3. Glass morphism on dark backgrounds needs careful opacity tuning (0.04-0.08 range)
4. Custom CSS utility classes (`.dao-*`, `.cult-*`) keep component JSX clean
5. MarkdownRenderer needs theme-specific overrides when used on non-standard backgrounds

## Files Modified (This Session)
```
src/index.css                    -- Design tokens + dao/cult/markdown styles
src/pages/Index.tsx              -- Landing hero + chat layout
src/pages/CultivationPage.tsx    -- Full polish
src/components/SearchBar.tsx     -- Card-style with toolbar
src/components/SuggestedPrompts.tsx -- Tag pills + question pills
src/components/ChatMessage.tsx   -- MarkdownRenderer integration
src/components/MarkdownRenderer.tsx -- NEW: React-Markdown wrapper
src/components/NavigationSidebar.tsx -- Warm palette
src/i18n/locales/zh-CN.json     -- Dao research prompts
src/i18n/locales/en-US.json     -- Dao research prompts
tailwind.config.ts               -- Custom shadow token
package.json                     -- +3 deps
```
