---
name: mongo-seed-generator
description: Generate robust, transactional MongoDB seed scripts (`.js`) for `mongosh`. Supports hierarchical data (trees) and flat lists, using MongoDB Sessions to ensure atomicity.
---

# MongoDB Seed Generator

Use this skill to generate a MongoDB Shell script (`.js`) that seeds a collection with data. The generated script is designed to be run via `mongosh`.

## Capabilities

- **Transaction Support**: Uses `session.withTransaction` to ensure all insertions succeed or all fail (Atomicity).
- **Hierarchical Data**: Handles nested structures (e.g., Categories, Permissions) using recursive insertion.
- **Reference Integrity**: Automatically captures `insertedId` from parent documents to link child documents.
- **Idempotency**: (Optional) Can include cleanup logic to wipe the collection before seeding.

## Templates

This skill provides multiple templates for different MongoDB operations:

1.  **Create Collection (Strict Schema)**: `templates/create-with-validator.js`
    *   Creates a new collection with `additionalProperties: false` and strict types.
2.  **Update Validator (Migration)**: `templates/update-validator.js`
    *   Updates (`collMod`) an existing collection's schema (e.g. adding constraints).
3.  **Insert Examples (Transactional & Validation)**: `templates/insert-examples.js`
    *   Demonstrates successful vs failed insertions under strict schema, with automatic transaction support (Replica Set detection).
4.  **Data Migration**: `templates/migration.js`
    *   Template for data transformations (e.g. `$rename`) with built-in safety checks and verification.

## Usage



When the user asks to "create a strict collection" or "add schema validation", use `templates/create-with-validator.js` or `templates/update-validator.js`.

### Adapting Template

1.  **Select Template**: Choose the file matching the user's intent.
2.  **Read & Adapt**:
    *   Set `use('[Database Name]')`.
    *   Set `[Collection Name]`.
    *   Define the JSON Schema `properties` according to the user's data model.
3.  **Generate**: Output the script.

## Instructions for implementation

1.  **Understand the Goal**: Does the user want to *create* a collection (Strict Schema), *update* an existing one (Migration), or *insert data* (Seeding/Examples)?
2.  **Select & Adapt Template**:
    
    *   **Goal: Create Strict Collection** -> `templates/create-with-validator.js`
        *   Define `properties` and types (string, int, date, etc.).
        *   Set `required` fields.
        *   Output as `generated/scripts/db/create-[collection]-collection.js`.

    *   **Goal: Update Schema/Validator** -> `templates/update-validator.js`
        *   Use `collMod` command.
        *   Add new fields or constraints (min/max/enum).
        *   Output as `generated/scripts/db/update-[collection]-schema.js`.

    *   **Goal: Insert Data / Test Validation** -> `templates/insert-examples.js`
        *   Use this for seeding OR verifying schema rules.
        *   Auto-detect Replica Set (Universal Transaction support).
        *   Include both **Valid** (Commit) and **Invalid** (Rollback) examples if demonstrating validation.
        *   Output as `generated/scripts/db/seed-[collection].js` or `generated/scripts/db/test-[collection]-validation.js`.

    *   **Goal: Migrate Data (Rename/Transform)** -> `templates/migration.js`
        *   Use for field renames, type conversions, etc.
        *   Ensure `[Query Filter]` targets only documents needing update.
        *   Output as `generated/scripts/db/migrate-[collection]-[description].js`.

3.  **Final Polish**: Ensure database name is correct (`use('...')`) and comments explain the schema rules.
