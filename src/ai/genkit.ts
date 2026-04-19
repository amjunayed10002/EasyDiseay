import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// DEBUG (only for checking in dev / Vercel logs)
console.log("GEMINI KEY:", process.env.GEMINI_API_KEY ? "FOUND ✅" : "MISSING ❌");

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY!,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});