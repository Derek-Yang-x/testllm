## ADDED Requirements

### Requirement: Subordinate Access Permission
The system SHALL control access to the subordinates API based on role and relationship.

#### Scenario: Manager accessing own subordinates
- **WHEN** an authenticated user requests subordinates for their OWN user ID
- **THEN** the request is allowed

#### Scenario: Admin accessing any subordinates
- **WHEN** a user with `user:read` permission requests subordinates for ANY user ID
- **THEN** the request is allowed

#### Scenario: Unauthorized access
- **WHEN** a user without `user:read` permission requests subordinates for ANOTHER user
- **THEN** the request is denied with 403 Forbidden
