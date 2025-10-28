-- Create profiles table for user data
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  
  -- User preferences
  preferred_transport_modes text[] default array['metro', 'bus', 'walk']::text[],
  home_address text,
  home_lat numeric(10, 8),
  home_lng numeric(11, 8),
  work_address text,
  work_lat numeric(10, 8),
  work_lng numeric(11, 8),
  
  -- Gamification stats
  total_routes_planned integer default 0,
  total_time_saved_minutes integer default 0,
  total_co2_saved_kg numeric(10, 2) default 0,
  total_distance_km numeric(10, 2) default 0,
  level integer default 1,
  experience_points integer default 0,
  
  -- Notification preferences
  enable_traffic_alerts boolean default true,
  enable_route_suggestions boolean default true,
  enable_event_notifications boolean default true,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Create index for faster queries
create index if not exists profiles_email_idx on public.profiles(email);
