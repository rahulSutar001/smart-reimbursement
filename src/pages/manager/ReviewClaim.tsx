import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { ApprovalTimeline } from '@/components/ApprovalTimeline';
import { toast } from 'sonner';
import { getClaimById, getSession, updateClaim, getEmployees } from '@/lib/storage';
import { Claim, Employee } from '@/lib/types';

const AI_REJECT_CHIPS = [
  'Receipt image is unclear or missing',
  'Amount exceeds policy limit for this category',
  'Duplicate submission detected',
];

const ReviewClaim = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [emp, setEmp] = useState<Employee | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    const session = getSession();
    if (!session) { navigate('/employee/login'); return; }
    setEmp(session.data);
    if (id) setClaim(getClaimById(id) || null);
  }, [id, navigate]);

  if (!claim) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Claim not found.</div>;

  const claimEmployee = getEmployees().find(e => e.id === claim.employeeId);

  const handleApprove = () => {
    const steps = claim.approvalSteps.map((s, i) =>
      i === 0 ? { ...s, status: 'approved' as const, approverName: emp?.name, comment: comment || 'Approved', timestamp: new Date().toLocaleString() } : s
    );
    updateClaim(claim.id, { status: 'approved', approvalSteps: steps });
    toast.success('Claim approved.');
    navigate('/manager/dashboard');
  };

  const handleReject = () => {
    const steps = claim.approvalSteps.map((s, i) =>
      i === 0 ? { ...s, status: 'rejected' as const, approverName: emp?.name, comment: reason, timestamp: new Date().toLocaleString() } : s
    );
    updateClaim(claim.id, { status: 'rejected', approvalSteps: steps });
    toast.success('Claim rejected.');
    navigate('/manager/dashboard');
  };

  const fields = [
    ['Requested By', claimEmployee?.name || 'Unknown'],
    ['Bill Number', claim.billNo],
    ['Vendor', claim.vendor],
    ['Category', claim.category],
    ['Date', claim.date],
    ['Currency', claim.currency],
    ['Amount', String(claim.amount)],
    ['Description', claim.description],
    ['Paid By', claim.paidBy],
    ['Receipt', claim.receiptUrl || 'N/A'],
  ];

  return (
    <div className="flex min-h-screen items-start justify-center bg-background px-4 py-8">
      <div className="w-full max-w-[700px] animate-fade-in rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
        <button onClick={() => navigate('/manager/dashboard')} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold text-foreground">Review Claim #{claim.billNo}</h1>
          <StatusBadge status={claim.status} />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3 space-y-3">
            {fields.map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{val}</p>
              </div>
            ))}
          </div>

          <div className="md:col-span-2">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-3">Approval Timeline</h3>
            <ApprovalTimeline steps={claim.approvalSteps} />
          </div>
        </div>

        {claim.status === 'pending' && (
          <div className="mt-6 space-y-4 border-t border-border pt-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Add Comment (optional)</p>
              <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Optional comment..." rows={2} />
            </div>
            <div className="flex gap-2">
              <Button className="bg-success text-success-foreground hover:bg-success/90" onClick={handleApprove}>✓ Approve</Button>
              <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => setShowReject(!showReject)}>✗ Reject</Button>
            </div>

            {showReject && (
              <div className="rounded-lg bg-destructive/5 p-4 space-y-2">
                <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Rejection reason..." rows={2} />
                <p className="text-xs text-muted-foreground">💡 AI Suggested Remarks:</p>
                <div className="flex flex-wrap gap-2">
                  {AI_REJECT_CHIPS.map(chip => (
                    <button key={chip} onClick={() => setReason(chip)} className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors">
                      {chip}
                    </button>
                  ))}
                </div>
                <Button size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90 mt-2" onClick={handleReject}>Submit Rejection</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewClaim;
