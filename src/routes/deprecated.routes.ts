
import { Router } from "express";
import path from "path";
import { AppDataSource, getRelevantSchema } from "../db.js";
import { generateAntDCode } from "../antd.js";
import { saveCodeToFile } from "../utils.js";
import { generateSqlQuery } from "../sql.js";
import { generateSequelizeCode } from "../sequelize.js";

const router = Router();

router.post("/gen-sql", async (req, res) => {
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

router.post("/gen-antd", async (req, res) => {
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

router.post("/gen-api", async (req, res) => {
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

export const genRouter = router;
