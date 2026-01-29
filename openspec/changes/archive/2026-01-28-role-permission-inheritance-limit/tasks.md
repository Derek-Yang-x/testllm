## 1. Core Validation Logic

- [ ] 1.1 Implement `PermissionService.validatePermissions` method to check if a user has sufficient privileges
- [ ] 1.2 Add unit tests for `validatePermissions` covering hierarchical and wildcard permissions

## 2. Controller Integration

- [ ] 2.1 Update `RoleController.create` to enforce permission validation
- [ ] 2.2 Update `RoleController.update` (and `assignPermissions`) to enforce validation on added permissions

## 3. API & Frontend Support

- [ ] 3.1 Implement `GET /users/:userId/assignable-permissions` endpoint in `rbacRoutes`
- [ ] 3.2 Add integration tests for the new endpoint

## 4. Verification

- [ ] 4.1 Verify role creation with valid/invalid permissions via API
- [ ] 4.2 Verify role update with valid/invalid permissions via API
