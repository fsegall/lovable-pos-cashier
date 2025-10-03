import { NavLink } from 'react-router-dom';
import { Home, Receipt, Package, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export function BottomTabs() {
  const { t } = useTranslation();

  const tabs = [
    { to: '/pos', icon: Home, label: t('nav.pos') },
    { to: '/receipts', icon: Receipt, label: t('nav.receipts') },
    { to: '/catalog', icon: Package, label: t('nav.catalog') },
    { to: '/reports', icon: BarChart3, label: t('nav.reports') },
    { to: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
