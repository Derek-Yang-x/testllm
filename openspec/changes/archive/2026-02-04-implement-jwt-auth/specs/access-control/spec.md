## MODIFIED Requirements

### Requirement: API Permission Enforcement
The system SHALL enforce permission checks on protected API endpoints based on the identity verified from the access token.

#### Scenario: Authorized access
- **WHEN** a user with the `user:read` permission requests `GET /api/users`
- **AND** the request includes a valid token for that user
- **THEN** the API returns the requested data

#### Scenario: Unauthorized access
- **WHEN** a user WITHOUT the `user:read` permission requests `GET /api/users`
- **AND** the request includes a valid token for that user
- **THEN** the API returns a 403 Forbidden status

#### Scenario: SuperAdmin access
- **WHEN** a user with the "SuperAdmin" role requests any endpoint
- **AND** the request includes a valid token for that user
- **THEN** the request is allowed regardless of specific permission assignments (assuming SuperAdmin implies all permissions or is handled via wildcard)
