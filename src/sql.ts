import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { SqlDatabase } from "@langchain/classic/sql_db";

// 1. Define the Structured Output Schema
const QuerySchema = z.object({
  sql: z.string().describe("The parameterized SQL query using ? as placeholders"),
  params: z.array(z.any()).describe("The parameters for the placeholders"),
});

// 2. Define the System Prompt
const SQL_PROMPT_TEMPLATE = `You are a helpful AI assistant expert in SQL databases.
System Prompt: {system_prompt}

Given an input question, create a syntactically correct {dialect} query to run.
Your output must be a JSON object with:
- "sql": The SQL query string using ? as placeholders for any dynamic values.
- "params": An array of values to replace the placeholders.

Rules:
- Do NOT use markdown code blocks.
- Do NOT include any explanations.
- Use ? for placeholders (parameterized query) to prevent SQL injection.
- If using MySQL, use backticks (\`\`) for table and column names.

Only use the following tables:
{table_info}

Question: {input}
`;

// Initialize LLM
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY || "",
  temperature: 0,
});

const structuredLlm = llm.withStructuredOutput(QuerySchema);
const promptTemplate = PromptTemplate.fromTemplate(SQL_PROMPT_TEMPLATE);

export async function generateSqlQuery(question: string, db: SqlDatabase) {
  // 4. Get Table Info & Dialect
  const tableInfo = await db.getTableInfo();
  const dialect = db.appDataSourceOptions.type;

  // 5. Generate SQL
  const prompt = await promptTemplate.format({
    system_prompt: "你是一個專業的資料庫管理員，請用繁體中文回答(DB欄位不用翻譯)。",
    dialect,
    table_info: tableInfo,
    input: question,
  });

  const generated = await structuredLlm.invoke(prompt);
  return generated;
}
