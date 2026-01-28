## 1. Schema & Model Updates

- [x] 1.1 Update `User.ts` schema to include `manager` field with `ref: 'User'` and `index: true`.
- [x] 1.2 Update `IUser` interface to include `manager` property.

## 2. Validation Logic

- [x] 2.1 Implement validation to prevent a user from being their own manager (self-reference check).
- [x] 2.2 Verify that the assigned manager exists (Mongoose `populate` or explicit check).

## 3. Verification

- [x] 3.1 Create a new test file `test/UserHierarchy.test.ts` to verify manager assignment.
- [x] 3.2 Add test case: specific user can be assigned a manager.
- [x] 3.3 Add test case: user cannot be their own manager.
- [x] 3.4 Add test case: reverse lookup (find direct reports) works effectively.
