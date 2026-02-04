## ADDED Requirements

### Requirement: Issue Authentication Token
The system SHALL issue a secure access token (JWT) upon successful user login.

#### Scenario: Successful Token Generation
- **WHEN** a user logs in with valid credentials
- **THEN** the system generates a signed JWT containing the user's ID
- **AND** the response includes this token in the `accessToken` field

### Requirement: Verify Authentication Token
The system SHALL verify the validity of the access token presented in API requests.

#### Scenario: Valid Token Access
- **WHEN** an API request includes a valid formatted JWT in the Authorization header
- **THEN** the system decodes the user identity
- **AND** allows the request to proceed to authorization checks

#### Scenario: Invalid Token Access
- **WHEN** an API request includes an invalid, expired, or malformed token
- **THEN** the system rejects the request with a 401 Unauthorized error
