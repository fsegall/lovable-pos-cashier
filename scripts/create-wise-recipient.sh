#!/bin/bash
# Create a Wise recipient for testing
# This creates a BRL bank account recipient in the Wise sandbox

WISE_TOKEN="e0c86156-e6da-411a-b3e0-59efd75b971f"
WISE_PROFILE_ID="28977775"
WISE_BASE="https://api.sandbox.transferwise.tech"

echo "🏦 Creating Wise recipient (BRL bank account)..."
echo ""

# Create recipient for BRL (Brazilian bank account)
RECIPIENT_RESPONSE=$(curl -s -X POST "$WISE_BASE/v1/accounts" \
  -H "Authorization: Bearer $WISE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "BRL",
    "type": "brazilian",
    "profile": '$WISE_PROFILE_ID',
    "accountHolderName": "Felipe Segall Corrêa",
    "details": {
      "legalType": "PRIVATE",
      "cpf": "123.456.789-00",
      "accountType": "CHECKING",
      "bankCode": "001",
      "branchCode": "0001",
      "accountNumber": "12345678"
    }
  }')

echo "Response:"
echo "$RECIPIENT_RESPONSE" | jq .

RECIPIENT_ID=$(echo "$RECIPIENT_RESPONSE" | jq -r '.id')

if [ "$RECIPIENT_ID" != "null" ] && [ -n "$RECIPIENT_ID" ]; then
  echo ""
  echo "✅ Recipient created successfully!"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📝 Add to supabase/functions/.env:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "WISE_RECIPIENT_ID=$RECIPIENT_ID"
  echo ""
  echo "Or use it directly in the UI/test."
else
  echo ""
  echo "❌ Failed to create recipient"
  echo "Check the response above for errors"
fi

