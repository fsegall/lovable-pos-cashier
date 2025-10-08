// Circle Settlement Provider
// USDC native off-ramp for USD, EUR, GBP (global)

import type { 
  SettlementProvider, 
  PayoutParams, 
  PayoutResult, 
  WebhookEvent,
  PayoutStatus 
} from './types';

export class CircleProvider implements SettlementProvider {
  name = 'circle' as const;
  region = ['global'];
  currencies = ['USD', 'EUR', 'GBP'];
  
  private apiKey: string;
  private baseUrl: string;
  private webhookSecret?: string;

  constructor(config: {
    apiKey: string;
    environment?: 'sandbox' | 'production';
    webhookSecret?: string;
  }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.circle.com'
      : 'https://api-sandbox.circle.com';
    this.webhookSecret = config.webhookSecret;
  }

  async createPayout(params: PayoutParams): Promise<PayoutResult> {
    const response = await fetch(`${this.baseUrl}/v1/businessAccount/payouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotencyKey: params.invoiceRef,
        source: {
          type: 'wallet',
          id: 'merchant-wallet-id', // TODO: Get from config
        },
        destination: {
          type: 'wire',
          id: params.recipientId,
        },
        amount: {
          amount: params.amount.toFixed(2),
          currency: params.currency,
        },
        metadata: {
          invoiceRef: params.invoiceRef,
          ...params.metadata,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Circle payout failed: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    const payout = data.data;

    return {
      id: payout.id,
      status: this.mapStatus(payout.status),
      amount: parseFloat(payout.amount.amount),
      currency: payout.amount.currency,
      estimatedArrival: payout.createDate ? new Date(payout.createDate) : undefined,
      trackingUrl: `${this.baseUrl}/payouts/${payout.id}`,
    };
  }

  async getPayoutStatus(id: string): Promise<PayoutResult> {
    const response = await fetch(`${this.baseUrl}/v1/businessAccount/payouts/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get payout status: ${response.statusText}`);
    }

    const data = await response.json();
    const payout = data.data;

    return {
      id: payout.id,
      status: this.mapStatus(payout.status),
      amount: parseFloat(payout.amount.amount),
      currency: payout.amount.currency,
      trackingUrl: `${this.baseUrl}/payouts/${payout.id}`,
    };
  }

  async validateWebhook(req: Request): Promise<WebhookEvent | null> {
    const signature = req.headers.get('X-Circle-Signature');
    const payload = await req.text();

    // TODO: Implement HMAC validation
    // if (this.webhookSecret && !this.verifySignature(payload, signature)) {
    //   throw new Error('Invalid webhook signature');
    // }

    const event = JSON.parse(payload);

    if (event.Type !== 'payout') {
      return null;
    }

    return {
      provider: 'circle',
      eventType: event.Action,
      payoutId: event.payout.id,
      status: this.mapStatus(event.payout.status),
      timestamp: new Date(event.payout.updateDate || event.payout.createDate),
      rawPayload: event,
    };
  }

  async estimateFee(amount: number, currency: string): Promise<number> {
    // Circle fees are typically 0.5-1% for payouts
    // This is an estimate - actual fee comes in the payout response
    return amount * 0.01; // 1%
  }

  async getSupportedCurrencies(): Promise<string[]> {
    return this.currencies;
  }

  private mapStatus(circleStatus: string): PayoutStatus {
    const statusMap: Record<string, PayoutStatus> = {
      'pending': 'pending',
      'processing': 'processing',
      'complete': 'completed',
      'completed': 'completed',
      'failed': 'failed',
      'cancelled': 'cancelled',
    };

    return statusMap[circleStatus.toLowerCase()] || 'pending';
  }

  private verifySignature(payload: string, signature: string | null): boolean {
    if (!signature || !this.webhookSecret) return false;
    
    // TODO: Implement Circle HMAC verification
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
