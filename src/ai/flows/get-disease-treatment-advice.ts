
'use server';
/**
 * @fileOverview A Digital agent that provides treatment and preventive advice for crop diseases.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiseaseTreatmentAdviceInputSchema = z.object({
  diseaseName: z.string().describe('The name of the identified crop disease.'),
  cropType: z
    .string()
    .optional()
    .describe(
      'The specific type of crop.'
    ),
  language: z.string().optional().describe('The language in which to provide the advice.'),
});
export type DiseaseTreatmentAdviceInput = z.infer<
  typeof DiseaseTreatmentAdviceInputSchema
>;

const DiseaseTreatmentAdviceOutputSchema = z.object({
  diseaseName: z.string().describe('The identified disease name.'),
  severity: z.enum(['Low', 'Medium', 'High']).describe('Severity level of the disease.'),
  howItHappens: z.string().describe('Explanation of how the disease spreads or occurs.'),
  whyItHappens: z.string().describe('Environmental or biological conditions that lead to the disease.'),
  recoverySolution: z.string().describe('Actionable steps to treat and recover the crop.'),
  medicines: z.string().describe('Recommended chemicals, fertilizers, or organic treatments.'),
  summary: z.string().describe('A concise 2-3 sentence summary of the diagnosis.'),
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

Your task is to provide a detailed technical report for the following identified disease:

Disease Name: {{{diseaseName}}}
{{#if cropType}}
Crop Type: {{{cropType}}}
{{/if}}

Respond in the following language: {{{language}}}. If no language is specified, use English.

Please provide:
1. diseaseName: The confirmed name.
2. severity: Choose from Low, Medium, or High.
3. howItHappens: Spread mechanism.
4. whyItHappens: Causes.
5. recoverySolution: Immediate steps.
6. medicines: Specific treatments.
7. summary: Professional summary.

Format your response strictly as JSON.`, 
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
