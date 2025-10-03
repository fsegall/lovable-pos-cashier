import { Badge } from '@/components/ui/badge';
import { ReceiptStatus } from '@/types/store';
import { Clock, CheckCircle, DollarSign, XCircle } from 'lucide-react';

interface StatusChipProps {
  status: ReceiptStatus;
}

export function StatusChip({ status }: StatusChipProps) {
  const config = {
    pending: {
      label: 'Pending',
      variant: 'secondary' as const,
      icon: Clock,
      className: 'bg-pending/10 text-pending border-pending/20',
    },
    confirmed: {
      label: 'Confirmed',
      variant: 'default' as const,
      icon: CheckCircle,
      className: 'bg-success/10 text-success border-success/20',
    },
    settled: {
      label: 'Settled',
      variant: 'default' as const,
      icon: DollarSign,
      className: 'bg-accent/10 text-accent border-accent/20',
    },
    error: {
      label: 'Error',
      variant: 'destructive' as const,
      icon: XCircle,
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <Badge variant="outline" className={className}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}
