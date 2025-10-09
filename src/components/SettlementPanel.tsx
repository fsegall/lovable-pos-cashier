// Settlement Panel Component
// Allows merchants to settle crypto payments to fiat via Circle or Wise

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSettlements } from '@/hooks/useSettlements';
import { Receipt } from '@/types/store';

interface SettlementPanelProps {
  receipt: Receipt;
  onSettled?: () => void;
}

export function SettlementPanel({ receipt, onSettled }: SettlementPanelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'circle' | 'wise'>('wise');
  const [selectedCurrency, setSelectedCurrency] = useState('BRL');
  
  const { requestSettlement, loading } = useSettlements();

  // Can only settle confirmed payments that haven't been settled yet
  const canSettle = receipt.status === 'confirmed';
  const isSettled = receipt.status === 'settled';

  const handleSettle = async () => {
    if (!receipt.paymentId) {
      console.error('No payment ID found');
      return;
    }

    const result = await requestSettlement({
      paymentId: receipt.paymentId,
      provider: selectedProvider,
      currency: selectedCurrency,
      amount: receipt.amountBRL,
      recipientId: 'demo-recipient-123', // TODO: Get from merchant settings
    });

    if (result.success) {
      setIsDialogOpen(false);
      if (onSettled) {
        onSettled();
      }
    }
  };

  if (isSettled) {
    return (
      <Card className="border-green-500/50 bg-green-50 dark:bg-green-900/10">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Settled to Fiat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            This payment has been settled to your bank account.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!canSettle) {
    return (
      <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/10">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            Settlement Not Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Payments must be confirmed before they can be settled.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-900/10">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            Settlement Available
          </CardTitle>
          <CardDescription className="text-xs">
            Convert crypto to fiat and receive in your bank account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Crypto Balance</p>
              <p className="text-2xl font-bold text-primary">
                R$ {receipt.amountBRL.toFixed(2)}
              </p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900">
              <TrendingUp className="w-3 h-3 mr-1" />
              Ready
            </Badge>
          </div>

          <Button
            onClick={() => setIsDialogOpen(true)}
            className="w-full"
            variant="default"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Settle to Bank
          </Button>

          <Alert>
            <AlertDescription className="text-xs">
              <strong>Optional:</strong> You can keep crypto or convert to fiat anytime.
              Fees apply when settling.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Settlement Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settle to Bank Account</DialogTitle>
            <DialogDescription>
              Convert R$ {receipt.amountBRL.toFixed(2)} to fiat and receive in your bank
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Provider Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Settlement Provider</label>
              <Select
                value={selectedProvider}
                onValueChange={(value) => setSelectedProvider(value as 'circle' | 'wise')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wise">
                    Wise (BRL, USD, EUR, 50+ currencies)
                  </SelectItem>
                  <SelectItem value="circle">
                    Circle (USD, EUR, GBP - Global)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Currency Selection (if Wise) */}
            {selectedProvider === 'wise' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Currency</label>
                <Select
                  value={selectedCurrency}
                  onValueChange={setSelectedCurrency}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL - Brazilian Real (PIX)</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Estimate */}
            <Alert>
              <AlertDescription className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">R$ {receipt.amountBRL.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Fee:</span>
                  <span className="font-medium text-orange-600">
                    ~R$ {(receipt.amountBRL * 0.01).toFixed(2)} (1%)
                  </span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                  <span>You Receive:</span>
                  <span className="text-green-600">
                    ~R$ {(receipt.amountBRL * 0.99).toFixed(2)}
                  </span>
                </div>
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertDescription className="text-xs">
                ⚠️ <strong>Note:</strong> This will convert your crypto to {selectedCurrency} and
                send to your configured bank account. This action cannot be undone.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSettle}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Confirm Settlement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

