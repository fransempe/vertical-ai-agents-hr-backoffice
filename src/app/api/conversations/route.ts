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
    const meetId = searchParams.get('meet_id');
    const candidateId = searchParams.get('candidate_id');

    if (meetId) {
      const conversations = await db.getConversationsByMeetId(meetId);
      return NextResponse.json(conversations, { headers: corsHeaders });
    }

    if (candidateId) {
      const conversations = await db.getConversationsByCandidateId(candidateId);
      return NextResponse.json(conversations, { headers: corsHeaders });
    }

    const conversations = await db.getConversations();
    return NextResponse.json(conversations, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meet_id, candidate_id, conversation_data } = body;

    if (!meet_id || !candidate_id || !conversation_data) {
      return NextResponse.json({ 
        error: 'Meet ID, candidate ID, and conversation data are required' 
      }, { status: 400, headers: corsHeaders });
    }

    // Validate that the meet exists
    const meet = await db.getMeet(meet_id);
    if (!meet) {
      return NextResponse.json({ error: 'Meet not found' }, { status: 404, headers: corsHeaders });
    }

    // Validate that the candidate exists
    const candidate = await db.getCandidate(candidate_id);
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404, headers: corsHeaders });
    }

    // Validate that the candidate is associated with the meet
    if (meet.candidate_id !== candidate_id) {
      return NextResponse.json({ 
        error: 'Candidate is not associated with this meet' 
      }, { status: 400, headers: corsHeaders });
    }

    const conversation = await db.createConversation({
      meet_id,
      candidate_id,
      conversation_data,
    });

    // Trigger evaluation in background (fire and forget)
    // Call the evaluate-meet endpoint without waiting for response
    console.log('Triggering meet evaluation in background...');
    fetch(`${process.env.MULTIAGENT_PROJECT_URL}/evaluate-meet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ meet_id }),
    }).then((response) => {
      console.log('Meet evaluation triggered successfully:', response);
    }).catch((error) => {
      // Log error but don't block the response
      console.error('Error triggering meet evaluation (background):', error);
    });

    return NextResponse.json(conversation, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500, headers: corsHeaders });
  }
}