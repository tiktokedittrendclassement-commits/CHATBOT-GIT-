-- Helper function to count total messages for a user
-- This is more efficient than doing complex joins in the application code

CREATE OR REPLACE FUNCTION get_user_message_count(p_user_id uuid)
RETURNS bigint AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    JOIN chatbots cb ON c.chatbot_id = cb.id
    WHERE cb.user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage:
-- SELECT get_user_message_count('your-user-id-here');
