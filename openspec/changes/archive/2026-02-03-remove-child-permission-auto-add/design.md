## Context

Currently, the `PermissionService.getUserPermissions` method employs a hierarchical resolution strategy: when a user has a permission, the system assumes they also possess all its descendant permissions. This was recently optimized using the `getAllDescendants` aggregation.

However, stricter control is now required where unauthorized access to child permissions (features) should not be granted simply by having a parent permission. The system must enforce **explicit assignment only**.

## Goals / Non-Goals

**Goals:**
-   Modify `PermissionService` to determine user permissions based **strictly** on explicitly assigned roles.
-   Remove the "implied" permission logic (recursive expansion of descendants) from the authorization path.
-   Retain `getAllDescendants` in the Model layer for potential future UI needs (e.g., displaying a tree), but decouple it from the authorization flow.

**Non-Goals:**
-   We are **not** changing the database schema.
-   We are **not** removing the `parentId` field from Permissions; hierarchy metadata remains for organizational purposes.
-   We are **not** modifying how Roles are assigned to Users.

## Decisions

### 1. Simplify `getUserPermissions`
We will strip down `PermissionService.getUserPermissions` effectively reversing the recent complex optimization.
-   **Old Logic**: Fetch Roles -> Collect IDs -> Aggregation (`getAllDescendants`) -> Return all.
-   **New Logic**: Fetch Roles -> Collect IDs/Slugs -> Return unique set.

**Rationale**: This aligns directly with the requirement for explicit permissioning. It also coincidentally simplifies the code and improves performance by removing a database round-trip (the aggregation).

### 2. Retain `Permission.getAllDescendants`
We will keep this static method in `src/generated/models/Permission.ts`.
**Rationale**: The spec mentions "Query all descendants (UI Only)". Keeping this method satisfies that requirement without polluting the authorization logic.

## Risks / Trade-offs

-   **[Risk] Breaking Change**: Users currently relying on implicit access will lose functionality.
    -   **Mitigation**: This is an intended change. If specific users break, the fix is to explicitly assign the missing child permissions to their roles.
-   **[Risk] Data Redundancy**: Roles might now need to contain larger lists of permissions (Parent + Child 1 + Child 2...).
    -   **Mitigation**: Acceptable trade-off for the desired granularity and explicitness.

## Migration Plan
1.  **Code Change**: Deploy the simplifed `PermissionService`.
2.  **Data Fix (Manual)**: If a Role was designed assuming inheritance (e.g., only had "Admin Root"), an admin must manually update that Role to include the necessary child permissions. (No automated script planned as per scope).
