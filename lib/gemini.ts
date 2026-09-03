import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";

export const googleAI = new GoogleGenAI({
  apiKey: apiKey !== "mock_gemini_key" && apiKey ? apiKey : "demo-api-key",
});

export const MODEL_QUESTION_GEN = "gemini-2.5-flash";
export const MODEL_EVALUATION = "gemini-2.5-pro";
