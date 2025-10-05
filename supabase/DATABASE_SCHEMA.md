# Database Schema - Merchant AI Checkout

Este documento detalha o schema PostgreSQL do projeto Merchant AI Checkout, incluindo tabelas, funções RPC, políticas RLS e configurações do Supabase.

---

## 📊 Visão Geral

O banco de dados foi projetado para suportar **multi-tenancy** com **Row Level Security (RLS)**, permitindo que múltiplos merchants operem de forma isolada e segura.

### Arquitetura Principal

```
auth.users (Supabase Auth)
    ↓
merchant_members (RBAC)
    ↓
merchants (tenant principal)
    ↓
products, invoices, payments, receipts
```

---

## 🗃️ Tabelas Principais

### 1. `merchants` - Dados do Merchant

```sql
create table public.merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null,                    -- Nome do estabelecimento
  logo_url text,                         -- URL do logo
  wallet_masked text not null,           -- Endereço da wallet (mascarado)
  category text,                         -- Categoria do negócio
  email text,                           -- Email de contato
  phone text,                           -- Telefone de contato
  onboarding_complete boolean not null default false,
  pix_settlement boolean not null default true,     -- Habilita liquidação PIX
  pay_with_binance boolean not null default false,  -- Habilita pagamento via Binance
  use_program boolean not null default true,        -- Usa programa Solana
  demo_mode boolean not null default true,          -- Modo demo
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 2. `merchant_members` - Controle de Acesso

```sql
create table public.merchant_members (
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','staff')),
  is_default boolean not null default false,        -- Merchant padrão do usuário
  name text,                                        -- Nome do membro
  email text,                                       -- Email do membro
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  primary key (merchant_id, user_id)
);
```

### 3. `products` - Catálogo de Produtos

```sql
create table public.products (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  name text not null,                               -- Nome do produto
  price_brl numeric(10,2) not null,                -- Preço em BRL
  image_url text,                                   -- URL da imagem
  category text,                                    -- Categoria do produto
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 4. `invoices` - Cobranças/Pedidos

```sql
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  amount_brl numeric(10,2) not null,               -- Valor em BRL
  ref text not null,                                -- Referência única (para Solana Pay)
  status text not null check (status in ('pending','confirmed','settled','error')),
  product_ids uuid[] default '{}',                  -- IDs dos produtos
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 5. `payments` - Pagamentos

```sql
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  tx_hash text,                                     -- Hash da transação blockchain
  amount_brl numeric(10,2) not null,               -- Valor do pagamento
  status text not null check (status in ('pending','confirmed','settled','error')),
  pix_payment_id text,                              -- ID do pagamento PIX (Transfero)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 6. `receipts` - Comprovantes Finais

```sql
create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  receipt_data jsonb not null,                      -- Dados do comprovante (PDF, etc.)
  created_at timestamptz not null default now()
);
```

---

## 🔧 Funções RPC (Schema `app`)

### Funções de Acesso

```sql
-- Verifica se usuário é membro do merchant
app.is_member(m_id uuid) → boolean

-- Verifica se usuário é owner do merchant
app.is_owner(m_id uuid) → boolean

-- Retorna merchant padrão do usuário
app.current_merchant() → uuid

-- Define merchant padrão
app.set_default_merchant(_merchant_id uuid) → void
```

### Funções de Negócio

```sql
-- Cria invoice + payment automaticamente
app.create_invoice_with_payment(
  _amount_brl numeric,
  _ref text,
  _product_ids uuid[] default '{}'
) → uuid

-- Atualiza status de payment e invoice
app.update_payment_status(
  _invoice_id uuid,
  _new_status text,
  _tx_hash text default null
) → void

-- Marca invoice como confirmado
app.mark_confirmed(_ref text, _tx_hash text) → void

-- Marca invoice como liquidado
app.mark_settled(_ref text) → void
```

### Funções de Consulta

```sql
-- Lista todos os receipts do merchant
app.list_receipts(
  _from timestamptz default now() - interval '30 days',
  _to timestamptz default now()
) → table (
  id uuid,
  created_at timestamptz,
  amount_brl numeric,
  status text,
  ref text,
  tx_hash text,
  payment_id uuid,
  product_ids uuid[]
)
```

---

## 🔒 Row Level Security (RLS)

### Políticas de Acesso

Todas as tabelas principais possuem RLS habilitado:

#### `merchants`
- **SELECT**: Apenas membros ativos
- **INSERT**: Qualquer usuário autenticado
- **UPDATE/DELETE**: Apenas owners

#### `products`
- **SELECT/INSERT/UPDATE/DELETE**: Apenas membros do merchant

#### `invoices`
- **SELECT/INSERT/UPDATE**: Apenas membros do merchant
- **DELETE**: Não permitido

#### `payments`
- **SELECT/INSERT/UPDATE**: Apenas membros do merchant do invoice associado

#### `receipts`
- **SELECT/INSERT**: Apenas membros do merchant do payment associado

#### `merchant_members`
- **SELECT**: Usuário só vê seus próprios membros
- **INSERT/UPDATE/DELETE**: Apenas owners do merchant

---

## 📈 Índices para Performance

### Índices Básicos
```sql
-- Tabelas principais
idx_products_merchant on products(merchant_id)
idx_invoices_merchant on invoices(merchant_id)
idx_invoices_status on invoices(status)
idx_payments_invoice on payments(invoice_id)
idx_receipts_payment on receipts(payment_id)

-- Multi-tenancy
idx_members_user on merchant_members(user_id)
idx_members_merchant on merchant_members(merchant_id)
```

### Índices Compostos
```sql
-- Performance de consultas
idx_payments_invoice_status on payments(invoice_id, status)
idx_invoices_merchant_status on invoices(merchant_id, status)
idx_invoices_reference on invoices(ref)
idx_products_merchant on products(merchant_id)
idx_merchant_members_user on merchant_members(user_id, is_default, status)
```

---

## 🔄 Realtime Subscriptions

### Tabelas com Realtime Habilitado
```sql
-- Habilitado via ALTER PUBLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
```

### Uso no Frontend
```typescript
// Exemplo de subscription
supabase
  .channel('invoices')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'invoices',
    filter: `merchant_id=eq.${merchantId}`
  }, (payload) => {
    // Atualizar UI em tempo real
  })
  .subscribe()
```

---

## 🗂️ Triggers

### Auto-Update Timestamps
```sql
-- Função para atualizar updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Aplicado nas tabelas:
-- merchants, products, invoices, payments
```

---

## 🚀 Edge Functions Integration

### Variáveis de Ambiente Necessárias
```bash
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
MERCHANT_RECIPIENT=your_merchant_spl_wallet_address
BRZ_MINT=FtgGSFADXBtroxq8VCausXRr2of47QBf5AS1NtZCu4GD

# Webhook Security
WEBHOOK_SECRET=your_webhook_hmac_secret

# Transfero (PIX Settlement)
TRANSFERO_BASE_URL=https://staging-openbanking.bit.one/
TRANSFERO_CLIENT_ID=your_transfero_client_id
TRANSFERO_CLIENT_SECRET=your_transfero_client_secret
TRANSFERO_ACCOUNT_ID=your_transfero_account_id

# Development
DEMO_MODE=true
```

### RPC Functions Chamadas pelas Edge Functions
- `app.mark_confirmed(ref, tx_hash)` - Marca pagamento como confirmado
- `app.mark_settled(ref)` - Marca pagamento como liquidado
- `app.list_receipts(from, to)` - Lista receipts para export CSV

---

## 🔧 Configuração do Supabase

### `config.toml`
```toml
project_id = "niocfujcwmbwictdpfsn"

[functions.chat-assistant]
verify_jwt = true
```

### Schemas Expostos
No Supabase Studio → Settings → API → Exposed schemas:
- `public` (tabelas principais)
- `app` (funções RPC)

---

## 📝 Migrations

### Estrutura das Migrations
```
supabase/migrations/
├── 20251003191223_ccc384fc-96c2-44e2-ae6e-d0ceed1d2a6c.sql  # Schema inicial
├── 20251003191307_81689cd4-794e-419e-8e8e-54f019b75542.sql  # Ajustes
├── 20251003192527_8b0b8ce0-61bd-4b8e-b037-37fcf0a429de.sql  # Funções RPC
├── 20251003193502_bffb30d9-4375-408e-b569-a12a9bee692d.sql  # Índices
├── 20251003200559_e0de1edc-a8bb-433a-8ffc-4f77a066c843.sql  # Ajustes
├── 20251003202447_0470386c-e464-4103-ab69-f35a3808e111.sql  # Ajustes
└── 20251004012116_28cf89d1-2718-431e-89ae-90b9bfe94d2f.sql  # Realtime
```

### Aplicar Migrations
```bash
# Reset completo (desenvolvimento)
npx supabase db reset

# Aplicar nova migration
npx supabase db push

# Ver status
npx supabase db diff
```

---

## 🧪 Desenvolvimento Local

### Setup Inicial
```bash
# Iniciar Supabase local
npx supabase start

# Aplicar migrations
npx supabase db reset

# Gerar tipos TypeScript
npx supabase gen types typescript --local > src/integrations/supabase/types-generated.ts
```

### URLs Locais
- **App**: http://localhost:5173
- **Supabase Studio**: http://localhost:54323
- **Edge Functions**: http://localhost:54321/functions/v1/

---

## 🔍 Queries Úteis

### Verificar RLS
```sql
-- Ver políticas ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public';

-- Testar acesso
SELECT app.current_merchant();
SELECT app.is_member('merchant-id');
```

### Monitorar Performance
```sql
-- Ver índices em uso
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Ver queries lentas
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 🚨 Troubleshooting

### Problemas Comuns

1. **RLS bloqueando acesso**
   - Verificar se usuário é membro do merchant
   - Verificar se merchant está ativo
   - Usar `app.current_merchant()` para debug

2. **Performance lenta**
   - Verificar se índices estão sendo usados
   - Analisar `pg_stat_statements`
   - Considerar índices compostos

3. **Realtime não funciona**
   - Verificar se tabela está na publicação
   - Verificar se RLS permite acesso
   - Usar Service Role para admin functions

### Logs e Debug
```bash
# Ver logs do Supabase
npx supabase logs

# Ver logs das Edge Functions
npx supabase functions logs validate-payment
```

---

## 📚 Referências

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
