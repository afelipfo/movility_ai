-- Create saved routes table
create table if not exists public.saved_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  
  name text not null,
  description text,
  
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
  estimated_duration_minutes integer,
  estimated_distance_km numeric(10, 2),
  
  -- Metadata
  is_favorite boolean default false,
  use_count integer default 0,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.saved_routes enable row level security;

-- RLS Policies
create policy "saved_routes_select_own"
  on public.saved_routes for select
  using (auth.uid() = user_id);

create policy "saved_routes_insert_own"
  on public.saved_routes for insert
  with check (auth.uid() = user_id);

create policy "saved_routes_update_own"
  on public.saved_routes for update
  using (auth.uid() = user_id);

create policy "saved_routes_delete_own"
  on public.saved_routes for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists saved_routes_user_id_idx on public.saved_routes(user_id);
create index if not exists saved_routes_is_favorite_idx on public.saved_routes(is_favorite);
