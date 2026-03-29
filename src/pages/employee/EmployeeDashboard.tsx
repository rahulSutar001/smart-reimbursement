import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, getClaimsByEmployee, findCompanyById } from '@/lib/storage';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Employee, Claim, Company } from '@/lib/types';
import { Receipt, Camera, Pencil, DollarSign, Clock, CheckCircle, Banknote, LogOut } from 'lucide-react';
import { clearSession } from '@/lib/storage';

const FILTERS = ['All', 'Draft', 'Pending', 'Approved', 'Rejected'] as const;

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [emp, setEmp] = useState<Employee | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    const session = getSession();
    if (!session || session.type !== 'employee') { navigate('/employee/login'); return; }
    setEmp(session.data);
    setCompany(findCompanyById(session.data.companyId) || null);
  }, [navigate]);

  if (!emp || !company) return null;

  const claims = getClaimsByEmployee(emp.id);
  const filtered = filter === 'All' ? claims : claims.filter(c => c.status.toLowerCase() === filter.toLowerCase());

  const totalClaimed = claims.reduce((s, c) => s + c.amountInBase, 0);
  const pendingAmt = claims.filter(c => c.status === 'pending').reduce((s, c) => s + c.amountInBase, 0);
  const approvedAmt = claims.filter(c => c.status === 'approved').reduce((s, c) => s + c.amountInBase, 0);
  const transferredAmt = claims.filter(c => c.status === 'transferred').reduce((s, c) => s + c.amountInBase, 0);
  const sym = company.currencySymbol;

  const canEdit = (c: Claim) => {
    if (c.status === 'draft') return true;
    if (c.status === 'pending' && c.approvalSteps.every(s => s.status === 'pending' || s.status === 'not_reached')) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <Receipt size={20} className="text-primary" />
          <span className="font-heading font-bold text-foreground">ReimburseFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {emp.name.charAt(0)}
          </div>
          <span className="hidden text-sm font-medium text-foreground sm:inline">{emp.name}</span>
          <button onClick={() => { clearSession(); navigate('/'); }} className="text-muted-foreground hover:text-destructive">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4 md:p-6">
        {/* New Claim CTA */}
        <div className="animate-fade-in rounded-xl border border-primary/20 bg-primary-light p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-heading text-lg font-bold text-foreground">Ready to claim an expense?</p>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/employee/new-claim')}>
              <Camera size={16} className="mr-1" /> Scan Receipt
            </Button>
            <Button variant="outline" onClick={() => navigate('/employee/new-claim')}>
              <Pencil size={16} className="mr-1" /> Enter Manually
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Claimed" value={`${sym}${totalClaimed.toLocaleString()}`} color="primary" icon={<DollarSign size={20} />} />
          <StatCard label="Pending Approval" value={`${sym}${pendingAmt.toLocaleString()}`} color="warning" icon={<Clock size={20} />} />
          <StatCard label="Approved" value={`${sym}${approvedAmt.toLocaleString()}`} color="success" icon={<CheckCircle size={20} />} />
          <StatCard label="Transferred to Bank" value={`${sym}${transferredAmt.toLocaleString()}`} color="primary" icon={<Banknote size={20} />} />
        </div>

        {/* Claims Table */}
        <div className="mt-8">
          <h2 className="font-heading text-lg font-semibold text-foreground">My Claims</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="mt-3 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Description</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Paid By</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((claim, i) => (
                  <tr
                    key={claim.id}
                    className="border-t border-border cursor-pointer hover:bg-muted/50 animate-stagger-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                    onClick={() => navigate(`/employee/claim/${claim.id}`)}
                  >
                    <td className="px-4 py-3 text-muted-foreground">{claim.billNo}</td>
                    <td className="px-4 py-3 text-muted-foreground">{claim.date}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{claim.category}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground truncate max-w-[150px]">{claim.description}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{claim.currency} {claim.amount}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{claim.paidBy}</td>
                    <td className="px-4 py-3"><StatusBadge status={claim.status} /></td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      {canEdit(claim) ? (
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/employee/new-claim?edit=true&id=${claim.id}`)}>Edit</Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/employee/claim/${claim.id}`)}>View</Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No claims found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
