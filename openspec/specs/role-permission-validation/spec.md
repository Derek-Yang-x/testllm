## Purpose
Define the mechanism for validating if users have sufficient privileges to assign permissions to roles.

## ADDED Requirements

### Requirement: Permission Validation Logic
The system SHALL provide a mechanism to validate if a user has sufficient privileges to assign a set of permissions.

#### Scenario: Valid Permissions
- **WHEN** a user with 'user:manage' and 'system:read' attempts to assign ['user:read', 'system:read']
- **THEN** the validation returns valid

#### Scenario: Invalid Permissions
- **WHEN** a user with only 'user:read' attempts to assign ['user:write']
- **THEN** the validation returns invalid and lists 'user:write' as missing

#### Scenario: Hierarchical Validation
- **WHEN** a user with 'user:manage' (which implies 'user:read') attempts to assign ['user:read']
- **THEN** the validation returns valid

#### Scenario: Star Permission Validation
- **WHEN** a user with '*' (superuser) attempts to assign any permissions
- **THEN** the validation returns valid
