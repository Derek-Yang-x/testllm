
## Context

The current RBAC system uses a flat permission model. We need to introduce hierarchical relationships where a parent permission (e.g., `user:manage`) automatically grants all child permissions (e.g., `user:read`, `user:write`).

## Goals / Non-Goals

**Goals:**
- Update `Permission` schema to support hierarchy.
- Update `PermissionService` (or equivalent) to resolve hierarchical permissions.
- Ensure backwards compatibility for existing flat permissions.

**Non-Goals:**
- Complex graph relationships (DAGs) - we enforce a strict tree structure for simplicity.
- Dynamic runtime updates to hierarchy without server restart/cache invalidation (out of scope for now).

## Decisions

### 1. Schema Design: Adjacency List
We will add a `parentId` field to the `Permission` model.
*   **Rationale**: Simple to implement and query for shallow hierarchies. Our permission trees are expected to be shallow (2-3 levels max).
*   **Alternative**: Closure Table or Materialized Path. Overkill for simple RBAC.

### 2. Resolution Strategy: "Flattening" at Fetch Time
When querying a user's permissions, we will traverse the permission tree and return a flattened list of *all* effective permissions (explicit assignments + implied children).
*   **Rationale**: Makes the `hasPermission` check extremely fast (O(1) lookup) at the cost of slightly more expensive fetch on login or cache refresh.

## Risks / Trade-offs

*   **Circular Dependencies**: A `parentId` pointing to a child could create infinite loops.
    *   *Mitigation*: Add validation on save to prevent cycles.
*   **Performance**: Deep trees could slow down permission fetching.
    *   *Mitigation*: Limit hierarchy depth or use caching.

## Data Model Changes

```typescript
// Permission Model Interface
interface IPermission extends Document {
  name: string;
  description?: string;
  parentId?: string | IPermission;  // Reference to parent Permission
  children?: IPermission[];          // Virtual field - only direct children
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Permission Model with Static Methods
interface IPermissionModel extends Model<IPermission> {
  getAllDescendants(permissionId: string): Promise<IPermission[]>;
}
```

### Virtual Field: `children`
- **Type**: Virtual field (not stored in DB)
- **Purpose**: Provides reverse lookup for **direct children only** (one level)
- **Usage**: `await Permission.findById(id).populate('children')`
- **Returns**: Array of immediate child permissions

### Static Method: `getAllDescendants()`
- **Type**: Static method on Permission model
- **Purpose**: Recursively fetches **all descendants** (multi-level)
- **Usage**: `await Permission.getAllDescendants(permissionId)`
- **Returns**: Array of all descendant permissions (children, grandchildren, etc.)
- **Implementation**: Depth-first traversal with recursion

### Why Both?
- **`children` virtual**: Efficient for UI tree navigation (expand/collapse nodes)
- **`getAllDescendants()`**: Essential for permission resolution and impact analysis

