import { PromptTemplate } from "@langchain/core/prompts";
import mongoose from "mongoose";
import { loadSkillPrompt } from "./utils.js";

// Prompt Template
// Loaded dynamically from .agent/skills/mongoose-generator/prompts/mongoose.md

export async function getMongoosePrompt(request: string) {
  const template = await loadSkillPrompt("mongoose-generator", "mongoose");

  if (!template) {
    // Fallback or error if prompt file is missing
    throw new Error("Failed to load mongoose prompt from skills");
  }

  const promptTemplate = PromptTemplate.fromTemplate(template);

  let databaseWarning = "";
  if (mongoose.connection.readyState !== 1) {
    databaseWarning = "IMPORTANT: The database is currently NOT connected. You must add the following comment to the very top of the generated code file:\n// [WARNING] Database not connected during code generation. Schema context is missing.\n";
  }

  return await promptTemplate.format({
    input: request + "\n\n" + databaseWarning,
  });
}
