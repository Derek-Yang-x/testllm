## 1. Database & Models

- [ ] 1.1 Create `Permission` Mongoose Schema (`src/generated/models/Permission.ts`)
- [ ] 1.2 Create `Role` Mongoose Schema (`src/generated/models/Role.ts`)
- [ ] 1.3 Update `User` Mongoose Schema to include `roles` field (`src/generated/models/User.ts`)
- [ ] 1.4 Create Seed Script for default Permissions and Roles (`scripts/seed-rbac.ts`)

## 2. Core Logic & Middleware

- [ ] 2.1 Implement `PermissionService` to handle logic (fetching user permissions, checking roles)
- [ ] 2.2 Implement `requirePermission` middleware (`src/generated/middleware/rbac.ts`)
- [ ] 2.3 Update `authMiddleware` to attach permissions/roles to `req.user` if needed (or load on demand)

## 3. API Implementation

- [ ] 3.1 Implement Role CRUD API (`src/generated/controllers/RoleController.ts`)
   - List Roles
   - Create Role
   - Update Role (assign permissions)
   - Delete Role
- [ ] 3.2 Implement Permission List API (`src/generated/controllers/PermissionController.ts`)
   - List Permissions (Read-only usually, or internal management)
- [ ] 3.3 Register new routes (`src/generated/routes/rbacRoutes.ts`)

## 4. Verification

- [ ] 4.1 Verify Seed Script execution
- [ ] 4.2 Verify specific API endpoint protection (Manual Test with Postman/Curl)
- [ ] 4.3 Verify User Role Assignment flow
