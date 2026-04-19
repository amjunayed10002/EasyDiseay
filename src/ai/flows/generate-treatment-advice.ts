
'use server';

/**
 * TASK: Disease Treatment Advice Generation
 * Purpose: Provides structured technical reports including severity levels, 
 * recovery steps, and recommended medicines for specific crop diseases.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTreatmentAdviceInputSchema = z.object({
  diseaseName: z.string().describe('The name of the identified crop disease.'),
  cropType: z.string().optional().describe('The specific type of crop.'),
  language: z.string().optional().describe('The language in which to provide the advice.'),
});
export type GenerateTreatmentAdviceInput = z.infer<typeof GenerateTreatmentAdviceInputSchema>;

const GenerateTreatmentAdviceOutputSchema = z.object({
  diseaseName: z.string().describe('The identified disease name.'),
  severity: z.enum(['Low', 'Medium', 'High']).describe('Severity level.'),
  howItHappens: z.string().describe('Spread mechanism.'),
  whyItHappens: z.string().describe('Biological/environmental causes.'),
  recoverySolution: z.string().describe('Immediate recovery steps.'),
  medicines: z.string().describe('Recommended treatments/pesticides.'),
  summary: z.string().describe('Professional concise summary.'),
});
export type GenerateTreatmentAdviceOutput = z.infer<typeof GenerateTreatmentAdviceOutputSchema>;

export async function generateTreatmentAdvice(input: GenerateTreatmentAdviceInput): Promise<GenerateTreatmentAdviceOutput> {
  return generateTreatmentAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTreatmentAdvicePrompt',
  input: {schema: GenerateTreatmentAdviceInputSchema},
  output: {schema: GenerateTreatmentAdviceOutputSchema},
  prompt: `You are an expert agricultural advisor. 
Provide a detailed technical recovery report for:
Disease: {{{diseaseName}}}
{{#if cropType}}Crop: {{{cropType}}}{{/if}}
Language: {{{language}}}

Format as JSON.`, 
});

const generateTreatmentAdviceFlow = ai.defineFlow(
  {
    name: 'generateTreatmentAdviceFlow',
    inputSchema: GenerateTreatmentAdviceInputSchema,
    outputSchema: GenerateTreatmentAdviceOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
