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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agent = await db.getAgent(id);
    
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' }, 
        { status: 404, headers: corsHeaders }
      );
    }
    
    return NextResponse.json(agent, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { agent_id, name, tech_stack, description, status } = body;

    // Check if agent exists
    const existingAgent = await db.getAgent(id);
    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' }, 
        { status: 404, headers: corsHeaders }
      );
    }

    // If updating agent_id, check if it already exists (but not for the current agent)
    if (agent_id && agent_id !== existingAgent.agent_id) {
      const agentWithSameId = await db.getAgentByAgentId(agent_id);
      if (agentWithSameId && agentWithSameId.id !== id) {
        return NextResponse.json(
          { error: 'Agent ID already exists' }, 
          { status: 409, headers: corsHeaders }
        );
      }
    }

    // Validate status if provided
    if (status && !['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either "active" or "inactive"' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    const updateData: any = {};
    if (agent_id !== undefined) updateData.agent_id = agent_id;
    if (name !== undefined) updateData.name = name;
    if (tech_stack !== undefined) updateData.tech_stack = tech_stack;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    const updatedAgent = await db.updateAgent(id, updateData);
    return NextResponse.json(updatedAgent, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update agent' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if agent exists
    const existingAgent = await db.getAgent(id);
    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' }, 
        { status: 404, headers: corsHeaders }
      );
    }

    const success = await db.deleteAgent(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete agent' }, 
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { message: 'Agent deleted successfully' }, 
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete agent' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}
