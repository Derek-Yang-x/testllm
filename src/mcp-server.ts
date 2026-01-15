
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { generateAntDPrompt } from "./antd.js";
import { getRelevantSchema, initializeDb, getSchema } from "./db.js";
import { getMongoosePrompt } from "./mongoose.js";
import { getSequelizePrompt } from "./sequelize.js";

// Initialize MCP Server
const server = new McpServer({
  name: "sequelize-generator",
  version: "1.0.0",
});

// Define Prompt Template (Reused from sequelize.ts but adapted for MCP Prompt)

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
    const promptText = await getSequelizePrompt(question);

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
  "get-sequelize-prompt",
  {
      inputSchema: {
          request: z.string(),
      },
  },
  async ({ request }) => {
    const question = request || "";
    const promptText = await getSequelizePrompt(question);

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

server.registerTool(
  "get-antd-prompt",
  {
    inputSchema: {
      request: z.string().describe("Description of the UI component to generate"),
      modelContext: z.string().optional().describe("Optional database schema context"),
    },
  },
  async ({ request, modelContext }) => {
    console.error(`[Tool: generate-antd] Processing request: ${request}`);
    try {
      const prompt = await generateAntDPrompt(request, modelContext);
      
      // Return the prompt text directly, DO NOT call LLM
      return {
        content: [
          {
            type: "text",
            text: prompt,
          },
        ],
      };
    } catch (error) {
      console.error("Error generating AntD prompt:", error);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error generating prompt: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  "get-mongoose-prompt",
  {
    inputSchema: {
      request: z.string().describe("Description of what data model/feature to generate for MongoDB"),
    },
  },
  async ({ request }) => {
    console.error(`[Tool: generate-mongoose] Processing request: ${request}`);
    try {
      // Just get the prompt, do NOT call LLM
      const prompt = await getMongoosePrompt(request);
      
      return {
        content: [
          {
            type: "text",
            text: prompt,
          },
        ],
      };
    } catch (error) {
      console.error("Error generating Mongoose code:", error);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  "list-collections",
  {},
  async () => {
    try {
      await initializeDb();
      const schema = await getSchema();
      return {
        content: [
          {
            type: "text",
            text: schema,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error listing collections: ${error}`,
          },
        ],
      };
    }
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
