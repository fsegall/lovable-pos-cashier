// Popular SPL tokens configuration for Jupiter swaps
// These are common tokens users might want to pay with

export interface TokenInfo {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  logoURI?: string;
  coingeckoId?: string;
}

// Devnet tokens (for testing)
export const DEVNET_TOKENS: TokenInfo[] = [
  {
    symbol: 'tBRZ',
    name: 'BRZ Stablecoin (Testnet)',
    mint: '6PzmkfqSn8uoN8adp4uk6nsL8VbdRrJocpB8LxEH4pA4',
    decimals: 6,
  },
  {
    symbol: 'SOL',
    name: 'Solana (Wrapped)',
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
  },
  // Add more devnet tokens as needed for testing
];

// Mainnet tokens (for production)
export const MAINNET_TOKENS: TokenInfo[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    coingeckoId: 'solana',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    coingeckoId: 'usd-coin',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
    coingeckoId: 'tether',
  },
  {
    symbol: 'BRZ',
    name: 'BRZ Stablecoin',
    mint: 'FtgGSFADXBtroxq8VCausXRr2of47QBf5AS1NtZCu4GD',
    decimals: 4,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/FtgGSFADXBtroxq8VCausXRr2of47QBf5AS1NtZCu4GD/logo.png',
    coingeckoId: 'brz',
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    decimals: 5,
    logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
    coingeckoId: 'bonk',
  },
  {
    symbol: 'JUP',
    name: 'Jupiter',
    mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    decimals: 6,
    logoURI: 'https://static.jup.ag/jup/icon.png',
    coingeckoId: 'jupiter-exchange-solana',
  },
  {
    symbol: 'PYTH',
    name: 'Pyth Network',
    mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
    decimals: 6,
    logoURI: 'https://pyth.network/token.svg',
    coingeckoId: 'pyth-network',
  },
  {
    symbol: 'JTO',
    name: 'Jito',
    mint: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL/logo.png',
    coingeckoId: 'jito-governance-token',
  },
  {
    symbol: 'WIF',
    name: 'dogwifhat',
    mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    decimals: 6,
    logoURI: 'https://bafkreibk3covs5ltyqxa272uodhculbr6kea6betidfwy3ajsav2vjzyum.ipfs.nftstorage.link',
    coingeckoId: 'dogwifcoin',
  },
];

// Get tokens based on current network
export function getSupportedTokens(): TokenInfo[] {
  const cluster = import.meta.env.VITE_SOLANA_CLUSTER || 'devnet';
  return cluster === 'mainnet-beta' ? MAINNET_TOKENS : DEVNET_TOKENS;
}

// Find token by mint address
export function getTokenByMint(mint: string): TokenInfo | undefined {
  return getSupportedTokens().find(t => t.mint === mint);
}

// Find token by symbol
export function getTokenBySymbol(symbol: string): TokenInfo | undefined {
  return getSupportedTokens().find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
}

// Get default payment token (tBRZ/BRZ)
export function getDefaultPaymentToken(): TokenInfo {
  const cluster = import.meta.env.VITE_SOLANA_CLUSTER || 'devnet';
  if (cluster === 'mainnet-beta') {
    return MAINNET_TOKENS.find(t => t.symbol === 'BRZ')!;
  }
  return DEVNET_TOKENS.find(t => t.symbol === 'tBRZ')!;
}

// Get preferred settlement tokens (BRZ or USDC)
// Merchants can choose which stable they want to receive
export function getSettlementTokens(): TokenInfo[] {
  const cluster = import.meta.env.VITE_SOLANA_CLUSTER || 'devnet';
  if (cluster === 'mainnet-beta') {
    return MAINNET_TOKENS.filter(t => ['BRZ', 'USDC', 'USDT'].includes(t.symbol));
  }
  // In devnet, only tBRZ is available
  return DEVNET_TOKENS.filter(t => t.symbol === 'tBRZ');
}

// Check if a token is a stablecoin
export function isStablecoin(symbol: string): boolean {
  return ['USDC', 'USDT', 'BRZ', 'tBRZ', 'EUROC'].includes(symbol.toUpperCase());
}

// Get USDC mint for current network
export function getUsdcMint(): string {
  const cluster = import.meta.env.VITE_SOLANA_CLUSTER || 'devnet';
  if (cluster === 'mainnet-beta') {
    return 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // Mainnet USDC
  }
  // Devnet USDC (if available) - fallback to tBRZ for now
  return '6PzmkfqSn8uoN8adp4uk6nsL8VbdRrJocpB8LxEH4pA4'; // tBRZ for devnet
}

