-- Create traffic predictions table for ML data
create table if not exists public.traffic_predictions (
  id uuid primary key default gen_random_uuid(),
  
  -- Location
  zone_name text not null,
  zone_lat numeric(10, 8) not null,
  zone_lng numeric(11, 8) not null,
  
  -- Prediction
  predicted_traffic_level text not null, -- 'low', 'medium', 'high', 'severe'
  confidence_score numeric(3, 2), -- 0.00 to 1.00
  
  -- Time window
  prediction_for_time timestamp with time zone not null,
  prediction_window_minutes integer default 30,
  
  -- Factors
  day_of_week integer, -- 0-6
  hour_of_day integer, -- 0-23
  is_holiday boolean default false,
  weather_condition text,
  
  -- Model info
  model_version text,
  
  created_at timestamp with time zone default now()
);

-- Enable RLS - predictions are public read
alter table public.traffic_predictions enable row level security;

create policy "traffic_predictions_select_all"
  on public.traffic_predictions for select
  using (true);

-- Create indexes
create index if not exists traffic_predictions_zone_name_idx on public.traffic_predictions(zone_name);
create index if not exists traffic_predictions_prediction_for_time_idx on public.traffic_predictions(prediction_for_time);
