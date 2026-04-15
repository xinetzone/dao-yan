# 修行打卡 + 修炼指南 合并页面

## 当前结构
CultivationPage 有 5 个 view 状态：
- `home` — 主界面（灵球 + 进度 + 统计 + 按钮）
- `checkin` — 打卡表单（心境/无为指数/道场/心言）
- `result` — 打卡结果（得分 + AI 点拨）
- `records` — 历史记录
- `tutorial` — 新手引导向导（5步骤轮播）

用户导航路径：home → checkin → result → home；tutorial 只在首次或 URL 参数时出现。

## 目标
**修行打卡** 和 **修炼指南** 合并为一个页面，使用 Tab 切换，无需二级导航。

## 方案：Tab 布局

### Tab 1 —「修行打卡」
保留原有 home → checkin → result 流程，作为第一个 Tab 的内部状态流：
- 子状态 `home`：灵球 + 进度条 + 统计 + 「今日打卡」按钮 + 「修行记录」入口
- 子状态 `checkin`：打卡表单
- 子状态 `result`：结果页

### Tab 2 —「修炼指南」
将 tutorial 中的静态内容改为**常驻参考手册**（不再是向导轮播），展示：
1. **系统概览**：欢迎词 + ψ=ψ(ψ) 宇宙观简介
2. **境界体系**：所有 realms 网格（name + description + EP threshold）
3. **心境积分表**：所有 moods 卡片（name + points + description）
4. **打卡说明**：无为指数 + 道场感应解释

原 5 步引导向导保留（用于首次进入 URL param `?tutorial=true`），但 tutorial tab 展示的是静态版本。

## 修改清单

### `src/pages/CultivationPage.tsx`
1. `ViewState` 改为 `"checkin-home" | "checkin" | "result" | "records" | "tutorial"`
2. 添加 `activeTab: "checkin" | "guide"` 状态
3. 主布局：  
   - Header（返回按钮 + 标题）  
   - **Tab 切换条**（两个 Tab）  
   - Tab 内容区（根据 `activeTab` 渲染）
4. Tab 切换时，如果从「修炼指南」切回「修行打卡」，保留 checkin 子状态

### 不改动
- `useCultivation.ts` — 逻辑层不动
- `records` view — 仍作为独立子视图
- i18n keys — 新增两个 Tab 标签 key（或直接 hardcode）
- 向导逻辑 (`?tutorial=true` URL param) — 保留

## i18n 新增（可选，直接 isZh 判断也可）
```
zh-CN: 修行打卡 / 修炼指南
en-US: Check-In / Guide
```

## 验证
- 默认打开显示「修行打卡」Tab
- 点「修炼指南」Tab 显示静态参考内容（realms + moods）
- 打卡流程（checkin → result → home）在 Tab 1 内正常运行
- 首次进入（`?tutorial=true`）仍触发向导
- 修行记录入口保留
