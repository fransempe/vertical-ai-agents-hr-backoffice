-- Create jd_interviews table for storing job description interview templates
CREATE TABLE IF NOT EXISTS jd_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_name VARCHAR(255),
  job_description TEXT,
  email_source TEXT,
  tech_stack VARCHAR(500),
  agent_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_jd_interviews_status ON jd_interviews(status);

-- Create index on agent_id for filtering
CREATE INDEX IF NOT EXISTS idx_jd_interviews_agent_id ON jd_interviews(agent_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_jd_interviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_jd_interviews_updated_at
  BEFORE UPDATE ON jd_interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_jd_interviews_updated_at();

-- Add jd_interview_id column to meets table (if not exists)
ALTER TABLE meets 
ADD COLUMN IF NOT EXISTS jd_interview_id UUID REFERENCES jd_interviews(id) ON DELETE SET NULL;

-- Create index on jd_interview_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_meets_jd_interview_id ON meets(jd_interview_id);

-- Insert some sample JD interview templates
INSERT INTO jd_interviews (interview_name, job_description, email_source, tech_stack, agent_id, status) VALUES
  ('Frontend Developer Interview', 'Interview template for frontend developers focusing on React and modern web technologies', 'hr@company.com', 'React, TypeScript, Tailwind CSS', 'frontend-agent-v1', 'active'),
  ('Backend Developer Interview', 'Interview template for backend developers with Node.js and database experience', 'hr@company.com', 'Node.js, Express, PostgreSQL', 'backend-agent-v1', 'active'),
  ('Senior Full Stack Developer', 'Comprehensive interview for senior full-stack developers', 'hr@company.com', 'React, Node.js, PostgreSQL, AWS', 'fullstack-agent-v1', 'active'),
  ('Junior Developer Interview', 'Entry-level interview focusing on fundamentals and learning potential', 'hr@company.com', 'JavaScript, HTML, CSS, Git', 'frontend-agent-v1', 'active'),
  ('Tech Lead Interview', 'Interview template for technical leadership positions', 'hr@company.com', 'Multiple technologies, Architecture patterns', 'fullstack-agent-v1', 'active'),
  ('DevOps Engineer Interview', 'Interview for DevOps and infrastructure roles', 'hr@company.com', 'AWS/Azure/GCP, Docker, Kubernetes', 'devops-agent-v1', 'active')
ON CONFLICT DO NOTHING;
