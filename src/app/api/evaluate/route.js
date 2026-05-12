import { ZenEngine } from '@gorules/zen-engine';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { context, content } = body;

    const engine = new ZenEngine();

    if (!content) {
      return NextResponse.json(
        { error: 'Graph content is required' },
        { status: 400 },
      );
    }

    const result = await engine.evaluate(content, context || {}, {
      trace: true,
    });

    // Clean up the engine instance
    engine.dispose();

    return NextResponse.json(result);
  } catch (error) {
    // console.error('Evaluate API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
