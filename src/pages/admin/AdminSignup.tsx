import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { saveCompany, uuid, setSession } from '@/lib/storage';

const AdminSignup = () => {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [form, setForm] = useState({
    companyName: '', country: '', currency: '', currencySymbol: '', domain: '',
    adminName: '', adminEmail: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCountries = async () => {
    if (countries.length) return;
    try {
      const res = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
      const data = await res.json();
      const mapped = data.map((c: any) => {
        const curr = c.currencies ? Object.entries(c.currencies)[0] : null;
        return {
          name: c.name.common,
          currency: curr ? (curr[1] as any).name : '',
          symbol: curr ? (curr[1] as any).symbol : '',
          code: curr ? curr[0] : '',
        };
      }).sort((a: any, b: any) => a.name.localeCompare(b.name));
      setCountries(mapped);
    } catch {
      toast.error('Failed to load countries');
    }
  };

  const handleCountryChange = (name: string) => {
    const c = countries.find(x => x.name === name);
    if (c) setForm(f => ({ ...f, country: c.name, currency: c.code, currencySymbol: c.symbol }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.companyName) e.companyName = 'Required';
    if (!form.country) e.country = 'Required';
    if (!form.domain) e.domain = 'Required';
    if (!form.adminName) e.adminName = 'Required';
    if (!form.adminEmail) e.adminEmail = 'Required';
    else if (!form.adminEmail.endsWith('@' + form.domain)) e.adminEmail = `Must end with @${form.domain}`;
    if (form.password.length < 8) e.password = 'Min 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords don\'t match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const company = {
      id: uuid(), name: form.companyName, domain: form.domain,
      country: form.country, currency: form.currency, currencySymbol: form.currencySymbol,
      adminEmail: form.adminEmail, adminName: form.adminName, password: form.password,
    };
    saveCompany(company);
    setSession('admin', company);
    toast.success(`Company registered! Welcome, ${form.adminName}.`);
    navigate('/admin/dashboard');
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-[520px] animate-fade-in rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
        <button onClick={() => navigate('/')} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="font-heading text-2xl font-bold text-foreground">Register Your Company</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label>Company Name</Label>
            <Input value={form.companyName} onChange={set('companyName')} />
            {errors.companyName && <p className="mt-1 text-xs text-destructive">{errors.companyName}</p>}
          </div>
          <div>
            <Label>Company Location</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.country}
              onFocus={fetchCountries}
              onChange={e => handleCountryChange(e.target.value)}
            >
              <option value="">Select country...</option>
              {countries.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            {form.currencySymbol && <p className="mt-1 text-xs text-muted-foreground">Currency: {form.currencySymbol} ({form.currency})</p>}
            {errors.country && <p className="mt-1 text-xs text-destructive">{errors.country}</p>}
          </div>
          <div>
            <Label>Company Email Domain</Label>
            <Input placeholder="e.g. yourcompany.com" value={form.domain} onChange={set('domain')} />
            <p className="mt-1 text-xs text-muted-foreground">Employees signing up with this domain will be auto-linked to your company.</p>
            {errors.domain && <p className="mt-1 text-xs text-destructive">{errors.domain}</p>}
          </div>
          <div>
            <Label>Admin Full Name</Label>
            <Input value={form.adminName} onChange={set('adminName')} />
            {errors.adminName && <p className="mt-1 text-xs text-destructive">{errors.adminName}</p>}
          </div>
          <div>
            <Label>Admin Email</Label>
            <Input type="email" value={form.adminEmail} onChange={set('adminEmail')} onBlur={() => {
              if (form.adminEmail && form.domain && !form.adminEmail.endsWith('@' + form.domain))
                setErrors(e => ({ ...e, adminEmail: `Must end with @${form.domain}` }));
              else setErrors(e => { const { adminEmail, ...rest } = e; return rest; });
            }} />
            {errors.adminEmail && <p className="mt-1 text-xs text-destructive">{errors.adminEmail}</p>}
          </div>
          <div>
            <Label>Password</Label>
            <div className="relative">
              <Input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-2.5 text-muted-foreground">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
          </div>
          <div>
            <Label>Confirm Password</Label>
            <Input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} />
            {errors.confirmPassword && <p className="mt-1 text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>
          <Button type="submit" className="w-full">Register & Continue →</Button>
        </form>
      </div>
    </div>
  );
};

export default AdminSignup;
