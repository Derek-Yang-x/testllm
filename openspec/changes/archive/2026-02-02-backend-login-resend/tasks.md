## 1. Helper Services

- [x] 1.1 Implement `AuthService` with password hashing (bcrypt) and JWT generation logic.
- [x] 1.2 Implement password validation logic (Regex, Expired Temp Password).
- [x] 1.3 Implement `EmailService` using **Resend SDK**.

## 2. Model Updates

- [x] 2.1 Update `User` model with `password`, `tempPassword`, `tempPasswordExpiresAt`, and other fields.
- [x] 2.2 Create database migration script or simple update script to ensure existing users (if any) have valid structure (optional for this scope but good practice).

## 3. Controller & API

- [x] 3.1 Implement `AuthController.login` with support for permanent and temp passwords.
- [x] 3.2 Implement `AuthController.forgotPassword` with rate limiting and temp password simulation.
- [x] 3.3 Implement `AuthController.changePassword` with complexity validation.
- [x] 3.4 Implement `AuthController.logout`.
- [x] 3.5 Register new routes in `authRoutes.ts`.

## 4. Verification

- [x] 4.1 Create `tests/auth.test.ts` to verify login, forgot password, and change password flows.
- [x] 4.2 Run tests and fix any issues.
