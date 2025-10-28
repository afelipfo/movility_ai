-- Create route history table
create table if not exists public.route_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  
  -- Origin
  origin_address text not null,
  origin_lat numeric(10, 8) not null,
  origin_lng numeric(11, 8) not null,
  
  -- Destination
  destination_address text not null,
  destination_lat numeric(10, 8) not null,
  destination_lng numeric(11, 8) not null,
  
  -- Route details
  transport_modes text[] not null,
  actual_duration_minutes integer,
  actual_distance_km numeric(10, 2),
  
  -- AI recommendations
  ai_recommendation_used boolean default false,
  alternative_routes_count integer default 0,
  
  -- Metrics
  time_saved_minutes integer default 0,
  co2_saved_kg numeric(10, 2) default 0,
  
  -- Traffic conditions at time of route
  traffic_level text, -- 'low', 'medium', 'high', 'severe'
  
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.route_history enable row level security;

-- RLS Policies
create policy "route_history_select_own"
  on public.route_history for select
  using (auth.uid() = user_id);

create policy "route_history_insert_own"
  on public.route_history for insert
  with check (auth.uid() = user_id);

create policy "route_history_delete_own"
  on public.route_history for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists route_history_user_id_idx on public.route_history(user_id);
create index if not exists route_history_created_at_idx on public.route_history(created_at desc);
