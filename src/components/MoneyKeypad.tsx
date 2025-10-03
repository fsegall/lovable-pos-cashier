import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Delete } from 'lucide-react';
import { motion } from 'framer-motion';

interface MoneyKeypadProps {
  onGenerate: (amount: number) => void;
}

export function MoneyKeypad({ onGenerate }: MoneyKeypadProps) {
  const [amount, setAmount] = useState('0');

  const handleNumber = (num: string) => {
    if (amount === '0') {
      setAmount(num);
    } else {
      setAmount(amount + num);
    }
  };

  const handleQuick = (value: number) => {
    setAmount(value.toString());
  };

  const handleBackspace = () => {
    if (amount.length === 1) {
      setAmount('0');
    } else {
      setAmount(amount.slice(0, -1));
    }
  };

  const handleGenerate = () => {
    const value = parseFloat(amount) / 100;
    if (value > 0) {
      onGenerate(value);
    }
  };

  const displayAmount = (parseFloat(amount) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0'];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className="text-sm text-muted-foreground mb-2">Valor</div>
        <div className="text-5xl font-bold text-primary">{displayAmount}</div>
      </motion.div>

      <div className="flex flex-wrap gap-2 justify-center">
        {[50, 100, 200, 500].map((value) => (
          <Button
            key={value}
            variant="outline"
            size="sm"
            onClick={() => handleQuick(value * 100)}
            className="min-w-[70px]"
          >
            R$ {value}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {buttons.map((btn) => (
          <Button
            key={btn}
            variant="outline"
            size="lg"
            onClick={() => handleNumber(btn)}
            className="h-16 text-xl font-semibold hover:bg-primary/10 hover:text-primary"
          >
            {btn}
          </Button>
        ))}
        <Button
          variant="outline"
          size="lg"
          onClick={handleBackspace}
          className="h-16 hover:bg-destructive/10 hover:text-destructive"
        >
          <Delete className="w-6 h-6" />
        </Button>
      </div>

      <Button
        size="lg"
        onClick={handleGenerate}
        disabled={parseFloat(amount) === 0}
        className="w-full h-14 text-lg font-semibold"
      >
        Gerar QR Code
      </Button>
    </div>
  );
}
