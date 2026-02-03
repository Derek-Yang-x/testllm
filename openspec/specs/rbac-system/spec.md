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

### Requirement: User Role Assignment
The system SHALL allow assigning one or more roles to a user account.

#### Scenario: Assign role to user
- **WHEN** an admin updates a user profile to include the "SuperAdmin" role
- **THEN** the user's effective permissions include all permissions associated with the "SuperAdmin" role
