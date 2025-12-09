import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST() {
  try {
    const multiagentUrl = process.env.MULTIAGENT_PROJECT_URL;
    
    if (!multiagentUrl) {
      return NextResponse.json(
        { error: 'MULTIAGENT_PROJECT_URL not configured' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Call the multiagent project API
    const response = await fetch(`${multiagentUrl}/match-candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Multiagent API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to process AI matching', details: errorText },
        { status: response.status, headers: corsHeaders }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: 200, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Error in match-candidates endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
