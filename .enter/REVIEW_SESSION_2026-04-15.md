# 道衍 — Session Review 2026-04-15

## 概览

| 项目 | 内容 |
|------|------|
| **日期** | 2026-04-15 |
| **Session 时长** | ~1.5 小时 |
| **Commits** | 10 个（26b679e … 49a6d8d） |
| **涉及文件** | 27 个文件 |
| **本次 Tag** | `v1.0.0` |

---

## Phase 6 — 品牌重命名：道研助手 → 道衍 (02:00–02:52)

### 背景
用户提供「道衍」品牌理念：
- **道** = 规律、法则、宇宙根本（老子「道法自然」）
- **衍** = 衍生、延展、变化（《说文》「水朝宗于海也」）
- **道衍** = 道法在当下的流动与延展
- 定位：「陪你问道的智慧伙伴」，不是学术工具，不是道德导师

### 提交清单

| Commit | 内容 |
|--------|------|
| `26b679e` | `feat`: zh-CN/en-US landing.title + chat.header → 道衍；index.html title + description |
| `ae6aada` | `fix`: landing.subtitle → 陪你问道的智慧伙伴 / Your Wise Companion on the Path of Dao |
| `1ad325e` | `fix`: SearchBar placeholder 向大师兄提问 → 向道衍提问 |
| `a14fc18` | `docs`: README clone URLs dao-research-assistant → dao-yan |
| `fa9217e` | `refactor`: 全项目 21 文件批量替换（0 残留） |
| `7ed671a` | `docs`: README 副标题 + 简介全面改写，匹配道衍品牌定位 |
| `bc40a40` | `docs`: 新建 README-EN.md（228 行完整英文文档） |

### 替换映射（已全部清零）

| 旧名 | 新名 | 文件类型 |
|------|------|---------|
| `道研助手` | `道衍` | .md, .json, .tsx, .sh, .txt |
| `dao-research-assistant` | `dao-yan` | 全部 URL、仓库名引用 |
| `Dao Research Assistant` | `Dao Yan (道衍)` | README 英文标题 |
| `道研主题提示词` | `道衍提示词` | README、设计文档 |
| `帛书版《道德经》AI 学者` | `陪你问道的智慧伙伴` | 副标题 |

### README-EN.md 结构
```
# 道衍 (Dao Yan) — Your Wise Companion on the Path of Dao
├── Name Meaning (3 layers: Dao / Yan / Dao Yan)
├── Core Philosophy (4 dimensions: Inheritance / Wisdom / Practice / Companionship)
├── Features (6 sections: AI Dialogue / Web Search / Chat UX / Docs / Cultivation / i18n)
├── Tech Stack
├── Project Structure
├── Cultivation Realms + Points Formula
├── Security
└── Quick Start
```

---

## Phase 7 — AllTheory 替换：量子场论 → ψ=ψ(ψ) 万物理论 (02:48–02:52)

### 背景
用户引用 https://dw.cash/zh-Hans/docs/intro — **ψ=ψ(ψ) AllTheory 体系**：
- **ψ=ψ(ψ)** — 单一递归方程，一切存在从此涌现
- **崩塌动力学** — 现实从意识的自我折叠中涌现
- **意识自显（一识）** — 东方智慧与物理统一场论的融合点

### 提交清单

| Commit | 内容 |
|--------|------|
| `a81696c` | `refactor`: 3 文件 5 处替换（zh-CN.json × 2 + en-US.json × 2 + CultivationPage.tsx × 1） |
| `cd7a1b5` | `docs`: README.md 中英双语同步 |
| `49a6d8d` | User edit: README 手动微调 |

### 5 处替换详情

| 文件 | 旧文本 | 新文本 |
|------|--------|--------|
| zh-CN.json (提示) | 从量子场论角度如何理解「道生一，一生二」？ | 「道生一，一生二」如何映照ψ=ψ(ψ)万物理论的崩塌涌现？ |
| zh-CN.json (欢迎语) | 量子场论的宇宙观 | ψ=ψ(ψ)万物理论的崩塌宇宙观 |
| en-US.json (提示) | ...quantum field theory | ψ=ψ(ψ) Theory of Everything |
| en-US.json (欢迎语) | quantum field theory | ψ=ψ(ψ) Theory of Everything's collapse cosmology |
| CultivationPage.tsx (AI system prompt) | 从量子场论/万物理论的宇宙视角启发 | 从ψ=ψ(ψ)万物理论（崩塌动力学、意识自显）的宇宙视角启发 |

---

## 全项目积累进度（截至 v1.0.0）

### 里程碑 commits

| Phase | Commit | 内容 |
|-------|--------|------|
| P1 | Early | Foundation: cultivation system, navigation, AI chat, git docs |
| P2 | `9fe38b9` | UI redesign: warm cream + cinnabar theme |
| P2 | `592ca8b` | Markdown rendering: marked + hljs + DOMPurify |
| P2 | `585c591` | Cultivation page polish: glass-morphism |
| P3 | `80d154d` | Theme unification (cosmic dark → warm scholarly) |
| P3 | `2d033d4` | Web search rebuild: DuckDuckGo + FatalError pattern |
| P3 | `5cd2c33` | Locale-aware AI responses |
| P3 | `86d994a` | Fix 5 critical bugs from full code review |
| P4 | `dbe4049` | Web search 3-layer SearXNG fallback |
| P4 | `ce8682c` | UX optimization batch (9 files: stop, copy, auto-resize, etc.) |
| P5 | `1d6bd2f` | Security hardening (S1-S4) |
| P5 | `c9d4c95` | Aria-describedby accessibility fix |
| P6 | `fa9217e` | Brand rename 道研助手 → 道衍 (21 files) |
| P6 | `bc40a40` | README-EN.md (228 lines) |
| P7 | `a81696c` | AllTheory ψ=ψ(ψ) integration |

### v1.0.0 功能清单

**核心 AI**
- Claude Sonnet 4.5 SSE 流式对话
- 3 层联网搜索（SearXNG → DDG HTML → DDG Lite）
- locale 感知（中/英自动匹配回复语言）
- 模型白名单 + 输入长度校验

**UX**
- 停止生成按钮（AbortController）
- 消息复制 + 最后一条重新生成
- 输入框自动伸缩（1–6 行）
- 滚动到底部浮动按钮
- 联网搜索进度指示 + 来源卡片（favicon）
- 暗/亮模式切换（localStorage 持久化）
- 建议提示词分类标签过滤

**文档系统**
- 文档集合管理（添加/删除/激活）
- URL 验证（must start with http/https）

**修炼系统**
- 5 境界升级（1–99 积分）
- 每日打卡 + AI 仙师引导
- 情绪选择 + 历史记录（localStorage）

**安全**
- src/config.ts 凭据统一管理
- DOMPurify FORBID_TAGS + FORBID_ATTR + URI 白名单
- 安全响应头（X-Content-Type-Options / X-Frame-Options 等）
- 字符限制 UI（SearchBar 80% 警告 + 超限阻止提交）

---

## 新增经验（Phase 6–7）

### 品牌一致性检查流程
```bash
# 搜索所有旧名残留
grep -rn "旧名称" . | grep -v node_modules | grep -v dist | grep -v ".git/"
# 批量替换
find . -name "*.md" -exec sed -i 's/旧名/新名/g' {} \;
# 验证清零
grep -rn "旧名称" . | grep -v node_modules | wc -l  # 必须为 0
```

### 文件类型覆盖顺序
1. `*.tsx` / `*.ts` — 源码（用户可见）
2. `*.json` — i18n translations（用户可见）
3. `*.html` — 页面 title/description（SEO可见）
4. `*.md` — 文档（开发者可见）
5. `*.sh` / `*.txt` — 脚本（运维可见）

### ψ=ψ(ψ) 核心概念（AllTheory）
- 网站：https://dw.cash/zh-Hans/docs/intro
- 核心方程：ψ=ψ(ψ)（自指递归，意识即现实结构）
- 崩塌动力学：ψ 自我折叠 → 世界涌现
- 道家对照：道生一（ψ 的初始化） → 一生二（崩塌） → 万物（涌现）
- 使用在：修炼欢迎语、AI system prompt、建议提示词
