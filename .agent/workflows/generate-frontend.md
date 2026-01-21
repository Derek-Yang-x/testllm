---
description: "Generate Frontend Code (UI) Only"
---
1. **Check Environment**: Read `.env` to determine `DB_TYPE` (mongo vs mysql).
2. **Verify & Inspect (MCP ONLY)**: 
   - **DO NOT create temporary scripts** (e.g., `check_conn.ts`, `inspect_schema.ts`).
   - Attempt to use MCP Tool `list-collections` (or `mcp_filesystem_list_directory` if checking files) to verify connectivity.
   - If connected, use `get-collection-schema` (if Mongo) or `mysql_query` (if MySQL) to inspect data structure.
   - **If connection fails (e.g. ECONNREFUSED), SKIP this step and PROCEED based on user request details.**
3. **Generate Frontend**: 
   - Use `get-antd-prompt` to get UI instructions.
   - Generate the React component directly.
