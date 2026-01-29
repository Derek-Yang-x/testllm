
## MODIFIED Requirements

### Requirement: Permission Management
The system SHALL provide a catalog of available permissions that can be assigned to roles. Permissions can be hierarchical, where a parent permission implies possession of all child permissions.

#### Scenario: Seed default permissions
- **WHEN** the system initializes
- **THEN** a default set of permissions is available in the database, including hierarchical relationships (e.g., `system:manage` is parent of `user:manage`)

#### Scenario: Verify permission hierarchy
- **WHEN** a user has a parent permission (e.g., `user:manage`)
- **THEN** the system considers them to also have all child permissions (e.g., `user:read`, `user:write`)

#### Scenario: Explicit permission assignment
- **WHEN** a user is assigned a specific child permission directly
- **THEN** they have that permission but not necessarily the parent permission

#### Scenario: Query all descendants
- **WHEN** the system needs to find all descendant permissions of a given permission (including grandchildren)
- **THEN** the system SHALL provide a method to recursively retrieve all descendants in the hierarchy tree

