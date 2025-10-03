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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (token) {
      const meet = await db.getMeetByToken(token);
      if (!meet) {
        return NextResponse.json({ error: 'Meet not found' }, { status: 404, headers: corsHeaders });
      }
      return NextResponse.json(meet, { headers: corsHeaders });
    }

    const meets = await db.getMeets();
    return NextResponse.json(meets, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching meets:', error);
    return NextResponse.json({ error: 'Failed to fetch meets' }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidate_id, jd_interviews_id, status = 'pending', scheduled_at } = body;

    if (!candidate_id) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400, headers: corsHeaders });
    }

    const candidate = await db.getCandidate(candidate_id);
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404, headers: corsHeaders });
    }

    const meetData: {
      candidate_id: string;
      status: 'pending' | 'active' | 'completed' | 'cancelled';
      scheduled_at?: string;
      jd_interviews_id?: string;
    } = {
      candidate_id,
      status: status as 'pending' | 'active' | 'completed' | 'cancelled',
      ...(scheduled_at && { scheduled_at }),
    };

    // Add jd_interviews_id if provided
    if (jd_interviews_id) {
      meetData.jd_interviews_id = jd_interviews_id;
    }

    const meetWithPassword = await db.createMeet(meetData);
    
    // Return meet data including the plain password for the admin
    return NextResponse.json({
      ...meetWithPassword,
      generatedPassword: meetWithPassword.password,
    }, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Error creating meet:', error);
    return NextResponse.json({ error: 'Failed to create meet' }, { status: 500, headers: corsHeaders });
  }
}