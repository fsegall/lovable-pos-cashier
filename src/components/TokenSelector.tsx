// Token Selector Component
// Allows merchants to choose which token they want to accept for payment
// Powered by Jupiter for auto-swap to preferred settlement token

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSupportedTokens, getSettlementTokens, TokenInfo } from '@/lib/tokens';
import { ArrowRight, Zap, TrendingUp } from 'lucide-react';

interface TokenSelectorProps {
  selectedInputToken?: TokenInfo;
  selectedOutputToken?: TokenInfo;
  onInputTokenChange: (token: TokenInfo) => void;
  onOutputTokenChange: (token: TokenInfo) => void;
  autoSwapEnabled: boolean;
  onAutoSwapChange: (enabled: boolean) => void;
}

export function TokenSelector({
  selectedInputToken,
  selectedOutputToken,
  onInputTokenChange,
  onOutputTokenChange,
  autoSwapEnabled,
  onAutoSwapChange,
}: TokenSelectorProps) {
  const inputTokens = getSupportedTokens();
  const outputTokens = getSettlementTokens();

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-600" />
          Multi-Token Support
          <Badge variant="secondary" className="ml-auto">
            Powered by Jupiter
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs">
          Accept any SPL token, auto-convert to your preferred settlement token
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-Swap Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex-1">
            <Label htmlFor="auto-swap" className="text-sm font-medium">
              Enable Auto-Swap
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Convert any token to stable automatically
            </p>
          </div>
          <Switch
            id="auto-swap"
            checked={autoSwapEnabled}
            onCheckedChange={onAutoSwapChange}
          />
        </div>

        {autoSwapEnabled && (
          <>
            {/* Input Token Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Customer Pays With:
              </Label>
              <Select
                value={selectedInputToken?.mint}
                onValueChange={(mint) => {
                  const token = inputTokens.find(t => t.mint === mint);
                  if (token) onInputTokenChange(token);
                }}
              >
                <SelectTrigger>
                  <SelectValue>
                    {selectedInputToken ? (
                      <div className="flex items-center gap-2">
                        {selectedInputToken.logoURI && (
                          <img
                            src={selectedInputToken.logoURI}
                            alt={selectedInputToken.symbol}
                            className="w-4 h-4 rounded-full"
                          />
                        )}
                        <span className="font-medium">{selectedInputToken.symbol}</span>
                        <span className="text-xs text-muted-foreground">
                          {selectedInputToken.name}
                        </span>
                      </div>
                    ) : (
                      'Select input token'
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {inputTokens.map((token) => (
                    <SelectItem key={token.mint} value={token.mint}>
                      <div className="flex items-center gap-2">
                        {token.logoURI && (
                          <img
                            src={token.logoURI}
                            alt={token.symbol}
                            className="w-4 h-4 rounded-full"
                          />
                        )}
                        <span className="font-medium">{token.symbol}</span>
                        <span className="text-xs text-muted-foreground">
                          {token.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center py-1">
              <div className="flex items-center gap-2 text-purple-600">
                <ArrowRight className="w-4 h-4" />
                <span className="text-xs font-medium">Auto-swap via Jupiter</span>
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            {/* Output Token Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                You Receive (Settlement Token):
              </Label>
              <Select
                value={selectedOutputToken?.mint}
                onValueChange={(mint) => {
                  const token = outputTokens.find(t => t.mint === mint);
                  if (token) onOutputTokenChange(token);
                }}
              >
                <SelectTrigger>
                  <SelectValue>
                    {selectedOutputToken ? (
                      <div className="flex items-center gap-2">
                        {selectedOutputToken.logoURI && (
                          <img
                            src={selectedOutputToken.logoURI}
                            alt={selectedOutputToken.symbol}
                            className="w-4 h-4 rounded-full"
                          />
                        )}
                        <span className="font-medium">{selectedOutputToken.symbol}</span>
                        <span className="text-xs text-muted-foreground">
                          {selectedOutputToken.name}
                        </span>
                      </div>
                    ) : (
                      'Select settlement token'
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {outputTokens.map((token) => (
                    <SelectItem key={token.mint} value={token.mint}>
                      <div className="flex items-center gap-2">
                        {token.logoURI && (
                          <img
                            src={token.logoURI}
                            alt={token.symbol}
                            className="w-4 h-4 rounded-full"
                          />
                        )}
                        <span className="font-medium">{token.symbol}</span>
                        <span className="text-xs text-muted-foreground">
                          {token.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Info Alert */}
            <Alert className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
              <AlertDescription className="text-xs text-purple-900 dark:text-purple-100">
                <strong>💡 How it works:</strong> Customer pays with any token (SOL, BONK, etc).
                Jupiter finds best swap route. You receive {selectedOutputToken?.symbol || 'stable'}.
                Optional: Convert to fiat via Wise/Circle.
              </AlertDescription>
            </Alert>
          </>
        )}

        {!autoSwapEnabled && (
          <Alert>
            <AlertDescription className="text-xs">
              💰 Direct payment mode: Accept only {selectedOutputToken?.symbol || 'tBRZ'}.
              Enable auto-swap to accept any token.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

