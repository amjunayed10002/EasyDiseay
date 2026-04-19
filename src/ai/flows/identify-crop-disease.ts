
'use server';

/**
 * TASK: Crop Disease Identification
 * Purpose: Uses Gemini vision models to analyze crop photos and identify 
 * symptoms, disease names, and diagnostic confidence.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyCropDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the crop, as a data URI that must include a MIME type and use Base64 encoding."
    ),
  cropType: z
    .string()
    .optional()
    .describe(
      'The specific type of crop (e.g., Rice, Tomato, Wheat) to aid in identification.'
    ),
  language: z.string().optional().describe('The language in which to provide the analysis.'),
});
export type IdentifyCropDiseaseInput = z.infer<typeof IdentifyCropDiseaseInputSchema>;

const IdentifyCropDiseaseOutputSchema = z.object({
  isDiseased: z.boolean().describe('Whether a disease was detected in the crop image.'),
  diseaseName: z.string().nullable().describe('The name of the identified disease.'),
  symptoms: z.string().nullable().describe('A description of the symptoms observed.'),
  confidenceScore: z.number().min(0).max(1).nullable().describe('Confidence score (0-1).'),
  diagnosticNotes: z.string().optional().describe('Additional reasoning from the expert.'),
});
export type IdentifyCropDiseaseOutput = z.infer<typeof IdentifyCropDiseaseOutputSchema>;

export async function identifyCropDisease(input: IdentifyCropDiseaseInput): Promise<IdentifyCropDiseaseOutput> {
  return identifyCropDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyCropDiseasePrompt',
  input: {schema: IdentifyCropDiseaseInputSchema},
  output: {schema: IdentifyCropDiseaseOutputSchema},
  prompt: `You are an expert agricultural Digital specialist.
Analyze the provided image to identify potential diseases.
{{#if cropType}}Crop Type: {{{cropType}}}.{{/if}}
Language: {{{language}}}.

Photo: {{media url=photoDataUri}}`,
  model: 'googleai/gemini-2.5-flash',
});

const identifyCropDiseaseFlow = ai.defineFlow(
  {
    name: 'identifyCropDiseaseFlow',
    inputSchema: IdentifyCropDiseaseInputSchema,
    outputSchema: IdentifyCropDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
