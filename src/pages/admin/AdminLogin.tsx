import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getCompanies, setSession } from '@/lib/storage';
import { ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const company = getCompanies().find(c => c.adminEmail === email && c.password === password);
    if (company) {
      setSession('admin', company);
      navigate('/admin/dashboard');
    } else {
      toast.error('Invalid credentials.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[420px] animate-fade-in rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
        <button onClick={() => navigate('/')} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="font-heading text-2xl font-bold text-foreground">Admin Login</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full">Login as Admin</Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New company? <Link to="/admin/signup" className="text-primary hover:underline">Register here →</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
