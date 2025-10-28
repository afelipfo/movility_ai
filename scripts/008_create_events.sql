-- Create events table for city events affecting mobility
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  
  title text not null,
  description text,
  event_type text not null, -- 'concert', 'sports', 'festival', 'conference', 'parade', 'other'
  
  -- Location
  venue_name text,
  venue_address text,
  venue_lat numeric(10, 8),
  venue_lng numeric(11, 8),
  
  -- Time
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  
  -- Impact
  expected_attendance integer,
  traffic_impact_level text, -- 'low', 'medium', 'high'
  
  -- Source
  source text, -- 'official', 'scraped', 'user_reported'
  source_url text,
  
  is_active boolean default true,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS - events are public read
alter table public.events enable row level security;

create policy "events_select_all"
  on public.events for select
  using (is_active = true);

-- Create indexes
create index if not exists events_start_time_idx on public.events(start_time);
create index if not exists events_is_active_idx on public.events(is_active);
