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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meetId, email, password } = body;

    // Validate required fields
    if (!meetId || !email || !password) {
      return NextResponse.json(
        { error: 'Meet ID, email, and password are required' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // Get the meet
    const meet = await db.getMeet(meetId);
    if (!meet) {
      return NextResponse.json(
        { error: 'Interview not found' }, 
        { status: 404, headers: corsHeaders }
      );
    }

    // Get candidate information
    const candidate = await db.getCandidate(meet.candidate_id);
    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' }, 
        { status: 404, headers: corsHeaders }
      );
    }

    // Verify email matches the candidate's email
    if (candidate.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify password (direct comparison since password is stored in plain text)
    if (password !== meet.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401, headers: corsHeaders }
      );
    }

    // Authentication successful
    return NextResponse.json(
      {
        success: true,
        meet: {
          id: meet.id,
          token: meet.token,
          link: meet.link,
          status: meet.status,
          scheduled_at: meet.scheduled_at,
        },
        candidate: {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error authenticating meet:', error);
    return NextResponse.json(
      { error: 'Authentication failed' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}