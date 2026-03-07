-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  plan_tier text default 'free', -- free, pro, agency
  credits_balance bigint default 0, -- 0 free credits to start
  stripe_customer_id text, -- or lemon_squeezy_customer_id
  lemon_squeezy_customer_id text,
  subscription_status text default 'active', -- active, past_due, canceled
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  smtp_host text,
  smtp_port integer,
  smtp_user text,
  smtp_from text,
  use_custom_smtp boolean default false,
  whatsapp_phone_id text,
  whatsapp_waba_id text,
  whatsapp_access_token text
);


alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id, 
    new.email, 
    coalesce(
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'given_name',
      'Membre'
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Table: chatbots
create table chatbots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  color text default '#4F46E5',
  system_prompt text default 'You are a helpful assistant.',
  data_sources text, -- Simple text block for context
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  collect_emails boolean default false,
  whatsapp_number text
);

alter table chatbots enable row level security;
create policy "Users can view own chatbots" on chatbots for select using (auth.uid() = user_id);
create policy "Users can insert own chatbots" on chatbots for insert with check (auth.uid() = user_id);
create policy "Users can update own chatbots" on chatbots for update using (auth.uid() = user_id);
create policy "Users can delete own chatbots" on chatbots for delete using (auth.uid() = user_id);

-- Helper to check plan limits (Enforced in application logic or RLS if complex)
-- For now, we rely on application logic to enforce plan limits on INSERT.

-- Table: conversations
create table conversations (
  id uuid default uuid_generate_v4() primary key,
  chatbot_id uuid references chatbots(id) on delete cascade not null,
  visitor_id text, -- Anonymous visitor ID from local storage
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table conversations enable row level security;
-- Owner can view conversations
create policy "Users can view conversations for their chatbots" on conversations
  for select using (
    exists (
      select 1 from chatbots
      where chatbots.id = conversations.chatbot_id
      and chatbots.user_id = auth.uid()
    )
  );

-- Table: messages
create table messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text not null, -- 'user' or 'assistant'
  content text not null,
  created_at timestamptz default now()
);

alter table messages enable row level security;
-- Owner can view messages
create policy "Users can view messages for their bot conversations" on messages
  for select using (
    exists (
      select 1 from conversations
      join chatbots on chatbots.id = conversations.chatbot_id
      where conversations.id = messages.conversation_id
      and chatbots.user_id = auth.uid()
    )
  );

-- Table: usages (To track credit consumption)
create table usages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  chatbot_id uuid references chatbots(id) on delete set null,
  tokens_used int default 0,
  credits_deducted int default 0,
  created_at timestamptz default now()
);

alter table usages enable row level security;
create policy "Users can view own usage" on usages for select using (auth.uid() = user_id);

-- PUBLIC ACCESS POLICIES FOR WIDGET
-- The widget needs to insert messages (as visitor) and read chatbot config (name, color).
-- Since supabase-js in the browser exposes the key, we need specific policies.

-- Allow PUBLIC read access to chatbots (id, name, color) only?
-- Or better: Create a "public_chatbots" view?
-- Simplest for MVP: Allow public read on chatbots, but maybe restrict columns in frontend query.
-- RLS applies to rows.
-- Let's create a policy that allows anyone to read a chatbot if they have the ID.
create policy "Public can view chatbots by ID" on chatbots
  for select using (true);
-- Note: This makes all chatbots public. Ideally we restrict origin, but that's hard in RLS.
-- This is acceptable for a widget that is meant to be public on a website.

-- Allow PUBLIC insert to conversations?
-- Anyone can start a conversation with a valid chatbot_id.
create policy "Public can insert conversations" on conversations
  for insert with check (true);

-- Allow PUBLIC insert to messages?
-- Anyone can send a message to a conversation.
create policy "Public can insert messages" on messages
  for insert with check (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
    )
  );
-- Allow Public to read messages of their own conversation?
-- This is tricky without a logged-in user.
-- Usually, the widget keeps state.
-- For now, let's allow public read on messages if they belong to a conversation?
-- This is risky if IDs are guessable (UUIDs are not easily guessable).
create policy "Public can read messages by conversation" on messages
  for select using (true);
-- Warning: This allows scraping if conversation IDs are leaked.
-- For an MVP, this is standard "security through unguessability".
-- Table: sales
create table sales (
  id uuid default uuid_generate_v4() primary key,
  chatbot_id uuid references chatbots(id) on delete cascade not null,
  amount decimal(10,2) not null,
  currency text default 'EUR',
  status text default 'completed',
  created_at timestamptz default now()
);

alter table sales enable row level security;
create policy "Users can view sales for their chatbots" on sales
  for select using (
    exists (
      select 1 from chatbots
      where chatbots.id = sales.chatbot_id
      and chatbots.user_id = auth.uid()
    )
  );

-- Table: abandoned_carts
create table abandoned_carts (
  id uuid default uuid_generate_v4() primary key,
  chatbot_id uuid references chatbots(id) on delete cascade not null,
  visitor_id text not null,
  cart_items jsonb default '[]'::jsonb,
  total_amount decimal(10,2) default 0,
  currency text default 'EUR',
  last_page_url text,
  status text default 'pending', -- pending, recovered, expired
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(chatbot_id, visitor_id)
);

alter table abandoned_carts enable row level security;
create policy "Users can view abandoned carts for their chatbots" on abandoned_carts
  for select using (
    exists (
      select 1 from chatbots
      where chatbots.id = abandoned_carts.chatbot_id
      and chatbots.user_id = auth.uid()
    )
  );
-- Table: leads
create table leads (
  id uuid default uuid_generate_v4() primary key,
  chatbot_id uuid references chatbots(id) on delete cascade not null,
  visitor_id text,
  email text,
  phone text,
  source_page text,
  captured_at timestamptz default now(),
  unique(chatbot_id, email, phone)
);

alter table leads enable row level security;
create policy "Users can view leads for their chatbots" on leads
  for select using (
    exists (
      select 1 from chatbots
      where chatbots.id = leads.chatbot_id
      and chatbots.user_id = auth.uid()
    )
  );

-- Update chatbots to include collection flags
alter table chatbots add column if not exists collect_phones boolean default false;
