---
name: mongoose-generator
description: Generate Mongoose models, controllers, and tests from a user request.
---
# Mongoose Generator Skill

This skill allows you to generate Mongoose code (Model, Controller, Tests) based on a user request.

## Instructions

1.  **Understand the Request**: Identify the user's need for a new MongoDB collection or feature.
2.  **Generate Code**: Use the prompt template in \`prompts/mongoose.md\`.
    - Replace `{input}` with the user's request.
3.  **Save Files**:
    - Save the generated model, controller, and route code to `src/generated/` (in `models/`, `controllers/`, `routes/` subdirectories).
    - Save the generated test code to `test/`.
    - **Run Test**: Execute the generated test:
      `NODE_OPTIONS=--experimental-vm-modules npx jest test/<generated-test-file>.test.ts`
    - **Cleanup**:
      - If the user rejects the result or declines *at any step* of the process: Run `rm test/<generated-test-file>.test.ts`.
      - If the workflow **Completes Successfully**: Explicitly ask the user: "Do you want to keep the generated test file?"
        - If **No**: Run `rm test/<generated-test-file>.test.ts`.
        - If **Yes**: Keep the file.
