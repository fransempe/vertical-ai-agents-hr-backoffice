import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the API URL from environment variable
    const multiagentUrl = process.env.MULTIAGENT_PROJECT_URL;
    
    if (!multiagentUrl) {
      return NextResponse.json(
        { error: 'MULTIAGENT_PROJECT_URL not configured' },
        { status: 500 }
      );
    }

    // Get request body
    const body = await request.json();
    const { meet_id } = body;

    if (!meet_id) {
      return NextResponse.json(
        { error: 'meet_id is required' },
        { status: 400 }
      );
    }

    // Call the external API endpoint in the background (fire and forget)
    // We don't wait for the response to return quickly to the client
    fetch(`${multiagentUrl}/evaluate-meet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ meet_id }),
    }).catch((error) => {
      // Log error but don't block the response
      console.error('Error calling evaluate-meet API (background):', error);
    });

    // Return immediately without waiting for the external API response
    return NextResponse.json({ 
      message: 'Evaluation started in background',
      meet_id 
    }, { status: 202 });

  } catch (error) {
    console.error('Error initiating evaluation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate evaluation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

