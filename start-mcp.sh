#!/bin/bash
# Log stderr to /tmp/mcp-server.log, keep stdout for MCP JSON-RPC
exec 2>>/tmp/mcp-server.log

echo "Starting MCP server at $(date)" >&2
echo "Script: $0" >&2
echo "Dirname: $(dirname "$0")" >&2

# Ensure we are in the project directory
cd "$(dirname "$0")"
echo "CWD: $(pwd)" >&2

# Execute the server
echo "Launching node..." >&2
exec /Users/derekyang/.nvm/versions/node/v22.14.0/bin/node ./node_modules/tsx/dist/cli.mjs ./src/mcp-server.ts
