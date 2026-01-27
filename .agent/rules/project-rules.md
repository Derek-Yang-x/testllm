---
trigger: always_on
---

# Project Rules for AI Assistant

## File Placement & Organization
1. **Temporary Files**: Use the project `tmp/` directory for scratchpads, debug scripts, or temporary data. Do NOT place them in `src/`.
3. **Source Code**: Only move files to `src/` after they have been verified.
4. **Generated Code**: Place generated code (e.g., from MCP tools, models, controllers, frontend) **EXCLUSIVELY** in the `src/generated/` directory.
   - Models: `src/generated/models/`
   - Routes: `src/generated/routes/`
   - Frontend: `src/generated/frontend/`
5. **Directory Creation**: If a target directory (especially `src/generated/*`) does not exist, **YOU MUST CREATE IT**. Do **NOT** fallback to other directories like `src/client` or `src/schemas`.
6. **Indentation**: **ALWAYS** use 2 spaces for indentation in all generated files (TypeScript, JSON, etc.). Verify this before writing any file.
7. **Verification**: Before writing any code, **ALWAYS** cross-reference the target path with these rules. If a plan suggests writing to `src/models` directly, **REJECT IT** and correct it to `src/generated/models`.

## MCP & Code Generation
1. **Check Environment First**: Before generating any database-related code, **ALWAYS** check the `.env` file for `DB_TYPE`.
   - If `DB_TYPE=mongo`, use the `mongoose-generator` skill.
   - If `DB_TYPE=mysql` (or missing), use the `sequelize-generator` skill.
2. **Tool Usage**: When using MCP tools, strictly follow the directory instructions defined in the tool's prompt/template.
3. **Prioritize Skills**: Always check available Skills (e.g., `sequelize-generator`, `mongoose-generator`, `antd-generator`) FIRST before using MCP tools or writing code manually. If a relevant Skill exists, use it.
4. **Cleanup**: Always clean up temporary files created during debugging sessions once the issue is resolved. This includes any test files created in `test/` (e.g., `test/api.test.ts`) that were used for verification but are not part of the permanent test suite.
5. **Best Practices**:
   - **Avoid Complex One-Liners**: Do not use `npx tsx -e` for complex database operations involving imports. Module resolution in eval mode is fragile.


## Autonomy & Workflow
1. **Be Proactive**: Do **NOT** ask for permission or confirmation in the chat before reading or writing files. Execute the file operations (`write_to_file`, `view_file`, etc.) immediately as part of your task.
2. **Minimize Interruptions**: Avoid using `notify_user` asking "Shall I proceed?" for standard file creation tasks. Only block on user if there are critical destructive changes or significant ambiguity.

## Tool Safety & Reliability
1. **Sequential Execution**: **NEVER** run `notify_user` in parallel with file operations (`write_to_file`, `replace_file_content`) or command executions.
2. **Confirmation First**: Always wait for the file operation to report "Success" or "Created file" BEFORE calling `notify_user` to announce completion. This prevents data loss if the notification interrupts the write process.
