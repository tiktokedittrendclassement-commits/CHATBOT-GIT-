-- Add reseller_token to chatbots table
ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS reseller_token UUID DEFAULT uuid_generate_v4();

-- Ensure all existing chatbots have a token
UPDATE chatbots SET reseller_token = uuid_generate_v4() WHERE reseller_token IS NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_chatbots_reseller_token ON chatbots(reseller_token);
