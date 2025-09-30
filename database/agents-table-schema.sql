-- Create agents table for storing AI agent information
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  tech_stack TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on agent_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_agent_id ON agents(agent_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_agents_updated_at();

-- Insert some sample data (optional)
INSERT INTO agents (agent_id, name, tech_stack, description, status) VALUES
  ('frontend-agent-v1', 'Frontend Developer Agent', 'React, TypeScript, Tailwind CSS', 'Specialized in modern frontend development with React ecosystem', 'active'),
  ('backend-agent-v1', 'Backend Developer Agent', 'Node.js, Express, PostgreSQL', 'Focused on server-side development and API design', 'active'),
  ('fullstack-agent-v1', 'Full Stack Developer Agent', 'React, Node.js, PostgreSQL, AWS', 'Comprehensive full-stack development capabilities', 'active'),
  ('devops-agent-v1', 'DevOps Engineer Agent', 'Docker, Kubernetes, AWS, CI/CD', 'Infrastructure and deployment automation specialist', 'inactive')
ON CONFLICT (agent_id) DO NOTHING;
