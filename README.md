# 道研助手 (Dao Research Assistant)

<div align="center">

**帛书版《道德经》AI 学者 -- 融合道家智慧与现代 AI 技术的研究型对话助手**

**[English](#english) | [中文](#chinese)**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-blue)](https://react.dev/)

</div>

---

<a id="chinese"></a>

## 项目简介

道研助手是一个创新的 AI 研究对话应用，以帛书版《道德经》为根基，独特融合：

- **帛书版《道德经》** 的无为而治哲学
- **佛家禅修** 的直心如如不动智慧
- **量子场论** 的宇宙观
- **现代 AI** (Claude Sonnet 4.5) 驱动的智能对话

### 核心理念

> "道，可道也，非恒道也。" -- 帛书版《道德经》

---

## 核心特性

### AI 深度研究
- **中国古典学术风 UI** -- 暖米色宣纸底、朱红强调色、手绘风卡片
- **流式响应** -- 实时显示 AI 思考过程
- **Markdown 富文本渲染** -- 代码高亮、表格、引用、一键复制（基于 marked + highlight.js）
- **来源引用** -- 联网搜索结果以卡片形式展示

### 智能联网搜索
- **可选联网** -- 搜索栏工具栏一键启用
- **DuckDuckGo 集成** -- 实时获取网络信息
- **自动内容抓取** -- 智能提取关键内容，8秒超时保护
- **双重入口** -- 侧边栏 + 搜索栏工具栏均可切换

### 文档集合系统
- **本地文件上传** -- 支持 TXT、MD、HTML、JSON、CSV、XML、YAML
- **网址内容抓取** -- 一键获取网页文本
- **智能上下文管理** -- 文档内容自动作为对话背景
- **多集合支持** -- 分类管理不同主题的文档

### 修炼打卡系统
独特的个人成长游戏化系统，深色宇宙星空主题：
- **10 个修炼境界** -- 从凡人到真仙的进阶之路
- **4 种心境状态** -- 通透、宁静、波动、纷乱
- **5 星无为指数** -- 量化你的无为境界
- **道场感应** -- 天地灵气互动
- **AI 仙师指导** -- 基于修行状态的个性化点拨（Markdown 渲染）
- **磨砂玻璃卡片** -- 深色背景下的精致 UI
- **新手教程** -- 5 步互动引导 + 50 悟道点礼包

### 国际化
- **中英文双语** -- 完整界面翻译
- **道研主题提示词** -- 原文解读、版本对比、思想阐发、生活应用
- **自动检测** -- 根据浏览器语言自动切换

### 双主题设计系统

| 维度 | 学术风（首页/聊天） | 修炼风（打卡/教程） |
|------|---------------------|---------------------|
| 背景 | 暖米色宣纸 hsl(36 33% 95%) | 深蓝宇宙渐变 #060a14 |
| 主色 | 朱红 hsl(4 78% 52%) | 境界色（动态） |
| 卡片 | dao-card 手绘粗边框 + 胶带装饰 | cult-card-glow 磨砂玻璃 |
| 标签 | dao-tag 暖黄药丸 | cult-mood-card 发光选择 |
| 动画 | 浮动方块 dao-float | 星空闪烁 twinkle、灵球脉冲 |

---

## 快速开始

### 前置要求

- Node.js 18+
- pnpm 8+

### 安装

```bash
git clone https://github.com/xinetzone/dao-research-assistant.git
cd dao-research-assistant
pnpm install
pnpm dev
```

访问 `http://localhost:5173`

---

## 项目架构

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | React 19.1 + TypeScript 5.9 | Vite 7 构建 |
| UI | Tailwind CSS + shadcn/ui + Lucide | 双主题设计系统 |
| Markdown | marked + highlight.js + DOMPurify | 富文本渲染 + XSS 防护 |
| 路由 | React Router v7 | 声明式路由 |
| 国际化 | i18next + react-i18next | 中英双语 |
| 后端 | Supabase Edge Functions (Deno) | AI 聊天、搜索、抓取 |
| AI | Claude Sonnet 4.5 via SSE | 流式响应 + Tool Calling |
| 存储 | localStorage | 修炼数据持久化 |

### 目录结构

```
dao-research-assistant/
├── src/
│   ├── components/
│   │   ├── ChatMessage.tsx          # 聊天消息（Markdown 渲染）
│   │   ├── MarkdownRenderer.tsx     # marked 渲染器（高亮、复制、XSS）
│   │   ├── DocumentPanel.tsx        # 文档管理面板
│   │   ├── LanguageSwitcher.tsx     # 语言切换器
│   │   ├── NavigationSidebar.tsx    # 左侧导航栏
│   │   ├── SearchBar.tsx            # 搜索栏（联网/文档工具栏）
│   │   ├── SuggestedPrompts.tsx     # 道研主题提示标签
│   │   └── ui/                      # shadcn/ui 基础组件
│   ├── hooks/
│   │   ├── useAIChat.ts             # AI 聊天（SSE + 搜索）
│   │   ├── useCultivation.ts        # 修炼系统（境界/打卡/积分）
│   │   └── useDocumentCollections.ts
│   ├── i18n/locales/                # zh-CN.json / en-US.json
│   ├── pages/
│   │   ├── Index.tsx                # 主页（英雄卡 + 聊天）
│   │   └── CultivationPage.tsx      # 修炼（打卡/教程/记录）
│   └── index.css                    # 双主题设计令牌 + 自定义 CSS
├── supabase/functions/
│   ├── ai-chat-*/                   # AI 聊天 + 联网搜索
│   ├── fetch-url-content/           # URL 内容抓取（8s 超时）
│   └── web-search/                  # DuckDuckGo 搜索
└── .enter/                          # 复盘报告 + 平台配置
```

---

## 修炼系统

### 10 个境界

| 境界 | 悟道点 | 含义 |
|------|--------|------|
| 凡人 | 0 | 尚未修行 |
| 炼气 | 50 | 初凝灵气 |
| 筑基 | 200 | 根基渐稳 |
| 金丹 | 600 | 凝结金丹 |
| 元婴 | 1,500 | 元婴初成 |
| 化神 | 4,000 | 神魂归一 |
| 合体 | 12,000 | 天人合一 |
| 大乘 | 40,000 | 大道现前 |
| 渡劫 | 120,000 | 历尽天劫 |
| 真仙 | 360,000 | 超脱轮回 |

### 积分计算

```
总积分 = 基础 10 点
       + 心境奖励 (3-15)
       + 无为指数 x 4 (0-20)
       + 道场感应 10 点
       + 心言奖励 (0-8)
       + 连续天数 x 2 (最高 20)
```

---

## 开发

```bash
pnpm install    # 安装依赖
pnpm dev        # 开发服务器
pnpm lint       # 代码检查
pnpm build      # 生产构建
```

---

## 开源协议

MIT License - 详见 [LICENSE](LICENSE)

---

## 致谢

- [React](https://react.dev/) / [TypeScript](https://www.typescriptlang.org/) / [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/) / [shadcn/ui](https://ui.shadcn.com/) / [Lucide](https://lucide.dev/)
- [marked](https://marked.js.org/) / [highlight.js](https://highlightjs.org/) / [DOMPurify](https://github.com/cure53/DOMPurify)
- [Supabase](https://supabase.com/) / [Anthropic Claude](https://www.anthropic.com/)
- [i18next](https://www.i18next.com/)

---

<div align="center">

**愿你在修炼之路上，证得本心，逍遥自在**

</div>
