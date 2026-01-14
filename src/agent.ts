import "dotenv/config";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation, MemorySaver } from "@langchain/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import * as readline from "readline";

import { llm } from "./llm.js";
import { getSchema } from "./db.js";
import { AppDataSource } from "./db.js";
import { generateSqlQuery } from "./sql.js";
import { generateSequelizeCode } from "./sequelize.js";
import { generateAntDCode } from "./antd.js";
import { saveCodeToFile } from "./utils.js";

// --- Tools ---

const sqlTool = tool(
  async ({ question }) => {
    try {
      console.log(`[Agent] Generating SQL for: ${question}`);
      const result = await generateSqlQuery(question);
      
      console.log(`[Agent] Executing SQL: ${result.sql}`);
      const dbResult = await AppDataSource.query(result.sql, result.params);
      
      return JSON.stringify({
        sql: result.sql,
        params: result.params,
        tables: result.tables,
        result: dbResult
      }, null, 2);
    } catch (error: any) {
      return `Error generating/executing SQL: ${error.message}`;
    }
  },
  {
    name: "sql_query_tool",
    description: "Use this tool to query the database. Input should be a natural language question about the data.",
    schema: z.object({
      question: z.string().describe("The user's question about the data"),
    }),
  }
);

const sequelizeTool = tool(
  async ({ question }) => {
    try {
      console.log(`[Agent] Generating Sequelize code for: ${question}`);
      const result = await generateSequelizeCode(question);
      
      const filename = result.filename || `output/model-${Date.now()}.ts`;
      const savedPath = await saveCodeToFile(result.modelCode + "\n\n" + result.controllerCode, filename);
      
      return `Sequelize Model and Controller generated and saved to: ${savedPath}\n\nUsed tables: ${result.tables?.join(", ") || "none"}`;
    } catch (error: any) {
      return `Error generating Sequelize code: ${error.message}`;
    }
  },
  {
    name: "sequelize_generator_tool",
    description: "Use this tool to generate Sequelize Model and Express Controller code. Input is a request for a model/feature.",
    schema: z.object({
      question: z.string().describe("The description of the model or feature to generate"),
    }),
  }
);

const antdTool = tool(
  async ({ question, modelContext }) => {
    try {
      console.log(`[Agent] Generating AntD code for: ${question}`);
      
      // If modelContext is not provided, the generateAntDCode function will handle finding relevant schema if we updated it,
      // BUT currently generateAntDCode expects `modelContext` OR it falls back to empty if not passed. 
      // In src/index.ts we call getRelevantSchema manually. Let's do that here too if needed, 
      // or better, if the user didn't provide specific context, we let the agent tools handle it.
      // However, generateAntDCode signature is (userInput, modelContext).
      // We should probably rely on the agent to pass schema if it knows it, or we fetch it here.
      // Let's reuse the getRelevantSchema logic implicitly by calling it if modelContext is missing.
      
      let finalContext = modelContext;
      if (!finalContext) {
        // We import getRelevantSchema dynamically to avoid circular deps if any, or just use the one from db
        const { getRelevantSchema } = await import("./db.js");
        const { schema } = await getRelevantSchema(question);
        finalContext = schema;
      }

      const code = await generateAntDCode(question, finalContext);
      const filename = `output/antd-${Date.now()}.tsx`;
      const savedPath = await saveCodeToFile(code, filename);

      return `Ant Design component generated and saved to: ${savedPath}`;
    } catch (error: any) {
      return `Error generating AntD code: ${error.message}`;
    }
  },
  {
    name: "antd_generator_tool",
    description: "Use this tool to generate React/Ant Design components. Input is a UI requirement.",
    schema: z.object({
      question: z.string().describe("The description of the UI component to generate"),
      modelContext: z.string().optional().describe("Optional database schema context if known"),
    }),
  }
);

// --- Agent Setup ---

const tools = [sqlTool, sequelizeTool, antdTool];
const toolNode = new ToolNode(tools);

const modelWithTools = llm.bindTools(tools);

async function callModel(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  const response = await modelWithTools.invoke(messages);
  
  // Reconstruct the message to ensure sanitized tool_calls are used.
  // We use JSON.parse(JSON.stringify(...)) to ensure a deep copy of plain objects,
  // removing any null-prototype issues recursively.
  const toolCalls = response.tool_calls || [];
  const sanitizedToolCalls = toolCalls.map((tc) => ({
    ...tc,
    args: JSON.parse(JSON.stringify(tc.args))
  }));

  // Create a new AIMessage with the sanitized fields
  // We cast to any to access internal fields if necessary, but AIMessage constructor supports these.
  const newResponse = new AIMessage({
    content: response.content,
    tool_calls: sanitizedToolCalls,
    additional_kwargs: response.additional_kwargs,
    response_metadata: response.response_metadata,
    id: response.id,
  } as any);

  return { messages: [newResponse] };
}

function shouldContinue(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  if (
    lastMessage && 
    "tool_calls" in lastMessage && 
    Array.isArray(lastMessage.tool_calls) && 
    lastMessage.tool_calls.length > 0
  ) {
    return "tools";
  }
  return "__end__";
}

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

const agent = workflow.compile({ checkpointer: new MemorySaver() });

// --- Interactive Loop ---

async function run() {
  // Warm up schema cache
  await getSchema();
  console.log("-----------------------------------------");
  console.log("🤖 Antigravity CLI Agent Ready");
  console.log("Type 'exit' to quit.");
  console.log("-----------------------------------------");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const config = { configurable: { thread_id: "cli-session" } };

  const ask = () => {
    rl.question("\nYou: ", async (input) => {
      if (input.toLowerCase() === "exit") {
        rl.close();
        process.exit(0);
      }

      try {
        const stream = await agent.stream(
          { messages: [new HumanMessage(input)] },
          config
        );

        for await (const chunk of stream) {
          const agentChunk = chunk;
          if (agentChunk.agent && Array.isArray(agentChunk.agent.messages) && agentChunk.agent.messages.length > 0) {
            console.log((agentChunk.agent.messages[0] as any).content);
          } else if (agentChunk.tools && Array.isArray(agentChunk.tools.messages) && agentChunk.tools.messages.length > 0) {
            console.log(`[Tool] ${(agentChunk.tools.messages[0] as any).name} called...`);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }

      ask();
    });
  };

  ask();
}

run();
