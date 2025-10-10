ulpas
# 🔧 Wise BRL Transfer - Solução para CPF

## Problema
```
Error: "CPF is mandatory for payments from Brazil. 
        Please specify in user profile."
```

## Solução: Third-Party Transfer

### Usar endpoint diferente:
```
POST /v2/profiles/{{profileId}}/third-party-transfers
```

### Exemplo de request:
```json
{
  "targetAccount": 701639460,
  "quote": "quote-uuid-here",
  "originalTransferId": "unique-id-in-our-system",
  "details": {
    "reference": "Invoice REFDEMO01"
  },
  "originator": {
    "legalEntityType": "PRIVATE",
    "reference": "merchant-id-123",
    "name": {
      "givenName": "Felipe",
      "familyName": "Segall Correa"
    },
    "dateOfBirth": "1979-08-23",
    "address": {
      "firstLine": "SQN 123",
      "city": "Brasilia",
      "stateCode": "DF",
      "countryCode": "BR",
      "postCode": "70000-000"
    }
  }
}
```

### Mudanças necessárias em `wise-payout/index.ts`:

1. **Trocar endpoint:**
   ```typescript
   // OLD:
   `${WISE_API_BASE}/v1/transfers`
   
   // NEW:
   `${WISE_API_BASE}/v2/profiles/${WISE_PROFILE_ID}/third-party-transfers`
   ```

2. **Atualizar payload:**
   ```typescript
   {
     targetAccount: parseInt(WISE_RECIPIENT_ID),
     quote: quote.id,  // note: usa 'quote' não 'quoteUuid'
     originalTransferId: customerTransactionId,  // não 'customerTransactionId'
     details: {
       reference: `Invoice ${invoiceRef}`
     },
     originator: {
       legalEntityType: "PRIVATE",
       reference: invoice.merchant_id,
       name: {
         givenName: "Merchant",
         familyName: "Owner"
       },
       dateOfBirth: "1980-01-01",
       address: {
         firstLine: "Address Line 1",
         city: "City",
         stateCode: "SP",  // Obrigatório para BR
         countryCode: "BR",
         postCode: "00000-000"
       }
     }
   }
   ```

## Alternativa: Testar com USD

Se quiser testar mais rápido sem CPF:
- Criar recipient USD
- Não precisa de originator block
- Continuar usando `POST /v1/transfers`

## Referências

- Linha 1708 em WISE_API_SPECS.md: Create a third party transfer
- Linha 1730-1778: Originator block fields
- Linha 1771: stateCode obrigatório para BR

