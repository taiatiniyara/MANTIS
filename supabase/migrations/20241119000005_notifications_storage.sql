-- MANTIS Database Schema - Notifications & Storage
-- Migration: Notification system and storage buckets

-- ============================================================================================
-- NOTIFICATIONS
-- ============================================================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('info', 'warning', 'error', 'success')),
  category text check (category in ('infringement', 'payment', 'system', 'team', 'route')),
  related_id uuid,
  is_read boolean default false,
  read_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_is_read on public.notifications(is_read);
create index idx_notifications_type on public.notifications(type);
create index idx_notifications_category on public.notifications(category);
create index idx_notifications_created_at on public.notifications(created_at desc);

-- RLS for notifications
alter table public.notifications enable row level security;

create policy "Super admins can manage all notifications"
  on public.notifications for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "System can create notifications for users"
  on public.notifications for insert
  with check (true);

-- ============================================================================================
-- STORAGE SETUP
-- ============================================================================================

-- Create storage bucket for evidence photos
insert into storage.buckets (id, name, public)
values ('evidence-photos', 'evidence-photos', false)
on conflict (id) do nothing;

-- Storage policies for evidence photos
create policy "Authenticated users can upload evidence photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'evidence-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view their own evidence photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'evidence-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Super admins can view all evidence photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'evidence-photos'
    and exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can view their agency evidence photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'evidence-photos'
    and exists (
      select 1 from public.users as admin
      join public.users as photo_owner on photo_owner.id::text = (storage.foldername(name))[1]
      where admin.id = auth.uid()
      and admin.agency_id = photo_owner.agency_id
      and admin.role = 'agency_admin'
    )
  );

create policy "Users can delete their own evidence photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'evidence-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================================
-- AUDIT LOG
-- ============================================================================================
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default now()
);

create index idx_audit_logs_user_id on public.audit_logs(user_id);
create index idx_audit_logs_table_name on public.audit_logs(table_name);
create index idx_audit_logs_record_id on public.audit_logs(record_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at desc);
create index idx_audit_logs_action on public.audit_logs(action);

-- RLS for audit_logs
alter table public.audit_logs enable row level security;

create policy "Super admins can view all audit logs"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can view their agency audit logs"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'agency_admin'
      and (
        users.id = audit_logs.user_id
        or exists (
          select 1 from public.users as logged_user
          where logged_user.id = audit_logs.user_id
          and logged_user.agency_id = users.agency_id
        )
      )
    )
  );

-- ============================================================================================
-- HELPER FUNCTION: Create notification
-- ============================================================================================
create or replace function create_notification(
  target_user_id uuid,
  notification_title text,
  notification_message text,
  notification_type text default 'info',
  notification_category text default null,
  notification_related_id uuid default null
)
returns uuid as $$
declare
  new_notification_id uuid;
begin
  insert into public.notifications (
    user_id,
    title,
    message,
    type,
    category,
    related_id
  )
  values (
    target_user_id,
    notification_title,
    notification_message,
    notification_type,
    notification_category,
    notification_related_id
  )
  returning id into new_notification_id;
  
  return new_notification_id;
end;
$$ language plpgsql security definer;
