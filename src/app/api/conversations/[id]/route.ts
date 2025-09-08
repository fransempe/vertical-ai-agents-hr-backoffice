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
    const conversation = await db.getConversation(id);
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(conversation, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { conversation_data } = body;

    if (!conversation_data) {
      return NextResponse.json({ 
        error: 'Conversation data is required' 
      }, { status: 400, headers: corsHeaders });
    }

    // Check if conversation exists
    const existingConversation = await db.getConversation(id);
    if (!existingConversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404, headers: corsHeaders });
    }

    const updatedConversation = await db.updateConversation(id, {
      conversation_data,
    });

    return NextResponse.json(updatedConversation, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if conversation exists
    const existingConversation = await db.getConversation(id);
    if (!existingConversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404, headers: corsHeaders });
    }

    const success = await db.deleteConversation(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ message: 'Conversation deleted successfully' }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500, headers: corsHeaders });
  }
}