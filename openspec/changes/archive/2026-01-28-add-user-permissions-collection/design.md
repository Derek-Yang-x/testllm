## Context
The system currently relies on basic user authentication. To support granular administrative controls, we need a Role-Based Access Control (RBAC) system. This involves creating new data models for Roles and Permissions and updating the User model to support role assignment.

## Goals / Non-Goals
**Goals:**
- implement Mongoose schemas for `Role` and `Permission`.
- Update `User` schema to reference `Role`.
- Create middleware for permission checking.
- Provide APIs to manage roles and permissions.

**Non-Goals:**
- Implementing hierarchical role inheritance (kept flat for v1 to reduce complexity).
- Implementing UI management pages (Backend API focus).

## Decisions

### Database Schema (Mongoose)
We will use MongoDB (Mongoose) as the database.

**1. Permission Schema**
```typescript
interface IPermission {
  name: string; // e.g., "user:read"
  description: string;
}
```

**2. Role Schema**
```typescript
interface IRole {
  name: string; // e.g., "SuperAdmin"
  description: string;
  permissions: mongoose.Types.ObjectId[]; // Ref to Permission
}
```

**3. User Schema Update**
```typescript
interface IUser {
  // ... existing fields
  roles: mongoose.Types.ObjectId[]; // Ref to Role
}
```

### Authorization Strategy
- **Middleware**: `requirePermission(permissionName)`
- **Logic**:
  1. Retrieve user with populated roles.
  2. For each role, populate permissions.
  3. Flatten user's permissions.
  4. Check if required permission exists.
- **SuperAdmin Bypass**: A specific role name "SuperAdmin" or a wildcard permission `*` will bypass checks.

### Seed Data
- **Default Permissions**: `user:read`, `user:write`, `role:read`, `role:write`.
- **Default Role**: `SuperAdmin` (with all permissions), `Viewer` (read-only).
- **Initial User**: Assign `SuperAdmin` to the first created user or via script.

## Risks / Trade-offs
- **Performance**: Populating roles and permissions on every request might be slow.
  - *Mitigation*: Cache user permissions in the JWT token or Redis if performance becomes an issue. For now, DB query is acceptable for admin panel traffic.
- **Complexity**: Multiple roles might have conflicting permissions (though typical RBAC is additive, so this is low risk).

## Migration Plan
1. Create `permissions` and `roles` collections.
2. Run a seed script to populate default permissions and roles.
3. Update existing users to have a default role (e.g., `Viewer` or `SuperAdmin` depending on risk).
