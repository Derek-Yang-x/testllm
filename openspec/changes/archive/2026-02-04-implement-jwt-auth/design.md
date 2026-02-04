## Context

The current `AuthController` returns the raw user object upon login. There is no mechanism to maintain a session or verify identity on subsequent API calls without constantly hitting the `User` collection. To support secure, stateless API access, we need to implement JWT (JSON Web Token) authentication.

## Goals / Non-Goals

**Goals:**
-   Implement JWT generation on successful login.
-   Return the JWT in the login API response.
-   Create middleware to verify the JWT on protected routes.
-   Store minimal user identity (user ID) in the token payload.

**Non-Goals:**
-   We are **not** implementing Refresh Tokens or token rotation at this stage (scope: basic Access Token only).
-   We are **not** implementing a "Logout" endpoint (client-side token removal is sufficient for stateless JWTs).

## Decisions

### 1. Token Library: `jsonwebtoken`
We will use the standard `jsonwebtoken` package for signing and verifying tokens.
**Rationale**: It is the industry standard for Node.js, lightweight, and well-maintained.

### 2. Token Payload Structure
The payload will be minimal to keep the token small.
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "iat": 1616239022,
  "exp": 1616242622
}
```
**Rationale**: We only strictly need the `userId` to load the user/permissions from DB during the request (or cache later). Storing roles/permissions in the token directly risks staleness (e.g., if permissions are revoked mid-session).
*Correction*: To support the requirement of "decoding user info... without repeated database queries for basic identity verification" mentioned in the proposal, we *could* store roles. However, given our existing `PermissionService` logic relies on fresh DB data (and we prioritize security over micro-optimization right now), we will stick to ID-only for the *initial* design, but we can revisit if performance demands it. 
*Refined Decision*: Stick to `userId` only. `AuthMiddleware` will load the user from DB to attach to `req.user`. This ensures critical permission checks (which we just made rigorous in the previous change) are always based on fresh data.

### 3. Login Response Format
**Old:** `res.json(user)`
**New:**
```json
{
  "user": { ...userFields... },
  "accessToken": "ey..."
}
```
**Rationale**: Separates the auth credential from the user data profile.

### 4. Middleware Strategy
New `AuthMiddleware.ts`.
-   Extract token from `Authorization: Bearer ...` header.
-   Verify signature using `JWT_SECRET`.
-   Decode `userId`.
-   (`Optional/Future`: Fetch user from DB and attach to `req.user`. For now, just verification is the goal, but usually we need the user object for `PermissionService`. So yes, fetch and attach.)

## Risks / Trade-offs

-   **[Risk] Token Theft**: If a token is stolen, it's valid until expiry.
    -   **Mitigation**: Set a reasonable expiration time (e.g., 1 hour).
-   **[Risk] Breaking Change (Login)**: Client expects just `User` object, now gets `{ user, accessToken }`.
    -   **Mitigation**: This IS a breaking change for the frontend login handler.

## Migration Plan

1.  **Env**: Add `JWT_SECRET` to `.env`.
2.  **Install**: `npm install jsonwebtoken @types/jsonwebtoken`.
3.  **Code**:
    -   Create `AuthMiddleware`.
    -   Update `AuthController.login`.
    -   Apply middleware to protected routes (e.g., `user-management`, `rbac-system`).
