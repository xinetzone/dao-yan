# 🔧 Stream Timeout 修复说明

## ❌ 问题描述

**错误信息**:
```
stream timeout: no data received for 2 minutes
```

**发生场景**: 当启用联网搜索功能时，Edge Function 在执行以下操作期间未发送任何数据：
1. 调用 DuckDuckGo 搜索（最多 20 秒）
2. 获取 3 个 URL 的完整内容（每个最多 15 秒 = 45 秒）
3. 总计可能超过 60+ 秒无数据传输

## ✅ 解决方案

### 1. **添加请求超时机制**

为所有外部请求添加 AbortController 超时：

```typescript
// Web 搜索超时（20 秒）
async function callWebSearch(query: string, timeoutMs = 20000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  // ... fetch with signal: controller.signal
}

// URL 内容获取超时（15 秒）
async function fetchUrlContent(url: string, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  // ... fetch with signal: controller.signal
}
```

### 2. **添加 Keepalive 消息**

在长时间操作期间发送进度更新以保持流活跃：

```typescript
// 搜索完成后发送状态更新
controller.enqueue(encoder.encode(`data: ${JSON.stringify({
  type: "search_status",
  status: "fetching_content",
  query
})}\n\n`));

// 获取每个 URL 时发送进度
for (let i = 0; i < urlsToFetch.length; i++) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
    type: "search_status",
    status: "fetching_content",
    progress: `${i + 1}/${urlsToFetch.length}`
  })}\n\n`));
  
  const content = await fetchUrlContent(urlsToFetch[i].url);
  contents.push(content);
}
```

### 3. **串行处理替代并行**

将 `Promise.all()` 改为循环处理：

```typescript
// ❌ 旧方案 - 并行但无进度反馈
const contentPromises = searchResults.slice(0, 3).map(r => fetchUrlContent(r.url));
const contents = await Promise.all(contentPromises);

// ✅ 新方案 - 串行 + 进度反馈
for (let i = 0; i < urlsToFetch.length; i++) {
  // 发送进度消息（keepalive）
  controller.enqueue(encoder.encode(...));
  const content = await fetchUrlContent(urlsToFetch[i].url);
  contents.push(content);
}
```

## 📊 效果对比

### 修复前
```
[0s] 用户提问
[1s] AI 决定使用 web_search
[2s] 发送 "searching" 状态
[2s-65s] ⚠️ 无任何数据（流超时！）
[超时] 错误: stream timeout
```

### 修复后
```
[0s] 用户提问
[1s] AI 决定使用 web_search
[2s] 发送 "searching" 状态
[5s] 发送 "fetching_content" 状态
[10s] 发送 progress: "1/3"
[20s] 发送 progress: "2/3"
[30s] 发送 progress: "3/3"
[35s] 发送 search_results
[40s] AI 开始回答（流继续）
```

## 🎯 关键改进

1. **20 秒搜索超时** - 避免 DuckDuckGo 卡住
2. **15 秒 URL 超时** - 避免单个 URL 拖慢整体
3. **每 10-15 秒发送进度** - 保持流活跃
4. **更好的错误处理** - 单个 URL 失败不影响其他

## 🧪 测试方法

1. **正常搜索**:
```
用户: "2026年最新的AI新闻"
预期: 搜索 → 获取内容 → 回答（无超时）
```

2. **慢速网站**:
```
用户: "搜索一些新闻"
预期: 15秒后超时某些 URL，但继续处理其他
```

3. **多次搜索**:
```
用户: "告诉我A、B、C三个话题的信息"
预期: AI 可能多次调用工具，每次都有 keepalive
```

## 📝 相关文件

- `supabase/functions/ai-chat-167c2bc1450e/index.ts` - 主修复
- `src/hooks/useAIChat.ts` - 前端适配新状态

## 🚀 部署

Edge Function 会自动重新部署。无需用户操作。

---

**修复时间**: 2026-04-14  
**Git Commit**: f09ec09  
**状态**: ✅ 已修复并推送
