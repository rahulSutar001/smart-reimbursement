import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { findCompanyByDomain, getEmployeesByCompany, savePendingEmployee, uuid } from '@/lib/storage';
import { Company, Employee } from '@/lib/types';
import { Link } from 'react-router-dom';

const ROLES = ['Employee', 'Manager', 'Director', 'Finance', 'CFO'] as const;
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

const EmployeeSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'otp' | 'details' | 'success'>('otp');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [company, setCompany] = useState<Company | null>(null);
  const [form, setForm] = useState({
    name: '', gender: '', age: '', department: '', role: 'Employee' as Employee['role'],
    managerId: '', prn: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const domain = email.includes('@') ? email.split('@')[1] : '';
  const detectedCompany = domain ? findCompanyByDomain(domain) : null;

  const handleSendOtp = () => {
    if (!email) return;
    toast.success(`OTP sent to ${email}`);
    setOtpSent(true);
    if (detectedCompany) setCompany(detectedCompany);
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) { toast.error('Enter a 6-digit OTP'); return; }
    if (!detectedCompany) { toast.error("Your company isn't registered yet."); return; }
    setCompany(detectedCompany);
    setStep('details');
  };

  const managers = company ? getEmployeesByCompany(company.id).filter(e => ['Manager', 'Director', 'CFO'].includes(e.role)) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name) errs.name = 'Required';
    if (form.password.length < 8) errs.password = 'Min 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    savePendingEmployee({
      id: uuid(), name: form.name, email, role: form.role, department: form.department,
      managerId: form.managerId, companyId: company!.id, status: 'pending', password: form.password,
      prn: form.prn, gender: form.gender, age: form.age ? Number(form.age) : undefined,
    });
    setStep('success');
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-[560px] animate-fade-in rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
        <button onClick={() => navigate('/')} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Back
        </button>

        {step === 'otp' && (
          <>
            <h1 className="font-heading text-2xl font-bold text-foreground">Employee Sign Up</h1>
            <p className="mt-1 text-sm text-muted-foreground">Step 1: Verify your work email</p>
            <div className="mt-6 space-y-4">
              <div>
                <Label>Work Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
                {domain && detectedCompany && <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">✓ {detectedCompany.name} detected</p>}
                {domain && !detectedCompany && email.includes('@') && <p className="mt-1 text-xs text-destructive">Your company isn't registered yet.</p>}
              </div>
              {!otpSent && <Button onClick={handleSendOtp} className="w-full">Send OTP</Button>}
              {otpSent && (
                <>
                  <div>
                    <Label>6-Digit OTP</Label>
                    <Input maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="000000" />
                  </div>
                  <Button onClick={handleVerifyOtp} className="w-full">Verify OTP</Button>
                </>
              )}
            </div>
          </>
        )}

        {step === 'details' && (
          <>
            <h1 className="font-heading text-2xl font-bold text-foreground">Employee Details</h1>
            <p className="mt-1 text-sm text-muted-foreground">Step 2: Fill in your details</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div><Label>Full Name</Label><Input value={form.name} onChange={set('name')} />{errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}</div>
              <div>
                <Label>Gender</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.gender} onChange={set('gender')}>
                  <option value="">Select...</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div><Label>Age</Label><Input type="number" value={form.age} onChange={set('age')} /></div>
              <div><Label>Department</Label><Input value={form.department} onChange={set('department')} /></div>
              <div>
                <Label>Role</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.role} onChange={set('role')}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <Label>Reports To / Manager</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.managerId} onChange={set('managerId')}>
                  <option value="">Select...</option>
                  {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div><Label>Employee ID / PRN</Label><Input value={form.prn} onChange={set('prn')} /></div>
              <div><Label>Password</Label><Input type="password" value={form.password} onChange={set('password')} />{errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}</div>
              <div><Label>Confirm Password</Label><Input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} />{errors.confirmPassword && <p className="mt-1 text-xs text-destructive">{errors.confirmPassword}</p>}</div>
              <Button type="submit" className="w-full">Submit for Approval</Button>
            </form>
          </>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle size={64} className="text-success animate-fade-in" />
            <h2 className="mt-4 font-heading text-xl font-bold text-foreground">Application Submitted!</h2>
            <p className="mt-2 text-sm text-muted-foreground">Your admin will review and approve your account. You'll be able to log in once approved.</p>
            <Link to="/" className="mt-6 text-sm text-primary hover:underline">Back to Home</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSignup;
