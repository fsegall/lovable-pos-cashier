import { create } from 'zustand';
import { Store, WebhookEvent, Staff, Product, Receipt } from '@/types/store';
import { useMerchant } from '@/hooks/useMerchant';
import { useProducts } from '@/hooks/useProducts';
import { useReceipts } from '@/hooks/useReceipts';

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

interface AppState {
  onboardingComplete: boolean;
  completeOnboarding: () => void;
  exportCsv: (receipts: any[]) => string;
  getWebhookEvents: (receipts: any[]) => WebhookEvent[];
  staff: Staff[];
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, staff: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
}

// Export hooks for components to use
export { useMerchant, useProducts, useReceipts };

export const useStore = create<AppState>()((set) => ({
  staff: seedStaff,
  onboardingComplete: false,

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

  exportCsv: (receipts) => {
    const header = 'ID,Amount (BRL),Status,Date,Reference,TxHash\n';
    const rows = receipts
      .map((r: any) =>
        [r.id, r.amountBRL.toFixed(2), r.status, r.createdAt, r.ref, r.txHash || ''].join(',')
      )
      .join('\n');
    return header + rows;
  },

  getWebhookEvents: (receipts) => {
    return receipts.slice(0, 10).map((r: any) => ({
      id: r.id,
      timestamp: r.createdAt,
      type: `payment.${r.status}` as WebhookEvent['type'],
      payload: { receiptId: r.id, amount: r.amountBRL, ref: r.ref },
    }));
  },
}));
