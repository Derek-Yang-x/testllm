import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { db } from "./db.js";
import { llm } from "./llm.js";

// Define the schema for the output
const SequelizeSchema = z.object({
  modelCode: z.string().describe("The TypeScript code for the Sequelize Model"),
  controllerCode: z.string().describe("The TypeScript code for the Express Controller"),
  filename: z.string().describe("Suggested filename for the model (e.g., user.model.ts)"),
});

// Prompt Template
const SEQUELIZE_PROMPT_TEMPLATE = `You are an expert TypeScript developer specializing in Node.js, Express, and Sequelize (using sequelize-typescript).

Your task is to generate two files based on the user's request:
1. A **Sequelize Model** using \`sequelize-typescript\` decorators (@Table, @Column, @Model, etc.).
2. An **Express Controller** that performs CRUD operations for that model.

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
  - If the user asks for a table that doesn't exist, try to infer the structure or create a new one based on best practices.
- **Controller**:
  - Export a class (e.g., UserController) or a set of functions.
  - Include methods/handlers for: create, findAll, findOne, update, delete.
  - **IMPORTANT**: When importing types (like Request, Response, NextFunction), use \`import type {{ ... }}\` syntax to satisfy 'verbatimModuleSyntax'.
  - Use \`req\`, \`res\`, \`next\` typed as \`Request\`, \`Response\`, \`NextFunction\` from 'express'.
  - Handle errors appropriately (try-catch).

User Request: {input}

Output JSON with matches for:
- "modelCode": The complete source code for the model file.
- "controllerCode": The complete source code for the controller file.
- "filename": A suitable filename definition for the model.
`;

const structuredLlm = llm.withStructuredOutput(SequelizeSchema);
const promptTemplate = PromptTemplate.fromTemplate(SEQUELIZE_PROMPT_TEMPLATE);

export async function generateSequelizeCode(question: string) {
  const tableInfo = await db.getTableInfo();

  const prompt = await promptTemplate.format({
    input: question,
    table_info: tableInfo,
  });

  const generated = await structuredLlm.invoke(prompt);
  return generated;
}
