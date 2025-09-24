# Token Authentication Endpoint

This endpoint provides token-based authentication for HR interview meetings.

## Endpoints

### POST `/api/auth/token`
Authenticate using a meeting token.

**Request Body:**
```json
{
  "token": "interview-token-here"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token authentication successful",
  "meet": {
    "id": "meet-id",
    "token": "interview-token",
    "link": "interview-link",
    "status": "pending",
    "scheduled_at": "2024-01-01T10:00:00Z",
    "password": "interview-password"
  },
  "candidate": {
    "id": "candidate-id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Error Responses:**
- `400`: Token is required
- `404`: Invalid token - Interview not found
- `400`: Interview already completed/cancelled

### GET `/api/auth/token?token=xyz`
Validate a token without authentication.

**Success Response (200):**
```json
{
  "valid": true,
  "status": "pending",
  "message": "Token is valid and ready for authentication"
}
```

**Error Response (404):**
```json
{
  "valid": false,
  "error": "Invalid token - Interview not found"
}
```

## Usage Examples

### JavaScript/TypeScript
```typescript
// Authenticate with token
const response = await fetch('/api/auth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: 'your-interview-token'
  })
});

const data = await response.json();

if (data.success) {
  console.log('Authenticated:', data.candidate.name);
  console.log('Interview status:', data.meet.status);
} else {
  console.error('Authentication failed:', data.error);
}
```

### cURL
```bash
# Authenticate with token
curl -X POST http://localhost:3000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"token": "your-interview-token"}'

# Validate token
curl "http://localhost:3000/api/auth/token?token=your-interview-token"
```

## Features

- ✅ Token-based authentication
- ✅ Interview status validation (no automatic updates)
- ✅ Candidate information retrieval
- ✅ CORS support
- ✅ Error handling
- ✅ Token validation endpoint
