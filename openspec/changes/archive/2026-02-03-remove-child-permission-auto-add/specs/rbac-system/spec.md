## MODIFIED Requirements

### Requirement: Permission Management
The system SHALL provide a catalog of available permissions that can be assigned to roles. Permissions can be organized hierarchically for display, but possession of a parent permission **does NOT** imply possession of child permissions.

#### Scenario: Seed default permissions
- **WHEN** the system initializes
- **THEN** a default set of permissions is available in the database, preserving hierarchical metadata (parent-child links) for UI organization

#### Scenario: Verify permission hierarchy (Explicit Only)
- **WHEN** a user has a parent permission (e.g., `user:manage`)
- **THEN** the system **checks for explicit assignment** of the required permission
- **AND** possession of the parent permission does NOT automatically grant access to child features (e.g., `user:read`)

#### Scenario: Explicit permission assignment
- **WHEN** a user is assigned a specific child permission directly
- **THEN** they have that permission

#### Scenario: Query all descendants (UI Only)
- **WHEN** the system needs to find all descendant permissions of a given permission (for UI display or management)
- **THEN** the system SHALL provide a method to recursively retrieve all descendants
