-- Add CV URL and tech stack fields to candidates table

-- Add cv_url column (optional field for storing S3 URL of uploaded CV)
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS cv_url TEXT;

-- Add tech_stack column (array of strings for storing technologies)
-- This will be populated automatically by AI processes
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS tech_stack TEXT[];

-- Add comments for documentation
COMMENT ON COLUMN candidates.cv_url IS 'S3 URL of uploaded CV/Resume file (PDF, DOC, DOCX)';
COMMENT ON COLUMN candidates.tech_stack IS 'Array of technologies extracted from CV by AI (e.g., ["React", "Node.js", "AWS"])';

-- Example of how to update tech_stack (for reference)
-- UPDATE candidates 
-- SET tech_stack = ARRAY['React', 'Node.js', 'TypeScript', 'AWS'] 
-- WHERE id = 'candidate-id-here';

-- Query to check the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'candidates' 
ORDER BY ordinal_position;
