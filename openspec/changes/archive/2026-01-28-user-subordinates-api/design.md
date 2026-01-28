## Context
We strictly need an API to fetch user subordinates. The hierarchy is defined by the `manager` field in the `User` model. We need to support both direct reports (1 level deep) and full recursive hierarchy (n levels deep).

## Goals / Non-Goals

**Goals:**
- Fetch direct reports efficiently.
- Fetch all descendants (recursive) in a single database query.
- Maintain a flat response structure for consistency.

**Non-Goals:**
- Visualizing the tree (frontend responsibility).
- handling cycles (validation layer handles this on write).

## Decisions

### 1. Database Query Strategy
**Decision:** Use MongoDB `$graphLookup` for recursive queries.
**Alternative:** Recursive application-level `find()` calls.
**Rationale:** `$graphLookup` performs the recursion on the DB server, which is significantly faster and reduces network round-trips compared to fetching level-by-level in Node.js.

**Aggregation Pipeline:**
```javascript
[
  { $match: { _id: targetUserId } },
  {
    $graphLookup: {
      from: 'users',
      startWith: '$_id',
      connectFromField: '_id',
      connectToField: 'manager',
      as: 'subordinates',
      depthField: 'depth'
    }
  }
]
```

### 2. Response Format
**Decision:** Return a flat array of users.
**Rationale:** `$graphLookup` produces an array. Flattening the structure simplifies the API contract. Clients can reconstruct constraints using the `manager` field if a tree view is needed.

### 3. Access Control
**Decision:** Allow users to view their own subordinates; require `user:read` for viewing others.
**Rationale:** Managers need to manage their team without needing global admin privileges.

## Risks / Trade-offs
- **Performance**: Deep hierarchies with thousands of users could be slow. We will set a default `maxDepth` restriction if needed in the future, but for now we assume reasonable org sizes (< 10k users).
