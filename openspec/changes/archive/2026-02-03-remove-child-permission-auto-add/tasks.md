## 1. Core Logic Update

- [x] 1.1 Refactor `PermissionService.getUserPermissions` in `src/generated/services/PermissionService.ts`
    -   Remove `Permission.getAllDescendants` call.
    -   Collect unique slugs directly from `User.roles`.
    -   Update method documentation to reflect "Explicit Assignment Only".
- [x] 1.2 Verify `validatePermissionIds` and `hasPermission` still work with the new logic (simplification should be seamless).

## 2. Verification

- [x] 2.1 Update `tests/permission.test.ts` or create new `tests/verify-explicit-permission.ts`
    -   Test case: User has Parent permission -> `validatePermissions` for Child should FAIL.
    -   Test case: User has Child permission -> `validatePermissions` for Child should PASS.
- [x] 2.2 Run tests to confirm the change.
