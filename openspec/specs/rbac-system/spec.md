## ADDED Requirements

### Requirement: Role Management
The system SHALL provide capabilities to manage user roles within the system, enforcing permission boundaries.

#### Scenario: Create a new role with valid permissions
- **WHEN** an admin creates a new role with a name (e.g., "Editor") and permissions they possess
- **THEN** the role is saved to the database and available for assignment

#### Scenario: Create a new role with invalid permissions
- **WHEN** an admin creates a new role with permissions they do NOT possess
- **THEN** the system rejects the creation with a forbidden error
- **AND** the error message lists the permissions that caused the rejection

#### Scenario: Assign permissions to a role with validation
- **WHEN** an admin links specific permissions to a role
- **AND** the admin possesses all linked permissions
- **THEN** the role is updated with the new permissions
- **AND** any user assigned that role inherits those permissions

#### Scenario: Assign invalid permissions to a role
- **WHEN** an admin links permissions they do NOT possess
- **THEN** the system rejects the update

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

### Requirement: User Role Assignment
The system SHALL allow assigning one or more roles to a user account.

#### Scenario: Assign role to user
- **WHEN** an admin updates a user profile to include the "SuperAdmin" role
- **THEN** the user's effective permissions include all permissions associated with the "SuperAdmin" role
