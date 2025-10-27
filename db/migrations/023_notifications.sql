-- Real-time Notifications System

-- Notifications table
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null, -- 'info', 'success', 'warning', 'error', 'infringement', 'report'
  category text, -- 'system', 'infringement', 'report', 'user', 'team', 'agency'
  priority text default 'normal', -- 'low', 'normal', 'high', 'urgent'
  is_read boolean default false,
  read_at timestamp with time zone,
  action_url text,
  action_label text,
  metadata jsonb,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone
);

-- Notification subscriptions for real-time updates
create table if not exists notification_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  endpoint text not null,
  subscription_data jsonb not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Notification templates for consistency
create table if not exists notification_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  title text not null,
  message text not null,
  type text not null,
  category text,
  variables jsonb, -- Available template variables
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for better performance
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_is_read on notifications(is_read);
create index if not exists idx_notifications_created_at on notifications(created_at);
create index if not exists idx_notifications_type on notifications(type);
create index if not exists idx_notifications_priority on notifications(priority);
create index if not exists idx_notification_subscriptions_user_id on notification_subscriptions(user_id);

-- Enable RLS
alter table notifications enable row level security;
alter table notification_subscriptions enable row level security;
alter table notification_templates enable row level security;

-- RLS Policies for notifications
create policy "Users can view their own notifications"
  on notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can update their own notifications"
  on notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "System can insert notifications"
  on notifications for insert
  to authenticated
  with check (true);

-- RLS Policies for notification_subscriptions
create policy "Users can manage their own subscriptions"
  on notification_subscriptions for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- RLS Policies for notification_templates
create policy "Everyone can view notification templates"
  on notification_templates for select
  to authenticated
  using (is_active = true);

create policy "Super admins can manage notification templates"
  on notification_templates for all
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

-- Function to create notification
create or replace function create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text,
  p_category text default null,
  p_priority text default 'normal',
  p_action_url text default null,
  p_action_label text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_notification_id uuid;
begin
  insert into notifications (
    user_id,
    title,
    message,
    type,
    category,
    priority,
    action_url,
    action_label,
    metadata
  ) values (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_category,
    p_priority,
    p_action_url,
    p_action_label,
    p_metadata
  )
  returning id into v_notification_id;

  return v_notification_id;
end;
$$;

-- Function to mark notification as read
create or replace function mark_notification_read(p_notification_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update notifications
  set is_read = true,
      read_at = now()
  where id = p_notification_id
    and user_id = auth.uid();
end;
$$;

-- Function to mark all notifications as read for a user
create or replace function mark_all_notifications_read()
returns void
language plpgsql
security definer
as $$
begin
  update notifications
  set is_read = true,
      read_at = now()
  where user_id = auth.uid()
    and is_read = false;
end;
$$;

-- Function to delete old notifications
create or replace function delete_old_notifications()
returns void
language plpgsql
security definer
as $$
begin
  delete from notifications
  where created_at < now() - interval '90 days'
    and is_read = true;
  
  delete from notifications
  where expires_at is not null
    and expires_at < now();
end;
$$;

-- Insert default notification templates
insert into notification_templates (name, title, message, type, category, variables)
values 
  (
    'infringement_created',
    'New Infringement Recorded',
    'Infringement {{infringement_number}} has been recorded by {{officer_name}}',
    'info',
    'infringement',
    '{"infringement_number": "string", "officer_name": "string", "vehicle_id": "string"}'::jsonb
  ),
  (
    'report_generated',
    'Report Generated',
    'Your {{report_type}} report is ready for download',
    'success',
    'report',
    '{"report_type": "string", "report_name": "string"}'::jsonb
  ),
  (
    'user_assigned',
    'Team Assignment',
    'You have been assigned to team {{team_name}}',
    'info',
    'team',
    '{"team_name": "string", "role": "string"}'::jsonb
  ),
  (
    'quota_warning',
    'Quota Warning',
    'Your agency has reached {{percentage}}% of its monthly quota',
    'warning',
    'agency',
    '{"percentage": "number", "current": "number", "limit": "number"}'::jsonb
  ),
  (
    'system_maintenance',
    'System Maintenance',
    'Scheduled maintenance on {{date}} from {{start_time}} to {{end_time}}',
    'warning',
    'system',
    '{"date": "string", "start_time": "string", "end_time": "string"}'::jsonb
  )
on conflict (name) do nothing;
