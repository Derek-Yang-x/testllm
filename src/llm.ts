import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import "dotenv/config";

let llmInstance: ChatGoogleGenerativeAI | null = null;

export const getLlm = () => {
  if (llmInstance) return llmInstance;

  llmInstance = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",//不要用Gemini 3 費用會爆炸
    apiKey: process.env.GOOGLE_API_KEY || "",
    temperature: 0,
  });
  return llmInstance;
};
