import { PublicKey, clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Network configuration
export const getNetwork = (): WalletAdapterNetwork => {
  const cluster = import.meta.env.VITE_SOLANA_CLUSTER as WalletAdapterNetwork;
  return cluster || WalletAdapterNetwork.Devnet;
};

export const getRpcUrl = (): string => {
  const customRpc = import.meta.env.VITE_SOLANA_RPC_URL;
  if (customRpc) return customRpc;
  return clusterApiUrl(getNetwork());
};

// BRZ Token Mints (Brazilian Real stablecoin on Solana)
export const BRZ_MINT_DEVNET = import.meta.env.VITE_BRZ_MINT_DEVNET
  ? new PublicKey(import.meta.env.VITE_BRZ_MINT_DEVNET)
  : null;

export const BRZ_MINT_MAINNET = import.meta.env.VITE_BRZ_MINT_MAINNET
  ? new PublicKey(import.meta.env.VITE_BRZ_MINT_MAINNET)
  : null;

export const getBrzMint = (): PublicKey | null => {
  const network = getNetwork();
  return network === WalletAdapterNetwork.Mainnet
    ? BRZ_MINT_MAINNET
    : BRZ_MINT_DEVNET;
};

// Merchant recipient address
export const getMerchantRecipient = (): PublicKey | null => {
  const recipient = import.meta.env.VITE_MERCHANT_RECIPIENT;
  if (!recipient) {
    console.warn('VITE_MERCHANT_RECIPIENT not configured');
    return null;
  }
  try {
    return new PublicKey(recipient);
  } catch (err) {
    console.error('Invalid VITE_MERCHANT_RECIPIENT:', err);
    return null;
  }
};

// Token decimals (BRZ typically uses 4 decimals)
export const BRZ_DECIMALS = 4;

// Default SOL decimals
export const SOL_DECIMALS = 9;

