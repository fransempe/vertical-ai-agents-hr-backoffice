import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const meet = await db.getMeetByToken(token);
    if (!meet) {
      return NextResponse.json({ error: 'Meet not found' }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json(meet, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching meet by token:', error);
    return NextResponse.json({ error: 'Failed to fetch meet' }, { status: 500, headers: corsHeaders });
  }
}