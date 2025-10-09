// Settlement Provider Types
// Unified interface for all settlement providers (Circle, Wise, MercadoPago, etc)

export type SettlementProviderName = 'circle' | 'wise' | 'mercadopago' | 'inter' | 'binance' | 'none';

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface PayoutParams {
  invoiceRef: string;
  amount: number;
  currency: string;
  recipientId: string;
  metadata?: Record<string, any>;
}

export interface PayoutResult {
  id: string;
  status: PayoutStatus;
  amount: number;
  currency: string;
  fee?: number;
  estimatedArrival?: Date;
  trackingUrl?: string;
}

export interface WebhookEvent {
  provider: SettlementProviderName;
  eventType: string;
  payoutId: string;
  status: PayoutStatus;
  timestamp: Date;
  rawPayload: any;
}

export interface SettlementProvider {
  name: SettlementProviderName;
  region: string[];
  currencies: string[];
  
  // Core methods
  createPayout(params: PayoutParams): Promise<PayoutResult>;
  getPayoutStatus(id: string): Promise<PayoutResult>;
  validateWebhook(req: Request): Promise<WebhookEvent | null>;
  
  // Optional methods
  estimateFee?(amount: number, currency: string): Promise<number>;
  getSupportedCurrencies?(): Promise<string[]>;
}

export interface SettlementConfig {
  provider: SettlementProviderName;
  apiKey: string;
  environment: 'sandbox' | 'production';
  webhookSecret?: string;
  additionalConfig?: Record<string, any>;
}
