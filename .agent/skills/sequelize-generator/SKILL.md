---
name: sequelize-generator
description: Generate Sequelize models, controllers, and tests from a user request.
---
# Sequelize Generator Skill

This skill allows you to generate Sequelize code (Model, Controller, Tests) based on a user request and database schema.

## Instructions

1.  **Understand the Request**: Identify the user's need for a new model or feature.
2.  **Get Schema**: If the request implies working with existing tables, ensure you have the schema context.
3.  **Generate Code**: Use the prompt template in \`prompts/sequelize.md\`.
    - Replace `{input}` with the user's request.
    - Replace `{table_info}` with the relevant database schema (if any).
4.  **Save Files**:
    - Save the generated model and controller code to `output/`.
    - Save the generated test code to `test/`.
