# Supabase Edge Functions

Este diretório contém Edge Functions para Merchant AI Checkout.

## 🚀 Funções Implementadas

### `validate-payment`
- **Rota**: `GET/POST /validate-payment`
- **Deploy**: `supabase functions deploy validate-payment --verify-jwt`
- **Função**: Valida pagamentos on-chain por reference

### `settlement-webhook`
- **Rota**: `POST /settlement-webhook`
- **Deploy**: `supabase functions deploy settlement-webhook --no-verify-jwt`
- **Função**: Recebe webhooks de provedores de settlement (Transfero, Stripe, etc.)

### `get-receipt-pdf`
- **Rota**: `GET /get-receipt-pdf?paymentId=...`
- **Deploy**: `supabase functions deploy get-receipt-pdf --no-verify-jwt`
- **Função**: Proxy para PDFs oficiais do provedor

### `export-csv`
- **Rota**: `GET /export-csv?date=YYYY-MM-DD`
- **Deploy**: `supabase functions deploy export-csv --verify-jwt`
- **Função**: Exporta dados em CSV

## 🔧 Configuração

### Variáveis de Ambiente Obrigatórias

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

# Transfero (PIX Settlement Provider)
TRANSFERO_BASE_URL=https://staging-openbanking.bit.one/
TRANSFERO_CLIENT_ID=your_transfero_client_id
TRANSFERO_CLIENT_SECRET=your_transfero_client_secret
TRANSFERO_ACCOUNT_ID=your_transfero_account_id

# Development
DEMO_MODE=true
```

### Definir Secrets (Produção)

```bash
supabase secrets set \
  SUPABASE_URL=... \
  SUPABASE_SERVICE_ROLE_KEY=... \
  SUPABASE_ANON_KEY=... \
  SOLANA_RPC_URL=https://api.mainnet-beta.solana.com \
  MERCHANT_RECIPIENT=<SPL address> \
  BRZ_MINT=FtgGSFADXBtroxq8VCausXRr2of47QBf5AS1NtZCu4GD \
  WEBHOOK_SECRET=<hmac for provider> \
  TRANSFERO_BASE_URL=https://staging-openbanking.bit.one/ \
  TRANSFERO_CLIENT_ID=... \
  TRANSFERO_CLIENT_SECRET=... \
  TRANSFERO_ACCOUNT_ID=... \
  DEMO_MODE=true
```

## 🧪 Desenvolvimento Local

```bash
# Rodar todas as funções localmente
supabase functions serve --env-file .env

# Rodar função específica
supabase functions serve validate-payment --env-file .env
```

## 📦 Deploy

```bash
# Deploy de todas as funções
supabase functions deploy

# Deploy de função específica
supabase functions deploy validate-payment --verify-jwt
supabase functions deploy export-csv --verify-jwt
supabase functions deploy settlement-webhook --no-verify-jwt
supabase functions deploy get-receipt-pdf --no-verify-jwt
```

## 🔒 Segurança

- **Funções com JWT**: `validate-payment`, `export-csv` - usam RLS
- **Funções sem JWT**: `settlement-webhook`, `get-receipt-pdf` - usam Service Role
- **HMAC**: Validação de webhook com assinatura
- **RLS**: Aplicada automaticamente via userClient

## 📝 Notas

- Modo DEMO habilitado por padrão para desenvolvimento
- @solana/pay será integrado quando disponível no Deno
- Funções RPC do Supabase são chamadas via adminClient/userClient

## 🗃️ Schema do Banco

Para informações detalhadas sobre o schema PostgreSQL, tabelas, funções RPC, políticas RLS e configurações do Supabase, consulte:

**[📊 DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md)**

Este documento inclui:
- Estrutura completa das tabelas
- Funções RPC do schema `app`
- Políticas Row Level Security (RLS)
- Índices para performance
- Configurações de Realtime
- Triggers e constraints
- Guias de troubleshooting

## 🏗️ Arquitetura das Funções

### Utilitários Compartilhados (`_shared/`)

- **`supabase.ts`**: Criação de clientes Supabase (admin/user)
- **`responses.ts`**: Helpers de resposta (JSON, PDF, CSV)
- **`crypto.ts`**: Validação HMAC e assinatura

### Fluxo das Funções

1. **validate-payment**: Valida transações on-chain via Solana Pay
2. **settlement-webhook**: Processa webhooks de provedores e marca pagamentos como settled
3. **get-receipt-pdf**: Busca PDFs oficiais de provedores de settlement
4. **export-csv**: Exporta dados de transações em formato CSV

### Integração com Banco

Todas as funções integram com funções RPC do Supabase:
- `mark_confirmed` - Marcar pagamento como confirmado
- `mark_settled` - Marcar pagamento como liquidado
- `list_receipts` - Listar receipts para export CSV

### Tratamento de Erros

Funções incluem tratamento abrangente de erros:
- Referências inválidas
- Variáveis de ambiente ausentes
- Timeouts de rede
- Assinaturas inválidas
- Erros de banco de dados

### Performance

- **Cold start**: ~100ms para funções simples
- **Warm start**: ~10ms
- **CDN Global**: Funções rodam próximas aos usuários
- **Auto-scaling**: Lida com picos de tráfego automaticamente
