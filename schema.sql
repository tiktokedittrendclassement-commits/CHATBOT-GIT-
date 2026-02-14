-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  plan_tier text default 'free', -- free, pro, agency
  credits_balance int default 10, -- 10 free credits to start
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for profiles
alter table profiles enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
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
  color text default '#000000',
  system_prompt text default 'You are a helpful assistant.',
  data_sources text, -- Simple text block for context
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for chatbots
alter table chatbots enable row level security;

create policy "Users can view own chatbots" on chatbots
  for select using (auth.uid() = user_id);

create policy "Users can insert own chatbots" on chatbots
  for insert with check (auth.uid() = user_id);

create policy "Users can update own chatbots" on chatbots
  for update using (auth.uid() = user_id);

create policy "Users can delete own chatbots" on chatbots
  for delete using (auth.uid() = user_id);

-- Public Policy for Embed (Read-Only)
-- The embed script needs to read the chatbot config (name, color, prompt-maybe?)
-- Wait, system_prompt should NOT be public if it contains sensitive info.
-- But for a simple chatbot, the frontend needs to know where to send messages.
-- Actually, the frontend (embed) will send messages to our API, and our API (server-side) will read the system_prompt.
-- So we don't need public read on chatbots table if we route everything through our API.
-- However, we might want to display the bot name/color on the widget.
-- Let's allow public read for 'name' and 'color' only? Supabase policies apply to rows, not columns.
-- We can create a secure view or just assume API usage.
-- For now, let's keep it private and use the API to fetch config.

-- Table: conversations
create table conversations (
  id uuid default uuid_generate_v4() primary key,
  chatbot_id uuid references chatbots(id) on delete cascade not null,
  visitor_id text, -- Anonymous visitor ID from local storage
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table conversations enable row level security;

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

create policy "Users can view messages for their bot conversations" on messages
  for select using (
    exists (
      select 1 from conversations
      join chatbots on chatbots.id = conversations.chatbot_id
      where conversations.id = messages.conversation_id
      and chatbots.user_id = auth.uid()
    )
  );
