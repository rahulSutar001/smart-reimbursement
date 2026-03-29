import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getSession, saveClaim, getClaimById, findCompanyById, uuid } from '@/lib/storage';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Employee, Company, Claim } from '@/lib/types';

const CATEGORIES = ['Meals', 'Travel', 'Accommodation', 'Office Supplies', 'Medical', 'Other'];
const PAID_BY = ['Self', 'Company Card', 'Corporate Account'];

const mockOCR = () => ({
  billNo: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
  vendor: ['Uber', 'Starbucks', 'Hilton Hotels', 'Amazon', 'FedEx'][Math.floor(Math.random() * 5)],
  category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
  date: new Date().toISOString().split('T')[0],
  amount: Math.floor(50 + Math.random() * 500),
  description: 'Business expense',
});

const NewClaim = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isEdit = params.get('edit') === 'true';
  const editId = params.get('id');

  const [emp, setEmp] = useState<Employee | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [receiptName, setReceiptName] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState({
    billNo: '', vendor: '', category: 'Meals', date: '', currency: '', amount: '',
    description: '', paidBy: 'Self',
  });

  useEffect(() => {
    const session = getSession();
    if (!session || session.type !== 'employee') { navigate('/employee/login'); return; }
    setEmp(session.data);
    const co = findCompanyById(session.data.companyId);
    setCompany(co || null);
    if (co) setForm(f => ({ ...f, currency: co.currency }));

    if (isEdit && editId) {
      const claim = getClaimById(editId);
      if (claim) {
        setForm({
          billNo: claim.billNo, vendor: claim.vendor, category: claim.category,
          date: claim.date, currency: claim.currency, amount: String(claim.amount),
          description: claim.description, paidBy: claim.paidBy,
        });
        setScanned(true);
      }
    }
  }, [navigate, isEdit, editId]);

  if (!emp || !company) return null;

  const handleUpload = () => {
    setScanning(true);
    setTimeout(() => {
      const data = mockOCR();
      setForm(f => ({
        ...f, billNo: data.billNo, vendor: data.vendor, category: data.category,
        date: data.date, amount: String(data.amount), description: data.description,
      }));
      setScanning(false);
      setScanned(true);
      setReceiptName('receipt.jpg');
    }, 1500);
  };

  const handleSave = (status: 'draft' | 'pending') => {
    if (!form.billNo || !form.amount) { toast.error('Fill required fields'); return; }
    const amt = Number(form.amount);
    const aiFlag: 'green' | 'red' = amt > 300 ? 'red' : 'green';
    const aiReason = aiFlag === 'green'
      ? 'Amount within normal range. Category matches role. No duplicate detected.'
      : 'Amount unusually high for category. Possible duplicate submission. Vendor name unclear from receipt.';

    const claim: Claim = {
      id: isEdit && editId ? editId : uuid(),
      employeeId: emp.id,
      companyId: company.id,
      billNo: form.billNo,
      vendor: form.vendor,
      category: form.category,
      date: form.date,
      currency: form.currency,
      amount: amt,
      amountInBase: amt,
      description: form.description,
      paidBy: form.paidBy,
      receiptUrl: receiptName,
      status,
      createdAt: new Date().toISOString(),
      aiFlag,
      aiReason,
      approvalSteps: [
        { role: 'Manager', status: 'pending' },
        { role: 'Finance', status: 'not_reached' },
        { role: 'Director', status: 'not_reached' },
      ],
    };
    saveClaim(claim);
    toast.success(status === 'draft' ? 'Saved as draft' : 'Claim submitted for approval!');
    navigate('/employee/dashboard');
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="flex min-h-screen items-start justify-center bg-background px-4 py-8">
      <div className="w-full max-w-[680px] animate-fade-in rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
        <button onClick={() => navigate('/employee/dashboard')} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="font-heading text-2xl font-bold text-foreground">{isEdit ? 'Edit Expense Claim' : 'New Expense Claim'}</h1>

        {/* Upload Zone */}
        <div
          className="mt-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 cursor-pointer transition-colors hover:border-primary/50"
          onClick={handleUpload}
        >
          {scanning ? (
            <div className="space-y-3 w-full">
              <div className="h-4 rounded bg-muted animate-shimmer" />
              <div className="h-4 rounded bg-muted animate-shimmer w-3/4" />
              <div className="h-4 rounded bg-muted animate-shimmer w-1/2" />
              <p className="text-xs text-muted-foreground text-center mt-2">Scanning receipt...</p>
            </div>
          ) : (
            <>
              <Upload size={32} className="text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Drag & drop a receipt image or click to upload</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, PDF</p>
            </>
          )}
        </div>
        {scanned && !scanning && (
          <p className="mt-2 flex items-center gap-1 text-xs text-success">✓ Receipt scanned — fields auto-filled. Please review.</p>
        )}
        {receiptName && <p className="mt-1 text-xs text-muted-foreground">📎 {receiptName}</p>}

        {/* Form */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div><Label>Bill Number</Label><Input value={form.billNo} onChange={set('billNo')} /></div>
          <div><Label>Vendor / Merchant</Label><Input value={form.vendor} onChange={set('vendor')} /></div>
          <div>
            <Label>Category</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><Label>Expense Date</Label><Input type="date" value={form.date} onChange={set('date')} /></div>
          <div>
            <Label>Currency</Label>
            <Input value={form.currency} onChange={set('currency')} />
          </div>
          <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={set('amount')} /></div>
          <div className="sm:col-span-2">
            <Label>Description / Notes</Label>
            <Textarea value={form.description} onChange={set('description')} rows={3} />
          </div>
          <div>
            <Label>Paid By</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.paidBy} onChange={set('paidBy')}>
              {PAID_BY.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => setDeleteOpen(true)}>
            <Trash2 size={16} className="mr-1" /> Delete
          </Button>
          <Button variant="outline" onClick={() => handleSave('draft')}>
            <Save size={16} className="mr-1" /> Save as Draft
          </Button>
          <Button onClick={() => handleSave('pending')}>
            <Send size={16} className="mr-1" /> Submit
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        title="Discard Claim"
        message="Are you sure? This will discard all changes."
        confirmLabel="Discard"
        variant="destructive"
        onConfirm={() => { setDeleteOpen(false); navigate('/employee/dashboard'); }}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
};

export default NewClaim;
