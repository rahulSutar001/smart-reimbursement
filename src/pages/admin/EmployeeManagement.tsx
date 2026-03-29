import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarLayout } from '@/components/SidebarLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  getSession, getEmployeesByCompany, saveEmployee, updateEmployee, deleteEmployee,
  getPendingEmployees, removePendingEmployee, uuid,
} from '@/lib/storage';
import { Employee, Company } from '@/lib/types';
import { Home, Users, Settings, ClipboardList, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';

const ROLES = ['Employee', 'Manager', 'Director', 'Finance', 'CFO'] as const;

const EmployeeManagement = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verified, setVerified] = useState<Set<string>>(new Set());
  const [refresh, setRefresh] = useState(0);
  const [newEmp, setNewEmp] = useState({ name: '', email: '', role: 'Employee' as Employee['role'], department: '', managerId: '', prn: '' });

  useEffect(() => {
    const session = getSession();
    if (!session || session.type !== 'admin') { navigate('/admin/login'); return; }
    setCompany(session.data);
  }, [navigate]);

  if (!company) return null;

  const employees = getEmployeesByCompany(company.id).filter(e => e.status === 'approved');
  const pending = getPendingEmployees().filter(e => e.companyId === company.id);
  const managers = employees.filter(e => ['Manager', 'Director', 'CFO'].includes(e.role));

  const sidebarItems = [
    { label: 'Overview', icon: <Home size={18} />, path: '/admin/dashboard' },
    { label: 'Employees', icon: <Users size={18} />, path: '/admin/employees' },
    { label: 'Approval Rules', icon: <Settings size={18} />, path: '/admin/approval-rules' },
    { label: 'All Expenses', icon: <ClipboardList size={18} />, path: '/admin/dashboard' },
  ];

  const handleAdd = () => {
    if (!newEmp.name || !newEmp.email) { toast.error('Name and email required'); return; }
    saveEmployee({
      id: uuid(), ...newEmp, companyId: company.id, status: 'approved', password: 'default123',
    });
    setDrawerOpen(false);
    setNewEmp({ name: '', email: '', role: 'Employee', department: '', managerId: '', prn: '' });
    setRefresh(r => r + 1);
    toast.success('Employee added.');
  };

  const handleApprove = (emp: Employee) => {
    setVerifying(emp.id);
    setTimeout(() => {
      saveEmployee({ ...emp, status: 'approved' });
      removePendingEmployee(emp.id);
      setVerifying(null);
      setVerified(v => new Set(v).add(emp.id));
      setRefresh(r => r + 1);
      setTimeout(() => setVerified(v => { const n = new Set(v); n.delete(emp.id); return n; }), 2000);
    }, 1000);
  };

  const handleReject = (id: string) => {
    removePendingEmployee(id);
    setRefresh(r => r + 1);
    toast.success('Employee rejected.');
  };

  const handleRoleChange = (id: string, role: Employee['role']) => {
    updateEmployee(id, { role });
    setRefresh(r => r + 1);
  };

  const handleManagerChange = (id: string, managerId: string) => {
    updateEmployee(id, { managerId });
    setRefresh(r => r + 1);
  };

  return (
    <SidebarLayout items={sidebarItems} title="Admin">
      <div className="animate-fade-in" key={refresh}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">Team Members</h1>
          <Button onClick={() => setDrawerOpen(true)}>Add Employee</Button>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Manager</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Department</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => (
                <tr key={emp.id} className="border-t border-border animate-stagger-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <td className="px-4 py-3 font-medium text-foreground">{emp.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.email}</td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded border border-input bg-background px-2 py-1 text-xs"
                      value={emp.role}
                      onChange={e => handleRoleChange(emp.id, e.target.value as Employee['role'])}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <select
                      className="rounded border border-input bg-background px-2 py-1 text-xs"
                      value={emp.managerId}
                      onChange={e => handleManagerChange(emp.id, e.target.value)}
                    >
                      <option value="">None</option>
                      {managers.filter(m => m.id !== emp.id).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{emp.department}</td>
                  <td className="px-4 py-3"><StatusBadge status="active" /></td>
                  <td className="px-4 py-3 flex gap-2">
                    <button className="text-muted-foreground hover:text-foreground"><Pencil size={15} /></button>
                    <button className="text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(emp.id)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No employees yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pending Sign-ups */}
        {pending.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-lg font-semibold text-foreground">Pending Sign-Up Requests</h2>
            <div className="mt-3 space-y-2">
              {pending.map(emp => (
                <div key={emp.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-4">
                  <div>
                    <p className="font-medium text-foreground">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.email} · {emp.role} · {emp.department}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {verifying === emp.id && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Loader2 size={14} className="animate-spin" /> Verifying...</span>}
                    {verified.has(emp.id) && <span className="text-xs text-success">✓ AI Verified — Records Match</span>}
                    {!verifying && !verified.has(emp.id) && (
                      <>
                        <Button size="sm" variant="outline" className="text-success border-success hover:bg-success/10" onClick={() => handleApprove(emp)}>
                          <Check size={14} className="mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleReject(emp.id)}>
                          <X size={14} className="mr-1" /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Employee Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-card shadow-lg animate-fade-in overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="font-heading text-lg font-semibold">Add Employee</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="space-y-4 p-4">
              <div><Label>Full Name</Label><Input value={newEmp.name} onChange={e => setNewEmp(n => ({ ...n, name: e.target.value }))} /></div>
              <div><Label>Email</Label><Input type="email" value={newEmp.email} onChange={e => setNewEmp(n => ({ ...n, email: e.target.value }))} /></div>
              <div>
                <Label>Role</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newEmp.role} onChange={e => setNewEmp(n => ({ ...n, role: e.target.value as Employee['role'] }))}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div><Label>Department</Label><Input value={newEmp.department} onChange={e => setNewEmp(n => ({ ...n, department: e.target.value }))} /></div>
              <div>
                <Label>Reports To / Manager</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newEmp.managerId} onChange={e => setNewEmp(n => ({ ...n, managerId: e.target.value }))}>
                  <option value="">Select...</option>
                  {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div><Label>Employee ID / PRN</Label><Input value={newEmp.prn} onChange={e => setNewEmp(n => ({ ...n, prn: e.target.value }))} /></div>
              <Button className="w-full" onClick={handleAdd}>Add Employee</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Employee"
        message="Are you sure? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => { if (deleteId) { deleteEmployee(deleteId); setDeleteId(null); setRefresh(r => r + 1); toast.success('Employee deleted.'); } }}
        onCancel={() => setDeleteId(null)}
      />
    </SidebarLayout>
  );
};

export default EmployeeManagement;
