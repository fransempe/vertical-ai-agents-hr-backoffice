# CV Processing Flow Documentation

## Overview
This document describes the CV processing flow that integrates with the multiagent project for AI-powered candidate extraction.

## Flow Description

### 1. CV Upload (Frontend)
- User selects CV file in the "Upload CV" tab
- File is uploaded to S3 bucket via `/api/upload/cv`
- Unique filename is generated: `CV-{timestamp}-{candidateName}`

### 2. Background Processing Initiation
- After successful upload, frontend calls `/api/read-cv`
- This endpoint forwards the CV URL to the multiagent project
- Processing starts in the background

### 3. Multiagent Project Processing
- Multiagent project receives CV URL and callback URL
- AI processes the CV to extract:
  - Candidate name
  - Email address
  - Phone number
  - Tech stack array
  - Other relevant information

### 4. Callback to HR System
- Multiagent project calls back to `/api/candidates/update-from-ai`
- New candidate is created with extracted information
- Tech stack is populated automatically

### 5. Frontend Updates
- Frontend polls for candidate updates every 10 seconds
- When new candidate appears, user is notified
- Candidate list is automatically refreshed

## API Endpoints

### POST /api/read-cv
Initiates CV processing with multiagent project.

**Request Body:**
```json
{
  "cv_url": "https://s3-bucket/cv-file.pdf",
  "filename": "CV-1234567890-candidate-name"
}
```

**Response:**
```json
{
  "message": "CV processing started successfully",
  "processing_id": "unique-id",
  "status": "processing"
}
```

### POST /api/candidates/update-from-ai
Callback endpoint for multiagent project to create/update candidates.

**Request Body:**
```json
{
  "candidate_id": "optional-existing-id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "tech_stack": ["React", "Node.js", "AWS"]
}
```

## Environment Variables

### Required Variables
```env
# Multiagent project URL
MULTIAGENT_PROJECT_URL=http://localhost:8000

# App URL for callbacks
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AWS S3 Configuration
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

## User Experience

### Loading States
1. **Uploading**: File upload to S3 in progress
2. **Processing**: AI processing in multiagent project
3. **Background Processing**: Visual indicator in candidate list

### Notifications
- **Success**: "CV uploaded successfully! Starting AI processing..."
- **Processing Started**: "CV processing started! You will be notified when the candidate is created."
- **Timeout**: "CV processing may take longer. Please check back later."

### Polling Mechanism
- Polls every 10 seconds for 2 minutes (12 polls total)
- Automatically stops after timeout
- Refreshes candidate list on each poll

## Error Handling

### Upload Errors
- File validation (PDF, DOC, DOCX only)
- Size limits (10MB max)
- S3 upload failures

### Processing Errors
- Multiagent project unavailable
- Invalid CV format
- Processing timeout

### Callback Errors
- Invalid candidate data
- Database errors
- Duplicate email handling

## Integration Points

### Multiagent Project Requirements
The multiagent project must:
1. Accept POST requests to `/process-cv`
2. Process CV files from S3 URLs
3. Extract candidate information using AI
4. Call back to HR system with results
5. Handle error cases gracefully

### Expected Callback Format
```json
{
  "cv_url": "original-s3-url",
  "filename": "original-filename",
  "callback_url": "https://hr-system.com/api/candidates/update-from-ai"
}
```

## Monitoring and Debugging

### Logs to Monitor
- CV upload success/failure
- Multiagent project calls
- Callback responses
- Candidate creation events

### Common Issues
1. **Multiagent project not responding**: Check MULTIAGENT_PROJECT_URL
2. **Callbacks not received**: Verify NEXT_PUBLIC_APP_URL and network connectivity
3. **Processing timeouts**: Check multiagent project logs
4. **Duplicate candidates**: Implement email deduplication logic

## Future Enhancements

### Potential Improvements
1. **WebSocket Integration**: Real-time updates instead of polling
2. **Processing Status API**: Check processing status by ID
3. **Retry Mechanism**: Automatic retry for failed processing
4. **Batch Processing**: Handle multiple CVs simultaneously
5. **Progress Tracking**: Detailed processing steps and progress
