import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarLayout } from '@/components/SidebarLayout';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { getSession, getEmployeesByCompany, getClaimsByCompany, getApprovalRules } from '@/lib/storage';
import { Users, Clock, DollarSign, Settings, Home, ClipboardList, LogOut } from 'lucide-react';
import { Company, Claim } from '@/lib/types';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session || session.type !== 'admin') { navigate('/admin/login'); return; }
    setCompany(session.data);
  }, [navigate]);

  if (!company) return null;

  const employees = getEmployeesByCompany(company.id);
  const claims = getClaimsByCompany(company.id);
  const pendingClaims = claims.filter(c => c.status === 'pending');
  const rules = getApprovalRules(company.id);
  const now = new Date();
  const thisMonth = claims.filter(c => c.status === 'approved' && new Date(c.createdAt).getMonth() === now.getMonth());
  const totalReimbursed = thisMonth.reduce((s, c) => s + c.amountInBase, 0);

  const recentActivity = claims.slice(-10).reverse();

  const sidebarItems = [
    { label: 'Overview', icon: <Home size={18} />, path: '/admin/dashboard' },
    { label: 'Employees', icon: <Users size={18} />, path: '/admin/employees' },
    { label: 'Approval Rules', icon: <Settings size={18} />, path: '/admin/approval-rules' },
    { label: 'All Expenses', icon: <ClipboardList size={18} />, path: '/admin/dashboard' },
  ];

  return (
    <SidebarLayout items={sidebarItems} title="Admin">
      <div className="animate-fade-in">
        <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{company.name}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Employees" value={employees.filter(e => e.status === 'approved').length} color="primary" icon={<Users size={20} />} />
          <StatCard label="Pending Approvals" value={pendingClaims.length} color="warning" icon={<Clock size={20} />} />
          <StatCard label={`Reimbursed This Month`} value={`${company.currencySymbol}${totalReimbursed.toLocaleString()}`} color="success" icon={<DollarSign size={20} />} />
          <StatCard label="Approval Rules Active" value={rules?.enabled ? rules.sequential.length : 0} color="primary" icon={<Settings size={20} />} />
        </div>

        <div className="mt-8">
          <h2 className="font-heading text-lg font-semibold text-foreground">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {recentActivity.map((claim, i) => {
                const emp = employees.find(e => e.id === claim.employeeId);
                return (
                  <div key={claim.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 animate-stagger-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <div>
                      <p className="text-sm font-medium text-foreground">{emp?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(claim.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{claim.currency} {claim.amount}</span>
                      <StatusBadge status={claim.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default AdminDashboard;
