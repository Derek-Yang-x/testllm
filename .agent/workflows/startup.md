---
description: "Project Startup"
title: "Project Startup"
name: "startup"
---

# Project Startup Convention

Run this workflow at the start of every session or when switching major contexts to ensure compliance with project rules and available tools.

1. **Read Project Rules**
   - Read `.cursorrules` to refresh memory on project guidelines, file placement, and MCP tool usage.
   - [ ] Confirm you understand the "Prioritize MCP" rule.

2. **Check Project Configuration**
   - Read `package.json` to understand dependencies and scripts.
   - Read `.env` (if applicable/safe) to verify environment settings (e.g., DB_TYPE).

3. **Identify Available MCP Tools**
   - Read `src/mcp-server.ts` to see what tools are registered.
   - Note down specific tool names (e.g., `get-sequelize-prompt`, `generate-antd`).

4. **Check Task Status**
   - Review `task.md` (if exists) to see current progress.

5. **Cleanup (Optional)**
   - Check `tmp/` for any stale files from previous sessions that can be deleted.

// turbo
6. **Ready**
   - Output a brief summary of the current context and ready status to the user.
