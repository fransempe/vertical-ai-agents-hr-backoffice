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

export async function GET() {
  try {
    const agents = await db.getAgents();
    return NextResponse.json(agents, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_id, name, tech_stack, description, status = 'active' } = body;

    // Validate required fields
    if (!agent_id || !name || !tech_stack) {
      return NextResponse.json(
        { error: 'Agent ID, name, and tech stack are required' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if agent_id already exists
    const existingAgent = await db.getAgentByAgentId(agent_id);
    if (existingAgent) {
      return NextResponse.json(
        { error: 'Agent ID already exists' }, 
        { status: 409, headers: corsHeaders }
      );
    }

    // Validate status
    if (status && !['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either "active" or "inactive"' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    const agent = await db.createAgent({
      agent_id,
      name,
      tech_stack,
      description: description || '',
      status,
    });

    return NextResponse.json(agent, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create agent' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}
