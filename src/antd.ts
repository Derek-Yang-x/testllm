import "dotenv/config";
import fs from "fs";
import path from "path";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { loadSkillPrompt } from "./utils.js";
import { getLlm } from "./llm.js";

// Path to split docs
const DOCS_DIR = path.resolve(process.cwd(), ".agent/skills/antd-generator/resources/docs");

function getRelevantDocs(request: string): string {
  if (!fs.existsSync(DOCS_DIR)) {
    console.warn(`[MCP] Docs directory not found at ${DOCS_DIR}. Please run fetch-docs.ts script.`);
    return "";
  }

  const files = fs.readdirSync(DOCS_DIR);
  // Simple keyword matching for retrieval
  // Remove extension for matching
  const components = files.map(f => ({
    name: f.replace('.md', ''),
    file: f
  }));

  const relevantDocs: string[] = [];
  const requestLower = request.toLowerCase();

  components.forEach(comp => {
    // Check if component name appears in request (e.g. "table", "button")
    if (requestLower.includes(comp.name)) {
      try {
        const content = fs.readFileSync(path.join(DOCS_DIR, comp.file), 'utf-8');
        relevantDocs.push(content);
      } catch (err) {
        console.error(`Error reading doc ${comp.file}:`, err);
      }
    }
  });

  return relevantDocs.join('\n\n');
}

export async function generateAntDPrompt(userInput: string, modelContext?: string): Promise<string> {
  // 1. Get Context via RAG
  const context = getRelevantDocs(userInput);

  // 2. Load Template
  const template = await loadSkillPrompt("antd-generator", "antd");

  if (!template) {
    throw new Error("Failed to load AntD prompt from skills (antd.md)");
  }

  // 3. Construct System Prompt
  // Replace placeholders carefully. 
  let systemPrompt = template
    .replace("{{context}}", context ? context.replace(/{/g, "{{").replace(/}/g, "}}") : "No specific component documentation found (or failed to load). Rely on general knowledge.")
    .replace("{{modelContext}}", modelContext ? `
    相關的資料庫 Model 結構如下 (請從中選擇與需求相關的表格及欄位)：
    ----------------
    ${modelContext.replace(/{/g, "{{").replace(/}/g, "}}")}
    ----------------
    ` : "");

  // 4. Handle {input}
  if (systemPrompt.includes("{input}")) {
    // Use string replacement instead of LangChain format to avoid escaping issues with code blocks in docs
    return systemPrompt.replace("{input}", userInput);
  }

  return systemPrompt;
}

// Deprecated or unused function kept for compatibility if needed, but safe
export async function generateAntDCode(userInput: string, modelContext?: string) {
  const promptStr = await generateAntDPrompt(userInput, modelContext);

  const result = await getLlm().invoke(promptStr);

  if (typeof result === 'string') return result;
  if (Array.isArray(result.content)) {
    return result.content.map((c: any) => c.text || '').join('');
  }
  return result.content as string;
}
