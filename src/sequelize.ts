import { PromptTemplate } from "@langchain/core/prompts";
import { getRelevantSchema } from "./db.js";
import { getLlm } from "./llm.js";
import { loadSkillPrompt } from "./utils.js";

export async function getSequelizePrompt(question: string) {
  const { schema } = await getRelevantSchema(question);

  const template = await loadSkillPrompt("sequelize-generator", "sequelize");
  if (!template) {
      throw new Error("Failed to load sequelize prompt from skills");
  }

  const promptTemplate = PromptTemplate.fromTemplate(template);

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
