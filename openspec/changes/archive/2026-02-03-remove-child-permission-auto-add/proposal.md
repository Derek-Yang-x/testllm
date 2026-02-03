## Why

Currently, when a user is assigned a "Parent" permission, the system automatically grants them access to all "Child" (descendant) permissions via implicit inheritance logic (recently optimized in `PermissionService`).

The user has requested to **remove this setting**, requiring that permissions be explicitly assigned. This ensures stricter security control where possessing a parent permission does *not* automatically imply access to its children.

## What Changes

-   **Modify `PermissionService`**:
    -   Update `getUserPermissions` to **stop** using `Permission.getAllDescendants`.
    -   It should only return the explicitly assigned permissions (found in `User.roles`).
-   **Modify `Permission` Model (Optional)**:
    -   The `getAllDescendants` method can remain for other uses (e.g. UI display), but it will no longer be used for authorization resolution.

## Capabilities

### Modified Capabilities
-   `user-management`: Remove implied permission inheritance logic from authorization checks.

## Impact

-   **Backend**: `PermissionService.ts`
-   **Security**: Users who relied on parent permissions to access child features will lose access unless those child permissions are explicitly added to their roles.
-   **Performance**: `getUserPermissions` becomes even faster (no aggregation needed), just simple collection traversing.
