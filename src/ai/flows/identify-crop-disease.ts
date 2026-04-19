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
          text: `You are an expert agricultural disease specialist and plant pathologist. 
          
TASK: Carefully analyze the provided crop image to identify any diseases or health issues.

${input.cropType ? `Crop Type: ${input.cropType}` : 'Analyze the crop type visible in the image'}
Language: ${input.language || 'English'}

ANALYSIS INSTRUCTIONS:
1. Examine the image CAREFULLY for ANY signs of disease, pests, nutrient deficiency, or health problems
2. Look for discoloration, spots, lesions, wilting, yellowing, brown patches, moldy growth, or any abnormalities
3. Be thorough and DO NOT assume the crop is healthy without clear evidence
4. Provide honest assessment - if there ARE problems, identify them clearly

RESPOND WITH A JSON OBJECT matching this exact structure:
{
  "isDiseased": true/false,
  "diseaseName": "name of disease or null if healthy",
  "symptoms": "visible symptoms or null",
  "confidenceScore": 0.0-1.0,
  "diagnosticNotes": "detailed observations"
}

Be accurate and thorough in your analysis.`
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