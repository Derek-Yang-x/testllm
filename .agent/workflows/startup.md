---
description: "Project Startup"
title: "Project Startup"
name: "startup"
---

# Project Startup Convention

Run this workflow at the start of every session or when switching major contexts to ensure compliance with project rules and available tools.

// turbo
1. **Verify Project Structure**
   - Run: `npx tsx .agent/skills/project-utils/scripts/ensure-dirs.ts` to ensure the output directory structure exists.
   - [ ] Acknowledge: "I will strictly output generated code to `src/generated/`."

2. **Check Project Configuration**
   - Read `package.json` to understand dependencies.
   - Run: `node -r dotenv/config -e 'console.log(JSON.stringify({ DB_TYPE: process.env.DB_TYPE || "mysql" }))'` to verify `DB_TYPE`.

3. **Identify Available MCP Tools (Optimized)**
   - Run: `grep -A 1 "server.register" src/mcp-server.ts` to list registered tools and prompts.

4. **Check Task Status**
   - Review `task.md` (if exists).

5. **Cleanup (Optional)**
   - Check `tmp/` for stale files.

// turbo
6. **Ready**
   - Output a brief summary of the current context and ready status.
