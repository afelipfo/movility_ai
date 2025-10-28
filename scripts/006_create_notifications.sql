-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  
  title text not null,
  message text not null,
  notification_type text not null, -- 'alert', 'badge', 'route_suggestion', 'system'
  
  -- Related entities
  related_alert_id uuid references public.alerts(id) on delete set null,
  related_badge_id uuid references public.badges(id) on delete set null,
  
  -- Status
  is_read boolean default false,
  
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_insert_own"
  on public.notifications for insert
  with check (auth.uid() = user_id);

create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "notifications_delete_own"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_is_read_idx on public.notifications(is_read);
create index if not exists notifications_created_at_idx on public.notifications(created_at desc);
