-- =============================================================================
-- MANTIS — app_theme table (in-app styling)
-- =============================================================================
-- Single-row, app-wide design tokens edited in-app by App Admin (and DEV
-- Engineer). Read by everyone (so the public landing page is themed too).
-- Apply in the Supabase SQL Editor. Idempotent.
-- =============================================================================

create table if not exists public.app_theme (
  id          text primary key default 'default',
  tokens      jsonb not null default '{}'::jsonb,   -- { "--primary": "oklch(...)", ... }
  updated_at  timestamptz default now(),
  updated_by  uuid references public.users(id)
);

-- Seed the singleton row (empty tokens => app falls back to index.css defaults).
insert into public.app_theme (id, tokens)
values ('default', '{}'::jsonb)
on conflict (id) do nothing;

alter table public.app_theme enable row level security;

-- Everyone may read the theme (incl. anon — the public site is themed).
drop policy if exists app_theme_select on public.app_theme;
create policy app_theme_select on public.app_theme
  for select to anon, authenticated
  using (true);

-- Only App Admin / DEV Engineer may edit styling (NOT Super Admin — styling is
-- an App-Admin concern, matching the /styling route guard).
drop policy if exists app_theme_write on public.app_theme;
create policy app_theme_write on public.app_theme
  for all to authenticated
  using (public.auth_role() in ('DEV Engineer', 'App Admin'))
  with check (public.auth_role() in ('DEV Engineer', 'App Admin'));
