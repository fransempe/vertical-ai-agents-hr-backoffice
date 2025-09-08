import { NextRequest, NextResponse } from 'next/server';
import { Candidate, db } from '@/lib/database';

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

interface CandidateData {
  name: string;
  email: string;
  phone?: string;
}

function parseCSV(csvContent: string): CandidateData[] {
  const lines = csvContent.trim().split('\n');
  const candidates: CandidateData[] = [];
  
  // Skip header line if it exists
  const startIndex = lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('email') ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
    
    if (columns.length >= 2) {
      const candidate: CandidateData = {
        name: columns[0],
        email: columns[1],
      };
      
      if (columns.length >= 3 && columns[2]) {
        candidate.phone = columns[2];
      }
      
      candidates.push(candidate);
    }
  }
  
  return candidates;
}

function parseTXT(txtContent: string): CandidateData[] {
  const lines = txtContent.trim().split('\n');
  const candidates: CandidateData[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Support different formats:
    // Format 1: "Name <email@domain.com> phone"
    // Format 2: "Name,email@domain.com,phone"
    // Format 3: "Name email@domain.com phone"
    
    if (trimmedLine.includes(',')) {
      // CSV-like format
      const parts = trimmedLine.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        const candidate: CandidateData = {
          name: parts[0],
          email: parts[1],
        };
        if (parts.length >= 3 && parts[2]) {
          candidate.phone = parts[2];
        }
        candidates.push(candidate);
      }
    } else {
      // Space-separated or angle bracket format
      const emailMatch = trimmedLine.match(/([^\s<]+@[^\s>]+)/);
      const nameMatch = trimmedLine.match(/^([^<]+?)(?:\s*<|$)/);
      
      if (emailMatch && nameMatch) {
        const email = emailMatch[1].trim();
        const name = nameMatch[1].trim();
        
        const candidate: CandidateData = { name, email };
        
        // Try to extract phone number
        const phoneMatch = trimmedLine.match(/(\+?[\d\s\-\(\)]+)$/);
        if (phoneMatch && phoneMatch[1].trim().length > 5) {
          candidate.phone = phoneMatch[1].trim();
        }
        
        candidates.push(candidate);
      }
    }
  }
  
  return candidates;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' }, 
        { status: 400, headers: corsHeaders }
      );
    }
    
    const fileContent = await file.text();
    const fileName = file.name.toLowerCase();
    
    let candidates: CandidateData[] = [];
    
    if (fileName.endsWith('.csv')) {
      candidates = parseCSV(fileContent);
    } else if (fileName.endsWith('.txt')) {
      candidates = parseTXT(fileContent);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Only CSV and TXT files are supported.' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    if (candidates.length === 0) {
      return NextResponse.json(
        { error: 'No valid candidates found in file' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Validate candidates
    const validCandidates: CandidateData[] = [];
    const errors: string[] = [];
    
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const lineNumber = i + 1;
      
      if (!candidate.name?.trim()) {
        errors.push(`Line ${lineNumber}: Name is required`);
        continue;
      }
      
      if (!candidate.email?.trim()) {
        errors.push(`Line ${lineNumber}: Email is required`);
        continue;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(candidate.email)) {
        errors.push(`Line ${lineNumber}: Invalid email format`);
        continue;
      }
      
      validCandidates.push({
        name: candidate.name.trim(),
        email: candidate.email.trim().toLowerCase(),
        phone: candidate.phone?.trim() || undefined,
      });
    }
    
    if (validCandidates.length === 0) {
      return NextResponse.json(
        { error: 'No valid candidates to import', details: errors },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Bulk create candidates
    const createdCandidates = [];
    const creationErrors: string[] = [];
    
    for (const candidate of validCandidates) {
      try {
        const created = await db.createCandidate(candidate);
        createdCandidates.push(created);
      } catch (error) {
        if (error instanceof Error && error.message.includes('duplicate')) {
          creationErrors.push(`Candidate with email ${candidate.email} already exists`);
        } else {
          creationErrors.push(`Failed to create candidate ${candidate.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
    
    const response: {
      success: boolean;
      message: string;
      imported: number;
      skipped: number;
      total: number;
      candidates: Candidate[];
      warnings?: string[];
    } = {
      success: true,
      message: `Successfully imported ${createdCandidates.length} candidates`,
      imported: createdCandidates.length,
      skipped: creationErrors.length,
      total: candidates.length,
      candidates: createdCandidates,
    };
    
    if (errors.length > 0 || creationErrors.length > 0) {
      response.warnings = [...errors, ...creationErrors];
    }
    
    return NextResponse.json(response, { 
      status: 201, 
      headers: corsHeaders 
    });
    
  } catch (error) {
    console.error('Error bulk uploading candidates:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Bulk upload failed' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}