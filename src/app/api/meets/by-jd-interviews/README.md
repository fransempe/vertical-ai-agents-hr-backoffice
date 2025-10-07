# Get Meets Grouped by JD Interviews Endpoint

## Endpoint
`GET /api/meets/by-jd-interviews`

## Description
This endpoint retrieves all meets grouped by their associated JD interviews. It:
1. Fetches all JD interviews from the `jd_interviews` table
2. For each JD interview, finds all meets that have `jd_interviews_id` matching the JD interview's `id`
3. Returns the data grouped by JD interview with their associated meets

## Parameters
None

## Response

### Success (200)
Returns an array of objects, each containing a JD interview and its associated meets:

```json
[
  {
    "jd_interview": {
      "id": "uuid",
      "agent_id": "string",
      "interview_name": "string",
      "job_description": "string"
    },
    "meets": [
      {
        "id": "uuid",
        "candidate_id": "uuid",
        "jd_interviews_id": "uuid",
        "token": "string",
        "link": "string",
        "password": "string",
        "status": "pending" | "active" | "completed" | "cancelled",
        "scheduled_at": "timestamp",
        "created_at": "timestamp",
        "updated_at": "timestamp",
        "candidate": {
          "name": "string",
          "email": "string"
        },
        "jd_interviews": {
          "interview_name": "string",
          "agent_id": "string"
        }
      }
    ]
  }
]
```

### Error Response

#### 500 - Internal Server Error
```json
{
  "error": "Failed to fetch meets by JD interviews"
}
```

## Example Usage

### cURL
```bash
curl -X GET "http://localhost:3001/api/meets/by-jd-interviews"
```

### JavaScript/TypeScript
```javascript
const response = await fetch('/api/meets/by-jd-interviews');
const meetsByJdInterviews = await response.json();

// Access data
meetsByJdInterviews.forEach(group => {
  console.log(`JD Interview: ${group.jd_interview.interview_name}`);
  console.log(`Agent: ${group.jd_interview.agent_id}`);
  console.log(`Number of meets: ${group.meets.length}`);
  
  group.meets.forEach(meet => {
    console.log(`- Meet with ${meet.candidate?.name} (${meet.status})`);
  });
});
```

## Use Cases
- Dashboard analytics showing interview distribution
- Reporting on JD interview utilization
- Agent workload analysis
- Interview template effectiveness tracking
- Bulk operations on meets by JD interview type

## Notes
- JD interviews with no associated meets will still appear in the response with an empty `meets` array
- Each meet includes full candidate information for convenience
- The response preserves the relationship chain: JD Interview → Meets → Candidates
