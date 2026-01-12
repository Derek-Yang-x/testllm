import "dotenv/config";
import express from "express";
import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SqlDatabase } from "@langchain/classic/sql_db";
import { PromptTemplate } from "@langchain/core/prompts";
import { AppDataSource } from "./db.js";
import { generateAntDCode } from "./antd.js";
const app = express();
app.use(express.json());

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

async function startServer() {
  await AppDataSource.initialize();
  const db = await SqlDatabase.fromDataSourceParams({ appDataSource: AppDataSource });
  
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_API_KEY || "",
    temperature: 0,
  });

  // 3. Create Structured LLM
  const structuredLlm = llm.withStructuredOutput(QuerySchema);

  const promptTemplate = PromptTemplate.fromTemplate(SQL_PROMPT_TEMPLATE);

  app.post("/ask-db", async (req, res) => {
    try {
      const { question } = req.body;
      if (!question) return res.status(400).send("Please provide a question.");

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

      console.log("Generated -------------------");
      console.log("SQL:", generated.sql);
      console.log("Params:", generated.params);
      console.log("-----------------------------");

      // 6. Execute SQL Manually
      const dbResult = await AppDataSource.query(generated.sql, generated.params);
      
      res.json({
        question,
        generated_sql: generated.sql,
        generated_params: generated.params,
        result: dbResult
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/ask-antd", async (req, res) => {
    try {
      const { question, system } = req.body;
      if (!question) return res.status(400).send("Please provide a question.");
    
      // 5. Generate AntD Code
      const result = await generateAntDCode(question, system);
      
      res.json({
        question,
        result
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.listen(process.env.PORT || 3000, () => console.log(`Server is running on http://localhost:3000`));
}

startServer();