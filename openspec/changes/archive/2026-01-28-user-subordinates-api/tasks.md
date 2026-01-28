## 1. API & Controller Implementation

- [x] 1.1 Create `IUserSubordinate` interface to define the recursive response structure (if applicable) or use existing `IUser`.
- [x] 1.2 Implement `UserController.getSubordinates` method.
- [x] 1.3 Use Mongoose `$graphLookup` for recursive fetch when `recursive=true`.
- [x] 1.4 Use simple `find({ manager: id })` when `recursive=false` (or default).
- [x] 1.5 Register `GET /users/:id/subordinates` in `UserRoutes.ts`.

## 2. Access Control

- [x] 2.1 specific middleware to check permissions: allow if `req.user.id === params.id` OR has `user:read` permission.

## 3. Verification

- [x] 3.1 Create `test/UserSubordinatesAPI.test.ts`.
- [x] 3.2 Test case: Manager can fetch direct reports.
- [x] 3.3 Test case: Manager can fetch recursive reports.
- [x] 3.4 Test case: User cannot fetch others' reports without permission.
