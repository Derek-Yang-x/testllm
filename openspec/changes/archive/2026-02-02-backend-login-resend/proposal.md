## Why

The current system lacks a secure backend authentication mechanism. This change implements the login, password recovery, and password change policies required by TCG-128265 to secure user accounts.

## What Changes

- **User Model**: Add password (hashed), temp password tracking, and last password change timestamp.
- **Auth API**:
  - Login endpoint (JWT generation).
  - Forgot Password endpoint (Email simulation + Temp password generation).
  - Change Password endpoint (Strict regex validation + Force change on temp password).
  - Logout endpoint.
- **Security Policies**:
  - Password complexity enforcement.
  - 5-minute expiry for temp passwords.
  - 3-minute rate limit for forgot password requests.

## Capabilities

### New Capabilities
- `backend-login`: Covers the core authentication logic, password management, and security policies.

### Modified Capabilities
<!-- No modified capabilities -->

## Impact

- **Database**: Schema update for `User` collection.
- **API**: New `/api/auth` routes.
- **Dependencies**: `bcryptjs` and `jsonwebtoken` are already in package.json, so no new dependencies needed.
