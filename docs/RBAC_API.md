# RBAC System API Documentation

根據 `rbac-system` spec 生成的 RESTful API 端點。

## Base URL
```
/api
```

## Roles API

### 建立角色
```http
POST /api/roles
Content-Type: application/json

{
  "name": "Editor",
  "description": "Content editor role",
  "permissions": ["content:read", "content:write"]
}
```

### 查詢所有角色 (分頁)
```http
GET /api/roles?page=1&limit=10
```

### 查詢單一角色
```http
GET /api/roles/:id
```

### 更新角色
```http
PUT /api/roles/:id
Content-Type: application/json

{
  "description": "Updated description",
  "permissions": ["content:read", "content:write", "content:delete"]
}
```

### 刪除角色 (軟刪除)
```http
DELETE /api/roles/:id
```

### 分配權限給角色
```http
POST /api/roles/:id/permissions
Content-Type: application/json

{
  "permissions": ["user:read", "user:write"]
}
```

## Permissions API

### 建立權限
```http
POST /api/permissions
Content-Type: application/json

{
  "name": "content:manage",
  "description": "Manage all content operations",
  "parentId": null
}
```

### 查詢所有權限 (分頁)
```http
GET /api/permissions?page=1&limit=10
```

### 查詢權限階層樹
```http
GET /api/permissions/hierarchy
```

### 查詢單一權限
```http
GET /api/permissions/:id
```

### 查詢權限的所有後代
```http
GET /api/permissions/:id/descendants
```

### 更新權限
```http
PUT /api/permissions/:id
Content-Type: application/json

{
  "description": "Updated description",
  "parentId": "parent_permission_id"
}
```

### 刪除權限 (軟刪除)
```http
DELETE /api/permissions/:id
```

## RBAC (User Role Assignment) API

### 分配角色給用戶
```http
POST /api/rbac/users/:userId/roles
Content-Type: application/json

{
  "roles": ["role_id_1", "role_id_2"]
}
```

### 查詢用戶的所有有效權限
```http
GET /api/rbac/users/:userId/permissions
```

**回應範例**:
```json
{
  "permissions": [
    "user:manage",
    "user:read",
    "user:write",
    "user:delete"
  ]
}
```

### 檢查用戶是否擁有特定權限
```http
POST /api/rbac/users/:userId/permissions/check
Content-Type: application/json

{
  "permission": "user:write"
}
```

**回應範例**:
```json
{
  "hasPermission": true
}
```

## 權限階層說明

權限支援階層關係:
- 父權限自動授予所有子權限
- 例如:`user:manage` → `user:read`, `user:write`, `user:delete`
- 查詢用戶權限時會自動展開階層

## 錯誤回應

所有 API 在錯誤時會回傳適當的 HTTP 狀態碼:
- `400`: 請求參數錯誤
- `404`: 資源不存在
- `500`: 伺服器錯誤

## 資料模型

### Role
```typescript
{
  _id: ObjectId
  name: string
  description?: string
  permissions: string[]  // 權限名稱陣列
  isValid: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Permission
```typescript
{
  _id: ObjectId
  name: string
  description?: string
  parentId?: ObjectId    // 父權限 ID
  children?: Permission[] // 虛擬欄位:直接子權限
  isValid: boolean
  createdAt: Date
  updatedAt: Date
}
```

### User
```typescript
{
  _id: ObjectId
  email: string
  name: string
  roles?: ObjectId[]     // 角色 ID 陣列
  manager?: ObjectId     // 主管 ID
  isValid: boolean
  createdAt: Date
  updatedAt: Date
}
```
