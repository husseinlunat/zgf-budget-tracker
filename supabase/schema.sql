-- ============================================================
-- ZGF Smart Budget Tracker — Supabase Schema
-- Run this in your Supabase project's SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── 1. budget_lines ────────────────────────────────────────
create table if not exists public.budget_lines (
  id              text primary key,           -- e.g. "KL-001", "ZGF-002"
  funding_source  text not null,              -- "KaluluII" | "ZGF"
  strategic_pillar text not null,
  objective       text,
  activity        text not null,
  budget_code     text,
  odoo_code       text,
  odoo_category   text,
  zgf_code        text,
  currency        text default 'ZMW',
  total_cost      numeric(15,2) default 0,
  q1              numeric(15,2) default 0,
  q2              numeric(15,2) default 0,
  q3              numeric(15,2) default 0,
  q4              numeric(15,2) default 0,
  spent           numeric(15,2) default 0,    -- computed: sum of approved deductions
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── 2. payment_requests ────────────────────────────────────
create table if not exists public.payment_requests (
  id              text primary key,           -- SharePoint Item ID e.g. "PR-2026-001"
  sharepoint_id   integer,                    -- raw SharePoint list item ID
  name            text not null,
  budget_code     text,
  budget_line_id  text references public.budget_lines(id) on delete set null,
  year            integer,
  amount          numeric(15,2) default 0,
  requested_by    text,
  status          text check (status in ('Pending','Approved','Rejected')) default 'Pending',
  date            date,
  synced_at       timestamptz,               -- last time synced from SharePoint
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── 3. deductions log ──────────────────────────────────────
create table if not exists public.deductions (
  id              uuid primary key default uuid_generate_v4(),
  payment_request_id text references public.payment_requests(id) on delete cascade,
  budget_line_id  text references public.budget_lines(id) on delete cascade,
  amount          numeric(15,2) not null,
  deducted_at     timestamptz default now()
);

-- ─── Indexes ─────────────────────────────────────────────────
create index if not exists idx_payment_requests_status         on public.payment_requests(status);
create index if not exists idx_payment_requests_budget_line_id on public.payment_requests(budget_line_id);
create index if not exists idx_budget_lines_funding_source     on public.budget_lines(funding_source);

-- ─── Auto-update updated_at ──────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_budget_lines_updated_at on public.budget_lines;
create trigger trg_budget_lines_updated_at
  before update on public.budget_lines
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_payment_requests_updated_at on public.payment_requests;
create trigger trg_payment_requests_updated_at
  before update on public.payment_requests
  for each row execute procedure public.set_updated_at();

-- ─── Auto-deduction function ─────────────────────────────────
-- Called when a payment_request status changes to 'Approved'
create or replace function public.handle_approval()
returns trigger language plpgsql as $$
begin
  -- Only act when status flips to Approved and wasn't Approved before
  if new.status = 'Approved' and coalesce(old.status, '') <> 'Approved' then
    -- Insert deduction log
    insert into public.deductions (payment_request_id, budget_line_id, amount)
    values (new.id, new.budget_line_id, new.amount);

    -- Update spent on the budget line
    update public.budget_lines
    set spent = spent + new.amount
    where id = new.budget_line_id;

  -- If status reverts from Approved → reverse the deduction
  elsif old.status = 'Approved' and new.status <> 'Approved' then
    delete from public.deductions
    where payment_request_id = new.id;

    update public.budget_lines
    set spent = greatest(0, spent - new.amount)
    where id = new.budget_line_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_handle_approval on public.payment_requests;
create trigger trg_handle_approval
  after update of status on public.payment_requests
  for each row execute procedure public.handle_approval();

-- ─── Row Level Security ──────────────────────────────────────
alter table public.budget_lines      enable row level security;
alter table public.payment_requests  enable row level security;
alter table public.deductions        enable row level security;

-- Allow anon read (public dashboard)
create policy "Allow anon read budget_lines"
  on public.budget_lines for select using (true);

create policy "Allow anon read payment_requests"
  on public.payment_requests for select using (true);

create policy "Allow anon read deductions"
  on public.deductions for select using (true);

-- Allow authenticated writes (for sync service)
create policy "Allow auth insert/update payment_requests"
  on public.payment_requests for all using (auth.role() = 'authenticated');

create policy "Allow auth insert/update budget_lines"
  on public.budget_lines for all using (auth.role() = 'authenticated');

-- Enable Realtime on payment_requests and budget_lines
-- (do this in the Supabase dashboard under Database > Replication, or run:)
-- alter publication supabase_realtime add table public.payment_requests;
-- alter publication supabase_realtime add table public.budget_lines;
