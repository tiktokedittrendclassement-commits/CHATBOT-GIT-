-- Create sales table to track revenue per chatbot
create table if not exists sales (
  id uuid default uuid_generate_v4() primary key,
  chatbot_id uuid references chatbots(id) on delete set null,
  amount decimal(10, 2) not null,
  currency text default 'EUR',
  status text default 'completed', -- completed, refunded, pending
  created_at timestamptz default now()
);

-- Enable RLS
alter table sales enable row level security;

-- Policy: Chatbot owners can view sales for their chatbots
create policy "Users can view sales for their chatbots" on sales
  for select using (
    exists (
      select 1 from chatbots
      where chatbots.id = sales.chatbot_id
      and chatbots.user_id = auth.uid()
    )
  );

-- Policy: Only system/service role should insert sales normally, but for MVP/simulation we might allow owners to insert test data?
-- Sticking to read-only for now for the user side to avoid easy tampering, assuming sales come from webhooks/backend.
-- actually, for the sake of the user simulating sales, let's allow insert for owners on their own bots for now.
create policy "Users can insert sales for their chatbots" on sales
  for insert with check (
    exists (
      select 1 from chatbots
      where chatbots.id = sales.chatbot_id
      and chatbots.user_id = auth.uid()
    )
  );
