## 1. Setup

- [x] 1.1 Install `jsonwebtoken` and `@types/jsonwebtoken`.
- [x] 1.2 Add `JWT_SECRET` to `.env` (generate a secure random string).

## 2. Core Implementation

- [x] 2.1 Create `AuthMiddleware` in `src/generated/middleware/AuthMiddleware.ts`.
    -   Implement `authenticate` method to verify Bearer token.
    -   Attach `user` to request (load from DB to ensure fresh permissions).
- [x] 2.2 Update `AuthController.login` in `src/generated/controllers/AuthController.ts`.
    -   Generate JWT on successful login.
    -   Return `{ user, accessToken }`.
- [x] 2.3 Apply `AuthMiddleware.authenticate` to protected routes (e.g., `roleRoutes`, `userRoutes`, `permissionRoutes`).

## 3. Verification

- [x] 3.1 Create verification test `tests/verify-jwt-auth.ts`.
    -   Test: Login -> Receive Token.
    -   Test: Access protected route WITHOUT token -> 401.
    -   Test: Access protected route WITH token -> 200.
- [x] 3.2 Run verification test.
