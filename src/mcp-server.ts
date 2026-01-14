
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getRelevantSchema, initializeDb } from "./db.js";

// Initialize MCP Server
const server = new McpServer({
  name: "sequelize-generator",
  version: "1.0.0",
});

// Define Prompt Template (Reused from sequelize.ts but adapted for MCP Prompt)
const SEQUELIZE_PROMPT_TEMPLATE = `You are an expert TypeScript developer specializing in Node.js, Express, and Sequelize (using sequelize-typescript).

Your task is to generate three files based on the user's request:
1. A **Sequelize Model** using \`sequelize-typescript\` decorators (@Table, @Column, @Model, etc.).
2. An **Express Controller** that performs CRUD operations for that model.
3. A **Unit Test** file for the controller using \`jest\` and \`supertest\`.

Current Context:
- Database: MySQL
- ORM: sequelize-typescript
- Framework: Express.js
- Existing Database Schema:
{table_info}

Requirements:
- **Model**:
  - Class name should be PascalCase (e.g., User).
  - Extend \`Model\`.
  - Use decorators correctly.
  - Map properties to existing columns in the table definition provided in {table_info}.
- **Controller**:
  - Export a class (e.g., UserController) or a set of functions.
  - Include methods/handlers for: create, findAll, findOne, update, delete.
  - **IMPORTANT**: When importing types (like Request, Response, NextFunction), use \`import type {{ ... }}\` syntax to satisfy 'verbatimModuleSyntax'.
  - Use \`req\`, \`res\`, \`next\` typed as \`Request\`, \`Response\`, \`NextFunction\` from 'express'.
  - Handle errors appropriately (try-catch).
  - **Do NOT include any comments in the code.**
- **Unit Test**:
  - Use \`jest\` and \`supertest\`.
  - Mock the Sequelize model methods.
  - Test at least one success case for each controller method.

User Request: {input}

Output JSON with matches for:
- "modelCode": The complete source code for the model file.
- "controllerCode": The complete source code for the controller file.
- "testCode": The complete source code for the unit test file.
- "filename": A suitable filename definition for the model.

**Directory Instructions**:
- **Model** and **Controller** files should be placed in the **\`output/\`** directory.
- **Test** files should be placed in the **\`test/\`** directory.
`;

// Register Prompt
server.registerPrompt(
  "generate-sequelize",
  {
      argsSchema: {
          request: z.string().describe("Description of what model/table to generate code for"),
      },
  },
  async ({ request }) => {
    const question = request || "";
    
    // Fetch schema using existing logic
    console.error(`Fetching schema for request: ${question}`);
    const { schema } = await getRelevantSchema(question);

    const promptText = SEQUELIZE_PROMPT_TEMPLATE
        .replace("{input}", question)
        .replace("{table_info}", schema);

    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: promptText,
          },
        },
      ],
    };
  }
);

server.registerTool(
  "ping",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: "pong",
        },
      ],
    };
  }
);

server.registerTool(
  "generate-sequelize-tool",
  {
      inputSchema: {
          request: z.string(),
      },
  },
  async ({ request }) => {
    const question = request || "";
    console.error(`[Tool] Fetching schema for request: ${question}`);
    const { schema } = await getRelevantSchema(question);

    const promptText = SEQUELIZE_PROMPT_TEMPLATE
        .replace("{input}", question)
        .replace("{table_info}", schema);

    return {
      content: [
        {
          type: "text",
          text: promptText,
        },
      ],
    };
  }
);

// Start the server
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Sequelize MCP Server running on stdio");

  // Attempt to connect to DB in background with retries
  const MAX_RETRIES = 10;
  const RETRY_DELAY = 3000;
  
  (async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            await initializeDb();
            console.error(`[${new Date().toISOString()}] ✅ Sequelize MCP Server: Database connected successfully!`);
            console.error(`[${new Date().toISOString()}] 🚀 MCP Server is READY to accept requests.`);
            return;
        } catch (err) {
            console.error(`Database connection failed (attempt ${i + 1}/${MAX_RETRIES}). Retrying in ${RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
    console.error("Failed to connect to database after multiple attempts. MCP server functionality may be limited.");
  })();
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
