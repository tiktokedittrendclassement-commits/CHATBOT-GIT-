-- Remove welcome credits for new users
ALTER TABLE public.profiles 
ALTER COLUMN credits_balance SET DEFAULT 0;
