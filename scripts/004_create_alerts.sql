-- Create alerts table for traffic incidents and events
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  
  -- Alert details
  title text not null,
  description text not null,
  alert_type text not null, -- 'accident', 'construction', 'event', 'weather', 'protest', 'closure'
  severity text not null, -- 'low', 'medium', 'high', 'critical'
  
  -- Location
  location_address text,
  location_lat numeric(10, 8),
  location_lng numeric(11, 8),
  affected_area_radius_km numeric(10, 2) default 1.0,
  
  -- Affected routes/areas
  affected_streets text[],
  affected_zones text[],
  
  -- Source
  source text not null, -- 'twitter', 'waze', 'metro', 'manual', 'ai_prediction'
  source_url text,
  
  -- Status
  is_active boolean default true,
  start_time timestamp with time zone default now(),
  end_time timestamp with time zone,
  
  -- Metadata
  view_count integer default 0,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS - alerts are public read, admin write
alter table public.alerts enable row level security;

-- RLS Policies - everyone can read active alerts
create policy "alerts_select_all"
  on public.alerts for select
  using (is_active = true);

-- Create indexes
create index if not exists alerts_is_active_idx on public.alerts(is_active);
create index if not exists alerts_alert_type_idx on public.alerts(alert_type);
create index if not exists alerts_severity_idx on public.alerts(severity);
create index if not exists alerts_created_at_idx on public.alerts(created_at desc);
