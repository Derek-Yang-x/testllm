## Why
To support organizational structures, application users need to be able to define reporting lines (who reports to whom). This enables downstream features like team-based data access, approval workflows, and organizational charts.

## What Changes
- Add a `manager` field to the `User` schema (self-reference).
- Enable `index` on the `manager` field for efficient reverse lookup (finding direct reports).
- Establish a `user-management` capability to govern user schema extensions.

## Capabilities

### New Capabilities
- `user-management`: Defines core user data structure, including hierarchy (manager/subordinate relationships) and profile management.

### Modified Capabilities
<!-- Only list if existing spec requirements change. -->
