import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { clearSession } from '@/lib/storage';
import { LogOut, Menu, X, Receipt } from 'lucide-react';
import { useState } from 'react';

interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

interface SidebarLayoutProps {
  items: SidebarItem[];
  children: React.ReactNode;
  title?: string;
}

export function SidebarLayout({ items, children, title }: SidebarLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <Receipt size={20} className="text-primary" />
        <span className="font-heading font-bold text-foreground">{title || 'ReimburseFlow'}</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map(item => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              location.pathname === item.path
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:block">
        {sidebar}
      </aside>

      {/* Mobile header + overlay */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
          <button onClick={() => setOpen(!open)} className="text-foreground">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Receipt size={18} className="text-primary" />
          <span className="font-heading font-semibold text-sm">{title || 'ReimburseFlow'}</span>
        </header>

        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-64 bg-card shadow-lg">{sidebar}</aside>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
