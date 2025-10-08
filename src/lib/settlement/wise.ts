// Wise Settlement Provider
// Multi-currency off-ramp (BRL, USD, EUR, GBP, 50+ currencies)

import type { 
  SettlementProvider, 
  PayoutParams, 
  PayoutResult, 
  WebhookEvent,
  PayoutStatus 
} from './types';

interface WiseQuote {
  id: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmount: number;
  rate: number;
  fee: number;
  payOut: string;
}

interface WiseTransfer {
  id: number;
  targetAccount: number;
  quoteUuid: string;
  status: string;
  sourceCurrency: string;
  sourceValue: number;
  targetCurrency: string;
  targetValue: number;
  customerTransactionId: string;
  created: string;
}

export class WiseProvider implements SettlementProvider {
  name = 'wise' as const;
  region = ['global'];
  currencies = ['BRL', 'USD', 'EUR', 'GBP', 'ARS', 'MXN', /* +44 more */];
  
  private apiToken: string;
  private baseUrl: string;
  private profileId: string;
  private webhookSecret?: string;

  constructor(config: {
    apiToken: string;
    profileId: string;
    environment?: 'sandbox' | 'production';
    webhookSecret?: string;
  }) {
    this.apiToken = config.apiToken;
    this.profileId = config.profileId;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.transferwise.com'
      : 'https://api.sandbox.transferwise.tech';
    this.webhookSecret = config.webhookSecret;
  }

  private authHeaders(extra?: Record<string, string>) {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
      ...extra,
    };
  }

  async createPayout(params: PayoutParams): Promise<PayoutResult> {
    try {
      // Step 1: Create quote
      console.log('📊 Creating Wise quote...', { amount: params.amount, currency: params.currency });
      
      const quoteResponse = await fetch(
        `${this.baseUrl}/v3/profiles/${this.profileId}/quotes`,
        {
          method: 'POST',
          headers: this.authHeaders(),
          body: JSON.stringify({
            sourceCurrency: params.currency,
            targetCurrency: params.currency,
            sourceAmount: params.amount,
            payOut: 'BANK_TRANSFER',
          }),
        }
      );

      if (!quoteResponse.ok) {
        const error = await quoteResponse.json();
        throw new Error(`Wise quote failed: ${error.errors?.[0]?.message || quoteResponse.statusText}`);
      }

      const quote: WiseQuote = await quoteResponse.json();
      console.log('✅ Quote created:', quote.id);

      // Step 2: Create transfer
      console.log('💸 Creating Wise transfer...');
      
      const transferResponse = await fetch(
        `${this.baseUrl}/v1/transfers`,
        {
          method: 'POST',
          headers: this.authHeaders(),
          body: JSON.stringify({
            targetAccount: parseInt(params.recipientId),
            quoteUuid: quote.id,
            customerTransactionId: params.invoiceRef,
            details: {
              reference: `Invoice ${params.invoiceRef}`,
              ...params.metadata,
            },
          }),
        }
      );

      if (!transferResponse.ok) {
        const error = await transferResponse.json();
        throw new Error(`Wise transfer failed: ${error.errors?.[0]?.message || transferResponse.statusText}`);
      }

      const transfer: WiseTransfer = await transferResponse.json();
      console.log('✅ Transfer created:', transfer.id);

      // Step 3: Fund transfer (from Wise balance)
      console.log('💰 Funding transfer...');
      
      const fundResponse = await fetch(
        `${this.baseUrl}/v3/profiles/${this.profileId}/transfers/${transfer.id}/payments`,
        {
          method: 'POST',
          headers: this.authHeaders(),
          body: JSON.stringify({
            type: 'BALANCE',
          }),
        }
      );

      if (!fundResponse.ok) {
        const error = await fundResponse.json();
        throw new Error(`Wise funding failed: ${error.errors?.[0]?.message || fundResponse.statusText}`);
      }

      console.log('✅ Transfer funded successfully');

      return {
        id: transfer.id.toString(),
        status: this.mapStatus(transfer.status),
        amount: transfer.targetValue,
        currency: transfer.targetCurrency,
        fee: quote.fee,
        trackingUrl: `${this.baseUrl}/transfers/${transfer.id}`,
      };

    } catch (error) {
      console.error('❌ Wise payout error:', error);
      throw error;
    }
  }

  async getPayoutStatus(id: string): Promise<PayoutResult> {
    const response = await fetch(
      `${this.baseUrl}/v1/transfers/${id}`,
      {
        headers: this.authHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get transfer status: ${response.statusText}`);
    }

    const transfer: WiseTransfer = await response.json();

    return {
      id: transfer.id.toString(),
      status: this.mapStatus(transfer.status),
      amount: transfer.targetValue,
      currency: transfer.targetCurrency,
      trackingUrl: `${this.baseUrl}/transfers/${transfer.id}`,
    };
  }

  async validateWebhook(req: Request): Promise<WebhookEvent | null> {
    const signature = req.headers.get('X-Signature') || req.headers.get('X-Signature-SHA256');
    const payload = await req.text();

    // TODO: Implement Wise HMAC validation
    // Wise uses SHA-256 HMAC with webhook secret
    // if (this.webhookSecret && !this.verifySignature(payload, signature)) {
    //   throw new Error('Invalid webhook signature');
    // }

    const event = JSON.parse(payload);

    // Wise webhook format:
    // {
    //   "data": {
    //     "resource": {
    //       "type": "transfer",
    //       "id": 12345,
    //       "profile_id": 67890,
    //       "account_id": 111,
    //       "status": "outgoing_payment_sent"
    //     },
    //     "current_state": "outgoing_payment_sent",
    //     "previous_state": "processing",
    //     "occurred_at": "2025-10-08T10:00:00Z"
    //   },
    //   "subscription_id": "...",
    //   "event_type": "transfers#state-change"
    // }

    if (event.event_type !== 'transfers#state-change') {
      return null;
    }

    const transfer = event.data.resource;
    const currentState = event.data.current_state;

    return {
      provider: 'wise',
      eventType: currentState,
      payoutId: transfer.id.toString(),
      status: this.mapStatus(currentState),
      timestamp: new Date(event.data.occurred_at),
      rawPayload: event,
    };
  }

  async estimateFee(amount: number, currency: string): Promise<number> {
    // Create a temporary quote to get exact fee
    try {
      const quoteResponse = await fetch(
        `${this.baseUrl}/v3/profiles/${this.profileId}/quotes`,
        {
          method: 'POST',
          headers: this.authHeaders(),
          body: JSON.stringify({
            sourceCurrency: currency,
            targetCurrency: currency,
            sourceAmount: amount,
            payOut: 'BANK_TRANSFER',
          }),
        }
      );

      if (quoteResponse.ok) {
        const quote: WiseQuote = await quoteResponse.json();
        return quote.fee || amount * 0.005; // Fallback to 0.5%
      }
    } catch (error) {
      console.error('Failed to estimate Wise fee:', error);
    }

    // Fallback: estimate 0.5-1% based on amount
    if (amount < 1000) return amount * 0.01; // 1% for small amounts
    if (amount < 10000) return amount * 0.007; // 0.7% for medium
    return amount * 0.005; // 0.5% for large amounts
  }

  async getSupportedCurrencies(): Promise<string[]> {
    return this.currencies;
  }

  private mapStatus(wiseStatus: string): PayoutStatus {
    const statusMap: Record<string, PayoutStatus> = {
      'incoming_payment_waiting': 'pending',
      'processing': 'processing',
      'funds_converted': 'processing',
      'outgoing_payment_sent': 'completed',
      'bounced_back': 'failed',
      'funds_refunded': 'cancelled',
      'cancelled': 'cancelled',
    };

    return statusMap[wiseStatus.toLowerCase()] || 'pending';
  }

  private verifySignature(payload: string, signature: string | null): boolean {
    if (!signature || !this.webhookSecret) return false;
    
    // TODO: Implement Wise HMAC verification
    // Wise uses SHA-256 HMAC
    // const expectedSignature = crypto
    //   .createHmac('sha256', this.webhookSecret)
    //   .update(payload)
    //   .digest('hex');
    
    // return crypto.timingSafeEqual(
    //   Buffer.from(signature),
    //   Buffer.from(expectedSignature)
    // );
    
    return true; // Temporary: accept all in development
  }
}
