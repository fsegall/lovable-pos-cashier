# Supabase Edge Functions

This directory contains Edge Functions for Merchant AI Checkout.

## 🚀 Implemented Functions

### `validate-payment`
- **Route**: `GET/POST /validate-payment`
- **Deploy**: `supabase functions deploy validate-payment --verify-jwt`
- **Function**: Validates on-chain payments by reference

### `settlement-webhook`
- **Route**: `POST /settlement-webhook`
- **Deploy**: `supabase functions deploy settlement-webhook --no-verify-jwt`
- **Function**: Receives settlement provider webhooks (Transfero, Stripe, etc.)

### `get-receipt-pdf`
- **Route**: `GET /get-receipt-pdf?paymentId=...`
- **Deploy**: `supabase functions deploy get-receipt-pdf --no-verify-jwt`
- **Function**: Proxy for official provider PDFs

### `export-csv`
- **Route**: `GET /export-csv?date=YYYY-MM-DD`
- **Deploy**: `supabase functions deploy export-csv --verify-jwt`
- **Function**: Exports data as CSV

## 🔧 Configuration

### Required Environment Variables

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

### Set Secrets (Production)

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

## 🧪 Local Development

```bash
# Run all functions locally
supabase functions serve --env-file .env

# Run specific function
supabase functions serve validate-payment --env-file .env
```

## 📦 Deploy

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy validate-payment --verify-jwt
supabase functions deploy export-csv --verify-jwt
supabase functions deploy settlement-webhook --no-verify-jwt
supabase functions deploy get-receipt-pdf --no-verify-jwt
```

## 🔒 Security

- **Functions with JWT**: `validate-payment`, `export-csv` - use RLS
- **Functions without JWT**: `settlement-webhook`, `get-receipt-pdf` - use Service Role
- **HMAC**: Webhook validation with signature
- **RLS**: Automatically applied via userClient

## 📝 Notes

- DEMO mode enabled by default for development
- @solana/pay will be integrated when available on Deno
- Supabase RPC functions are called via adminClient/userClient

## 🗃️ Database Schema

For detailed information about the PostgreSQL schema, tables, RPC functions, RLS policies, and Supabase configurations, see:

**[📊 DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md)**

This document includes:
- Complete table structure
- `app` schema RPC functions
- Row Level Security (RLS) policies
- Performance indexes
- Realtime configurations
- Triggers and constraints
- Troubleshooting guides

## 🏗️ Function Architecture

### Shared Utilities (`_shared/`)

- **`supabase.ts`**: Supabase client creation (admin/user)
- **`responses.ts`**: Response helpers (JSON, PDF, CSV)
- **`crypto.ts`**: HMAC and signature validation

### Function Flow

1. **validate-payment**: Validates on-chain transactions via Solana Pay
2. **settlement-webhook**: Processes provider webhooks and marks payments as settled
3. **get-receipt-pdf**: Fetches official PDFs from settlement providers
4. **export-csv**: Exports transaction data in CSV format

### Database Integration

All functions integrate with Supabase RPC functions:
- `mark_confirmed` - Mark payment as confirmed
- `mark_settled` - Mark payment as settled
- `list_receipts` - List receipts for CSV export

### Error Handling

Functions include comprehensive error handling:
- Invalid references
- Missing environment variables
- Network timeouts
- Invalid signatures
- Database errors

### Performance

- **Cold start**: ~100ms for simple functions
- **Warm start**: ~10ms
- **Global CDN**: Functions run close to users
- **Auto-scaling**: Handles traffic spikes automatically
