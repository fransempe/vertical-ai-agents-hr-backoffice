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
    const { token } = body;

    // Validate required fields
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // Get the meet by token
    const meet = await db.getMeetByToken(token);
    if (!meet) {
      return NextResponse.json(
        { error: 'Invalid token - Interview not found' }, 
        { status: 404, headers: corsHeaders }
      );
    }

    // Validate meet status
    if (meet.status === 'completed') {
      return NextResponse.json(
        { error: 'This interview has already been completed' }, 
        { status: 400, headers: corsHeaders }
      );
    }
    
    if (meet.status === 'cancelled') {
      return NextResponse.json(
        { error: 'This interview has been cancelled' }, 
        { status: 400, headers: corsHeaders }
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

    // Update meet status to active if it's still pending
    let updatedMeet = meet;
    if (meet.status === 'pending') {
      updatedMeet = await db.updateMeet(meet.id, { status: 'active' });
    }

    // Authentication successful
    return NextResponse.json(
      {
        success: true,
        message: 'Token authentication successful',
        meet: {
          id: updatedMeet.id,
          token: updatedMeet.token,
          link: updatedMeet.link,
          status: updatedMeet.status,
          scheduled_at: updatedMeet.scheduled_at,
          password: updatedMeet.password,
        },
        candidate: {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error authenticating with token:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Token authentication failed' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET method for token validation without authentication
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token parameter is required' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // Get the meet by token (just validation, no authentication)
    const meet = await db.getMeetByToken(token);
    if (!meet) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Invalid token - Interview not found' 
        }, 
        { status: 404, headers: corsHeaders }
      );
    }

    // Check if token is valid for use
    const isValid = meet.status !== 'completed' && meet.status !== 'cancelled';

    return NextResponse.json(
      {
        valid: isValid,
        status: meet.status,
        message: isValid 
          ? 'Token is valid and ready for authentication' 
          : `Token is not usable - Interview is ${meet.status}`,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: error instanceof Error ? error.message : 'Token validation failed' 
      }, 
      { status: 500, headers: corsHeaders }
    );
  }
}
