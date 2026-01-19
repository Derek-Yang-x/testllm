import { PromptTemplate } from "@langchain/core/prompts";
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
  
  return await promptTemplate.format({
    input: request,
  });
}
