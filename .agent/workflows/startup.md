---
description: "Project Startup"
title: "Project Startup"
name: "startup"
---

# Project Startup Convention

Run this workflow at the start of every session or when switching major contexts to ensure compliance with project rules and available tools.

// turbo
1. **Verify Project Structure**
   - Run: `mkdir -p src/generated/{models,routes,frontend}` to ensure the output directory structure exists.
   - [ ] Acknowledge: "I will strictly output generated code to `src/generated/`."

2. **Check Project Configuration**
   - Read `package.json` to understand dependencies.
   - Read `.env` (if safe) to verify `DB_TYPE`.

3. **Identify Available MCP Tools (Optimized)**
   - Run: `grep -A 1 "server.register" src/mcp-server.ts` to list registered tools and prompts.

4. **Check Task Status**
   - Review `task.md` (if exists).

5. **Cleanup (Optional)**
   - Check `tmp/` for stale files.

// turbo
6. **Ready**
   - Output a brief summary of the current context and ready status.
