import { PromptTemplate } from "@langchain/core/prompts";
import { getRelevantSchema } from "./db.js";
import { getLlm } from "./llm.js";

// Prompt Template
export const SEQUELIZE_PROMPT_TEMPLATE = `You are an expert TypeScript developer specializing in Node.js, Express, and Sequelize (using sequelize-typescript).

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
  - If the user asks for a table that doesn't exist, try to infer the structure or create a new one based on best practices.
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

const promptTemplate = PromptTemplate.fromTemplate(SEQUELIZE_PROMPT_TEMPLATE);

export async function getSequelizePrompt(question: string) {
  const { schema } = await getRelevantSchema(question);

  return await promptTemplate.format({
    input: question,
    table_info: schema,
  });
}

export async function generateSequelizeCode(question: string) {
  const prompt = await getSequelizePrompt(question);
  const result = await getLlm().invoke(prompt);
  const content = result.content as string;

  try {
    // Attempt to parse JSON directly
    return JSON.parse(content);
  } catch (e) {
    // If strict JSON parsing fails, try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]!);
      } catch (parseError) {
        console.error("Failed to parse JSON from LLM response:", content);
        throw new Error("Failed to parse JSON from LLM response");
      }
    }
    throw new Error("Invalid response format from LLM");
  }
}
