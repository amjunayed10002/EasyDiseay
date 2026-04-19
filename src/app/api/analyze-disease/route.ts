import { NextRequest, NextResponse } from 'next/server';
import { identifyCropDisease } from '@/ai/flows/identify-crop-disease';

export async function POST(request: NextRequest) {
  try {
    const { photoDataUri, cropType, language } = await request.json();

    if (!photoDataUri) {
      return NextResponse.json(
        { error: 'Photo data is required' },
        { status: 400 }
      );
    }

    const result = await identifyCropDisease({
      photoDataUri,
      cropType: cropType || undefined,
      language: language || 'en',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Disease analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze disease' },
      { status: 500 }
    );
  }
}