import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarLayout } from '@/components/SidebarLayout';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { AIFlagIcon } from '@/components/AIFlagIcon';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getSession, getClaimsByCompany, getEmployees, updateClaim, findCompanyById } from '@/lib/storage';
import { Employee, Claim, Company } from '@/lib/types';
import { ClipboardList, CheckSquare, Eye, Bot } from 'lucide-react';
import confetti from 'canvas-confetti';

const AI_REJECT_CHIPS = [
  'Receipt image is unclear or missing',
  'Amount exceeds policy limit for this category',
  'Duplicate submission detected',
];

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [emp, setEmp] = useState<Employee | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [tab, setTab] = useState<'pending' | 'reviewed' | 'team'>('pending');
  const [approveAllOpen, setApproveAllOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.type !== 'employee') { navigate('/employee/login'); return; }
    setEmp(session.data);
    setCompany(findCompanyById(session.data.companyId) || null);
    setTimeout(() => setAnimated(true), 100);
  }, [navigate]);

  if (!emp || !company) return null;

  const allClaims = getClaimsByCompany(company.id);
  const employees = getEmployees().filter(e => e.companyId === company.id);
  const pendingClaims = allClaims.filter(c => c.status === 'pending');
  const reviewedClaims = allClaims.filter(c => c.status === 'approved' || c.status === 'rejected');
  const greenClaims = pendingClaims.filter(c => c.aiFlag === 'green');
  const redClaims = pendingClaims.filter(c => c.aiFlag === 'red');

  const sidebarItems = [
    { label: 'Pending Reviews', icon: <ClipboardList size={18} />, path: '/manager/dashboard', badge: pendingClaims.length },
    { label: 'Reviewed', icon: <CheckSquare size={18} />, path: '/manager/dashboard' },
    { label: 'Team Overview', icon: <Eye size={18} />, path: '/manager/dashboard' },
  ];

  const handleApprove = (claimId: string) => {
    const claim = allClaims.find(c => c.id === claimId);
    if (!claim) return;
    const steps = claim.approvalSteps.map((s, i) => i === 0 ? { ...s, status: 'approved' as const, approverName: emp.name, comment: 'Approved', timestamp: new Date().toLocaleString() } : s);
    updateClaim(claimId, { status: 'approved', approvalSteps: steps });
    setRefresh(r => r + 1);
    toast.success('Claim approved.');
  };

  const handleReject = (claimId: string) => {
    const claim = allClaims.find(c => c.id === claimId);
    if (!claim) return;
    const steps = claim.approvalSteps.map((s, i) => i === 0 ? { ...s, status: 'rejected' as const, approverName: emp.name, comment: rejectReason, timestamp: new Date().toLocaleString() } : s);
    updateClaim(claimId, { status: 'rejected', approvalSteps: steps });
    setRejectingId(null);
    setRejectReason('');
    setRefresh(r => r + 1);
    toast.success('Claim rejected.');
  };

  const handleApproveAll = () => {
    greenClaims.forEach(c => {
      const steps = c.approvalSteps.map((s, i) => i === 0 ? { ...s, status: 'approved' as const, approverName: emp.name, timestamp: new Date().toLocaleString() } : s);
      updateClaim(c.id, { status: 'approved', approvalSteps: steps });
    });
    setApproveAllOpen(false);
    setRefresh(r => r + 1);
    toast.success(`${greenClaims.length} claims approved.`);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const totalGreenAmt = greenClaims.reduce((s, c) => s + c.amountInBase, 0);

  return (
    <SidebarLayout items={sidebarItems} title="Manager" key={refresh}>
      <div className="animate-fade-in">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {tab === 'pending' ? 'Pending Approvals' : tab === 'reviewed' ? 'Reviewed Claims' : 'Team Overview'}
          </h1>
          <div className="flex gap-2">
            <Button size="sm" variant={tab === 'pending' ? 'default' : 'outline'} onClick={() => setTab('pending')}>Pending ({pendingClaims.length})</Button>
            <Button size="sm" variant={tab === 'reviewed' ? 'default' : 'outline'} onClick={() => setTab('reviewed')}>Reviewed</Button>
            <Button size="sm" variant={tab === 'team' ? 'default' : 'outline'} onClick={() => setTab('team')}>Team</Button>
          </div>
        </div>

        {tab === 'pending' && (
          <>
            {/* AI Banner */}
            <div className="mt-4 rounded-lg bg-primary-light border border-primary/20 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-primary" />
                <span className="text-sm text-foreground">
                  🤖 AI Assistant has reviewed {pendingClaims.length} claims. {greenClaims.length} flagged green, {redClaims.length} flagged red.
                </span>
              </div>
              {greenClaims.length > 0 && (
                <Button size="sm" onClick={() => setApproveAllOpen(true)}>✅ Approve All Green</Button>
              )}
            </div>

            {/* Table */}
            <div className="mt-4 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left">
                  <tr>
                    <th className="px-3 py-3 font-medium">AI</th>
                    <th className="px-3 py-3 font-medium">#</th>
                    <th className="px-3 py-3 font-medium">Requested By</th>
                    <th className="px-3 py-3 font-medium hidden sm:table-cell">Category</th>
                    <th className="px-3 py-3 font-medium">Amount</th>
                    <th className="px-3 py-3 font-medium hidden md:table-cell">Date</th>
                    <th className="px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingClaims.map((claim, i) => {
                    const claimEmp = employees.find(e => e.id === claim.employeeId);
                    return (
                      <tr key={claim.id}>
                        <td className="px-3 py-3">
                          <AIFlagIcon flag={claim.aiFlag} tooltip={claim.aiReason} animate={animated} />
                        </td>
                        <td className="px-3 py-3 text-muted-foreground cursor-pointer hover:text-primary" onClick={() => navigate(`/manager/review/${claim.id}`)}>
                          {claim.billNo}
                        </td>
                        <td className="px-3 py-3 font-medium text-foreground">{claimEmp?.name || 'Unknown'}</td>
                        <td className="px-3 py-3 hidden sm:table-cell text-muted-foreground">{claim.category}</td>
                        <td className="px-3 py-3 font-medium">{claim.currency} {claim.amount}</td>
                        <td className="px-3 py-3 hidden md:table-cell text-muted-foreground">{claim.date}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="text-success border-success/50 hover:bg-success/10 text-xs h-7 px-2" onClick={() => handleApprove(claim.id)}>
                              ✓
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10 text-xs h-7 px-2" onClick={() => setRejectingId(rejectingId === claim.id ? null : claim.id)}>
                              ✗
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {pendingClaims.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No pending claims.</td></tr>
                  )}
                </tbody>
                {/* Inline rejection panel */}
                {rejectingId && (
                  <tbody>
                    <tr className="bg-destructive/5">
                      <td colSpan={7} className="px-4 py-4">
                        <p className="text-sm font-medium text-foreground mb-2">Rejection Reason</p>
                        <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Enter reason..." rows={2} className="mb-2" />
                        <p className="text-xs text-muted-foreground mb-2">💡 AI Suggested Remarks:</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {AI_REJECT_CHIPS.map(chip => (
                            <button key={chip} onClick={() => setRejectReason(chip)} className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                              {chip}
                            </button>
                          ))}
                        </div>
                        <Button size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleReject(rejectingId)}>Submit Rejection</Button>
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </>
        )}

        {tab === 'reviewed' && (
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {reviewedClaims.map(c => {
                  const e = employees.find(emp => emp.id === c.employeeId);
                  return (
                    <tr key={c.id} className="border-t border-border cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/manager/review/${c.id}`)}>
                      <td className="px-4 py-3">{c.billNo}</td>
                      <td className="px-4 py-3">{e?.name}</td>
                      <td className="px-4 py-3">{c.currency} {c.amount}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    </tr>
                  );
                })}
                {reviewedClaims.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No reviewed claims.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'team' && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {employees.filter(e => e.status === 'approved').map(e => (
              <div key={e.id} className="rounded-lg border border-border bg-card p-4">
                <p className="font-medium text-foreground">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.role} · {e.department}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={approveAllOpen}
        title="Approve All Green-Flagged Claims"
        message={`You're about to approve ${greenClaims.length} claims totaling ${company.currencySymbol}${totalGreenAmt.toLocaleString()}. Continue?`}
        confirmLabel="Confirm Approve All"
        onConfirm={handleApproveAll}
        onCancel={() => setApproveAllOpen(false)}
      />
    </SidebarLayout>
  );
};

export default ManagerDashboard;
