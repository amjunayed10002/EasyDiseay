'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IdentifyCropDiseaseInputSchema = z.object({
  photoDataUri: z.string(),
  cropType: z.string().optional(),
  language: z.string().optional(),
});

const IdentifyCropDiseaseOutputSchema = z.object({
  isDiseased: z.boolean(),
  diseaseName: z.string().nullable(),
  symptoms: z.string().nullable(),
  confidenceScore: z.number().nullable(),
  diagnosticNotes: z.string().optional(),
});

export async function identifyCropDisease(input: any) {
  try {
    const result = await identifyCropDiseaseFlow(input);
    return result;
  } catch (error) {
    console.error("❌ AI FLOW ERROR:", error);
    throw new Error("AI analysis failed");
  }
}

const prompt = ai.definePrompt({
  name: 'identifyCropDiseasePrompt',
  input: { schema: IdentifyCropDiseaseInputSchema },
  output: { schema: IdentifyCropDiseaseOutputSchema },
  prompt: `
You are an expert agricultural specialist.

Analyze crop image and identify disease.

Crop Type: {{cropType}}
Language: {{language}}

Image: {{media url=photoDataUri}}
`,
  model: 'googleai/gemini-2.5-flash',
});

const identifyCropDiseaseFlow = ai.defineFlow(
  {
    name: 'identifyCropDiseaseFlow',
    inputSchema: IdentifyCropDiseaseInputSchema,
    outputSchema: IdentifyCropDiseaseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output ?? {
      isDiseased: false,
      diseaseName: null,
      symptoms: null,
      confidenceScore: null,
      diagnosticNotes: "No result returned from AI",
    };
  }
);