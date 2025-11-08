import { NavLink } from '@/components/NavLink';
import { LayoutDashboard, ArrowLeftRight, Wallet, Tags, Target, BarChart3, FileText, CreditCard, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transações', icon: ArrowLeftRight },
    { to: '/wallets', label: 'Carteiras', icon: Wallet },
    { to: '/categories', label: 'Categorias', icon: Tags },
    { to: '/goals', label: 'Metas', icon: Target },
    { to: '/reports', label: 'Relatórios', icon: BarChart3 },
    { to: '/bills', label: 'Contas', icon: FileText },
    { to: '/debts', label: 'Dívidas', icon: CreditCard },
    { to: '/settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-card backdrop-blur supports-[backdrop-filter]:bg-card/95">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">FinanceControl</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-muted/50"
                  activeClassName="text-primary bg-muted"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};
