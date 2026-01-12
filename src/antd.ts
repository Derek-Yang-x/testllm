import "dotenv/config";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

import { RecursiveCharacterTextSplitter } from "@langchain/classic/text_splitter";

import { Document } from "@langchain/core/documents";

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

export async function generateAntDCode(userInput: string, customSystemPrompt?: string) {
  // 1. 使用 loadDocsFromUrl 加載與切分文檔 (RAG 準備)
  const url = "https://ant.design/llms-full.txt";
  const retriever = (await loadPlainTextUrl(url)).asRetriever();

  // 3. 設定 System Prompt
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

  // 4. 初始化模型
  // 4. 初始化模型
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_API_KEY || "",
    temperature: 0,
  });

  // 5. 檢索並生成 (簡單工作流)
  const relevantDocs = await retriever.invoke(userInput);
  const context = relevantDocs.map(d => d.pageContent).join("\n");
  
  const chain = prompt.pipe(model);
  const response = await chain.invoke({
    context: context,
    input: userInput
  });

  return response.content;
}