-- Migration: Change credits_balance from integer to bigint
-- This fixes the "value is out of range for type integer" error
-- bigint can store values up to 9,223,372,036,854,775,807

-- Step 1: Change the column type from int to bigint
ALTER TABLE profiles 
ALTER COLUMN credits_balance TYPE bigint;

-- Step 2: Update the default value to use bigint
-- Default is 10,000,000 micros = 10€ for new users
ALTER TABLE profiles 
ALTER COLUMN credits_balance SET DEFAULT 10000000;

-- Step 3: Update the decrement_balance function to use bigint
CREATE OR REPLACE FUNCTION decrement_balance(p_user_id uuid, p_amount bigint)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET credits_balance = credits_balance - p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Also update the usages table to use bigint for consistency
ALTER TABLE usages 
ALTER COLUMN credits_deducted TYPE bigint;

-- Verification query (optional - run this to check the change)
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name = 'credits_balance';
