import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the multiagent project URL from environment variable
    const multiagentUrl = process.env.MULTIAGENT_PROJECT_URL;
    
    if (!multiagentUrl) {
      return NextResponse.json(
        { error: 'Multiagent project URL not configured' },
        { status: 500 }
      );
    }

    // Get request body if any
    const body = await request.json().catch(() => ({}));

    // Call the multiagent project /analyze endpoint
    const response = await fetch(`${multiagentUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Multiagent API responded with status: ${response.status}`);
    }

    const result = await response.json();

    // Return the result from the multiagent project
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error calling multiagent API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to execute analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
