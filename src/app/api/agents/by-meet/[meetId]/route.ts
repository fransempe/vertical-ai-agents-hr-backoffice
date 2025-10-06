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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ meetId: string }> }
) {
  try {
    const { meetId } = await params;

    if (!meetId) {
      return NextResponse.json(
        { error: 'Meet ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1. Get the meet to find jd_interviews_id
    const meet = await db.getMeet(meetId);
    if (!meet) {
      return NextResponse.json(
        { error: 'Meet not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    if (!meet.jd_interviews_id) {
      return NextResponse.json(
        { error: 'Meet has no associated JD interview' },
        { status: 404, headers: corsHeaders }
      );
    }

    // 2. Get the JD interview to find agent_id
    const jdInterview = await db.getJdInterview(meet.jd_interviews_id);
    if (!jdInterview) {
      return NextResponse.json(
        { error: 'JD interview not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // 3. Get the agent by agent_id
    const agent = await db.getAgentByAgentId(jdInterview.agent_id);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(agent, { headers: corsHeaders });
  } catch (error) {
    console.error('Error getting agent by meet ID:', error);
    return NextResponse.json(
      { error: 'Failed to get agent' },
      { status: 500, headers: corsHeaders }
    );
  }
}
