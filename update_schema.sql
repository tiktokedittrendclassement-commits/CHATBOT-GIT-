-- Add marketing fields to chatbots table
ALTER TABLE chatbots 
ADD COLUMN IF NOT EXISTS collect_emails boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_number text;
