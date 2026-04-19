import { NextRequest, NextResponse } from 'next/server';
import { generateTreatmentAdvice } from '@/ai/flows/generate-treatment-advice';

export async function POST(request: NextRequest) {
  try {
    const { diseaseName, cropType, language } = await request.json();

    if (!diseaseName) {
      return NextResponse.json(
        { error: 'Disease name is required' },
        { status: 400 }
      );
    }

    const result = await generateTreatmentAdvice({
      diseaseName,
      cropType: cropType || undefined,
      language: language || 'en',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Treatment advice error:', error);
    return NextResponse.json(
      { error: 'Failed to generate treatment advice' },
      { status: 500 }
    );
  }
}