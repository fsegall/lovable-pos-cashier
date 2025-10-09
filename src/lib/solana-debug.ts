// Solana Pay Debug Helper
// Use this in browser console to debug payment issues

import { PublicKey } from '@solana/web3.js';
import { parseURL } from '@solana/pay';

export async function debugSolanaPayLink(link: string) {
  console.group('🔍 Solana Pay Link Debug');
  
  try {
    console.log('📋 Raw link:', link);
    
    // Parse URL
    const url = new URL(link);
    console.log('✅ URL parsed successfully');
    
    // Extract parameters
    const parsed = parseURL(link);
    console.log('📊 Parsed parameters:', {
      recipient: parsed.recipient?.toString(),
      amount: parsed.amount?.toString(),
      splToken: parsed.splToken?.toString(),
      reference: parsed.reference?.toString(),
      label: parsed.label,
      message: parsed.message,
    });
    
    // Validate recipient
    try {
      new PublicKey(parsed.recipient);
      console.log('✅ Recipient is valid PublicKey');
    } catch (e) {
      console.error('❌ Invalid recipient:', e);
    }
    
    // Validate reference
    try {
      if (parsed.reference) {
        new PublicKey(parsed.reference);
        console.log('✅ Reference is valid PublicKey');
      }
    } catch (e) {
      console.error('❌ Invalid reference:', e);
    }
    
    // Validate SPL token (if present)
    try {
      if (parsed.splToken) {
        new PublicKey(parsed.splToken);
        console.log('✅ SPL Token is valid PublicKey');
      } else {
        console.warn('⚠️ No SPL token specified (will use SOL)');
      }
    } catch (e) {
      console.error('❌ Invalid SPL token:', e);
    }
    
    // Check amount
    if (parsed.amount) {
      console.log('✅ Amount:', parsed.amount.toString());
      if (parsed.amount.isNaN() || parsed.amount.isLessThanOrEqualTo(0)) {
        console.error('❌ Invalid amount: must be > 0');
      }
    } else {
      console.warn('⚠️ No amount specified');
    }
    
    console.log('\n🎯 Summary:');
    console.log('- Recipient OK?', !!parsed.recipient);
    console.log('- Amount OK?', parsed.amount && parsed.amount.isGreaterThan(0));
    console.log('- SPL Token OK?', !!parsed.splToken);
    console.log('- Reference OK?', !!parsed.reference);
    
  } catch (error) {
    console.error('❌ Error parsing link:', error);
  }
  
  console.groupEnd();
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).debugSolanaPayLink = debugSolanaPayLink;
}

