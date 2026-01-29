## Why

當前的 RBAC 系統允許任何使用者建立角色並賦予任意權限,這造成了安全漏洞。使用者可能會建立擁有超出自己權限範圍的角色,導致權限提升攻擊。我們需要確保使用者在建立新角色時,只能賦予自己已擁有的權限,遵循「最小權限原則」。

## What Changes

- 在建立新角色時,新增權限驗證邏輯,確保建立者擁有所有要賦予該角色的權限
- 在更新現有角色的權限時,同樣執行權限驗證
- 提供清晰的錯誤訊息,告知使用者哪些權限超出其權限範圍
- 新增相關的 API 端點來檢查使用者可以賦予的權限清單

## Capabilities

### New Capabilities

- `role-permission-validation`: 角色權限驗證機制,確保建立/更新角色時的權限不超過建立者自身擁有的權限

### Modified Capabilities

- `rbac-system`: 修改角色建立和更新的需求,新增權限繼承限制的驗證邏輯

## Impact

**受影響的程式碼:**
- `src/generated/controllers/RoleController.ts` - 需要新增權限驗證邏輯
- `src/generated/routes/roleRoutes.ts` - 可能需要新增新的端點
- `src/generated/services/PermissionService.ts` - 需要新增檢查使用者權限的方法

**API 變更:**
- POST `/api/roles` - 建立角色時新增權限驗證
- PUT `/api/roles/:id` - 更新角色時新增權限驗證
- 可能新增 GET `/api/users/:userId/assignable-permissions` - 取得使用者可賦予的權限清單

**安全性影響:**
- 提升系統安全性,防止權限提升攻擊
- 確保權限管理符合最小權限原則
