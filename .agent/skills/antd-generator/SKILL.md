---
name: antd-generator
description: Generate Ant Design UI components from a user request.
---
# Ant Design Generator Skill

This skill allows you to generate Ant Design UI components (specifically ProComponents) based on a user request.

## Instructions

1.  **Understand the Request**: Identify the UI component the user wants to generate.
2.  **Get Context**:
    - **Data Model**: If relevant, gather schema information about the data to be displayed (e.g., table columns).
    - **AntD Docs**:
        - **ALWAYS** runs the fetch script to ensure documentation is fresh (it has built-in caching):
          \`\`\`bash
          npx tsx .agent/skills/antd-generator/scripts/fetch-docs.ts
          \`\`\`
        - Read the content of `resources/antd-docs.txt` and use it to fill the `{{context}}` placeholder.
3.  **Generate Code**: Use the prompt template in \`prompts/antd.md\`.
    - Replace `{input}` with the user's request.
    - Replace `{{context}}` with the content of `resources/antd-docs.txt`.
    - Replace `{{modelContext}}` with relevant database schema or leave empty.
4.  **Save Files**:
    - Save the generated component files to the appropriate directory (e.g., `src/pages/` or `output/`).
