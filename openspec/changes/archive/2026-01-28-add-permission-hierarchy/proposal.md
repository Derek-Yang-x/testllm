
## Why

To support more logical and scalable permission management, permissions need to support hierarchical relationships. Currently, permissions are flat, which means granting broad access requires assigning multiple individual permissions or creating aggregate roles manually.

By introducing hierarchy (e.g., `system:admin` > `user:manage` > `user:view`), we can:
1. Simplify role assignment (assigning a parent permission automatically grants children).
2. Simplify permission checks (checking for `user:view` passes if the user has `user:manage`).

## What Changes

- Modify the `Permission` data model to support a hierarchical structure:
  - Add `parentId` field for parent-child relationships
  - Add `children` virtual field for querying direct children
  - Add `getAllDescendants()` static method for recursively querying all descendants
- Update the permission checking logic to respect hierarchy (a user has a permission if they have the permission explicitly OR a parent permission).
- Update the permission seeding logic to define these relationships for default permissions.

## Capabilities

### Modified Capabilities

- `rbac-system`: Updating the Permission Management requirement to satisfy hierarchical definitions and checking logic.

## Impact

- **Database**: Schema change for the `Permission` model (adding `parentId`).
- **Core Logic**: `PermissionService` (or equivalent) `hasPermission` check needs to be recursive or check up/down the tree.
- **Seeding**: Initial data population scripts need update.
