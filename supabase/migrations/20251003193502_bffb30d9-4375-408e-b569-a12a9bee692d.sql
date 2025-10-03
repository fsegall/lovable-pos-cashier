-- Índices para performance
create index if not exists idx_payments_invoice_status 
  on public.payments (invoice_id, status);

create index if not exists idx_invoices_merchant_status 
  on public.invoices (merchant_id, status);

create index if not exists idx_invoices_reference 
  on public.invoices (ref);

create index if not exists idx_products_merchant 
  on public.products (merchant_id);

create index if not exists idx_merchant_members_user 
  on public.merchant_members (user_id, is_default, status);