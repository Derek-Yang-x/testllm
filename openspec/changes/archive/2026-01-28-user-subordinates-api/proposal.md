## Why
Users and administrators need a way to inspect the organizational structure programmatically. A dedicated API to fetch direct reports (and optionally recursively fetch their reports) is necessary to support org-chart visualization and team management features.

## What Changes
- Implement a new API endpoint `GET /users/:id/subordinates`.
- Support a `recursive=true` query parameter to fetch nested subordinates.
- Ensure response structure reflects the hierarchy (tree or flat list with parent references).

## Capabilities

### New Capabilities
<!-- None, we are extending existing capabilities -->

### Modified Capabilities
- `user-management`: Add requirement for searching/listing subordinates via API.
- `access-control`: Define permissions for viewing subordinates (e.g., managers can view their own team).

## Impact
- **API**: New public endpoint on `User` resource.
- **Performance**: Recursive queries can be heavy; will need depth limits or pagination considerations.
