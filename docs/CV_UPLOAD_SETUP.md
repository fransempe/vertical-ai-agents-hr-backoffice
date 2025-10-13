# CV Upload Setup Guide

## Overview
This feature allows candidates to upload their CV/Resume files (PDF, DOC, DOCX) which are stored in an AWS S3 bucket. The system also includes a tech_stack field that will be automatically populated by AI processes.

## Prerequisites

### 1. AWS S3 Bucket Setup
1. Create an S3 bucket in your AWS account
2. Configure bucket permissions for public read access (for CV viewing)
3. Set up CORS policy if needed
4. Create IAM user with S3 permissions

### 2. Environment Variables
Add the following variables to your `.env.local` file:

```env
# AWS S3 Configuration for CV uploads
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### 3. Database Schema Update
Run the SQL script to add the new fields to your candidates table:

```sql
-- Execute this in your Supabase SQL editor or database
\i database/add-cv-fields-to-candidates.sql
```

## Features

### 1. CV Upload
- **Supported formats**: PDF, DOC, DOCX
- **File size limit**: 10MB
- **Storage**: AWS S3 bucket
- **Naming convention**: `cvs/{YYYY-MM-DDTHH-MM-SS}-{candidate-name}.{extension}`

### 2. Tech Stack Field
- **Type**: Array of strings
- **Population**: Automatic via AI processes (not user input)
- **Example**: `["React", "Node.js", "TypeScript", "AWS"]`
- **Display**: Shows up to 3 technologies with "+X more" indicator

### 3. UI Integration
- **Tabbed interface**: Two creation methods (Manual Entry / Upload CV)
- **Manual Entry**: Traditional form with optional CV upload
- **CV Upload**: AI-powered extraction from CV only
- **CV link**: "View CV" link in candidate list
- **Tech stack badges**: Displayed as colored pills in candidate cards
- **Loading states**: Shows "Uploading CV..." / "Processing..." during operations
- **AI Processing indicators**: Visual badges for candidates being processed

## Creation Methods

### Method 1: Manual Entry
- Traditional form with name, email, phone fields
- Optional CV upload for reference
- Immediate candidate creation
- Full control over candidate data

### Method 2: CV Upload (AI Processing)
- Upload CV file only
- AI extracts all candidate information
- Creates placeholder candidate initially
- Updates with extracted data via AI service

## API Endpoints

### Upload CV
```
POST /api/upload/cv
Content-Type: multipart/form-data

Body: FormData with:
- 'file' field: The CV file
- 'candidateName' field: Candidate's full name

Response:
{
  "url": "https://bucket.s3.region.amazonaws.com/cvs/2024-01-15T14-30-25-john-doe.pdf",
  "fileName": "original-name.pdf",
  "size": 1234567,
  "type": "application/pdf"
}
```

### Create Candidate (Updated)
```
POST /api/candidates
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890", // optional
  "cv_url": "https://bucket.s3.region.amazonaws.com/cvs/file.pdf" // optional
}
```

### Update Candidate from AI
```
POST /api/candidates/update-from-ai
Content-Type: application/json

Body:
{
  "candidate_id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "tech_stack": ["React", "Node.js", "TypeScript"]
}

Response:
{
  "message": "Candidate updated successfully",
  "candidate": { /* updated candidate object */ },
  "updated_fields": ["name", "email", "tech_stack"]
}
```

## Security Considerations

1. **File validation**: Only PDF, DOC, DOCX files are accepted
2. **Size limits**: Maximum 10MB per file
3. **Descriptive naming**: Files named with date-time and candidate name for easy identification
4. **IAM permissions**: Use minimal required S3 permissions
5. **CORS configuration**: Configure properly for your domain

## Troubleshooting

### Common Issues

1. **"S3 configuration missing"**
   - Check that all AWS environment variables are set
   - Verify variable names match exactly

2. **"Failed to upload file"**
   - Check AWS credentials and permissions
   - Verify bucket exists and is accessible
   - Check file size and format

3. **"Invalid file type"**
   - Only PDF, DOC, DOCX files are supported
   - Check file extension and MIME type

### Testing
1. Try uploading a small PDF file
2. Verify the file appears in your S3 bucket
3. Check that the CV link works in the candidate list
4. Confirm the URL is saved in the database

## Future Enhancements

1. **AI Tech Stack Extraction**: Implement AI service to analyze uploaded CVs and populate tech_stack field
2. **File management**: Add ability to replace/delete uploaded CVs
3. **Preview functionality**: Add CV preview modal
4. **Bulk operations**: Support for bulk CV uploads
