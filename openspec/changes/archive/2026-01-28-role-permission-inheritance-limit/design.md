## Context

當前的 RBAC 系統已實作基本的角色和權限管理功能,包括:
- 角色的 CRUD 操作 (`RoleController`)
- 權限的階層式管理 (`PermissionService`)
- 使用者權限的查詢和驗證

然而,現有的 `RoleController.create()` 和 `RoleController.update()` 方法缺乏權限驗證機制,允許任何使用者建立或修改角色時賦予任意權限,這違反了最小權限原則並可能導致權限提升攻擊。

**現有架構:**
- MongoDB + Mongoose ORM
- Express.js REST API
- 權限採用字串陣列儲存在 Role 模型中
- PermissionService 已支援階層式權限展開

**約束條件:**
- 必須保持向後相容,不能破壞現有 API
- 需要支援權限的階層式繼承(父權限包含所有子權限)
- 錯誤訊息必須清晰,告知使用者哪些權限不可用

## Goals / Non-Goals

**Goals:**
- 在建立角色時驗證建立者擁有所有要賦予的權限
- 在更新角色權限時驗證操作者擁有所有新增的權限
- 提供清晰的錯誤訊息,列出超出權限範圍的權限清單
- 新增 API 端點讓前端可以查詢使用者可賦予的權限清單
- 支援權限的階層式驗證(擁有父權限即可賦予子權限)

**Non-Goals:**
- 不修改現有的權限模型結構
- 不改變現有的權限查詢邏輯
- 不處理角色的其他屬性(如 name、description)的驗證
- 不實作角色的審批流程或工作流程

## Decisions

### 決策 1: 在 Controller 層進行權限驗證

**選擇:** 在 `RoleController` 的 `create()` 和 `update()` 方法中新增權限驗證邏輯

**理由:**
- Controller 層已有 request context,可以輕鬆取得當前使用者 ID
- 符合單一職責原則,驗證邏輯與業務邏輯分離
- 便於未來擴展其他驗證規則

**替代方案:**
- 在 Model 層使用 Mongoose middleware: 缺點是無法取得當前使用者上下文
- 在 Service 層: 需要額外建立 RoleService,增加架構複雜度

### 決策 2: 擴展 PermissionService 新增驗證方法

**選擇:** 在 `PermissionService` 中新增 `validatePermissions(userId, permissions)` 方法

**理由:**
- 重用現有的 `getUserPermissions()` 方法取得使用者的完整權限清單(包含階層式展開)
- 集中管理所有權限相關邏輯
- 便於單元測試

**實作細節:**
```typescript
static async validatePermissions(
  userId: string | Types.ObjectId, 
  requestedPermissions: string[]
): Promise<{ valid: boolean; missing: string[] }>
```

**替代方案:**
- 在 Controller 中直接實作: 違反 DRY 原則,且邏輯分散

### 決策 3: 新增 API 端點取得可賦予的權限清單

**選擇:** 新增 `GET /api/users/:userId/assignable-permissions` 端點

**理由:**
- 前端可以在建立/編輯角色時顯示可選的權限清單
- 提升使用者體驗,避免提交後才發現權限不足
- 可以重用 `PermissionService.getUserPermissions()` 方法

**實作位置:**
- 在 `rbacRoutes.ts` 中新增路由(因為這是跨 User 和 Permission 的操作)

**替代方案:**
- 在 `roleRoutes.ts` 中新增: 語義不清,角色路由不應處理使用者相關查詢
- 在前端進行驗證: 不安全,可被繞過

### 決策 4: 錯誤處理策略

**選擇:** 當權限驗證失敗時,回傳 403 Forbidden 狀態碼,並在 response body 中包含缺少的權限清單

**回應格式:**
```json
{
  "message": "Insufficient permissions to assign the requested permissions",
  "missingPermissions": ["user:delete", "system:manage"]
}
```

**理由:**
- 403 是標準的權限不足狀態碼
- 詳細的錯誤訊息幫助使用者理解問題
- 便於前端顯示友善的錯誤訊息

### 決策 5: 更新操作的權限驗證策略

**選擇:** 只驗證**新增**的權限,不驗證原有的權限

**理由:**
- 使用者可能因為組織變動而失去某些權限,但不應影響已建立的角色
- 只要不新增超出權限範圍的權限,就不會造成權限提升
- 符合實務需求,避免過度限制

**實作邏輯:**
```typescript
// 在 update 方法中
const existingRole = await Role.findById(req.params.id);
const newPermissions = req.body.permissions.filter(
  p => !existingRole.permissions.includes(p)
);
// 只驗證 newPermissions
```

**替代方案:**
- 驗證所有權限: 過於嚴格,可能導致無法更新現有角色

## Risks / Trade-offs

### 風險 1: 效能影響
**風險:** 每次建立/更新角色都需要查詢使用者的完整權限清單,可能影響效能

**緩解措施:**
- `PermissionService.getUserPermissions()` 已經過優化,使用單次查詢 + 記憶體展開
- 建立/更新角色是低頻操作,效能影響可接受
- 未來可考慮新增 Redis 快取使用者權限

### 風險 2: 階層式權限的複雜度
**風險:** 權限階層可能很深,展開邏輯可能出錯

**緩解措施:**
- 重用已測試的 `expandPermissions()` 方法
- 新增單元測試覆蓋各種階層情境
- 在 seed 資料中建立測試用的多層權限結構

### 風險 3: 向後相容性
**風險:** 現有的角色建立流程可能因為新增驗證而失敗

**緩解措施:**
- 在開發環境充分測試
- 提供清晰的錯誤訊息,幫助使用者理解問題
- 考慮新增 migration script 檢查現有角色的權限是否合法

### 風險 4: 超級管理員的特殊處理
**風險:** 超級管理員(擁有 `*` 權限)的處理邏輯可能不一致

**緩解措施:**
- `PermissionService.hasPermission()` 已支援 `*` 權限
- 確保 `validatePermissions()` 也正確處理 `*` 權限
- 新增專門的測試案例

## Migration Plan

### 部署步驟

1. **階段 1: 部署新程式碼**
   - 部署包含權限驗證邏輯的新版本
   - 不影響現有功能,因為只是新增驗證

2. **階段 2: 驗證現有資料**
   - 執行 script 檢查現有角色的權限是否符合新規則
   - 記錄不符合規則的角色(如果有)

3. **階段 3: 通知使用者**
   - 如果發現不符合規則的角色,通知相關管理員
   - 提供修正建議

### Rollback 策略

如果發現嚴重問題:
- 可以快速 rollback 到前一版本
- 權限驗證是新增功能,移除不會影響現有資料
- 資料庫結構沒有變更,無需資料遷移

### 測試計畫

1. **單元測試**
   - `PermissionService.validatePermissions()` 的各種情境
   - 階層式權限的驗證邏輯

2. **整合測試**
   - 建立角色時的權限驗證
   - 更新角色時的權限驗證
   - 新 API 端點的回應

3. **端到端測試**
   - 使用不同權限的使用者建立角色
   - 驗證錯誤訊息的正確性

## Open Questions

1. **是否需要審計日誌?**
   - 記錄誰嘗試建立超出權限範圍的角色?
   - 建議: 可以在後續版本中新增

2. **是否需要支援「委派」權限?**
   - 例如:允許使用者賦予特定權限,即使自己沒有該權限
   - 建議: 當前版本不支援,保持簡單

3. **前端 UI 如何處理權限清單?**
   - 需要與前端團隊確認 UI/UX 設計
   - 建議: 使用多選下拉選單,只顯示可賦予的權限
