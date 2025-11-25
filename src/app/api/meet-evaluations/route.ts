import { NextRequest, NextResponse } from 'next/server';
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
    const candidateId = searchParams.get('candidate_id');
    const jdInterviewId = searchParams.get('jd_interview_id');

    if (!candidateId || !jdInterviewId) {
      return NextResponse.json(
        { error: 'candidate_id and jd_interview_id are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration is missing' },
        { status: 500, headers: corsHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Query meet_evaluations directly by candidate_id and jd_interview_id
    const { data: evaluation, error: evaluationError } = await supabase
      .from('meet_evaluations')
      .select('*')
      .eq('candidate_id', candidateId)
      .eq('jd_interview_id', jdInterviewId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (evaluationError) {
      // If no row found, return null instead of error
      if (evaluationError.code === 'PGRST116') {
        return NextResponse.json(
          { evaluation: null, message: 'No evaluation found for this candidate and JD interview' },
          { status: 200, headers: corsHeaders }
        );
      }
      console.error('Error fetching meet evaluation:', evaluationError);
      return NextResponse.json(
        { error: 'Failed to fetch meet evaluation', details: evaluationError.message },
        { status: 500, headers: corsHeaders }
      );
    }

    // Return the evaluation
    return NextResponse.json(
      { evaluation },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error fetching meet evaluations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meet evaluations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

