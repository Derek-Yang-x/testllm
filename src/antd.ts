import "dotenv/config";
import { ChatPromptTemplate } from "@langchain/core/prompts";

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

  const defaultSystemPrompt = `你是一位資深的 Ant Design 5.0 專家。
    請參考以下技術文檔片段來生成代碼：
    ----------------
    ${context.replace(/{/g, "{{").replace(/}/g, "}}")}
    ----------------
    
    ${modelContext ? `
    相關的資料庫 Model 結構如下 (請從中選擇與需求相關的表格及欄位)：
    ----------------
    ${modelContext.replace(/{/g, "{{").replace(/}/g, "}}")}
    ----------------
    ` : ""}

    要求：
    - 使用 React Functional Components 和 TypeScript。
    - 優先使用 ProComponents。
    - 只輸出代碼塊，不要解釋。`;

  const prompt = await ChatPromptTemplate.fromMessages([
    ["system", defaultSystemPrompt],
    ["human", "{input}"],
  ]).format({ input: userInput });
  
  return prompt;
}

export async function generateAntDCode(userInput: string, modelContext?: string) {
  // Use the new prompt generator logic
  const promptStr = await generateAntDPrompt(userInput, modelContext);
  
  // Directly invoke LLM with the formatted prompt
  // Since 'model' is likely a ChatOpenAI or similar LangChain object, we can invoke it with a string or messages.
  // Although generateAntDPrompt returns a string (the formatted prompt), passing it as a single human message string is usually fine for chat models,
  // OR we can reconstruct a simple message array if needed.
  // However, 'model.invoke' typically accepts a string or BaseMessage[].
  
  // Let's create a simple chain: Prompt (String) -> LLM -> StringOutputParser
  // But since promptStr is already the FINAL formatted string, we might just pass it.
  
  // Dynamically import llm to avoid initialization errors if API key is missing when only generating prompts
  const { llm } = await import("./llm.js");
  const result = await llm.invoke(promptStr);
  
  // Result is likely an AIMessage.
  if (typeof result === 'string') return result;
  if (Array.isArray(result.content)) {
    return result.content.map((c: any) => c.text || '').join('');
  }
  return result.content as string;
}
