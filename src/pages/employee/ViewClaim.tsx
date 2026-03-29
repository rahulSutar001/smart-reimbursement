import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { ApprovalTimeline } from '@/components/ApprovalTimeline';
import { getClaimById, getSession } from '@/lib/storage';
import { Claim } from '@/lib/types';

const ViewClaim = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [claim, setClaim] = useState<Claim | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) { navigate('/employee/login'); return; }
    if (id) setClaim(getClaimById(id) || null);
  }, [id, navigate]);

  if (!claim) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Claim not found.</div>;

  const canEdit = claim.status === 'pending' && claim.approvalSteps.every(s => s.status === 'pending' || s.status === 'not_reached');

  const fields = [
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
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold text-foreground">Claim #{claim.billNo}</h1>
          <StatusBadge status={claim.status} />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-5">
          {/* Details */}
          <div className="md:col-span-3 space-y-3">
            {fields.map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{val}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="md:col-span-2">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-3">Approval Timeline</h3>
            <ApprovalTimeline steps={claim.approvalSteps} />
          </div>
        </div>

        {canEdit && (
          <Button className="mt-6" onClick={() => navigate(`/employee/new-claim?edit=true&id=${claim.id}`)}>
            <Pencil size={16} className="mr-1" /> Edit Claim
          </Button>
        )}
      </div>
    </div>
  );
};

export default ViewClaim;
