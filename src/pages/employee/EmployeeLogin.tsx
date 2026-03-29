import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { findEmployeeByEmail, setSession, getPendingEmployees } from '@/lib/storage';

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = findEmployeeByEmail(email);
    if (emp && emp.password === password && emp.status === 'approved') {
      setSession('employee', emp);
      if (['Manager', 'Director', 'CFO'].includes(emp.role)) {
        navigate('/manager/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
      return;
    }
    const pending = getPendingEmployees().find(p => p.email === email);
    if (pending) {
      toast.warning('Your account is pending admin approval.');
      return;
    }
    toast.error('Account not found.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[400px] animate-fade-in rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
        <button onClick={() => navigate('/')} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="font-heading text-2xl font-bold text-foreground">Employee Login</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div><Label>Work Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <Button type="submit" className="w-full">Login</Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New here? <Link to="/employee/signup" className="text-primary hover:underline">Sign up →</Link>
        </p>
      </div>
    </div>
  );
};

export default EmployeeLogin;
