#!/bin/bash
# Quick script to check settlements in database

echo "🔍 Checking settlements table..."
echo ""

psql postgresql://postgres:postgres@127.0.0.1:54322/postgres << 'EOF'
SELECT 
  s.id,
  s.provider,
  s.currency,
  s.amount,
  s.status,
  substring(s.error_message, 1, 50) as error,
  s.created_at
FROM public.settlements s
ORDER BY s.created_at DESC
LIMIT 10;
EOF

echo ""
echo "📈 Settlement summary:"
echo ""

psql postgresql://postgres:postgres@127.0.0.1:54322/postgres << 'EOF'
SELECT 
  provider,
  status,
  count(*) as count,
  sum(amount) as total_amount
FROM public.settlements
GROUP BY provider, status
ORDER BY provider, status;
EOF

