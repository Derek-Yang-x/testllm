import "dotenv/config";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { llm as model } from "./llm.js";

import { RecursiveCharacterTextSplitter } from "@langchain/classic/text_splitter";

import { Document } from "@langchain/core/documents";

async function loadPlainTextUrl(url: string) {
  try {
    const response = await fetch(url);
    const text = await response.text();

    // 將純文字包裝成 LangChain 的 Document 物件
    const doc = new Document({ pageContent: text, metadata: { source: url } });

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const splitDocs = await splitter.splitDocuments([doc]);

    return await MemoryVectorStore.fromDocuments(splitDocs, new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY || "",
      model: "text-embedding-004",
    }));
  } catch (err) {
    console.error("Error loading docs from URL:", err);
    return null;
  }
}

// Initialize the knowledge base immediately (this may take a few seconds on startup)
const antdVectorStorePromise = (async () => {
  console.log("Initializing AntD Knowledge Base...");
  try {
    const url = "https://ant.design/llms-full.txt";
    const store = await loadPlainTextUrl(url);
    if (store) {
      console.log("AntD Knowledge Base Ready.");
      return store;
    } else {
      console.warn("AntD Knowledge Base failed to load. Proceeding without it.");
      return null;
    }
  } catch (err) {
    console.error("Failed to initialize AntD Knowledge Base:", err);
    return null;
  }
})();

let cachedDefaultChain: RunnableSequence | null = null;

export async function generateAntDCode(userInput: string, modelContext?: string) {
  // We can't use cached chain if modelContext is provided, as it is dynamic context
  if (!modelContext && cachedDefaultChain) {
    return await cachedDefaultChain.invoke(userInput);
  }

  const store = await antdVectorStorePromise;
  
  // If store is available, use it as context. Otherwise use empty string.
  const contextStep = store 
    ? store.asRetriever().pipe((docs) => docs.map((d) => d.pageContent).join("\n"))
    : () => "";

  const defaultSystemPrompt = `你是一位資深的 Ant Design 5.0 專家。
    請參考以下技術文檔片段來生成代碼：
    ----------------
    {context}
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

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", defaultSystemPrompt],
    ["human", "{input}"],
  ]);

  // Construct the chain using LCEL
  const chain = RunnableSequence.from([
    {
      context: contextStep,
      input: new RunnablePassthrough(),
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  // Cache the chain only if it's the pure default one without extra context AND store loaded successfully
  if (!modelContext && store) {
    cachedDefaultChain = chain;
  }

  return await chain.invoke(userInput);
}
