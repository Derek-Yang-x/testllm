---
name: sequelize-generator
description: Generate Sequelize models, controllers, and tests from a user request.
---
# Sequelize Generator Skill

This skill allows you to generate Sequelize code (Model, Controller, Tests) based on a user request and database schema.

## Instructions

1.  **Understand the Request**: Identify the user's need for a new model or feature.
2.  **Get Context**:
    - **Schema Inference**:
        - Run the schema inference script:
          \`\`\`bash
          npx tsx .agent/skills/sequelize-generator/scripts/get-schema.ts <table_name>
          \`\`\`
          (Replace `<table_name>` with the target table, or `list` to see available tables).
        - Use the output to fill the `{table_info}` placeholder in the prompt.
3.  **Generate Code**: Use the prompt template in \`prompts/sequelize.md\`.
    - Replace `{input}` with the user's request.
    - Replace `{table_info}` with the relevant database schema (if any).
    - **ALWAYS appends**: "Output code with strict 2-space indentation."
4.  **Save Files**:
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
5.  **Format Code**:
    - **CRITICAL**: Rely on the prompt instruction for correct 2-space indentation.
6.  **Run Test**: Execute the generated test:
      `NODE_OPTIONS=--experimental-vm-modules npx jest tests/<generated-test-file>.test.ts`
7.  **Cleanup**:
      - If the user rejects the result or declines *at any step* of the process: Run `rm tests/<generated-test-file>.test.ts`.
      - If the workflow **Completes Successfully**: Explicitly ask the user: "Do you want to keep the generated test file?"
        - If **No**: Run `rm tests/<generated-test-file>.test.ts`.
        - If **Yes**: Keep the file.
