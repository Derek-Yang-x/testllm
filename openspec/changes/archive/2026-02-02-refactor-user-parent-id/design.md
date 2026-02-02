
# Design: User.parentId

## Database Schema Changes

```typescript
// User Model (Before)
{
  manager: { type: ObjectId, ref: 'User' }
}

// User Model (After)
{
  parentId: { type: ObjectId, ref: 'User', default: null }
}
```

## Code Updates
1. **User Model**: Rename field, update validation (self-reference check).
2. **DTOs/Interfaces**: Update `IUser`.
3. **Controllers**: Update any logic accessing `.manager`.

## Trade-offs
- **Breakage**: Existing code using `.manager` will break. Search and replace required.
