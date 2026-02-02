## ADDED Requirements

### Requirement: User Hierarchy Management
The system SHALL allow designating a parent user to establish organizational reporting lines.

#### Scenario: Assigning a parent to a user
- **WHEN** an admin updates a user profile with a valid parent ID
- **THEN** the user's `parentId` field is updated to reference the parent's user ID
- **AND** the system validates that the parent ID exists

#### Scenario: Querying direct reports
- **WHEN** querying for users with a specific parent ID
- **THEN** the system returns a list of all users who report to that parent
- **AND** the query uses an index for performance

### Requirement: User Self-Management
The system SHALL allow users to view their own profile including their parent.

#### Scenario: Viewing own parent
- **WHEN** a user requests their own profile
- **THEN** the response includes the `parentId` field if populated

#### Scenario: User cannot change own parent
- **WHEN** a standard user attempts to update their own `parentId` field
- **THEN** the system rejects the update with a Forbidden error

### Requirement: Fetch User Subordinates
The system SHALL provide an API to retrieve the subordinates of a specific user.

#### Scenario: Fetch direct reports
- **WHEN** an authenticated user requests `GET /users/:userId/subordinates`
- **THEN** the system returns a list of users where `parentId` equals `userId`
- **AND** the response includes basic user details (id, username, email)

#### Scenario: Fetch nested subordinates (recursive)
- **WHEN** the request includes the query parameter `recursive=true`
- **THEN** the system returns a hierarchical tree or flat list of all subordinates down the reporting line
- **AND** the structure clearly indicates the parent-child relationship

#### Scenario: Handle invalid user
- **WHEN** requesting subordinates for a non-existent user ID
- **THEN** the system returns a 404 Not Found error
