# Proposal: Add User Permissions Collection (RBAC)

## Why
The current system lacks a structured way to manage user permissions for backend administrators. As the system grows, we need a flexible and secure way to assign different access levels to different admins. Implementing a Role-Based Access Control (RBAC) system will solve this by decoupling users from direct permissions and managing them via roles.

## What Changes
We will introduce a standard RBAC architecture consisting of three main collections:

- **Users (Modified)**: Update the existing User model to support role assignment.
- **Roles (New)**: A new collection to define roles (e.g., SuperAdmin, Editor, Viewer).
- **Permissions (New)**: A new collection to define granular access rights (e.g., `user:read`, `user:write`).

**Key Features:**
- Flexible role management (create/edit/delete roles).
- Granular permission definitions.
- Ability to assign multiple roles to a user (or single role, TBD in design).
- Middleware to enforce permission checks on API routes.

## Capabilities

### New Capabilities
- `rbac-system`: Implementation of Role and Permission collections and management APIs.
- `access-control`: Middleware and logic for checking user permissions against required resource actions.

### Modified Capabilities
- `admin-login`: (From TCG-128265) - Will need updates to include role information in the login session/token.

## Impact
- **Database**: Adds `roles` and `permissions` collections. Modifies `users` collection schema.
- **API**: New endpoints for managing roles and permissions.
- **Auth**: Login response and token payload will now include permission data.
- **Frontend**: Admin UI will need pages to manage these new resources (though UI implementation might be separate scope, backend support is primary).
