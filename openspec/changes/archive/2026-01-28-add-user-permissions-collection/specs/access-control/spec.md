## ADDED Requirements

### Requirement: API Permission Enforcement
The system SHALL enforce permission checks on protected API endpoints.

#### Scenario: Authorized access
- **WHEN** a user with the `user:read` permission requests `GET /api/users`
- **THEN** the API returns the requested data

#### Scenario: Unauthorized access
- **WHEN** a user WITHOUT the `user:read` permission requests `GET /api/users`
- **THEN** the API returns a 403 Forbidden status

#### Scenario: SuperAdmin access
- **WHEN** a user with the "SuperAdmin" role requests any endpoint
- **THEN** the request is allowed regardless of specific permission assignments (assuming SuperAdmin implies all permissions or is handled via wildcard)
