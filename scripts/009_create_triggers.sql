-- Create trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Create trigger to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at trigger to relevant tables
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

drop trigger if exists saved_routes_updated_at on public.saved_routes;
create trigger saved_routes_updated_at
  before update on public.saved_routes
  for each row
  execute function public.handle_updated_at();

drop trigger if exists alerts_updated_at on public.alerts;
create trigger alerts_updated_at
  before update on public.alerts
  for each row
  execute function public.handle_updated_at();

drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at
  before update on public.events
  for each row
  execute function public.handle_updated_at();
