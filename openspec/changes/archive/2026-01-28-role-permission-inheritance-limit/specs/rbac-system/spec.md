## MODIFIED Requirements

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
