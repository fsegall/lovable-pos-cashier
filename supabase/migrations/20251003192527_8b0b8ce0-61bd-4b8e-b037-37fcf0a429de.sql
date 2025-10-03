-- Helper: Define merchant padrão do usuário
create or replace function app.set_default_merchant(_merchant_id uuid)
returns void 
language plpgsql 
security definer
set search_path = public
as $$
begin
  -- Remove is_default de todos os merchants do usuário
  update public.merchant_members
    set is_default = false
  where user_id = auth.uid();
  
  -- Define o novo merchant como padrão
  update public.merchant_members
    set is_default = true
  where user_id = auth.uid() 
    and merchant_id = _merchant_id;
end;
$$;

-- Helper: Retorna merchant padrão do usuário (alias para get_default_merchant)
create or replace function app.current_merchant()
returns uuid 
language sql 
stable 
security definer
set search_path = public
as $$
  select merchant_id 
  from public.merchant_members
  where user_id = auth.uid() 
    and is_default = true 
    and status = 'active'
  limit 1;
$$;

-- Helper: Cria invoice + payment automaticamente
create or replace function app.create_invoice_with_payment(
  _amount_brl numeric,
  _ref text,
  _product_ids uuid[] default '{}'
)
returns uuid 
language plpgsql 
security definer
set search_path = public
as $$
declare 
  _merchant_id uuid;
  _invoice_id uuid;
begin
  -- Pega merchant padrão
  _merchant_id := app.current_merchant();
  if _merchant_id is null then 
    raise exception 'No default merchant set for user'; 
  end if;

  -- Cria invoice
  insert into public.invoices (merchant_id, amount_brl, ref, status, product_ids)
    values (_merchant_id, _amount_brl, _ref, 'pending', _product_ids)
    returning id into _invoice_id;
  
  -- Cria payment pendente associado
  insert into public.payments (invoice_id, amount_brl, status)
    values (_invoice_id, _amount_brl, 'pending');
  
  return _invoice_id;
end;
$$;

-- Helper: Atualiza status de payment e invoice
create or replace function app.update_payment_status(
  _invoice_id uuid,
  _new_status text,
  _tx_hash text default null
)
returns void 
language plpgsql 
security definer
set search_path = public
as $$
declare
  _merchant_id uuid;
  _payment_id uuid;
begin
  -- Verifica se o invoice pertence ao merchant do usuário
  _merchant_id := app.current_merchant();
  if not exists (
    select 1 from public.invoices 
    where id = _invoice_id and merchant_id = _merchant_id
  ) then
    raise exception 'Invoice not found or access denied';
  end if;

  -- Atualiza invoice
  update public.invoices
    set status = _new_status
  where id = _invoice_id;
  
  -- Atualiza payment
  select id into _payment_id 
  from public.payments 
  where invoice_id = _invoice_id 
  limit 1;
  
  if _payment_id is not null then
    update public.payments
      set status = _new_status,
          tx_hash = coalesce(_tx_hash, tx_hash)
    where id = _payment_id;
  end if;
end;
$$;

-- View/Function: Lista todos os receipts (invoices com payments) do merchant
create or replace function app.list_receipts(
  _from timestamptz default now() - interval '30 days',
  _to timestamptz default now()
)
returns table (
  id uuid,
  created_at timestamptz,
  amount_brl numeric,
  status text,
  ref text,
  tx_hash text,
  product_ids uuid[]
)
language sql 
stable 
security definer
set search_path = public
as $$
  select 
    i.id,
    i.created_at,
    i.amount_brl,
    i.status,
    i.ref,
    p.tx_hash,
    i.product_ids
  from public.invoices i
  left join public.payments p on p.invoice_id = i.id
  where i.merchant_id = app.current_merchant()
    and i.created_at between _from and _to
  order by i.created_at desc;
$$;

-- Helper: Marca invoice como confirmado com tx_hash
create or replace function app.mark_confirmed(
  _ref text,
  _tx_hash text
)
returns void 
language plpgsql 
security definer
set search_path = public
as $$
declare
  _merchant_id uuid;
  _invoice_id uuid;
begin
  _merchant_id := app.current_merchant();
  
  -- Busca invoice pelo ref
  select id into _invoice_id 
  from public.invoices 
  where merchant_id = _merchant_id and ref = _ref;
  
  if _invoice_id is null then 
    raise exception 'Invoice not found for ref: %', _ref; 
  end if;
  
  -- Atualiza para confirmed
  perform app.update_payment_status(_invoice_id, 'confirmed', _tx_hash);
end;
$$;

-- Helper: Marca invoice como settled
create or replace function app.mark_settled(_ref text)
returns void 
language plpgsql 
security definer
set search_path = public
as $$
declare
  _merchant_id uuid;
  _invoice_id uuid;
begin
  _merchant_id := app.current_merchant();
  
  -- Busca invoice pelo ref
  select id into _invoice_id 
  from public.invoices 
  where merchant_id = _merchant_id and ref = _ref;
  
  if _invoice_id is null then 
    raise exception 'Invoice not found for ref: %', _ref; 
  end if;
  
  -- Atualiza para settled
  perform app.update_payment_status(_invoice_id, 'settled');
end;
$$;