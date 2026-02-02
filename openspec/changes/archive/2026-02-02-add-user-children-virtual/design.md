
# Design: User.children

## Mongoose Changes

```typescript
UserSchema.virtual('children', {
    ref: 'User',
    localField: '_id',
    foreignField: 'parentId'
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });
```

## Interface Changes
Update `IUser` to include:
```typescript
children?: IUser[];
```
