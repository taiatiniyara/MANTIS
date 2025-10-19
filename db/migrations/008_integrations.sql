-- Integration & API Layer

-- API keys for third-party access
create table if not exists api_keys (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  key_hash text unique not null,
  key_prefix text not null, -- First 8 chars for identification
  agency_id uuid references agencies(id),
  permissions jsonb not null default '[]'::jsonb, -- List of allowed endpoints/actions
  rate_limit integer default 100, -- Requests per minute
  is_active boolean default true,
  last_used_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_by uuid references users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Webhook configurations
create table if not exists webhooks (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id),
  name text not null,
  url text not null,
  events text[] not null, -- ['infringement.created', 'payment.completed', etc.]
  secret text not null, -- For signature verification
  is_active boolean default true,
  retry_count integer default 3,
  timeout_seconds integer default 30,
  headers jsonb, -- Custom headers
  created_by uuid references users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Webhook delivery logs
create table if not exists webhook_deliveries (
  id uuid primary key default uuid_generate_v4(),
  webhook_id uuid not null references webhooks(id) on delete cascade,
  event_type text not null,
  payload jsonb not null,
  status text not null, -- 'pending', 'success', 'failed', 'retrying'
  response_code integer,
  response_body text,
  attempt_count integer default 0,
  next_retry_at timestamp with time zone,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- External service integrations
create table if not exists service_integrations (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id),
  service_type text not null, -- 'stripe', 'paypal', 'twilio', 'sendgrid', 'mpesa', etc.
  service_name text not null,
  config jsonb not null, -- API keys, endpoints, etc. (encrypted)
  is_active boolean default true,
  is_test_mode boolean default true,
  last_sync_at timestamp with time zone,
  created_by uuid references users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- API request logs for monitoring
create table if not exists api_request_logs (
  id uuid primary key default uuid_generate_v4(),
  api_key_id uuid references api_keys(id),
  endpoint text not null,
  method text not null,
  status_code integer,
  response_time_ms integer,
  ip_address text,
  user_agent text,
  request_body jsonb,
  response_body jsonb,
  error_message text,
  created_at timestamp with time zone default now()
);

-- Integration activity logs
create table if not exists integration_logs (
  id uuid primary key default uuid_generate_v4(),
  integration_id uuid references service_integrations(id) on delete cascade,
  action text not null, -- 'payment_created', 'sms_sent', 'email_sent', etc.
  status text not null, -- 'success', 'failed'
  request_data jsonb,
  response_data jsonb,
  error_message text,
  created_at timestamp with time zone default now()
);

-- Create indexes
create index if not exists idx_api_keys_key_hash on api_keys(key_hash);
create index if not exists idx_api_keys_agency_id on api_keys(agency_id);
create index if not exists idx_webhooks_agency_id on webhooks(agency_id);
create index if not exists idx_webhook_deliveries_webhook_id on webhook_deliveries(webhook_id);
create index if not exists idx_webhook_deliveries_status on webhook_deliveries(status);
create index if not exists idx_service_integrations_agency_id on service_integrations(agency_id);
create index if not exists idx_service_integrations_type on service_integrations(service_type);
create index if not exists idx_api_request_logs_api_key_id on api_request_logs(api_key_id);
create index if not exists idx_api_request_logs_created_at on api_request_logs(created_at);
create index if not exists idx_integration_logs_integration_id on integration_logs(integration_id);

-- Enable RLS
alter table api_keys enable row level security;
alter table webhooks enable row level security;
alter table webhook_deliveries enable row level security;
alter table service_integrations enable row level security;
alter table api_request_logs enable row level security;
alter table integration_logs enable row level security;

-- RLS Policies
create policy "Admins can manage API keys"
  on api_keys for all
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role in ('super_admin', 'agency_admin', 'manager')
    )
  );

create policy "Admins can manage webhooks"
  on webhooks for all
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role in ('super_admin', 'agency_admin', 'manager')
    )
  );

create policy "Admins can view webhook deliveries"
  on webhook_deliveries for select
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role in ('super_admin', 'agency_admin', 'manager')
    )
  );

create policy "Admins can manage service integrations"
  on service_integrations for all
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role in ('super_admin', 'agency_admin', 'manager')
    )
  );

create policy "Admins can view API logs"
  on api_request_logs for select
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role in ('super_admin', 'agency_admin')
    )
  );

create policy "Admins can view integration logs"
  on integration_logs for select
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role in ('super_admin', 'agency_admin', 'manager')
    )
  );

-- Function to generate API key
create or replace function generate_api_key()
returns text
language plpgsql
as $$
declare
  v_key text;
begin
  v_key := 'mantis_' || encode(gen_random_bytes(32), 'hex');
  return v_key;
end;
$$;

-- Function to trigger webhook
create or replace function trigger_webhook(
  p_event_type text,
  p_payload jsonb
)
returns void
language plpgsql
security definer
as $$
declare
  v_webhook webhooks;
begin
  for v_webhook in
    select * from webhooks
    where is_active = true
    and p_event_type = any(events)
  loop
    insert into webhook_deliveries (
      webhook_id,
      event_type,
      payload,
      status,
      attempt_count
    ) values (
      v_webhook.id,
      p_event_type,
      p_payload,
      'pending',
      0
    );
  end loop;
end;
$$;

-- Function to log API request
create or replace function log_api_request(
  p_api_key_id uuid,
  p_endpoint text,
  p_method text,
  p_status_code integer,
  p_response_time_ms integer,
  p_ip_address text default null,
  p_error_message text default null
)
returns void
language plpgsql
security definer
as $$
begin
  insert into api_request_logs (
    api_key_id,
    endpoint,
    method,
    status_code,
    response_time_ms,
    ip_address,
    error_message
  ) values (
    p_api_key_id,
    p_endpoint,
    p_method,
    p_status_code,
    p_response_time_ms,
    p_ip_address,
    p_error_message
  );
  
  -- Update last_used_at for API key
  update api_keys
  set last_used_at = now()
  where id = p_api_key_id;
end;
$$;
