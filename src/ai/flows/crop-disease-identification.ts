
'use server';
/**
 * @fileOverview A Digital agent for identifying crop diseases from images.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const CropDiseaseIdentificationInputSchema = z.object({
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
export type CropDiseaseIdentificationInput = z.infer<
  typeof CropDiseaseIdentificationInputSchema
>;

// Output Schema
const CropDiseaseIdentificationOutputSchema = z.object({
  isDiseased: z
    .boolean()
    .describe('Whether a disease was detected in the crop image.'),
  diseaseName: z
    .string()
    .nullable()
    .describe(
      'The name of the identified disease. Null if no disease is detected.'
    ),
  symptoms: z
    .string()
    .nullable()
    .describe(
      'A description of the symptoms observed in the crop.'
    ),
  confidenceScore: z
    .number()
    .min(0)
    .max(1)
    .nullable()
    .describe(
      'A confidence score (0-1) for the disease identification.'
    ),
  diagnosticNotes: z
    .string()
    .optional()
    .describe(
      'Any additional notes or reasoning from the Digital expert regarding the diagnosis.'
    ),
});
export type CropDiseaseIdentificationOutput = z.infer<
  typeof CropDiseaseIdentificationOutputSchema
>;

// Wrapper function
export async function cropDiseaseIdentification(
  input: CropDiseaseIdentificationInput
): Promise<CropDiseaseIdentificationOutput> {
  return cropDiseaseIdentificationFlow(input);
}

// Prompt definition
const cropDiseaseIdentificationPrompt = ai.definePrompt({
  name: 'cropDiseaseIdentificationPrompt',
  input: {schema: CropDiseaseIdentificationInputSchema},
  output: {schema: CropDiseaseIdentificationOutputSchema},
  prompt: `You are an expert agricultural Digital specialist, specializing in identifying crop diseases from images.

Analyze the provided image of a crop to identify any potential diseases.
{{#if cropType}}Consider that the crop type is: {{{cropType}}}.{{/if}}

Respond in the following language: {{{language}}}. If no language is specified, use English.

Based on your analysis, provide the following information:
1. isDiseased: Boolean.
2. diseaseName: String (or null).
3. symptoms: String (or null).
4. confidenceScore: Number (0-1).
5. diagnosticNotes: String (optional).

Photo: {{media url=photoDataUri}}`,
  model: 'googleai/gemini-2.5-flash',
});

// Flow definition
const cropDiseaseIdentificationFlow = ai.defineFlow(
  {
    name: 'cropDiseaseIdentificationFlow',
    inputSchema: CropDiseaseIdentificationInputSchema,
    outputSchema: CropDiseaseIdentificationOutputSchema,
  },
  async input => {
    const {output} = await cropDiseaseIdentificationPrompt(input);
    return output!;
  }
);
