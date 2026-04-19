
'use client';

/**
 * TASK: Genkit Development Entry Point
 * Purpose: Registers all AI flows for the Genkit Developer UI.
 */

import { config } from 'dotenv';
config();

import '@/ai/flows/identify-crop-disease';
import '@/ai/flows/generate-treatment-advice';
