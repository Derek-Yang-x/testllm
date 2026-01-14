import "dotenv/config";
import express from "express";
import path from "path";
import { AppDataSource, getSchema, getRelevantSchema, initializeDb } from "./db.js";
import { generateAntDCode } from "./antd.js";
import { saveCodeToFile } from "./utils.js";
import { generateSqlQuery } from "./sql.js";
import { generateSequelizeCode } from "./sequelize.js";

const app = express();
app.use(express.json());

async function startServer() {

  await initializeDb();

  // Warm up the schema cache
  await getSchema();
  
  app.post("/gen-sql", async (req, res) => {
    try {
      const { question } = req.body;
      if (!question) return res.status(400).send("Please provide a question.");

      const generated = await generateSqlQuery(question);

      console.log("Generated -------------------");
      console.log("SQL:", generated.sql);
      console.log("Params:", generated.params);
      console.log("-----------------------------");

      const dbResult = await AppDataSource.query(generated.sql, generated.params);
      
      res.json({
        question,
        sql: generated.sql,
        params: generated.params,
        result: dbResult
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/gen-antd", async (req, res) => {
    try {
      let { question, filename, modelContext } = req.body;
      if (!question) return res.status(400).send("Please provide a question.");

      if (!modelContext) {
        const { schema } = await getRelevantSchema(question);
        modelContext = schema;
      }
    
      const result = await generateAntDCode(question, modelContext);

      const savedPath = filename || `output/antd-${Date.now()}.tsx`;
      await saveCodeToFile(result, savedPath);

      res.json({
        question,
        result,
        savedPath
      });
    } catch (error) {
      console.error("Error in /ask-antd:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/gen-api", async (req, res) => {
    try {
      const { question } = req.body;
      if (!question) return res.status(400).send("Please provide a question.");

      const result = await generateSequelizeCode(question);
      
      const suggested = result.filename || `model-${Date.now()}.ts`;
      const baseName = `output/${suggested}`;

      await saveCodeToFile(result.modelCode, baseName);

      const dir = path.dirname(baseName);
      const ext = path.extname(baseName);
      const name = path.basename(baseName, ext); // e.g. User
      const controllerName = path.join(dir, `${name}.controller${ext || '.ts'}`);
      
      await saveCodeToFile(result.controllerCode, controllerName);

      res.json({
        question,
        result,
        savedPaths: {
          model: baseName,
          controller: controllerName
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.listen(process.env.PORT || 3000, () => console.log(`Server is running on http://localhost:3000`));
}

startServer();