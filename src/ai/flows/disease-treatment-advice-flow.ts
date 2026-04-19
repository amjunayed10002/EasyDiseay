
'use server';
/**
 * @fileOverview A Digital agent that provides treatment and preventive advice for crop diseases.
 *
 * - getDiseaseTreatmentAdvice - A function that handles the generation of treatment advice.
 * - DiseaseTreatmentAdviceInput - The input type for the getDiseaseTreatmentAdvice function.
 * - DiseaseTreatmentAdviceOutput - The return type for the getDiseaseTreatmentAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiseaseTreatmentAdviceInputSchema = z.object({
  diseaseName: z.string().describe('The name of the identified crop disease.'),
  cropType: z
    .string()
    .optional()
    .describe(
      'The specific type of crop (e.g., Rice, Tomato). Optional, but enhances accuracy.'
    ),
});
export type DiseaseTreatmentAdviceInput = z.infer<
  typeof DiseaseTreatmentAdviceInputSchema
>;

const DiseaseTreatmentAdviceOutputSchema = z.object({
  treatmentAdvice: z
    .string()
    .describe('Clear, generative advice on how to treat the identified disease.'),
  preventiveMeasures: z
    .string()
    .describe('Recommendations for preventing the recurrence of the disease.'),
});
export type DiseaseTreatmentAdviceOutput = z.infer<
  typeof DiseaseTreatmentAdviceOutputSchema
>;

export async function getDiseaseTreatmentAdvice(
  input: DiseaseTreatmentAdviceInput
): Promise<DiseaseTreatmentAdviceOutput> {
  return diseaseTreatmentAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diseaseTreatmentAdvicePrompt',
  input: {schema: DiseaseTreatmentAdviceInputSchema},
  output: {schema: DiseaseTreatmentAdviceOutputSchema},
  prompt: `You are an expert agricultural advisor specializing in crop diseases.

Your task is to provide clear, actionable treatment advice and preventive measures for a specific crop disease.

Disease Name: {{{diseaseName}}}
{{#if cropType}}
Crop Type: {{{cropType}}}
{{/if}}

Provide detailed instructions for treatment and comprehensive preventive measures to avoid future outbreaks. Format your response strictly as JSON with 'treatmentAdvice' and 'preventiveMeasures' fields.`, 
});

const diseaseTreatmentAdviceFlow = ai.defineFlow(
  {
    name: 'diseaseTreatmentAdviceFlow',
    inputSchema: DiseaseTreatmentAdviceInputSchema,
    outputSchema: DiseaseTreatmentAdviceOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
