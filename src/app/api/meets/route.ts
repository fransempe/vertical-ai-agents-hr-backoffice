import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { createClient } from '@supabase/supabase-js';

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
    const candidateId = searchParams.get('candidate_id');
    const jdInterviewId = searchParams.get('jd_interview_id');

    if (token) {
      const meet = await db.getMeetByToken(token);
      if (!meet) {
        return NextResponse.json({ error: 'Meet not found' }, { status: 404, headers: corsHeaders });
      }
      return NextResponse.json(meet, { headers: corsHeaders });
    }

    // If candidate_id is provided, filter meets by candidate
    if (candidateId && jdInterviewId) {
      const meets = await db.getMeets();
      const candidateMeets = meets.filter(meet => meet.candidate_id === candidateId && meet.jd_interviews_id === jdInterviewId);
      return NextResponse.json(candidateMeets, { headers: corsHeaders });
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

    if (!jd_interviews_id) {
      return NextResponse.json({ error: 'JD Interview ID is required' }, { status: 400, headers: corsHeaders });
    }

    const candidate = await db.getCandidate(candidate_id);
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404, headers: corsHeaders });
    }

    // Check if there's already a meet with the same candidate_id and jd_interviews_id
    // Exclude cancelled meets from the check - query directly from database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: existingMeets, error: checkError } = await supabase
        .from('meets')
        .select('id, status')
        .eq('candidate_id', candidate_id)
        .eq('jd_interview_id', jd_interviews_id)
        .neq('status', 'cancelled');

      if (!checkError && existingMeets && existingMeets.length > 0) {
        return NextResponse.json(
          { 
            error: 'Ya existe una entrevista programada para este candidato en esta búsqueda. No se puede duplicar.'
          },
          { status: 409, headers: corsHeaders }
        );
      }
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