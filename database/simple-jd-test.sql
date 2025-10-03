-- Simple test to create and verify jd_interviews table with only the 4 required fields

-- Drop table if exists (for clean start)
DROP TABLE IF EXISTS jd_interviews CASCADE;

-- Create simple table with only required fields
CREATE TABLE jd_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(255) NOT NULL,
  interview_name VARCHAR(255) NOT NULL,
  job_description TEXT
);

-- Verify data
SELECT COUNT(*) as total_records FROM jd_interviews;
SELECT id, agent_id, interview_name, job_description FROM jd_interviews;

-- Add the foreign key to meets table if it doesn't exist
ALTER TABLE meets ADD COLUMN IF NOT EXISTS jd_interviews_id UUID REFERENCES jd_interviews(id) ON DELETE SET NULL;
