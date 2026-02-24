-- Add email customization fields to chatbots table
ALTER TABLE chatbots 
ADD COLUMN IF NOT EXISTS sender_name text,
ADD COLUMN IF NOT EXISTS reply_to text;
