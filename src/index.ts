import "dotenv/config";
import express from "express";
import { AppDataSource, db } from "./db.js";
import { generateAntDCode, saveCodeToFile } from "./antd.js";
import { generateSqlQuery } from "./sql.js";

const app = express();
app.use(express.json());

async function startServer() {
  
  app.post("/ask-db", async (req, res) => {
    try {
      const { question } = req.body;
      if (!question) return res.status(400).send("Please provide a question.");

      const generated = await generateSqlQuery(question, db);

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
      const { question, system, filename } = req.body;
      if (!question) return res.status(400).send("Please provide a question.");
    
      // 5. Generate AntD Code
      const result = await generateAntDCode(question, system);
      
      // Save code to file
      const savedPath = filename || `output/antd-${Date.now()}.tsx`;
      await saveCodeToFile(result, savedPath);

      res.json({
        question,
        result,
        savedPath
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.listen(process.env.PORT || 3000, () => console.log(`Server is running on http://localhost:3000`));
}

startServer();