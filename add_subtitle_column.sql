-- Add subtitle column to chatbots table
ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT 'En ligne · repond en 3s';
