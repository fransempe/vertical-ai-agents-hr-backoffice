-- Check if jd_interviews table exists and create sample data
-- Run this in your Supabase SQL editor

-- First, let's check if the table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'jd_interviews'
);

-- If the table doesn't exist, create it
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_jd_interviews_status ON jd_interviews(status);
CREATE INDEX IF NOT EXISTS idx_jd_interviews_agent_id ON jd_interviews(agent_id);

-- Add jd_interview_id column to meets table if it doesn't exist
ALTER TABLE meets 
ADD COLUMN IF NOT EXISTS jd_interview_id UUID REFERENCES jd_interviews(id) ON DELETE SET NULL;

-- Create index on jd_interview_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_meets_jd_interview_id ON meets(jd_interview_id);

-- Insert sample data (will not insert if data already exists)
INSERT INTO jd_interviews (interview_name, job_description, email_source, tech_stack, agent_id, status) 
SELECT * FROM (VALUES
  ('Frontend Developer Interview', 'Interview template for frontend developers focusing on React and modern web technologies', 'hr@company.com', 'React, TypeScript, Tailwind CSS', 'frontend-agent-v1', 'active'),
  ('Backend Developer Interview', 'Interview template for backend developers with Node.js and database experience', 'hr@company.com', 'Node.js, Express, PostgreSQL', 'backend-agent-v1', 'active'),
  ('Senior Full Stack Developer', 'Comprehensive interview for senior full-stack developers', 'hr@company.com', 'React, Node.js, PostgreSQL, AWS', 'fullstack-agent-v1', 'active'),
  ('Junior Developer Interview', 'Entry-level interview focusing on fundamentals and learning potential', 'hr@company.com', 'JavaScript, HTML, CSS, Git', 'frontend-agent-v1', 'active'),
  ('Tech Lead Interview', 'Interview template for technical leadership positions', 'hr@company.com', 'Multiple technologies, Architecture patterns', 'fullstack-agent-v1', 'active'),
  ('DevOps Engineer Interview', 'Interview for DevOps and infrastructure roles', 'hr@company.com', 'AWS/Azure/GCP, Docker, Kubernetes', 'devops-agent-v1', 'active')
) AS t(interview_name, job_description, email_source, tech_stack, agent_id, status)
WHERE NOT EXISTS (SELECT 1 FROM jd_interviews WHERE interview_name = t.interview_name);

-- Check the data was inserted
SELECT COUNT(*) as total_jd_interviews FROM jd_interviews;
SELECT * FROM jd_interviews LIMIT 5;
