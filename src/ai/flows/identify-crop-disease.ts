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

const identifyCropDiseaseFlow = ai.defineFlow(
  {
    name: 'identifyCropDiseaseFlow',
    inputSchema: IdentifyCropDiseaseInputSchema,
    outputSchema: IdentifyCropDiseaseOutputSchema,
  },
  async (input) => {
    // Parse data URI
    const dataUriMatch = input.photoDataUri.match(/^data:([^;]+);base64,(.+)$/);
    if (!dataUriMatch) {
      throw new Error('Invalid data URI format');
    }

    const contentType = dataUriMatch[1];
    const base64Data = dataUriMatch[2];

    const result = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        {
          text: `You are an expert agricultural specialist. Analyze this crop image and identify if it's diseased. Provide a detailed analysis in ${input.language || 'English'}.${input.cropType ? ` The crop type is: ${input.cropType}` : ''}`
        },
        {
          media: {
            contentType,
            data: base64Data,
          }
        }
      ],
      output: {
        schema: IdentifyCropDiseaseOutputSchema,
      },
    });

    return result.output() ?? {
      isDiseased: false,
      diseaseName: null,
      symptoms: null,
      confidenceScore: null,
      diagnosticNotes: "No result returned from AI",
    };
  }
);