-- Add triggers column to chatbots table
-- This stores an array of triggers like: [{"type":"scroll","value":50,"message":"Hello"}]
ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS triggers JSONB DEFAULT '[]'::jsonb;
