import { NextRequest, NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cv_url, filename } = body;

    if (!cv_url) {
      return NextResponse.json(
        { error: 'CV URL is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get multiagent project URL from environment
    const multiagentUrl = process.env.MULTIAGENT_PROJECT_URL;
    if (!multiagentUrl) {
      return NextResponse.json(
        { error: 'Multiagent project URL not configured' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Call multiagent project to process CV
    const multiagentResponse = await fetch(`${multiagentUrl}/read-cv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cv_url,
        filename,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/candidates/update-from-ai`
      }),
    });

    if (!multiagentResponse.ok) {
      const errorText = await multiagentResponse.text();
      console.error('Multiagent project error:', errorText);
      return NextResponse.json(
        { error: 'Failed to process CV with multiagent system' },
        { status: 500, headers: corsHeaders }
      );
    }

    const result = await multiagentResponse.json();
    
    return NextResponse.json(
      {
        message: 'CV processing started successfully',
        processing_id: result.processing_id || 'unknown',
        status: 'processing'
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error in read-cv endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
