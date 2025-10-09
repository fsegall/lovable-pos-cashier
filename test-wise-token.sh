#!/bin/bash
# Test Wise API Token
# Usage: ./test-wise-token.sh YOUR_TOKEN

set -e

if [ -z "$1" ]; then
  echo "❌ Usage: ./test-wise-token.sh YOUR_TOKEN"
  exit 1
fi

TOKEN="$1"
BASE_URL="https://api.sandbox.transferwise.tech"

echo "🔍 Testing Wise API Token..."
echo "Token: ${TOKEN:0:10}..."
echo ""

# Test 1: Authentication
echo "📡 Test 1: Get Profiles"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  "$BASE_URL/v1/profiles" \
  -H "Authorization: Bearer $TOKEN")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Authentication OK"
  
  # Extract profile ID
  PROFILE_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
  PROFILE_TYPE=$(echo "$BODY" | grep -o '"type":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ -n "$PROFILE_ID" ]; then
    echo "✅ Profile found:"
    echo "   ID: $PROFILE_ID"
    echo "   Type: $PROFILE_TYPE"
    echo ""
    
    # Test 2: Create a quote
    echo "📡 Test 2: Create Quote (BRL → USD, R$ 100)"
    QUOTE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
      "$BASE_URL/v3/profiles/$PROFILE_ID/quotes" \
      -X POST \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "sourceCurrency": "BRL",
        "targetCurrency": "USD",
        "sourceAmount": 100,
        "targetAmount": null,
        "payOut": "BALANCE"
      }')
    
    QUOTE_STATUS=$(echo "$QUOTE_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
    QUOTE_BODY=$(echo "$QUOTE_RESPONSE" | sed '/HTTP_STATUS/d')
    
    if [ "$QUOTE_STATUS" -eq 200 ] || [ "$QUOTE_STATUS" -eq 201 ]; then
      QUOTE_ID=$(echo "$QUOTE_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
      RATE=$(echo "$QUOTE_BODY" | grep -o '"rate":[0-9.]*' | head -1 | cut -d: -f2)
      FEE=$(echo "$QUOTE_BODY" | grep -o '"fee":[0-9.]*' | head -1 | cut -d: -f2)
      
      echo "✅ Quote created:"
      echo "   Quote ID: $QUOTE_ID"
      echo "   Rate: $RATE"
      echo "   Fee: $FEE BRL"
      echo ""
    else
      echo "⚠️  Quote creation failed (Status: $QUOTE_STATUS)"
      echo "   This is OK for testing authentication"
      echo "   Actual transfers need balance in sandbox"
      echo ""
    fi
    
    # Success! Show config
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 TOKEN IS VALID!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📝 Add to supabase/functions/.env:"
    echo ""
    echo "WISE_API_TOKEN=$TOKEN"
    echo "WISE_API_BASE=$BASE_URL"
    echo "WISE_PROFILE_ID=$PROFILE_ID"
    echo "WISE_WEBHOOK_SECRET=your-webhook-secret"
    echo ""
    echo "Then restart Edge Functions:"
    echo "  supabase functions serve"
    echo ""
    
  else
    echo "❌ No profiles found"
    echo "   Create a profile first in the sandbox"
    exit 1
  fi
else
  echo "❌ Authentication failed (Status: $HTTP_STATUS)"
  echo ""
  echo "Response:"
  echo "$BODY"
  echo ""
  echo "🔍 Troubleshooting:"
  echo "1. Check you're using SANDBOX token from:"
  echo "   https://sandbox.transferwise.tech/settings/api-tokens"
  echo "2. Token must have these permissions:"
  echo "   - Read accounts"
  echo "   - Create quotes"
  echo "   - Create transfers"
  echo "3. Token might be expired or revoked"
  echo ""
  exit 1
fi

