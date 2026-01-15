import "dotenv/config";
import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { getLlm } from "./llm.js";
import { getRelevantSchema } from "./db.js";

const SQL_PROMPT_TEMPLATE = `You are a SQL expert. Given an input question, create a syntactically correct MySQL query to run.

IMPORTANT: You MUST use parameterized queries for any string literals or dynamic values from the input. Use '?' as the placeholder.
Do NOT directly insert values into the SQL string. Put them in the 'params' array.

Rules:
1. Use '?' for ALL user-provided values (strings, numbers, dates).
2. Limit results to at most 5 unless specified otherwise.
3. Select only relevant columns.
4. Use valid MySQL syntax.

Table Info:
{table_info}

Format:
Question: {input}`;

const SqlQuerySchema = z.object({
  sql: z.string().describe("The SQL query to run"),
  params: z.array(z.any()).optional().describe("The parameters for the SQL query"),
});

const structuredLlm = getLlm().withStructuredOutput(SqlQuerySchema);
const promptTemplate = PromptTemplate.fromTemplate(SQL_PROMPT_TEMPLATE);

export async function generateSqlQuery(question: string) {

  const { schema, tables } = await getRelevantSchema(question);

  const prompt = await promptTemplate.format({
    table_info: schema,
    input: question,
  });

  const generated = await structuredLlm.invoke(prompt);
  return { ...generated, tables };
}
