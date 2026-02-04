## Why

Currently, the system lacks a stateless mechanism to verify user identity and permissions for API requests after the comprehensive login flow. We need a token-based authentication system (JWT) to securely manage user sessions and authorize API access.

## What Changes

-   **Modify `AuthController.login`**: Update the response to include a secure `accessToken` (JWT) alongside the existing user info.
-   **New Metadata**: The token will allow decoding user identity (ID, associated Role IDs) without repeated database queries for basic identity verification.
-   **Security**: Introduce a standard Authorization header mechanism (e.g., `Authorization: Bearer <token>`).

## Capabilities

### New Capabilities
-   `api-authentication`: Define how the system issues and refutes identity tokens for API access.

### Modified Capabilities
-   `access-control`: Update access control requirements to support token-based identity verification.

## Impact

-   **Backend**: `AuthController`, potential new `AuthMiddleware`.
-   **Dependencies**: Requires `jsonwebtoken` (or similar) package.
