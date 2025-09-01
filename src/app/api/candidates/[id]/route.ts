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
    const candidate = await db.getCandidate(id);
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json(candidate, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    return NextResponse.json({ error: 'Failed to fetch candidate' }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400, headers: corsHeaders });
    }

    const candidate = await db.updateCandidate(id, { name, email, phone });
    return NextResponse.json(candidate, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating candidate:', error);
    return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await db.deleteCandidate(id);
    if (!success) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json({ message: 'Candidate deleted successfully' }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    return NextResponse.json({ error: 'Failed to delete candidate' }, { status: 500, headers: corsHeaders });
  }
}