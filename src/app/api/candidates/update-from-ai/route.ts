import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const { candidate_id, name, email, phone, tech_stack } = body;

    if (!candidate_id) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify candidate exists
    const existingCandidate = await db.getCandidate(candidate_id);
    if (!existingCandidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Prepare update data
    const updateData: {
      name?: string;
      email?: string;
      phone?: string;
      tech_stack?: string[];
    } = {};
    
    if (name && name !== existingCandidate.name) {
      updateData.name = name;
    }
    
    if (email && email !== existingCandidate.email) {
      updateData.email = email;
    }
    
    if (phone && phone !== existingCandidate.phone) {
      updateData.phone = phone;
    }
    
    if (tech_stack && Array.isArray(tech_stack)) {
      updateData.tech_stack = tech_stack;
    }

    // Update candidate
    const updatedCandidate = await db.updateCandidate(candidate_id, updateData);
    
    return NextResponse.json(
      {
        message: 'Candidate updated successfully',
        candidate: updatedCandidate,
        updated_fields: Object.keys(updateData)
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error updating candidate from AI:', error);
    return NextResponse.json(
      { error: 'Failed to update candidate' },
      { status: 500, headers: corsHeaders }
    );
  }
}
