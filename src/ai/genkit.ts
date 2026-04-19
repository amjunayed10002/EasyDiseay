import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

console.log("🔥 Genkit file loaded");

const apiKey = process.env.GEMINI_API_KEY;

console.log("🔑 GEMINI KEY STATUS:", apiKey ? "FOUND" : "MISSING");

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey!,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});