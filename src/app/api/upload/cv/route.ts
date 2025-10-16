import { NextRequest, NextResponse } from 'next/server';

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
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const candidateName = formData.get('candidateName') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!candidateName) {
      return NextResponse.json(
        { error: 'Candidate name is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and DOC/DOCX files are allowed.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get S3 configuration from environment variables
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        { error: 'S3 configuration missing' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Import AWS SDK dynamically
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

    // Create S3 client
    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // Generate filename with format: 2025-10-15T18-54-34-cv1760554474499.pdf
    const now = new Date();
    const dateTime = now.toISOString().replace(/[:.]/g, '-').slice(0, 19); // YYYY-MM-DDTHH-MM-SS
    const fileExtension = file.name.split('.').pop();
    const fileName = `cvs/${dateTime}-${candidateName}.${fileExtension}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      ContentDisposition: 'inline',
    });

    await s3Client.send(uploadCommand);

    // Generate the public URL
    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;

    // Extract just the filename without the 'cvs/' prefix
    const generatedFileName = fileName.replace('cvs/', '');
    
    return NextResponse.json(
      { 
        url: fileUrl,
        fileName: generatedFileName, // Return the generated filename: 2025-10-15T18-54-34-cv1760554474499.pdf
        originalName: file.name,
        size: file.size,
        type: file.type
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500, headers: corsHeaders }
    );
  }
}
