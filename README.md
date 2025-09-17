# HR Interview Backoffice

A modern HR backoffice system for managing AI-powered interview meetings. Built with Next.js 15, TypeScript, and Supabase.

## Features

- 🤖 **AI Agent Management**: Create and manage AI agents for conducting interviews
- 👥 **Candidate Management**: Manage candidate information and profiles
- 📅 **Meeting Orchestration**: Create interview meetings with unique tokens and links
- 💬 **Conversation History**: View and analyze interview conversations
- 📂 **Bulk Upload**: Import multiple candidates via CSV or TXT files
- ⚙️ **AI Analysis Processes**: Execute multiagent analysis on interview data
- 🔗 **Secure Access**: Token-based meeting access with UUID security
- 🗃️ **Modular Database**: Configurable database provider (currently Supabase, easily extensible)
- 🎨 **Modern UI**: Built with Tailwind CSS and custom components

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Components**: Custom UI components
- **UUID Generation**: Built-in UUID v4 support

## Database Schema

### Tables

1. **candidates**
   - `id` (UUID, Primary Key)
   - `name` (VARCHAR, Required)
   - `email` (VARCHAR, Required, Unique)
   - `phone` (VARCHAR, Optional)
   - `created_at` / `updated_at` (Timestamps)

2. **meets**
   - `id` (UUID, Primary Key)
   - `candidate_id` (UUID, Foreign Key)
   - `agent_id` (UUID, Foreign Key)
   - `token` (UUID, Unique)
   - `link` (TEXT, Generated)
   - `status` (ENUM: pending, active, completed, cancelled)
   - `scheduled_at` (Timestamp, Optional)
   - `created_at` / `updated_at` (Timestamps)

3. 

## Setup Instructions

### 1. Install Dependencies

```bash
cd hr-backoffice
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Execute the SQL schema in `database/supabase-schema.sql` in your Supabase SQL editor

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
# Database Configuration
DATABASE_PROVIDER=supabase

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Multiagent Project URL (for AI Analysis)
MULTIAGENT_PROJECT_URL=http://localhost:8000

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Usage

### Managing AI Agents

1. Navigate to the "AI Agents" tab
2. Fill in the agent name and description
3. Click "Create Agent" to add a new AI interviewer

### Managing Candidates

1. Navigate to the "Candidates" tab  
2. Enter candidate information (name, email, phone)
3. Click "Create Candidate" to add them to the system

### Creating Interview Meetings

1. Navigate to the "Meetings" tab
2. Select a candidate and AI agent from the dropdowns
3. Click "Create Meeting" to generate a new interview session
4. The system will automatically:
   - Generate a unique UUID for the meeting
   - Create a secure token for access
   - Generate a meeting link: `http://your-domain/meet/{token}`
   - Store all information in the database

### Accessing Meetings

Candidates can access their interviews using the generated link format:
```
http://your-domain/meet/{token}
```

The meeting page will display:
- Meeting status (pending, active, completed, cancelled)
- Candidate and agent information
- Meeting details
- Appropriate actions based on status

### Deleting Meetings

Meetings can be deleted from the backoffice by clicking the "Delete" button next to any meeting in the list.

### AI Analysis Processes

1. Navigate to the "Processes" tab
2. Click "Execute Analysis" to run the multiagent analysis
3. The system will:
   - Call the multiagent project at the configured URL
   - Execute the `/analyze` endpoint
   - Display the results including status, execution time, and raw results
4. Results are displayed in real-time with detailed information about the analysis

### Bulk Upload Candidates

1. Navigate to the "Bulk Upload" tab
2. Select a CSV or TXT file containing candidate data
3. Supported formats:
   - CSV: `Name,Email,Phone`
   - TXT: Multiple formats supported (comma-separated, space-separated, angle brackets)
4. Click "Upload Candidates" to import all candidates at once

## API Routes

The application provides the following REST API endpoints:

### AI Agents
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create new agent
- `GET /api/agents/[id]` - Get specific agent
- `PUT /api/agents/[id]` - Update agent
- `DELETE /api/agents/[id]` - Delete agent

### Candidates
- `GET /api/candidates` - List all candidates
- `POST /api/candidates` - Create new candidate
- `GET /api/candidates/[id]` - Get specific candidate
- `PUT /api/candidates/[id]` - Update candidate
- `DELETE /api/candidates/[id]` - Delete candidate

### Meetings
- `GET /api/meets` - List all meetings
- `POST /api/meets` - Create new meeting
- `GET /api/meets/[id]` - Get specific meeting
- `PUT /api/meets/[id]` - Update meeting
- `DELETE /api/meets/[id]` - Delete meeting
- `GET /api/meets/token/[token]` - Get meeting by token

### Processes
- `POST /api/processes/analyze` - Execute AI analysis process

## Database Provider Architecture

The system is designed with a modular database architecture that allows easy switching between providers:

### Current Provider: Supabase
- Full PostgreSQL database
- Real-time capabilities
- Built-in authentication (ready for future use)
- Automatic backups

### Adding New Providers

To add a new database provider:

1. Create a new file in `src/lib/database/` (e.g., `mongodb.ts`)
2. Implement the `DatabaseProvider` interface from `types.ts`
3. Update the `createDatabaseProvider` function in `src/lib/database/index.ts`
4. Add necessary environment variables

Example structure:
```typescript
export class MongoDBProvider implements DatabaseProvider {
  // Implement all methods from DatabaseProvider interface
}
```

## Security Features

- **UUID-based IDs**: All primary keys use UUID v4 for security
- **Unique Tokens**: Each meeting has a unique access token
- **Input Validation**: Server-side validation for all API endpoints
- **Environment Variables**: Sensitive data stored in environment variables
- **CORS Protection**: Built-in Next.js API route protection

## Future Enhancements

- [ ] Authentication and authorization
- [ ] Real-time meeting status updates
- [ ] Email notifications for candidates
- [ ] Meeting scheduling with calendar integration
- [ ] Interview recording and transcription
- [ ] Analytics and reporting dashboard
- [ ] Multi-tenant support
- [ ] Advanced AI agent configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
