import "dotenv/config";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { loadSkillPrompt } from "./utils.js";
import { getLlm } from "./llm.js";

// Reused helper for loading knowledge base
async function loadPlainTextUrl(url: string) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return text;
  } catch (err) {
    console.error("Error loading docs from URL:", err);
    return null;
  }
}

// Initialize knowledge base
const antdContextPromise = (async () => {
  console.log("[MCP] Initializing AntD Knowledge Base...");
  try {
    const url = "https://ant.design/llms-full.txt";
    const text = await loadPlainTextUrl(url);
    if (text) {
      console.log("[MCP] AntD Knowledge Base Ready.");
      return text;
    } else {
      console.warn("[MCP] AntD Knowledge Base failed to load. Proceeding without it.");
      return "";
    }
  } catch (err) {
    console.error("[MCP] Failed to initialize AntD Knowledge Base:", err);
    return "";
  }
})();

export async function generateAntDPrompt(userInput: string, modelContext?: string): Promise<string> {
  const context = await antdContextPromise;
  const template = await loadSkillPrompt("antd-generator", "antd");

  if (!template) {
    throw new Error("Failed to load AntD prompt from skills");
  }

  // Pre-process template to inject context manually if needed, or rely on LangChain's partials if variable names match.
  // The original code was:
  // ${context.replace(/{/g, "{{").replace(/}/g, "}}")}
  // The skill prompt uses {{context}} and {{modelContext}}.
  
  // Since we are loading a markdown file that likely contains {{context}} placeholders,
  // we need to be careful. LangChain's PromptTemplate expects single braces {variable}.
  // If the markdown file uses {{variable}} (double braces) for Handlebars-style or just visual, 
  // LangChain deals with single braces.

  // Let's assume the skill prompt (antd.md) uses {{context}} as a placeholder.
  
  // Optimization: Construct the system prompt by replacing placeholders directly in the string
  // to avoid brace-escaping hell with LangChain if the context itself contains code.
  
  let systemPrompt = template
      .replace("{{context}}", context)
      .replace("{{modelContext}}", modelContext ? `
    相關的資料庫 Model 結構如下 (請從中選擇與需求相關的表格及欄位)：
    ----------------
    ${modelContext}
    ----------------
    ` : "");

  // Now systemPrompt contains the full prompt with context. 
  // It effectively becomes the system message or the input for the chain.
  
  // The original code used ChatPromptTemplate.
  // Let's use it to format the final user input part if the template still has {input}
  
  // If the skill prompt has "{input}" (single brace) or "User Request: {input}"
  // we can use PromptTemplate.

  // Check if {input} exists in the loaded template
  if (systemPrompt.includes("{input}")) {
      const prompt = await ChatPromptTemplate.fromMessages([
          ["system", systemPrompt.replace("{input}", "").trim()], // Remove {input} from system if it was there, assuming it's in user message? 
          // Actually, looking at antd.md: "User Request: {input}" is at the bottom.
          // It's better to treat the whole thing as a template.
      ]).format({ input: userInput }); // This ignores the system/user split if we just passing string?
      
      // Let's stick to the original logic: split system and user?
      // Or just format the whole string.
      
      const pt = ChatPromptTemplate.fromTemplate(systemPrompt);
      return await pt.format({ input: userInput });
  }

  // Fallback
  return systemPrompt;
}

export async function generateAntDCode(userInput: string, modelContext?: string) {
  const promptStr = await generateAntDPrompt(userInput, modelContext);
  
  const result = await getLlm().invoke(promptStr);
  
  if (typeof result === 'string') return result;
  if (Array.isArray(result.content)) {
    return result.content.map((c: any) => c.text || '').join('');
  }
  return result.content as string;
}
