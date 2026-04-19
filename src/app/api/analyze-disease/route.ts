import { identifyCropDisease } from '@/ai/flows/identify-crop-disease';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await identifyCropDisease(body);

    return Response.json(result);
  } catch (error) {
    console.error('API ERROR:', error);

    return Response.json(
      { error: 'AI analysis failed' },
      { status: 500 }
    );
  }
}