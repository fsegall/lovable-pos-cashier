export type ReceiptStatus = 'pending' | 'confirmed' | 'settled' | 'error';

export type Receipt = {
  id: string;
  amountBRL: number;
  createdAt: string;
  status: ReceiptStatus;
  ref: string;
  txHash?: string;
  productIds?: string[];
  paymentId?: string;
};

export type Product = {
  id: string;
  name: string;
  priceBRL: number;
  imageUrl?: string;
  category?: string;
};

export type MerchantInfo = {
  name: string;
  logoUrl?: string;
  walletMasked: string;
  category?: string;
  email?: string;
  phone?: string;
};

export type FeatureFlags = {
  pixSettlement: boolean;
  payWithBinance: boolean;
  useProgram: boolean;
  demoMode: boolean;
};

export type Staff = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  status: 'active' | 'inactive';
};

export type Store = {
  merchant: MerchantInfo;
  flags: FeatureFlags;
  products: Product[];
  receipts: Receipt[];
  staff: Staff[];
  onboardingComplete: boolean;
};

export type WebhookEvent = {
  id: string;
  timestamp: string;
  type: 'payment.pending' | 'payment.confirmed' | 'payment.settled' | 'payment.error';
  payload: Record<string, any>;
};
