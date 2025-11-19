-- MANTIS Database Schema - Auth Sync & Triggers
-- Migration: Auto-sync auth.users with public.users and triggers

-- ============================================================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create a basic user profile with officer role by default
  insert into public.users (id, role)
  values (new.id, 'officer')
  on conflict (id) do nothing;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create user profile when auth user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================================================
-- SYNC EXISTING AUTH USERS
-- ============================================================================================
-- This ensures any existing auth.users are synced to public.users
insert into public.users (id, role)
select id, 'officer' as role
from auth.users
where not exists (
  select 1 from public.users where users.id = auth.users.id
)
on conflict (id) do nothing;

-- ============================================================================================
-- AUTO-UPDATE TIMESTAMPS
-- ============================================================================================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at columns where needed (for future use)
-- Note: Most tables only need created_at, but some may benefit from updated_at

-- ============================================================================================
-- NOTIFICATION TRIGGERS
-- ============================================================================================

-- Trigger: Notify officer when payment is received
create or replace function notify_payment_received()
returns trigger as $$
declare
  officer_id uuid;
  infringement_vehicle text;
begin
  -- Get the officer who issued the infringement
  select i.officer_id, i.vehicle_id
  into officer_id, infringement_vehicle
  from public.infringements i
  where i.id = new.infringement_id;
  
  -- Only notify if payment is completed
  if new.payment_status = 'completed' and officer_id is not null then
    perform create_notification(
      officer_id,
      'Payment Received',
      format('Payment of $%s received for vehicle %s', new.amount, coalesce(infringement_vehicle, 'N/A')),
      'success',
      'payment',
      new.id
    );
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_payment_completed on public.payments;
create trigger on_payment_completed
  after insert or update on public.payments
  for each row
  when (new.payment_status = 'completed')
  execute function notify_payment_received();

-- Trigger: Notify team members when assigned to a route
create or replace function notify_route_assignment()
returns trigger as $$
declare
  member_record record;
  route_name text;
begin
  -- Get route name
  select r.name into route_name
  from public.routes r
  where r.id = new.route_id;
  
  -- Notify all team members
  for member_record in
    select tm.user_id
    from public.team_members tm
    where tm.team_id = new.team_id
  loop
    perform create_notification(
      member_record.user_id,
      'New Route Assignment',
      format('Your team has been assigned to route: %s', route_name),
      'info',
      'route',
      new.route_id
    );
  end loop;
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_team_route_assigned on public.team_routes;
create trigger on_team_route_assigned
  after insert on public.team_routes
  for each row
  execute function notify_route_assignment();

-- Trigger: Notify user when added to a team
create or replace function notify_team_membership()
returns trigger as $$
declare
  team_name text;
begin
  -- Get team name
  select t.name into team_name
  from public.teams t
  where t.id = new.team_id;
  
  -- Notify the user
  perform create_notification(
    new.user_id,
    'Added to Team',
    format('You have been added to team: %s', team_name),
    'info',
    'team',
    new.team_id
  );
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_team_member_added on public.team_members;
create trigger on_team_member_added
  after insert on public.team_members
  for each row
  execute function notify_team_membership();

-- ============================================================================================
-- AUDIT LOG TRIGGERS
-- ============================================================================================

-- Generic audit log function
create or replace function log_audit_event()
returns trigger as $$
begin
  if (tg_op = 'DELETE') then
    insert into public.audit_logs (user_id, action, table_name, record_id, old_data)
    values (auth.uid(), 'DELETE', tg_table_name, old.id, to_jsonb(old));
    return old;
  elsif (tg_op = 'UPDATE') then
    insert into public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    values (auth.uid(), 'UPDATE', tg_table_name, new.id, to_jsonb(old), to_jsonb(new));
    return new;
  elsif (tg_op = 'INSERT') then
    insert into public.audit_logs (user_id, action, table_name, record_id, new_data)
    values (auth.uid(), 'INSERT', tg_table_name, new.id, to_jsonb(new));
    return new;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Apply audit logging to critical tables
drop trigger if exists audit_infringements on public.infringements;
create trigger audit_infringements
  after insert or update or delete on public.infringements
  for each row
  execute function log_audit_event();

drop trigger if exists audit_payments on public.payments;
create trigger audit_payments
  after insert or update or delete on public.payments
  for each row
  execute function log_audit_event();

drop trigger if exists audit_users on public.users;
create trigger audit_users
  after insert or update or delete on public.users
  for each row
  execute function log_audit_event();

-- ============================================================================================
-- UTILITY FUNCTIONS
-- ============================================================================================

-- Function to mark all notifications as read for a user
create or replace function mark_all_notifications_read(target_user_id uuid)
returns integer as $$
declare
  updated_count integer;
begin
  update public.notifications
  set is_read = true, read_at = now()
  where user_id = target_user_id and is_read = false;
  
  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$ language plpgsql security definer;

-- Function to clean old notifications (older than 90 days)
create or replace function cleanup_old_notifications()
returns integer as $$
declare
  deleted_count integer;
begin
  delete from public.notifications
  where is_read = true
    and created_at < now() - interval '90 days';
  
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$ language plpgsql security definer;
