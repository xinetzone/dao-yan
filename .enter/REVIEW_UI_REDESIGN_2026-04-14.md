# UI 改造复盘报告 — 2026-04-14

## 1. 执行概览
| 项目 | 详情 |
|------|------|
| **任务** | 参考"道德大师兄"设计风格，全面改造 dao-research-assistant UI |
| **参考** | https://acntxq6xf8pe.aiforce.cloud/spark/faas/app_4jspztm260ymj |
| **状态** | 首次改造已提交(ba51f4b)但被平台重置，需重新实施 |

## 2. 参考设计分析（道德大师兄）
### 核心设计特征
- **色调**: 暖米色宣纸底(~#f5f0e8)，朱红CTA，深棕文字
- **卡片**: 手绘风粗边框(2-3px solid)，顶部胶带装饰，微倾斜
- **标签**: 黄色药丸按钮带黑色细边框（原文解读/版本对比/思想阐发/生活应用）
- **排版**: 中文书法感标题，古朴气息
- **布局**: 英雄区(圆形头像+标题+标签+描述+CTA) → 问道区(聊天+建议问题) → 帛书知识区
- **装饰**: 背景浮动旋转方块，虚线分隔

## 3. 发现的关键Bug
1. **DocumentPanel 重复渲染**: Index.tsx 行68和行192渲染了两次
2. **Props 命名不匹配**: DocumentPanel定义`onSelectCollection`，Index.tsx传入`onCollectionSelect`（导致选择集合功能静默失败）
3. **ChatMessage 接口重复**: ChatMessage.tsx 行8和行48重复定义 ChatMessageProps

## 4. 实施计划
### 文件变更清单
| 文件 | 变更 | 说明 |
|------|------|------|
| src/index.css | 重写 | 暖色系令牌 + dao-card/dao-tag/dao-question 等自定义类 |
| tailwind.config.ts | 修改 | shadow-card令牌 + float动画 |
| src/components/ui/button.tsx | 修改 | 新增 dao 变体(朱红CTA) |
| src/components/SearchBar.tsx | 重写 | 卡片式搜索框 + 底部工具栏(联网/文档/发送) |
| src/components/SuggestedPrompts.tsx | 重写 | 功能标签 + 问题药丸 |
| src/pages/Index.tsx | 重写 | 英雄卡片 + 修复3个bug |
| src/components/ChatMessage.tsx | 修改 | 移除重复接口定义 |
| src/i18n/locales/zh-CN.json | 修改 | 道研主题提示词 |
| src/i18n/locales/en-US.json | 修改 | 道研主题提示词 |

## 5. 经验教训
- 平台可能会自动重置代码，大改后应立即push到GitHub
- 修改前应检查现有bug（如props不匹配、组件重复渲染）并一并修复
- 大型UI改造应对照参考逐元素实施，避免遗漏

## 6. 设计令牌规划
```
Background: hsl(36 33% 95%)    — 宣纸米色
Foreground: hsl(20 20% 16%)    — 深棕黑
Primary:    hsl(4 78% 52%)     — 朱红
Accent:     hsl(45 80% 88%)    — 暖黄标签
Card:       hsl(36 40% 98%)    — 温白
Border:     hsl(36 15% 82%)    — 暖灰边
Radius:     0.375rem           — 方正感
```
