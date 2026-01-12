import "dotenv/config";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

import { RecursiveCharacterTextSplitter } from "@langchain/classic/text_splitter";

import { Document } from "@langchain/core/documents";
import fs from 'fs/promises';
import path from 'path';

async function loadPlainTextUrl(url: string) {
  const response = await fetch(url);
  const text = await response.text();

  // 將純文字包裝成 LangChain 的 Document 物件
  const doc = new Document({ pageContent: text, metadata: { source: url } });

  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
  const splitDocs = await splitter.splitDocuments([doc]);

  return await MemoryVectorStore.fromDocuments(splitDocs, new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY || "",
  }));
}

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY || "",
  temperature: 0,
});

// Initialize the knowledge base immediately (this may take a few seconds on startup)
const antdVectorStorePromise = (async () => {
  console.log("Initializing AntD Knowledge Base...");
  try {
    const url = "https://ant.design/llms-full.txt";
    const store = await loadPlainTextUrl(url);
    console.log("AntD Knowledge Base Ready.");
    return store;
  } catch (err) {
    console.error("Failed to initialize AntD Knowledge Base:", err);
    throw err;
  }
})();

let cachedDefaultChain: RunnableSequence | null = null;

export async function generateAntDCode(userInput: string, customSystemPrompt?: string) {
  // If no custom system prompt is provided, try to use the cached chain
  if (!customSystemPrompt && cachedDefaultChain) {
    return await cachedDefaultChain.invoke(userInput);
  }

  const retriever = (await antdVectorStorePromise).asRetriever();

  const defaultSystemPrompt = `你是一位資深的 Ant Design 5.0 專家。
    請參考以下技術文檔片段來生成代碼：
    ----------------
    {context}
    ----------------
    要求：
    - 使用 React Functional Components 和 TypeScript。
    - 優先使用 ProComponents。
    - 只輸出代碼塊，不要解釋。`;

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", customSystemPrompt || defaultSystemPrompt],
    ["human", "{input}"],
  ]);

  // Construct the chain using LCEL
  const chain = RunnableSequence.from([
    {
      context: retriever.pipe((docs) => docs.map((d) => d.pageContent).join("\n")),
      input: new RunnablePassthrough(),
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  // Cache the chain if it's the default one
  if (!customSystemPrompt) {
    cachedDefaultChain = chain;
  }

  return await chain.invoke(userInput);
}

export async function saveCodeToFile(code: string, filename: string) {
  // Strip markdown code blocks if present
  let content = code;
  const codeBlockRegex = /```(?:typescript|tsx|jsx|js)?\n([\s\S]*?)```/;
  const match = code.match(codeBlockRegex);
  if (match) {
    content = match[1] || "";
  }

  const dir = path.dirname(filename);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filename, content);
  console.log(`Code saved to ${filename}`);
  return filename;
}