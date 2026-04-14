# UI 一致性优化复盘 — 2026-04-14

## 本轮优化目标
确保道研助手的两大主题（暖色学术风 + 深色修炼风）各自内部一致，跨页面元素协调。

## 执行内容

### Commit 1: `592ca8b` — Markdown 渲染器
- 新增 MarkdownRenderer 组件（react-markdown + remark-gfm + rehype-highlight）
- 添加 .dao-markdown 完整样式体系（代码块、表格、引用、列表、标题）
- AI 回答从纯文本升级为富文本渲染

### Commit 2: `aed65f2` — 切换为 marked
- react-markdown → marked + highlight.js + DOMPurify
- 打包体积减少 ~250KB（1528→1277KB）
- 代码复制按钮改为事件委托（无 React 组件开销）

### Commit 3: `585c591` — 修炼页 UI 打磨
- 星空 CSS 从内联 `<style>` 移入 index.css
- 磨砂玻璃卡片（cult-card-glow）、灵球脉冲、自定义进度条
- 心境选择卡片带选中发光、道场感应按钮动态着色
- 修行记录可展开 AI 点拨（MarkdownRenderer）
- 教程步骤指示器

### Commit 4: `5313f49` — 布局一致性
- SuggestedPrompts 从英雄卡内部移到卡片与搜索栏之间
- 问题药丸改为 2 列网格布局（sm 以上）
- 搜索栏 landing 模式去掉粗边框+胶带装饰，改为轻量边框
- 侧边栏图标统一为 BookOpen（与英雄区一致）
- 英雄卡收紧间距、缩小头像

## 发现的问题与修复

| # | 问题 | 修复 |
|---|------|------|
| 1 | 英雄卡+搜索栏双粗边框视觉过重 | 搜索栏改为 2px 细边框 |
| 2 | 侧边栏图标 Sparkles ≠ 英雄区 BookOpen | 统一为 BookOpen |
| 3 | 问题药丸垂直堆叠占太多空间 | 改为 2 列网格 + line-clamp |
| 4 | 修炼页道场按钮 Tailwind 动态色无效 | 改用 inline style |
| 5 | AI 点拨在深色背景上样式错乱 | 添加 .cult-guidance 覆写 |

## 两大设计系统

### 暖色学术风（首页/聊天/文档）
- 背景: hsl(36 33% 95%) 米色宣纸
- 主色: hsl(4 78% 52%) 朱红
- 强调: hsl(45 80% 88%) 暖黄标签
- 卡片: dao-card（2.5px 粗边框 + 阴影 + dao-tape 胶带）
- 标签: dao-tag（暖黄底 + 深色边框药丸）
- 问题: dao-question（圆角卡片 + 浅边框）

### 深色修炼风（修行打卡/教程）
- 背景: 深蓝宇宙渐变（#060a14 → #111827）
- 卡片: cult-card-glow（白色5%半透 + backdrop-blur）
- 进度: cult-progress-track/fill（带微光动画）
- 按钮: cult-btn-glow（渐变背景 + 光晕边框）
- 动画: orb-pulse、twinkle、level-up-glow

## 经验教训
1. **预览缓存**: 平台预览有延迟，应以 build 结果为准
2. **Tailwind 动态值**: `bg-${color}` 模板字面量不会被编译，必须用 inline style
3. **设计系统分离**: 两个主题各自独立是合理的（学术 vs 修炼），但共享底层令牌（primary/foreground 等）
4. **marked vs react-markdown**: marked 更轻（-250KB），但需要 DOMPurify 做 XSS 防护
