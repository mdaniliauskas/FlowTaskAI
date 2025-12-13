-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Lists Table
create table public.lists (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  user_identifier text not null, -- Simple auth (email)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tasks Table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  list_id uuid references public.lists(id) on delete cascade not null,
  title text not null,
  is_completed boolean default false,
  is_important boolean default false,
  is_my_day boolean default false, -- Features: My Day
  notes text, -- Features: Task Details
  due_date timestamp with time zone, -- Features: Due Date
  position float default 0, -- Features: Reordering
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ai_enrichment jsonb -- Stores AI suggestions
);

-- RLS (Row Level Security) - Optional for now but good practice
alter table public.lists enable row level security;
alter table public.tasks enable row level security;

-- Open access policy for prototype (simple auth via user_identifier filter)
create policy "Allow all operations" on public.lists for all using (true);
create policy "Allow all operations" on public.tasks for all using (true);
