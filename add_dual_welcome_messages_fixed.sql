-- Add new columns for dual welcome messages
ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS welcome_message_new TEXT DEFAULT 'Bonjour ! 👋 Comment puis-je vous aider aujourd''hui ?';
ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS welcome_message_returning TEXT DEFAULT 'Re-bonjour ! Ravi de vous revoir. 👋';

-- No update from 'welcome_message' as it does not exist.
