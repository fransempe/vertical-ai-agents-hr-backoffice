import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest) {
  try {
    const meetsByJdInterviews = await db.getMeetsByJdInterviews();
    
    return NextResponse.json(meetsByJdInterviews, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching meets by JD interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meets by JD interviews' },
      { status: 500, headers: corsHeaders }
    );
  }
}
