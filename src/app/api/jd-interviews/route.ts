import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET() {
  try {
    const jdInterviews = await db.getJdInterviews();
    return NextResponse.json(jdInterviews, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching JD interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch JD interviews', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}
