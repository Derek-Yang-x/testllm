---
description: Generate MongoDB scripts (Schema/Seed) from an existing Mongoose Model
---

# Generate MongoDB Scripts from Model

Use this workflow to generate database scripts (Schema Validation, Seeding, Migration) based on an existing TypeScript Mongoose Model in the project.

## Prerequisites
- The model file must exist (e.g. `src/generated/models/User.ts`).
- The `mongo-seed-generator` skill must be available.

## Steps

1.  **Analyze Request**:
    - Identify the target **Model File** (e.g., `User.ts`, `Role.ts`).
    - Identify the **Goal**:
        - `Create`: Initialize collection with strict schema.
        - `Update`: Modify existing schema (collMod).
        - `Seed`: Generate dummy data.
        - `Migrate`: Transform existing data (e.g. rename fields).

2.  **Check Database State** (Crucial for deciding between Create/Update):
    - Run DB check directly (no temp file needed):
      ```bash
      npm run db:exec -- --eval "print('COLLECTIONS:' + JSON.stringify(db.getCollectionNames()))"
      ```
    - **Decision Logic**:
        - If output contains target collection -> Use **Update** (`src/generated/scripts/db/update-[collection]-schema.js`).
        - If output does NOT contain target collection -> Use **Create** (`src/generated/scripts/db/create-[collection]-collection.js`).

3.  **Read Model Definition**:
    - Use `view_file` to read the content of the target Model file.
    - Extract:
        - Collection Name (usually defined in `mongoose.model('Name', schema)`).
        - Fields and their Types (`String`, `Number`, `Boolean`, `Date`, etc.).
        - Required fields (`required: true`).
        - Enums (`enum: [...]`).
        - Relationships (`ref: '...'`).

4.  **Execute Skill**:
    - Invoke the `mongo-seed-generator` logic (manually or via prompt).
    - **IF Creating Schema**:
        - Select `templates/create-with-validator.js`.
        - Map TS types to BSON types (string->string, number->int/double, Date->date).
        - Generate `src/generated/scripts/db/create-[collection]-collection.js`.
    - **IF Updating Schema**:
        - Select `templates/update-validator.js`.
        - Generate `src/generated/scripts/db/update-[collection]-schema.js` containing ONLY the changed fields.
    - **IF Seeding**:
        - Select `templates/insert-examples.js`.
        - Generates `src/generated/scripts/db/seed-[collection].js`.
        - Create mock data based on the Model's fields appropriately.
    - **IF Migrating**:
        - Select `templates/migration.js`.
        - Generates `src/generated/scripts/db/migrate-[collection]-[description].js`.
        - Define appropriate filters and update operators.

5.  **Notify User**:
    - Inform the user that the script has been generated in `src/generated/scripts/db/`.
    - Suggest running it via: `npm run db:exec src/generated/scripts/db/[filename].js`
