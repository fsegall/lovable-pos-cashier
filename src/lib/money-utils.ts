import BigNumber from 'bignumber.js';

/**
 * Convert BRL amount (string or number) to cents (BigNumber)
 * @param amount BRL amount (e.g., "100.50" or 100.50)
 * @returns BigNumber representing cents (e.g., 10050)
 */
export function brlToCents(amount: string | number): BigNumber {
  const bn = new BigNumber(amount);
  if (bn.isNaN()) {
    throw new Error(`Invalid BRL amount: ${amount}`);
  }
  return bn.multipliedBy(100).decimalPlaces(0, BigNumber.ROUND_DOWN);
}

/**
 * Convert cents (BigNumber) to BRL with decimals (string or number) to token minor units
 * @param cents BigNumber of cents
 * @param tokenDecimals Number of decimals the token uses (e.g., 4 for BRZ, 9 for SOL)
 * @returns BigNumber representing token minor units
 */
export function centsToTokenMinor(cents: BigNumber, tokenDecimals: number): BigNumber {
  if (cents.isNaN() || tokenDecimals < 0) {
    throw new Error('Invalid conversion parameters');
  }
  
  // Scale from 2 decimals (BRL cents) to token decimals
  const scaleFactor = tokenDecimals - 2;
  
  if (scaleFactor >= 0) {
    // Token has more decimals than cents, multiply
    return cents.multipliedBy(new BigNumber(10).pow(scaleFactor));
  } else {
    // Token has fewer decimals than cents, divide
    return cents.dividedBy(new BigNumber(10).pow(Math.abs(scaleFactor)))
      .decimalPlaces(0, BigNumber.ROUND_DOWN);
  }
}

/**
 * Convert BRL amount directly to token minor units
 * @param amount BRL amount (e.g., "100.50")
 * @param tokenDecimals Number of decimals the token uses
 * @returns BigNumber representing token minor units
 */
export function brlToTokenMinor(amount: string | number, tokenDecimals: number): BigNumber {
  const cents = brlToCents(amount);
  return centsToTokenMinor(cents, tokenDecimals);
}

/**
 * Convert token minor units back to BRL amount
 * @param tokenMinor BigNumber of token minor units
 * @param tokenDecimals Number of decimals the token uses
 * @returns String representing BRL amount (e.g., "100.50")
 */
export function tokenMinorToBrl(tokenMinor: BigNumber, tokenDecimals: number): string {
  if (tokenMinor.isNaN() || tokenDecimals < 0) {
    throw new Error('Invalid conversion parameters');
  }
  
  // Scale from token decimals to 2 decimals (BRL cents)
  const scaleFactor = tokenDecimals - 2;
  
  let cents: BigNumber;
  if (scaleFactor >= 0) {
    // Token has more decimals, divide
    cents = tokenMinor.dividedBy(new BigNumber(10).pow(scaleFactor));
  } else {
    // Token has fewer decimals, multiply
    cents = tokenMinor.multipliedBy(new BigNumber(10).pow(Math.abs(scaleFactor)));
  }
  
  // Convert cents to BRL
  return cents.dividedBy(100).toFixed(2);
}

/**
 * Format BRL amount for display
 * @param amount Number or string
 * @returns Formatted string (e.g., "R$ 100,50")
 */
export function formatBrl(amount: string | number): string {
  const bn = new BigNumber(amount);
  if (bn.isNaN()) return 'R$ 0,00';
  
  return `R$ ${bn.toFixed(2).replace('.', ',')}`;
}

/**
 * Parse user input to BRL amount
 * Handles various formats: "100", "100.50", "100,50"
 * @param input User input string
 * @returns Normalized BRL amount as string
 */
export function parseUserInputToBrl(input: string): string {
  // Remove R$, spaces, and replace comma with dot
  const cleaned = input.replace(/[R$\s]/g, '').replace(',', '.');
  const bn = new BigNumber(cleaned);
  
  if (bn.isNaN() || bn.isNegative()) {
    throw new Error('Invalid amount');
  }
  
  return bn.toFixed(2);
}

