-- MANTIS Database Schema - Payments & Finance
-- Migration: Payment processing, reminders, and financial reporting

-- ============================================================================================
-- PAYMENTS
-- ============================================================================================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  infringement_id uuid not null references public.infringements(id) on delete cascade,
  amount numeric(10, 2) not null,
  payment_method text not null check (payment_method in ('cash', 'card', 'bank_transfer', 'mobile_money', 'stripe', 'paypal')),
  payment_status text not null check (payment_status in ('pending', 'completed', 'failed', 'refunded')) default 'pending',
  transaction_id text unique,
  receipt_number text unique,
  paid_at timestamp with time zone,
  processed_by uuid references public.users(id) on delete set null,
  notes text,
  created_at timestamp with time zone default now()
);

create index idx_payments_infringement_id on public.payments(infringement_id);
create index idx_payments_status on public.payments(payment_status);
create index idx_payments_method on public.payments(payment_method);
create index idx_payments_paid_at on public.payments(paid_at);
create index idx_payments_transaction_id on public.payments(transaction_id);

-- RLS for payments
alter table public.payments enable row level security;

create policy "Super admins can manage all payments"
  on public.payments for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can manage their agency payments"
  on public.payments for all
  using (
    exists (
      select 1 from public.users
      join public.infringements on infringements.id = payments.infringement_id
      where users.id = auth.uid()
      and users.agency_id = infringements.agency_id
      and users.role = 'agency_admin'
    )
  );

create policy "Officers can view payments for their infringements"
  on public.payments for select
  using (
    exists (
      select 1 from public.infringements
      where infringements.id = payments.infringement_id
      and infringements.officer_id = auth.uid()
    )
  );

-- ============================================================================================
-- PAYMENT REMINDERS
-- ============================================================================================
create table public.payment_reminders (
  id uuid primary key default gen_random_uuid(),
  infringement_id uuid not null references public.infringements(id) on delete cascade,
  reminder_type text not null check (reminder_type in ('email', 'sms', 'letter', 'push')),
  sent_at timestamp with time zone default now(),
  status text not null check (status in ('sent', 'delivered', 'failed')) default 'sent',
  recipient_contact text,
  message_content text,
  created_at timestamp with time zone default now()
);

create index idx_payment_reminders_infringement_id on public.payment_reminders(infringement_id);
create index idx_payment_reminders_type on public.payment_reminders(reminder_type);
create index idx_payment_reminders_status on public.payment_reminders(status);
create index idx_payment_reminders_sent_at on public.payment_reminders(sent_at);

-- RLS for payment_reminders
alter table public.payment_reminders enable row level security;

create policy "Super admins can manage all payment reminders"
  on public.payment_reminders for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can manage their agency payment reminders"
  on public.payment_reminders for all
  using (
    exists (
      select 1 from public.users
      join public.infringements on infringements.id = payment_reminders.infringement_id
      where users.id = auth.uid()
      and users.agency_id = infringements.agency_id
      and users.role = 'agency_admin'
    )
  );

-- ============================================================================================
-- FINANCE REPORTS VIEW
-- ============================================================================================
create or replace view public.finance_reports as
select
  i.agency_id,
  a.name as agency_name,
  it.gl_code,
  it.code as infringement_code,
  it.name as infringement_name,
  count(i.id) as infringement_count,
  sum(it.fine_amount) as total_fines,
  min(i.issued_at) as first_infringement,
  max(i.issued_at) as last_infringement
from public.infringements i
join public.infringement_types it on it.id = i.type_id
left join public.agencies a on a.id = i.agency_id
group by i.agency_id, a.name, it.gl_code, it.code, it.name;

-- Grant access to finance_reports view
grant select on public.finance_reports to authenticated;
