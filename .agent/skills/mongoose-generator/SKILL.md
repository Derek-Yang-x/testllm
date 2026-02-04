---
name: mongoose-generator
description: Generate Mongoose models, controllers, and tests from a user request.
---
# Mongoose Generator Skill

This skill allows you to generate Mongoose code (Model, Controller, Tests) based on a user request.

## Instructions

1.  **Understand the Request**: Identify the user's need for a new MongoDB collection.
    - **Indentation**: ALWAYS use 2 spaces for indentation.
    - **Default Directory Structure** (Adapt if user requests otherwise):
      - Models: `src/generated/models/`
      - Controllers: `src/generated/controllers/`
      - Routes: `src/generated/routes/`
      - Tests: `tests/`

    REQUIREMENTS:
    - **General ESM Rules**:

2.  **Get Context**:
    - **Schema Inference**:
        - Run the schema inference script (uses individual `DB_*` vars from `.env`):
          \`\`\`bash
          npx tsx .agent/skills/mongoose-generator/scripts/get-schema.ts <collection_name>
          \`\`\`
          (Replace `<collection_name>` with the target collection, or `all` if unsure, or skip if no DB access).
        - Use the output to fill the `{{context}}` placeholder in the prompt.

3.  **Generate Code**: Use the prompt template in `prompts/mongoose.md`.

    - Replace `{input}` with the user's request.
    - **ALWAYS appends**: "Output code with strict 2-space indentation."
3.  **Save Files**:
    - **Target Directories** (Default to `src/generated/` unless user specifies otherwise):
      - Models: `src/generated/models/`
      - Controllers: `src/generated/controllers/`
      - Routes: `src/generated/routes/`
      - Tests: `tests/`
    - **Ensure Directories**: Run the script with target directories:
      ```bash
      npx tsx .agent/skills/project-utils/scripts/ensure-dirs.ts src/generated/models src/generated/controllers src/generated/routes tests
      ```
    - Save the generated content to these paths.
4.  **Format Code**: 
    - **CRITICAL**: The prompt MUST explicitly ask for "2-space indentation" to ensure correct formatting directly from the LLM.
    - Verify that the output handling preserves this indentation.
5.  **Run Test**: Execute the generated test:
    `NODE_OPTIONS=--experimental-vm-modules npx jest tests/<generated-test-file>.test.ts`
6.  **Cleanup**:
    - If the user rejects the result or declines *at any step* of the process: Run `rm tests/<generated-test-file>.test.ts`.
    - If the workflow **Completes Successfully**: Explicitly ask the user: "Do you want to keep the generated test file?"
    - If **No**: Run `rm tests/<generated-test-file>.test.ts`.
    - If **Yes**: Keep the file.
