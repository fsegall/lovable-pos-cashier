// Debug Panel - Shows detailed info about Solana Pay configuration
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getMerchantRecipient, getBrzMint, getNetwork, getRpcUrl } from '@/lib/solana-config';
import { Info } from 'lucide-react';

interface DebugPanelProps {
  paymentUrl?: string;
  reference?: string;
  amount?: number;
}

export function DebugPanel({ paymentUrl, reference, amount }: DebugPanelProps) {
  const merchantRecipient = getMerchantRecipient();
  const brzMint = getBrzMint();
  const network = getNetwork();
  const rpcUrl = getRpcUrl();

  return (
    <Card className="mt-4 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/10">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="w-4 h-4" />
          Debug Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs font-mono">
        <div>
          <div className="font-semibold text-muted-foreground">Network:</div>
          <div className="text-primary">{network}</div>
        </div>
        
        <div>
          <div className="font-semibold text-muted-foreground">RPC:</div>
          <div className="text-primary break-all">{rpcUrl}</div>
        </div>
        
        <div>
          <div className="font-semibold text-muted-foreground">Merchant:</div>
          <div className="text-primary break-all">{merchantRecipient?.toString() || '❌ Not configured'}</div>
        </div>
        
        <div>
          <div className="font-semibold text-muted-foreground">tBRZ Mint:</div>
          <div className="text-primary break-all">{brzMint?.toString() || '❌ Not configured'}</div>
        </div>

        {reference && (
          <div>
            <div className="font-semibold text-muted-foreground">Reference:</div>
            <div className="text-primary break-all">{reference}</div>
          </div>
        )}

        {amount && (
          <div>
            <div className="font-semibold text-muted-foreground">Amount (BRL):</div>
            <div className="text-primary">R$ {amount.toFixed(2)}</div>
          </div>
        )}

        {paymentUrl && (
          <div>
            <div className="font-semibold text-muted-foreground">Full URL:</div>
            <div className="text-primary break-all text-[10px]">{paymentUrl}</div>
          </div>
        )}

        <Alert className="mt-4">
          <AlertDescription className="text-xs">
            <strong>Para funcionar:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Phantom no <strong>Devnet</strong></li>
              <li>Saldo de <strong>SOL</strong> (gas fees)</li>
              <li>Saldo de <strong>tBRZ</strong> tokens</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

