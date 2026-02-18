-- Add logo_url column to chatbots table
ALTER TABLE chatbots 
ADD COLUMN logo_url text;

-- Comment on column
COMMENT ON COLUMN chatbots.logo_url IS 'URL to the custom chatbot logo (Agency/Pro plans only)';
