## Context
The application requires a way to structure users into an organizational hierarchy. This is essential for features like team management, data access scoping, and approval workflows. Currently, the `User` model is flat with no self-referencing capabilities.

## Goals / Non-Goals

**Goals:**
- Enable users to have a manager (reporting line).
- Support efficient queries for direct reports.
- Validate hierarchical consistency (e.g., prevent self-assignment).

**Non-Goals:**
- Full organizational chart visualization (UI).
- Complex matrix reporting (multiple managers) - we will stick to a single manager for now.

## Decisions

### 1. Schema Design
**Decision:** Add `manager` field to `User` model as a self-referencing `ObjectId`.
**Rationale:** This is the standard pattern for tree structures in MongoDB that don't require deep nested queries often. It keeps the schema simple.
**Schema Change:**
```typescript
{
  manager: { type: Schema.Types.ObjectId, ref: 'User', index: true }
}
```

### 2. Indexing Strategy
**Decision:** Add an index to the `manager` field.
**Rationale:** To efficiently find direct reports (`User.find({ manager: userId })`), an index is critical. Without it, finding a manager's team would require a full collection scan.

### 3. Validation Logic
**Decision:** Implement basic validation to prevent a user from being their own manager.
**Rationale:** Circular dependency (A is manager of A) breaks the hierarchy logic and can cause infinite loops in recursive functions.

## Risks / Trade-offs

### [Risk] Cyclic Dependencies (A -> B -> A)
- **Risk:** Simple `manager` field doesn't prevent A reporting to B and B reporting to A.
- **Mitigation:** For this iteration, we will only prevent direct self-reference (A -> A). Full cycle detection is complex and expensive on writes; we will defer strict cycle prevention to the application layer logic or future iterations if deep hierarchies become common.

### [Risk] Data Integrity on Deletion
- **Risk:** If a manager is deleted, their subordinates become "orphaned".
- **Mitigation:** We will keep the reference as is (or set to null manually). Application logic should handle "manager not found" gracefully. In the future, we could implement a "transfer subordinates" feature upon user deletion.
