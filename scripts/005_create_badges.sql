-- Create badges table for gamification
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  
  name text not null unique,
  description text not null,
  icon_name text not null, -- icon identifier for UI
  category text not null, -- 'routes', 'eco', 'explorer', 'social', 'special'
  
  -- Requirements
  requirement_type text not null, -- 'routes_count', 'time_saved', 'co2_saved', 'distance', 'special'
  requirement_value integer not null,
  
  -- Rewards
  experience_points integer default 0,
  
  -- Rarity
  rarity text not null default 'common', -- 'common', 'rare', 'epic', 'legendary'
  
  created_at timestamp with time zone default now()
);

-- Enable RLS - badges are public read
alter table public.badges enable row level security;

create policy "badges_select_all"
  on public.badges for select
  using (true);

-- Create user_badges junction table
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  
  earned_at timestamp with time zone default now(),
  
  unique(user_id, badge_id)
);

-- Enable RLS
alter table public.user_badges enable row level security;

create policy "user_badges_select_own"
  on public.user_badges for select
  using (auth.uid() = user_id);

create policy "user_badges_insert_own"
  on public.user_badges for insert
  with check (auth.uid() = user_id);

-- Create indexes
create index if not exists user_badges_user_id_idx on public.user_badges(user_id);
create index if not exists user_badges_badge_id_idx on public.user_badges(badge_id);
