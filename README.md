# 道研助手 (Dao Research Assistant)

<div align="center">

一个融合道家智慧与现代 AI 技术的研究型对话助手

**[English](#english) | [中文](#chinese)**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-blue)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Enabled-green)](https://supabase.com/)

</div>

---

## 📖 项目简介

道研助手是一个创新的 AI 研究对话应用，它独特地融合了：
- 📜 **帛书版《道德经》** 的无为而治哲学
- 🧘 **佛家禅修** 的直心如如不动智慧  
- 🔬 **量子场论** 的宇宙观
- 🤖 **现代 AI 技术** (Claude Sonnet 4.5)

### 核心理念

> "道可道，非恒道。" - 通过技术手段，帮助用户在信息洪流中找到内心的宁静与智慧。

---

## ✨ 核心特性

### 🔍 AI 驱动的深度研究
- **Perplexity 风格界面** - 简洁优雅的搜索体验
- **流式响应** - 实时显示 AI 思考过程
- **思考过程可视化** - 看见 AI 的推理路径
- **来源引用** - 每个回答都有可信来源

### 🌐 智能联网搜索
- **可选的网络搜索** - 一键启用/禁用
- **DuckDuckGo 集成** - 实时获取网络信息
- **自动内容抓取** - 智能提取关键内容
- **来源卡片展示** - 点击即可访问原始页面

### 📚 文档集合系统
- **本地文件上传** - 支持 TXT、MD、HTML、JSON、CSV、XML、YAML
- **网址内容抓取** - 一键获取网页文本
- **智能上下文管理** - 文档内容自动作为对话背景
- **多集合支持** - 分类管理不同主题的文档

### 🧘 修炼打卡系统
一个独特的个人成长游戏化系统：
- **10 个修炼境界** - 从凡人到真仙的进阶之路
- **4 种心境状态** - 通透、宁静、波动、纷乱
- **每日打卡积分** - 记录你的修行历程
- **AI 仙师指导** - 基于你的状态给予个性化点拨
- **新手教程** - 互动式引导，快速上手
- **数据持久化** - 本地存储，永不丢失

### 🌍 国际化支持
- **中英文双语** - 完整的界面翻译
- **自动检测** - 根据浏览器语言自动切换
- **无缝切换** - 实时语言切换，无需刷新

### 🎨 现代化设计
- **响应式布局** - 完美适配桌面、平板、手机
- **深色主题** - 护眼的太空星空风格
- **流畅动画** - 细腻的交互体验
- **shadcn/ui** - 高质量的 UI 组件库

---

## 🚀 快速开始

### 前置要求

- Node.js 18+ 
- pnpm 8+
- Supabase 账号（用于后端服务）

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/daoApps/dao-research-assistant.git
cd dao-research-assistant
```

2. **安装依赖**
```bash
pnpm install
```

3. **环境配置**

项目使用 Enter Cloud (Supabase) 作为后端，相关配置已自动生成在：
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`

如需自行部署，请参考 [部署指南](#部署指南)

4. **启动开发服务器**
```bash
pnpm dev
```

访问 `http://localhost:5173` 即可使用！

---

## 🏗️ 项目架构

### 技术栈

**前端框架**
- React 19.1 - 最新的 React 版本
- TypeScript 5.9 - 类型安全
- Vite 7 - 极速构建工具

**UI 框架**
- Tailwind CSS 3.4 - 实用优先的 CSS 框架
- shadcn/ui - 高质量组件库
- Radix UI - 无障碍的原始组件
- Lucide React - 优美的图标库

**路由与状态**
- React Router v7 - 声明式路由
- TanStack Query - 服务端状态管理
- LocalStorage - 客户端持久化

**国际化**
- i18next - 国际化核心
- react-i18next - React 集成
- i18next-browser-languagedetector - 语言检测

**后端服务**
- Supabase - 开源 Firebase 替代方案
- Edge Functions - 无服务器函数 (Deno)
- PostgreSQL - 关系型数据库

**AI 能力**
- Claude Sonnet 4.5 - Anthropic 的最新模型
- SSE (Server-Sent Events) - 流式响应
- Tool Calling - 函数调用（用于搜索）

### 目录结构

```
dao-research-assistant/
├── src/
│   ├── components/          # React 组件
│   │   ├── ChatMessage.tsx        # 聊天消息组件
│   │   ├── DocumentPanel.tsx      # 文档管理面板
│   │   ├── LanguageSwitcher.tsx   # 语言切换器
│   │   ├── NavigationSidebar.tsx  # 左侧导航栏
│   │   ├── SearchBar.tsx          # 搜索栏
│   │   ├── SuggestedPrompts.tsx   # 建议提示
│   │   └── ui/                    # shadcn/ui 基础组件
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useAIChat.ts          # AI 聊天逻辑
│   │   ├── useCultivation.ts     # 修炼系统逻辑
│   │   └── useDocumentCollections.ts  # 文档管理逻辑
│   ├── i18n/                # 国际化配置
│   │   ├── config.ts             # i18n 配置
│   │   └── locales/              # 翻译文件
│   │       ├── en-US.json        # 英文
│   │       └── zh-CN.json        # 中文
│   ├── integrations/        # 外部集成
│   │   └── supabase/             # Supabase 配置
│   ├── pages/               # 页面组件
│   │   ├── Index.tsx             # 主页（AI 研究助手）
│   │   └── CultivationPage.tsx   # 修炼打卡页面
│   ├── lib/                 # 工具库
│   └── main.tsx             # 应用入口
├── supabase/
│   ├── functions/           # Edge Functions
│   │   ├── ai-chat-167c2bc1450e/      # AI 聊天 API
│   │   ├── fetch-url-content/         # URL 内容抓取
│   │   └── web-search/                # 网络搜索
│   └── migrations/          # 数据库迁移
├── public/                  # 静态资源
├── .enter/                  # Enter 平台配置
└── package.json
```

### 核心模块说明

#### 1. AI 研究助手 (`src/pages/Index.tsx`)
- 主界面，包含搜索栏、聊天记录、建议提示
- 集成了文档上下文、联网搜索功能
- 使用 SSE 实现流式响应

#### 2. 修炼系统 (`src/pages/CultivationPage.tsx`)
- 独立的修炼打卡页面
- 包含主界面、打卡流程、结果展示、历史记录、新手教程五个视图
- 使用 localStorage 持久化数据

#### 3. 文档管理 (`src/components/DocumentPanel.tsx`)
- 侧边栏面板，支持文件上传和 URL 抓取
- 与 AI 聊天无缝集成
- 支持多个文档集合

#### 4. 导航系统 (`src/components/NavigationSidebar.tsx`)
- 左侧固定导航栏
- 响应式设计，移动端使用抽屉式
- 包含所有主要功能入口

---

## 🎯 功能详解

### AI 研究助手

**特点**
- Perplexity 风格的简洁界面
- 支持长对话上下文
- 实时流式响应
- 显示 AI 思考过程
- 可选的联网搜索
- 来源引用卡片

**使用方法**
1. 在搜索框输入你的问题
2. AI 会实时显示思考和回答过程
3. 点击"联网搜索"按钮启用网络搜索
4. 查看来源卡片了解信息来源

**技术实现**
- 使用 `fetch-event-source` 处理 SSE 流
- Claude Sonnet 4.5 作为 AI 模型
- 支持 Tool Calling 调用搜索功能

### 文档集合系统

**支持格式**
- 文本文件：TXT, MD
- 标记语言：HTML, XML, YAML
- 数据格式：JSON, CSV

**工作流程**
1. 创建文档集合
2. 上传文件或添加网址
3. 激活集合作为对话上下文
4. AI 会参考文档内容回答问题

**技术实现**
- 使用 Supabase Database 存储文档
- Edge Function 抓取网页内容
- 自动提取纯文本内容

### 修炼打卡系统

**10 个境界**
1. 凡人 (0 EP) - 尚未修行
2. 炼气 (50 EP) - 初凝灵气
3. 筑基 (200 EP) - 根基渐稳
4. 金丹 (600 EP) - 凝结金丹
5. 元婴 (1500 EP) - 元婴初成
6. 化神 (4000 EP) - 神魂归一
7. 合体 (12000 EP) - 天人合一
8. 大乘 (40000 EP) - 大道现前
9. 渡劫 (120000 EP) - 历尽天劫
10. 真仙 (360000 EP) - 超脱轮回

**4 种心境**
- 通透 (+15点) - 心如明镜，万象皆空
- 宁静 (+10点) - 静水流深，心无挂碍
- 波动 (+5点) - 心有涟漪，不失根本
- 纷乱 (+3点) - 心绪纷扰，需定慧观

**积分计算**
```
总积分 = 基础 10 点
       + 心境奖励 (3-15)
       + 无为指数 × 4 (0-20)
       + 道场感应 10 点
       + 心言奖励 (0-8)
       + 连续天数 × 2 (最高 20)
```

**新手教程**
1. 欢迎介绍 - 了解修炼理念
2. 境界展示 - 查看所有境界
3. 心境讲解 - 理解心境系统
4. 引导打卡 - 完成首次打卡
5. 新手礼包 - 获得 50 悟道点奖励

---

## 🛠️ 开发指南

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 代码检查
pnpm lint

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

### 环境变量

项目使用 Enter Cloud 集成，主要配置已自动生成。如需自定义：

```env
# Supabase 配置 (auto-generated)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 添加新功能

1. **添加新页面**
   - 在 `src/pages/` 创建组件
   - 在 `src/main.tsx` 添加路由

2. **添加新组件**
   - 在 `src/components/` 创建组件
   - 使用 shadcn/ui 基础组件

3. **添加新 Hook**
   - 在 `src/hooks/` 创建 Hook
   - 遵循 React Hooks 规则

4. **添加 Edge Function**
   - 在 `supabase/functions/` 创建目录
   - 创建 `index.ts` 入口文件
   - 使用 Deno 运行时

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 组件使用函数式写法
- 使用 Tailwind CSS 样式
- 避免内联样式

---

## 📦 部署指南

### 部署到 Vercel

```bash
# 安装 Vercel CLI
pnpm i -g vercel

# 部署
vercel
```

### 部署到 Netlify

```bash
# 构建
pnpm build

# 上传 dist 目录到 Netlify
```

### 自托管

```bash
# 构建生产版本
pnpm build:prod

# dist 目录包含所有静态文件
# 使用任何静态文件服务器托管
```

### Supabase 配置

1. 创建 Supabase 项目
2. 运行数据库迁移
3. 部署 Edge Functions
4. 更新环境变量

---

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat:` - 新功能
- `fix:` - Bug 修复
- `docs:` - 文档更新
- `style:` - 代码格式（不影响功能）
- `refactor:` - 重构
- `test:` - 测试
- `chore:` - 构建/工具配置

---

## 📄 开源协议

本项目采用 MIT 协议 - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

本项目的实现离不开以下优秀的开源项目：

- [React](https://react.dev/) - 用户界面库
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的类型超集
- [Vite](https://vitejs.dev/) - 下一代前端工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [shadcn/ui](https://ui.shadcn.com/) - 精美的 React 组件
- [Supabase](https://supabase.com/) - 开源 Firebase 替代方案
- [Anthropic Claude](https://www.anthropic.com/) - 强大的 AI 模型
- [Lucide](https://lucide.dev/) - 优美的图标库
- [i18next](https://www.i18next.com/) - 国际化框架

特别感谢所有贡献者和使用者！

---

## 📮 联系方式

- GitHub Issues: [提交问题](https://github.com/daoApps/dao-research-assistant/issues)
- GitHub Discussions: [参与讨论](https://github.com/daoApps/dao-research-assistant/discussions)

---

<div align="center">

**愿你在修炼之路上，证得本心，逍遥自在 🌟**

Made with ❤️ by daoApps

</div>
