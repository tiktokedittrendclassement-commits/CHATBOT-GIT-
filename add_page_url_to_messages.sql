-- Add page_url column to messages table to visualize user journey
ALTER TABLE messages ADD COLUMN IF NOT EXISTS page_url TEXT;

-- Policy update not needed if generic "insert" policy covers all columns, 
-- but strict policies might need check. Assuming current policy is "INSERT WITH CHECK (true)" or similar.
