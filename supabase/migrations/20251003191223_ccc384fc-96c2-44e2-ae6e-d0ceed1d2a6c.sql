-- Create app schema for helper functions
create schema if not exists app;

-- ============================================
-- TABLES
-- ============================================

-- 1) Merchants table
create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  wallet_masked text not null,
  category text,
  email text,
  phone text,
  onboarding_complete boolean not null default false,
  pix_settlement boolean not null default true,
  pay_with_binance boolean not null default false,
  use_program boolean not null default true,
  demo_mode boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Products table (catalog)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  name text not null,
  price_brl numeric(10,2) not null,
  image_url text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Invoices table (payment requests created in POS)
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  amount_brl numeric(10,2) not null,
  ref text not null,
  status text not null check (status in ('pending','confirmed','settled','error')),
  product_ids uuid[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4) Payments table (actual payments made against invoices)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  tx_hash text,
  amount_brl numeric(10,2) not null,
  status text not null check (status in ('pending','confirmed','settled','error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5) Receipts table (final proof of payment)
create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  receipt_data jsonb not null,
  created_at timestamptz not null default now()
);

-- 6) Merchant members table (multi-tenancy control)
create table if not exists public.merchant_members (
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','staff')),
  is_default boolean not null default false,
  name text,
  email text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  primary key (merchant_id, user_id)
);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if current user is member of merchant
create or replace function app.is_member(m_id uuid)
returns boolean 
language sql 
stable 
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.merchant_members mm
    where mm.merchant_id = m_id 
      and mm.user_id = auth.uid()
      and mm.status = 'active'
  );
$$;

-- Check if current user is owner of merchant
create or replace function app.is_owner(m_id uuid)
returns boolean 
language sql 
stable 
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.merchant_members mm
    where mm.merchant_id = m_id 
      and mm.user_id = auth.uid()
      and mm.role = 'owner'
      and mm.status = 'active'
  );
$$;

-- Get user's default merchant
create or replace function app.get_default_merchant()
returns uuid 
language sql 
stable 
security definer
set search_path = public
as $$
  select merchant_id from public.merchant_members
  where user_id = auth.uid() 
    and is_default = true 
    and status = 'active'
  limit 1;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.merchants enable row level security;
alter table public.products enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.receipts enable row level security;
alter table public.merchant_members enable row level security;

-- Merchants policies
create policy "merchants_select" on public.merchants 
  for select using (app.is_member(id));

create policy "merchants_insert" on public.merchants 
  for insert with check (true);

create policy "merchants_update" on public.merchants 
  for update using (app.is_owner(id));

create policy "merchants_delete" on public.merchants 
  for delete using (app.is_owner(id));

-- Products policies
create policy "products_select" on public.products 
  for select using (app.is_member(merchant_id));

create policy "products_insert" on public.products 
  for insert with check (app.is_member(merchant_id));

create policy "products_update" on public.products 
  for update using (app.is_member(merchant_id));

create policy "products_delete" on public.products 
  for delete using (app.is_member(merchant_id));

-- Invoices policies
create policy "invoices_select" on public.invoices 
  for select using (app.is_member(merchant_id));

create policy "invoices_insert" on public.invoices 
  for insert with check (app.is_member(merchant_id));

create policy "invoices_update" on public.invoices 
  for update using (app.is_member(merchant_id));

-- Payments policies
create policy "payments_select" on public.payments 
  for select using (
    app.is_member((select merchant_id from public.invoices where id = invoice_id))
  );

create policy "payments_insert" on public.payments 
  for insert with check (
    app.is_member((select merchant_id from public.invoices where id = invoice_id))
  );

create policy "payments_update" on public.payments 
  for update using (
    app.is_member((select merchant_id from public.invoices where id = invoice_id))
  );

-- Receipts policies
create policy "receipts_select" on public.receipts 
  for select using (
    app.is_member((
      select i.merchant_id 
      from public.invoices i 
      join public.payments p on p.invoice_id = i.id 
      where p.id = payment_id
    ))
  );

create policy "receipts_insert" on public.receipts 
  for insert with check (
    app.is_member((
      select i.merchant_id 
      from public.invoices i 
      join public.payments p on p.invoice_id = i.id 
      where p.id = payment_id
    ))
  );

-- Merchant members policies
create policy "members_select_own" on public.merchant_members 
  for select using (user_id = auth.uid());

create policy "members_insert_owner" on public.merchant_members 
  for insert with check (app.is_owner(merchant_id));

create policy "members_update_owner" on public.merchant_members 
  for update using (app.is_owner(merchant_id));

create policy "members_delete_owner" on public.merchant_members 
  for delete using (app.is_owner(merchant_id));

-- ============================================
-- INDEXES
-- ============================================

create index if not exists idx_products_merchant on public.products(merchant_id);
create index if not exists idx_invoices_merchant on public.invoices(merchant_id);
create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_payments_invoice on public.payments(invoice_id);
create index if not exists idx_receipts_payment on public.receipts(payment_id);
create index if not exists idx_members_user on public.merchant_members(user_id);
create index if not exists idx_members_merchant on public.merchant_members(merchant_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_merchants_updated_at before update on public.merchants
  for each row execute procedure public.update_updated_at_column();

create trigger update_products_updated_at before update on public.products
  for each row execute procedure public.update_updated_at_column();

create trigger update_invoices_updated_at before update on public.invoices
  for each row execute procedure public.update_updated_at_column();

create trigger update_payments_updated_at before update on public.payments
  for each row execute procedure public.update_updated_at_column();