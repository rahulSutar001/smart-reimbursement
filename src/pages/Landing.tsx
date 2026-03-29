import { useNavigate } from 'react-router-dom';
import { Receipt, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Header / Logo */}
      <div className="absolute left-6 top-6 flex items-center gap-2">
        <Receipt size={24} className="text-primary" />
        <span className="font-heading text-lg font-bold text-foreground">ReimburseFlow</span>
      </div>

      {/* Hero */}
      <div className="mb-10 text-center animate-fade-in">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          Expense Management, Simplified.
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">Choose your portal to get started.</p>
      </div>

      {/* Cards */}
      <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
        {/* Employee Card */}
        <div className="group flex flex-col items-center rounded-xl border border-border bg-card p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <User size={28} className="text-primary" />
          </div>
          <h2 className="font-heading text-lg font-semibold text-foreground">I'm an Employee / Manager</h2>
          <p className="mt-1 text-sm text-muted-foreground text-center">Submit claims, track approvals</p>
          <div className="mt-6 flex w-full flex-col gap-2">
            <Button onClick={() => navigate('/employee/login')} className="w-full">Login</Button>
            <Button onClick={() => navigate('/employee/signup')} variant="ghost" className="w-full">Sign Up</Button>
          </div>
        </div>

        {/* Admin Card */}
        <div className="group flex flex-col items-center rounded-xl border border-border bg-card p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Shield size={28} className="text-primary" />
          </div>
          <h2 className="font-heading text-lg font-semibold text-foreground">I'm an Admin</h2>
          <p className="mt-1 text-sm text-muted-foreground text-center">Manage your company & approval rules</p>
          <div className="mt-6 flex w-full flex-col gap-2">
            <Button onClick={() => navigate('/admin/login')} className="w-full">Login</Button>
            <Button onClick={() => navigate('/admin/signup')} variant="ghost" className="w-full">Register Company</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
