
# Refactor User.manager to parentId

## Context
Use `User.manager` to `Permission.parentId`.

## Goals
- Rename `manager` field to `parentId` in User model.
- Enable consistent tree-structure handling (recursive children) for both Users and Permissions.
- Update all references in code.

## Non-Goals
- Changing the actual logic of how hierarchy is used (just renaming).
