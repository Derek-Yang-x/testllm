
## 1. Database & Models

- [x] 1.1 Update `Permission` model to include `parentId` field (self-reference).
- [x] 1.2 Update `Permission` model to include virtual `children` field.
- [x] 1.3 Add `getAllDescendants()` static method to recursively fetch all descendants.

## 2. Core Logic

- [x] 2.1 Update `PermissionService` (or equivalent) to flatten permission tree on fetch.
- [x] 2.2 Implement recursion or traversal logic to gather all child permissions when checking/fetching.

## 3. Data Seeding & Migration

- [x] 3.1 Update permission seeding script to define parent-child relationships for default permissions.
- [x] 3.2 Verify existing permissions work as expected.

## 4. Verification

- [x] 4.1 Write test case for hierarchical permission inheritance (parent implies child).
- [x] 4.2 Write test case for explicit child permission assignment.
