import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Store, Receipt, Product, WebhookEvent, Staff } from '@/types/store';

// Seed data
const seedProducts: Product[] = [
  { id: '1', name: 'Café Expresso', priceBRL: 5.00, category: 'Bebidas' },
  { id: '2', name: 'Pão de Queijo', priceBRL: 3.50, category: 'Comidas' },
  { id: '3', name: 'Água Mineral', priceBRL: 2.50, category: 'Bebidas' },
  { id: '4', name: 'Sanduíche Natural', priceBRL: 12.00, category: 'Comidas' },
  { id: '5', name: 'Suco Natural', priceBRL: 8.00, category: 'Bebidas' },
  { id: '6', name: 'Bolo Caseiro', priceBRL: 6.00, category: 'Sobremesas' },
];

const seedReceipts: Receipt[] = [
  {
    id: '1',
    amountBRL: 15.50,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'confirmed',
    ref: 'REF001',
    txHash: '5Jx7K2mN...',
  },
  {
    id: '2',
    amountBRL: 28.00,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'settled',
    ref: 'REF002',
    txHash: '3Hf9P1qR...',
  },
  {
    id: '3',
    amountBRL: 50.00,
    createdAt: new Date(Date.now() - 300000).toISOString(),
    status: 'pending',
    ref: 'REF003',
  },
];

const seedStaff: Staff[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana@example.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao@example.com',
    role: 'staff',
    status: 'active',
  },
];

interface AppState extends Store {
  // Actions
  createCharge: (amount: number, productIds?: string[]) => Receipt;
  updateReceiptStatus: (id: string, status: Receipt['status'], txHash?: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateMerchant: (merchant: Partial<Store['merchant']>) => void;
  updateFlags: (flags: Partial<Store['flags']>) => void;
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, staff: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  completeOnboarding: () => void;
  exportCsv: () => string;
  getWebhookEvents: () => WebhookEvent[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      merchant: {
        name: 'Minha Loja',
        walletMasked: 'HG7x...2Kp9',
        category: 'Café',
      },
      flags: {
        pixSettlement: false,
        payWithBinance: false,
        useProgram: false,
        demoMode: true,
      },
      products: seedProducts,
      receipts: seedReceipts,
      staff: seedStaff,
      onboardingComplete: false,

      createCharge: (amount: number, productIds?: string[]) => {
        const receipt: Receipt = {
          id: Date.now().toString(),
          amountBRL: amount,
          createdAt: new Date().toISOString(),
          status: 'pending',
          ref: `REF${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          productIds,
        };
        set((state) => ({ receipts: [receipt, ...state.receipts] }));
        return receipt;
      },

      updateReceiptStatus: (id: string, status: Receipt['status'], txHash?: string) => {
        set((state) => ({
          receipts: state.receipts.map((r) =>
            r.id === id ? { ...r, status, ...(txHash && { txHash }) } : r
          ),
        }));
      },

      addProduct: (product) => {
        const newProduct = { ...product, id: Date.now().toString() };
        set((state) => ({ products: [...state.products, newProduct] }));
      },

      updateProduct: (id, product) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...product } : p)),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
      },

      updateMerchant: (merchant) => {
        set((state) => ({ merchant: { ...state.merchant, ...merchant } }));
      },

      updateFlags: (flags) => {
        set((state) => ({ flags: { ...state.flags, ...flags } }));
      },

      addStaff: (staff) => {
        const newStaff = { ...staff, id: Date.now().toString() };
        set((state) => ({ staff: [...state.staff, newStaff] }));
      },

      updateStaff: (id, staff) => {
        set((state) => ({
          staff: state.staff.map((s) => (s.id === id ? { ...s, ...staff } : s)),
        }));
      },

      deleteStaff: (id) => {
        set((state) => ({ staff: state.staff.filter((s) => s.id !== id) }));
      },

      completeOnboarding: () => {
        set({ onboardingComplete: true });
      },

      exportCsv: () => {
        const { receipts } = get();
        const header = 'ID,Amount (BRL),Status,Date,Reference,TxHash\n';
        const rows = receipts
          .map((r) =>
            [r.id, r.amountBRL.toFixed(2), r.status, r.createdAt, r.ref, r.txHash || ''].join(',')
          )
          .join('\n');
        return header + rows;
      },

      getWebhookEvents: () => {
        const { receipts } = get();
        return receipts.slice(0, 10).map((r) => ({
          id: r.id,
          timestamp: r.createdAt,
          type: `payment.${r.status}` as WebhookEvent['type'],
          payload: { receiptId: r.id, amount: r.amountBRL, ref: r.ref },
        }));
      },
    }),
    {
      name: 'merchant-pos-storage',
    }
  )
);
