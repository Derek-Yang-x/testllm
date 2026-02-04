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

3.  **Generate Prompt**:
    - Run the intelligent prompt generator script. This script automatically retrieves relevant documentation based on keywords in the request.
      \`\`\`bash
      npx tsx .agent/skills/antd-generator/scripts/get-prompt.ts "Your detailed request here"
      \`\`\`
    - The script outputs the complete prompt. Use this output to query the LLM.
    - **Add manual instruction to the final prompt**: "Use 2-space indentation."
4.  **Save Files**:
    - **Ensure Directories**: Run the script with target directories:
      ```bash
      npx tsx .agent/skills/project-utils/scripts/ensure-dirs.ts src/generated/frontend
      ```
    - Save the generated component files to the `src/generated/frontend/` directory (or user specified path).
5.  **Format Code**:
    - **CRITICAL**: Rely on the prompt instruction for correct 2-space indentation.
