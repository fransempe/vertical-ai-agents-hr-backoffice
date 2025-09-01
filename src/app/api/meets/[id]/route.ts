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
    const meet = await db.getMeet(id);
    if (!meet) {
      return NextResponse.json({ error: 'Meet not found' }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json(meet, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching meet:', error);
    return NextResponse.json({ error: 'Failed to fetch meet' }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, scheduled_at } = body;

    const meet = await db.updateMeet(id, { status, scheduled_at });
    return NextResponse.json(meet, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating meet:', error);
    return NextResponse.json({ error: 'Failed to update meet' }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await db.deleteMeet(id);
    if (!success) {
      return NextResponse.json({ error: 'Meet not found' }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json({ message: 'Meet deleted successfully' }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting meet:', error);
    return NextResponse.json({ error: 'Failed to delete meet' }, { status: 500, headers: corsHeaders });
  }
}