# Get Agent by Meet ID Endpoint

## Endpoint
`GET /api/agents/by-meet/[meetId]`

## Description
This endpoint retrieves the agent associated with a specific meet by following the relationship chain:
1. Gets the meet by `meetId`
2. Extracts the `jd_interviews_id` from the meet
3. Gets the JD interview by `jd_interviews_id`
4. Extracts the `agent_id` from the JD interview
5. Returns the agent details by `agent_id`

## Parameters
- `meetId` (string, required): The ID of the meet

## Response

### Success (200)
Returns the agent object:
```json
{
  "id": "uuid",
  "agent_id": "string",
  "name": "string", 
  "tech_stack": "string",
  "description": "string",
  "status": "active" | "inactive",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Error Responses

#### 400 - Bad Request
```json
{
  "error": "Meet ID is required"
}
```

#### 404 - Not Found
```json
{
  "error": "Meet not found"
}
```
or
```json
{
  "error": "Meet has no associated JD interview"
}
```
or
```json
{
  "error": "JD interview not found"
}
```
or
```json
{
  "error": "Agent not found"
}
```

#### 500 - Internal Server Error
```json
{
  "error": "Failed to get agent"
}
```

## Example Usage

### cURL
```bash
curl -X GET "http://localhost:3001/api/agents/by-meet/fab5631d-3b86-4309-879d-10cda43b3099"
```

### JavaScript/TypeScript
```javascript
const response = await fetch(`/api/agents/by-meet/${meetId}`);
const agent = await response.json();
```

## Use Cases
- Get the agent responsible for conducting a specific interview
- Retrieve agent details for interview preparation
- Link interview sessions with their corresponding AI agents
