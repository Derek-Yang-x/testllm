
# Add User.children Virtual

## Context
User requested adding a `children` virtual field to `User` model to mirror `Permission` model structure, enabling easy traversal of the user hierarchy.

## Goals
- Add Mongoose virtual `children` to `User` model.
- Configure `toJSON` and `toObject` to include virtuals.
- Update `IUser` interface to include optional `children`.

## Non-Goals
- Changing database schema (this is purely virtual).
