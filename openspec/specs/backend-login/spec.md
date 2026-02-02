## ADDED Requirements

### Requirement: Authenticated Login
The system SHALL provide an API to authenticate users using username and password, supporting both permanent and temporary passwords.

#### Scenario: Successful Login with Permanent Password
- **WHEN** user provides correct username and permanent password
- **THEN** system returns a valid JWT token
- **AND** system updates `loginAttempts` to 0

#### Scenario: Successful Login with Temporary Password
- **WHEN** user provides correct username and valid temporary password (not expired)
- **THEN** system returns a valid JWT token
- **AND** system enforces a password change on next action (client logic or special token claim, here simplified to just logging in)

#### Scenario: Failed Login - Invalid Credentials
- **WHEN** user provides incorrect username or password
- **THEN** system returns 401 Unauthorized
- **AND** system increments `loginAttempts`

### Requirement: Forgot Password
The system SHALL allowing users to request a temporary password via email if they forget their password, with rate limiting.

#### Scenario: Request Temp Password (Success)
- **WHEN** user submits correct username and email
- **THEN** system generates a temporary password (valid for 5 mins)
- **AND** system sends email with the temp password via **Resend**
- **AND** system records the request time

#### Scenario: Request Temp Password (Rate Limit)
- **WHEN** user requests temp password twice within 3 minutes
- **THEN** system blocks the second request with "Too frequent" error

### Requirement: Change Password
The system SHALL allow authenticated users to change their password, enforcing complexity rules.

#### Scenario: Change Password (Success)
- **WHEN** user provides valid old password and new password matching regex `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$`
- **THEN** system updates the password hash
- **AND** system clears any temporary password status

#### Scenario: Change Password (Complexity Fail)
- **WHEN** user provides new password that does not match complexity rules (e.g., too short, missing special char)
- **THEN** system rejects the request with "Password format error"
