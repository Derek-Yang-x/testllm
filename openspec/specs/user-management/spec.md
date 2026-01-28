## ADDED Requirements

### Requirement: User Hierarchy Management
The system SHALL allow designating a manager for a user to establish organizational reporting lines.

#### Scenario: Assigning a manager to a user
- **WHEN** an admin updates a user profile with a valid manager ID
- **THEN** the user's `manager` field is updated to reference the manager's user ID
- **AND** the system validates that the manager ID exists

#### Scenario: Querying direct reports
- **WHEN** querying for users with a specific manager ID
- **THEN** the system returns a list of all users who report to that manager
- **AND** the query uses an index for performance

### Requirement: User Self-Management
The system SHALL allow users to view their own profile including their manager.

#### Scenario: Viewing own manager
- **WHEN** a user requests their own profile
- **THEN** the response includes the `manager` field if populated

#### Scenario: User cannot change own manager
- **WHEN** a standard user attempts to update their own `manager` field
- **THEN** the system rejects the update with a Forbidden error

### Requirement: Fetch User Subordinates
The system SHALL provide an API to retrieve the subordinates of a specific user.

#### Scenario: Fetch direct reports
- **WHEN** an authenticated user requests `GET /users/:userId/subordinates`
- **THEN** the system returns a list of users where `manager` equals `userId`
- **AND** the response includes basic user details (id, username, email)

#### Scenario: Fetch nested subordinates (recursive)
- **WHEN** the request includes the query parameter `recursive=true`
- **THEN** the system returns a hierarchical tree or flat list of all subordinates down the reporting line
- **AND** the structure clearly indicates the manager-subordinate relationship

#### Scenario: Handle invalid user
- **WHEN** requesting subordinates for a non-existent user ID
- **THEN** the system returns a 404 Not Found error
