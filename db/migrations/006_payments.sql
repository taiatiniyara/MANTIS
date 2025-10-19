-- Payment Integration System

-- Payments table
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  infringement_id uuid not null references infringements(id) on delete cascade,
  payment_reference text unique not null,
  payment_method text not null, -- 'card', 'cash', 'bank_transfer', 'mobile_money'
  payment_provider text, -- 'stripe', 'paypal', 'westpac', 'mpesa', etc.
  amount decimal(10, 2) not null,
  currency text default 'FJD',
  status text not null default 'pending', -- 'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
  paid_at timestamp with time zone,
  payer_name text,
  payer_email text,
  payer_phone text,
  transaction_id text,
  receipt_number text unique,
  receipt_url text,
  metadata jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Refunds table
create table if not exists refunds (
  id uuid primary key default uuid_generate_v4(),
  payment_id uuid not null references payments(id) on delete cascade,
  refund_reference text unique not null,
  amount decimal(10, 2) not null,
  reason text not null,
  status text not null default 'pending', -- 'pending', 'processing', 'completed', 'failed'
  processed_at timestamp with time zone,
  processed_by uuid references users(id),
  transaction_id text,
  metadata jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Payment reconciliation records
create table if not exists payment_reconciliations (
  id uuid primary key default uuid_generate_v4(),
  reconciliation_date date not null,
  agency_id uuid references agencies(id),
  total_payments decimal(10, 2) default 0,
  total_refunds decimal(10, 2) default 0,
  net_amount decimal(10, 2) default 0,
  payment_count integer default 0,
  refund_count integer default 0,
  status text not null default 'draft', -- 'draft', 'submitted', 'approved', 'rejected'
  reconciled_by uuid references users(id),
  approved_by uuid references users(id),
  submitted_at timestamp with time zone,
  approved_at timestamp with time zone,
  notes text,
  file_url text,
  metadata jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Payment reminders
create table if not exists payment_reminders (
  id uuid primary key default uuid_generate_v4(),
  infringement_id uuid not null references infringements(id) on delete cascade,
  reminder_type text not null, -- 'first', 'second', 'final', 'overdue'
  reminder_method text not null, -- 'email', 'sms', 'mail'
  sent_at timestamp with time zone default now(),
  recipient_email text,
  recipient_phone text,
  recipient_address text,
  status text not null default 'sent', -- 'sent', 'delivered', 'failed'
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- Create indexes
create index if not exists idx_payments_infringement_id on payments(infringement_id);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_payments_paid_at on payments(paid_at);
create index if not exists idx_payments_payment_reference on payments(payment_reference);
create index if not exists idx_refunds_payment_id on refunds(payment_id);
create index if not exists idx_refunds_status on refunds(status);
create index if not exists idx_payment_reconciliations_date on payment_reconciliations(reconciliation_date);
create index if not exists idx_payment_reconciliations_agency_id on payment_reconciliations(agency_id);
create index if not exists idx_payment_reminders_infringement_id on payment_reminders(infringement_id);

-- Enable RLS
alter table payments enable row level security;
alter table refunds enable row level security;
alter table payment_reconciliations enable row level security;
alter table payment_reminders enable row level security;

-- RLS Policies for payments
create policy "Super admins can view all payments"
  on payments for select
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can view their agency payments"
  on payments for select
  to authenticated
  using (
    exists (
      select 1 from users u
      join infringements i on i.id = payments.infringement_id
      where u.id = auth.uid()
      and u.role in ('agency_admin', 'manager')
      and u.agency_id = i.agency_id
    )
  );

create policy "Finance users can manage payments"
  on payments for all
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role in ('super_admin', 'agency_admin', 'manager')
    )
  );

-- RLS Policies for refunds
create policy "Admins can manage refunds"
  on refunds for all
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role in ('super_admin', 'agency_admin', 'manager')
    )
  );

-- RLS Policies for payment_reconciliations
create policy "Admins can manage reconciliations"
  on payment_reconciliations for all
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role in ('super_admin', 'agency_admin', 'manager')
    )
  );

-- RLS Policies for payment_reminders
create policy "Admins can manage reminders"
  on payment_reminders for all
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role in ('super_admin', 'agency_admin', 'manager')
    )
  );

-- Function to generate payment reference
create or replace function generate_payment_reference()
returns text
language plpgsql
as $$
declare
  v_reference text;
  v_exists boolean;
begin
  loop
    v_reference := 'PAY-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 8));
    
    select exists(select 1 from payments where payment_reference = v_reference) into v_exists;
    
    if not v_exists then
      return v_reference;
    end if;
  end loop;
end;
$$;

-- Function to generate receipt number
create or replace function generate_receipt_number()
returns text
language plpgsql
as $$
declare
  v_receipt text;
  v_exists boolean;
begin
  loop
    v_receipt := 'RCT-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 999999)::text, 6, '0');
    
    select exists(select 1 from payments where receipt_number = v_receipt) into v_exists;
    
    if not v_exists then
      return v_receipt;
    end if;
  end loop;
end;
$$;

-- Trigger to set payment reference
create or replace function set_payment_reference()
returns trigger
language plpgsql
as $$
begin
  if new.payment_reference is null then
    new.payment_reference := generate_payment_reference();
  end if;
  
  if new.status = 'completed' and new.receipt_number is null then
    new.receipt_number := generate_receipt_number();
  end if;
  
  new.updated_at := now();
  
  return new;
end;
$$;

create trigger trigger_set_payment_reference
  before insert or update on payments
  for each row
  execute function set_payment_reference();

-- Function to calculate reconciliation totals
create or replace function calculate_reconciliation_totals(
  p_reconciliation_id uuid
)
returns void
language plpgsql
security definer
as $$
declare
  v_reconciliation payment_reconciliations;
  v_total_payments decimal(10, 2);
  v_total_refunds decimal(10, 2);
  v_payment_count integer;
  v_refund_count integer;
begin
  select * into v_reconciliation
  from payment_reconciliations
  where id = p_reconciliation_id;

  -- Calculate payment totals
  select 
    coalesce(sum(p.amount), 0),
    count(p.id)
  into v_total_payments, v_payment_count
  from payments p
  join infringements i on i.id = p.infringement_id
  where p.status = 'completed'
    and date(p.paid_at) = v_reconciliation.reconciliation_date
    and (v_reconciliation.agency_id is null or i.agency_id = v_reconciliation.agency_id);

  -- Calculate refund totals
  select 
    coalesce(sum(r.amount), 0),
    count(r.id)
  into v_total_refunds, v_refund_count
  from refunds r
  join payments p on p.id = r.payment_id
  join infringements i on i.id = p.infringement_id
  where r.status = 'completed'
    and date(r.processed_at) = v_reconciliation.reconciliation_date
    and (v_reconciliation.agency_id is null or i.agency_id = v_reconciliation.agency_id);

  -- Update reconciliation
  update payment_reconciliations
  set 
    total_payments = v_total_payments,
    total_refunds = v_total_refunds,
    net_amount = v_total_payments - v_total_refunds,
    payment_count = v_payment_count,
    refund_count = v_refund_count,
    updated_at = now()
  where id = p_reconciliation_id;
end;
$$;
