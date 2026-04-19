import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

console.log("🔥 Genkit file loaded");

// Get API key from environment variables (works for both local and Vercel deployment)
const apiKey = process.env.GEMINI_API_KEY;

console.log("🔑 GEMINI KEY STATUS:", apiKey ? "FOUND" : "MISSING");
console.log("🌍 Environment:", process.env.NODE_ENV || "development");

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is not set!");
  console.error("📝 For local development: Add to .env.local");
  console.error("🚀 For Vercel deployment: Add to Vercel environment variables");
  console.error("🔗 Get your key from: https://makersuite.google.com/app/apikey");
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey!,
    }),
  ],
  model: 'googleai/gemini-1.5-flash',
});