# 修炼数据云同步

## Context
认证系统已完成，但 `useCultivation` 仍是纯 localStorage。目标：
- 已登录用户 → 打卡数据写入 DB（profiles + cultivation_records），换设备不丢失
- 未登录用户 → 保持原有 localStorage 行为（兼容）
- 首次登录时 → 若 DB 为空且 localStorage 有数据 → 自动迁移

---

## DB 表结构（已存在）

```
profiles (每用户一行，汇总数据)
  id, enlightenment_points, check_in_streak, total_check_ins,
  last_check_in_date, tutorial_completed

cultivation_records (每次打卡一行)
  id, user_id, date, mood, wu_wei_score, dao_field_active,
  insight, points_earned, ai_guidance, created_at
```

字段映射：
| CheckInRecord (前端) | cultivation_records (DB) |
|---------------------|--------------------------|
| `wuWeiScore`        | `wu_wei_score`           |
| `daoFieldActive`    | `dao_field_active`       |
| `pointsEarned`      | `points_earned`          |
| `aiGuidance`        | `ai_guidance`            |

---

## 文件变更

### 1. `src/hooks/useCultivation.ts`

**新增签名：**
```ts
export function useCultivation(userId?: string)
```

**新增 import：**
```ts
import { supabase } from "@/integrations/supabase/client";
```

**新增 state：**
```ts
const [isSyncing, setIsSyncing] = useState(false);
```

**加载逻辑 (`useEffect([userId])`)**：
```ts
useEffect(() => {
  if (!userId) return;
  loadFromDB(userId);
}, [userId]);
```

`loadFromDB(userId)`：
1. `setIsSyncing(true)`
2. 并行拉取 `profiles` + `cultivation_records`（limit 100，按 created_at desc）
3. 若 profile.total_check_ins === 0 AND localStorage 有数据 → `migrateLocalToDB(userId, localState)`
4. 否则直接 `setState(mapDBToState(profile, records))`
5. `setIsSyncing(false)`

`migrateLocalToDB(userId, localState)`：
1. 批量 INSERT `localState.records` → `cultivation_records`
2. UPDATE `profiles` 写入 localStorage 的汇总数据
3. 重新 `loadFromDB(userId)` 以确保 state 与 DB 一致

**localStorage 保存逻辑：** 只在未登录时写（`if (!userId) saveState(state)`），已登录时不写

**`checkIn` 函数**（已登录时额外写 DB）：
```ts
// 保留原有 setState(...)
// 额外：
if (userId) {
  await supabase.from("cultivation_records").insert({
    user_id: userId, date: today, mood,
    wu_wei_score: wuWeiScore, dao_field_active: daoFieldActive,
    insight, points_earned: pointsEarned, ai_guidance: aiGuidance,
  });
  await supabase.from("profiles").update({
    enlightenment_points: newEP,
    check_in_streak: newStreak,
    total_check_ins: newTotal,
    last_check_in_date: today,
  }).eq("id", userId);
}
```
注意：`checkIn` 需要改为 `async`，返回 `Promise<number>`

**`completeTutorial` 函数**（已登录时更新 DB）：
```ts
if (userId) {
  await supabase.from("profiles").update({
    tutorial_completed: true,
    enlightenment_points: prev.enlightenmentPoints + TUTORIAL_REWARD,
  }).eq("id", userId);
}
```

**新增返回值：** `isSyncing`

---

### 2. `src/pages/CultivationPage.tsx`

**新增 import：**
```ts
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { CloudOff } from "lucide-react";
```

**新增逻辑：**
```ts
const { user } = useAuth();
const [authOpen, setAuthOpen] = useState(false);
const { ..., isSyncing } = useCultivation(user?.id);
```

**登录横幅**（仅未登录时显示，在页面顶部）：
```tsx
{!user && (
  <div className="flex items-center justify-between px-4 py-2 bg-muted/60 text-sm text-muted-foreground border-b border-border">
    <span className="flex items-center gap-2">
      <CloudOff className="h-4 w-4" />
      {isZh ? "未登录，打卡数据仅保存在本设备" : "Not signed in — data saved locally only"}
    </span>
    <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setAuthOpen(true)}>
      {isZh ? "登录以同步" : "Sign in to sync"}
    </Button>
  </div>
)}
```

**同步指示**（已登录且 isSyncing 时）：
在页面标题旁边加一个小 spinner + "同步中..."

**JSX 末尾追加：**
```tsx
<AuthModal open={authOpen} onOpenChange={setAuthOpen} />
```

---

## 注意事项

1. **`checkIn` 改为 async** → CultivationPage 调用处需加 `await`（现在是 `const pts = checkIn(...)`，需改为 `const pts = await checkIn(...)`）
2. **RLS 已配置**：`cultivation_records` 和 `profiles` 均有 `auth.uid()` 限制，Supabase 客户端会自动带上 JWT，无需额外传 userId 到查询（但 INSERT 需要显式写入 `user_id: userId`）
3. **错误处理**：DB 操作失败时不影响本地 state（降级到本地）
4. **不删除 localStorage**：迁移后保留 localStorage 作为离线缓存

---

## 验证步骤
1. 未登录 → 正常打卡 → localStorage 有数据
2. 注册/登录 → 页面自动加载 DB 数据，若 DB 为空则自动迁移 localStorage 数据
3. 退出登录再登录 → 数据仍在
4. 不同设备登录同一账号 → 显示相同打卡记录
