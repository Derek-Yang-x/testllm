---
description: "Generate Frontend Code (UI) Only"
---
1. **Check Environment**: Read `.env` to determine `DB_TYPE` (mongo vs mysql).
2. **Verify & Inspect (MCP ONLY)**: 
   - **DO NOT create temporary scripts** (e.g., `check_conn.ts`, `inspect_schema.ts`).
   - Use MCP Tool `list-collections` (or `mcp_filesystem_list_directory` if checking files) to verify connectivity.
   - Use MCP Tool `get-collection-schema` (if Mongo) or `mysql_query` (if MySQL) to inspect data structure.
3. **Generate Frontend**: 
   - Use `get-antd-prompt` to get UI instructions.
   - Generate the React component directly.
