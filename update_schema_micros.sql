-- Update stored procedure for decrementing balance
-- We are switching to specific amount decrement instead of "1 credit"

create or replace function decrement_balance(p_user_id uuid, p_amount int)
returns void as $$
begin
  update profiles
  set credits_balance = credits_balance - p_amount
  where id = p_user_id;
end;
$$ language plpgsql security definer;

-- Optional: Scale existing balances if we want to migrate current users
-- Let's give them a bonus. If they had "10 credits", let's give them 0.10€ (100,000 micros)
-- This assumes we wipe or strictly migrate.
-- For safety in this dev environment, let's just update all profiles to have 1.00€ (1,000,000 micros) to start fresh testing.
update profiles set credits_balance = 1000000 where credits_balance < 1000;
