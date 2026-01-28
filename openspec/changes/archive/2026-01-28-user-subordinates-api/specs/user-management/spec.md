## ADDED Requirements

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
