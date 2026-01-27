import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Initialize MCP Server
const server = new McpServer({
  name: "sequelize-generator",
  version: "1.0.0",
});

// Register Tools with Dynamic Imports
server.registerPrompt(
  "generate-sequelize",
  {
    argsSchema: {
      request: z.string().describe("Description of what model/table to generate code for"),
    },
  },
  async ({ request }) => {
    try {
      const { getSequelizePrompt } = await import("./sequelize.js");
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
    } catch (error) {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Error loading sequelize module: ${error instanceof Error ? error.message : String(error)}`,
            },
          },
        ],
      };
    }
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
    try {
      const { getSequelizePrompt } = await import("./sequelize.js");
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
    } catch (error) {
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
      const { generateAntDPrompt } = await import("./antd.js");
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
      const { getMongoosePrompt } = await import("./mongoose.js");
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
      const { initializeDb, getSchema } = await import("./db.js");
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

server.registerTool(
  "get-collection-schema",
  {
    inputSchema: {
      collectionName: z.string(),
      limit: z.number().optional().default(1),
    },
  },
  async ({ collectionName, limit }) => {
    try {
      const { initializeDb } = await import("./db.js");
      // Need default import for mongoose to access 'connection' property if it's a default export from the lib
      // OR import * as mongoose from "mongoose" if that's how it's used.
      const mongoose = (await import("mongoose")).default;

      await initializeDb();
      // @ts-ignore
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error("MongoDB not connected");
      }
      const docs = await db.collection(collectionName).find({}).limit(limit || 1).toArray();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(docs, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error fetching documents: ${error}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  "custom_jira_search",
  {
    inputSchema: {
      jql: z.string().describe("JQL query string"),
      maxResults: z.number().optional().describe("Max results to return (default 20)"),
    },
  },
  async ({ jql, maxResults }) => {
    try {
      const { searchJiraIssues } = await import("./jira.js");
      const data = await searchJiraIssues(jql, maxResults);
      // Format for display
      const issues = (data.issues || []).map((i: any) => {
        return {
          key: i.key,
          summary: i.fields?.summary,
          status: i.fields?.status?.name
        }
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(issues, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Jira Search Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  "custom_jira_get_issue",
  {
    inputSchema: {
      issueKey: z.string().describe("Jira Issue Key (e.g. TCG-123)"),
    },
  },
  async ({ issueKey }) => {
    try {
      const { getJiraIssue } = await import("./jira.js");
      const data = await getJiraIssue(issueKey);

      // Simplify output for LLM/User consumption 
      const fields = data.fields || {};
      const simpleIssue = {
        key: data.key,
        summary: fields.summary,
        status: fields.status?.name,
        assignee: fields.assignee?.displayName,
        description: fields.description,
        comments: (fields.comment?.comments || []).slice(-3).map((c: any) => ({
          author: c.author?.displayName,
          body: c.body,
          created: c.created
        }))
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(simpleIssue, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Jira Get Issue Error: ${error instanceof Error ? error.message : String(error)}`,
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
        // Dynamically import db to prevent startup crash if db.ts is broken
        const { initializeDb } = await import("./db.js");
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
