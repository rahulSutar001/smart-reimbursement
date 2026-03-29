import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarLayout } from '@/components/SidebarLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { getSession, getApprovalRules, saveApprovalRules } from '@/lib/storage';
import { ApprovalRules as ARType, Company } from '@/lib/types';
import { Home, Users, Settings, ClipboardList, GripVertical, Plus, Trash2 } from 'lucide-react';

const APPROVER_ROLES = ['Manager', 'Finance', 'Director', 'CFO', 'HR'];

const ApprovalRulesPage = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [rules, setRules] = useState<ARType>({
    companyId: '',
    enabled: false,
    sequential: [{ step: 1, role: 'Manager' }],
    conditional: {
      percentageRule: { enabled: false, value: 50 },
      specificRule: { enabled: false, role: 'CFO' },
      hybridRule: { enabled: false, operator: 'AND' },
    },
  });

  useEffect(() => {
    const session = getSession();
    if (!session || session.type !== 'admin') { navigate('/admin/login'); return; }
    setCompany(session.data);
    const existing = getApprovalRules(session.data.id);
    if (existing) setRules(existing);
    else setRules(r => ({ ...r, companyId: session.data.id }));
  }, [navigate]);

  if (!company) return null;

  const sidebarItems = [
    { label: 'Overview', icon: <Home size={18} />, path: '/admin/dashboard' },
    { label: 'Employees', icon: <Users size={18} />, path: '/admin/employees' },
    { label: 'Approval Rules', icon: <Settings size={18} />, path: '/admin/approval-rules' },
    { label: 'All Expenses', icon: <ClipboardList size={18} />, path: '/admin/dashboard' },
  ];

  const addStep = () => {
    setRules(r => ({
      ...r,
      sequential: [...r.sequential, { step: r.sequential.length + 1, role: 'Manager' }],
    }));
  };

  const removeStep = (idx: number) => {
    setRules(r => ({
      ...r,
      sequential: r.sequential.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step: i + 1 })),
    }));
  };

  const updateStepRole = (idx: number, role: string) => {
    setRules(r => ({
      ...r,
      sequential: r.sequential.map((s, i) => (i === idx ? { ...s, role } : s)),
    }));
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= rules.sequential.length) return;
    setRules(r => {
      const arr = [...r.sequential];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return { ...r, sequential: arr.map((s, i) => ({ ...s, step: i + 1 })) };
    });
  };

  const handleSave = () => {
    saveApprovalRules(rules);
    toast.success('Rules saved.');
  };

  return (
    <SidebarLayout items={sidebarItems} title="Admin">
      <div className="animate-fade-in max-w-3xl">
        <h1 className="font-heading text-2xl font-bold text-foreground">Approval Flow Configuration</h1>

        <div className="mt-6 flex items-center gap-3">
          <Switch checked={rules.enabled} onCheckedChange={v => setRules(r => ({ ...r, enabled: v }))} />
          <Label className="text-sm">Enable Custom Approval Flow</Label>
        </div>

        {rules.enabled && (
          <div className="mt-6 space-y-8">
            {/* Sequential Steps */}
            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground">Define Approver Sequence</h2>
              <div className="mt-3 space-y-2">
                {rules.sequential.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveStep(i, -1)} className="text-muted-foreground hover:text-foreground text-xs">▲</button>
                      <GripVertical size={14} className="text-muted-foreground" />
                      <button onClick={() => moveStep(i, 1)} className="text-muted-foreground hover:text-foreground text-xs">▼</button>
                    </div>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{step.step}</span>
                    <select
                      className="flex-1 rounded border border-input bg-background px-3 py-1.5 text-sm"
                      value={step.role}
                      onChange={e => updateStepRole(i, e.target.value)}
                    >
                      {APPROVER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button onClick={() => removeStep(i)} className="text-muted-foreground hover:text-destructive"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-3" onClick={addStep}>
                <Plus size={14} className="mr-1" /> Add Step
              </Button>
            </section>

            {/* Conditional Rules */}
            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground">Auto-Approval Conditions</h2>
              <div className="mt-3 space-y-4">
                {/* Rule 1 — Percentage */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <Switch checked={rules.conditional.percentageRule.enabled} onCheckedChange={v => setRules(r => ({ ...r, conditional: { ...r.conditional, percentageRule: { ...r.conditional.percentageRule, enabled: v } } }))} />
                    <Label className="text-sm font-medium">Percentage Rule</Label>
                  </div>
                  {rules.conditional.percentageRule.enabled && (
                    <div className="mt-3 flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">If</span>
                      <Input type="number" className="w-20" min={0} max={100} value={rules.conditional.percentageRule.value} onChange={e => setRules(r => ({ ...r, conditional: { ...r.conditional, percentageRule: { ...r.conditional.percentageRule, value: Number(e.target.value) } } }))} />
                      <span className="text-sm text-muted-foreground">% of approvers approve → auto-approve</span>
                    </div>
                  )}
                  {rules.conditional.percentageRule.enabled && (
                    <Slider className="mt-3" min={0} max={100} step={5} value={[rules.conditional.percentageRule.value]} onValueChange={v => setRules(r => ({ ...r, conditional: { ...r.conditional, percentageRule: { ...r.conditional.percentageRule, value: v[0] } } }))} />
                  )}
                </div>

                {/* Rule 2 — Specific Approver */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <Switch checked={rules.conditional.specificRule.enabled} onCheckedChange={v => setRules(r => ({ ...r, conditional: { ...r.conditional, specificRule: { ...r.conditional.specificRule, enabled: v } } }))} />
                    <Label className="text-sm font-medium">Specific Approver Rule</Label>
                  </div>
                  {rules.conditional.specificRule.enabled && (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">If</span>
                      <select className="rounded border border-input bg-background px-3 py-1.5 text-sm" value={rules.conditional.specificRule.role} onChange={e => setRules(r => ({ ...r, conditional: { ...r.conditional, specificRule: { ...r.conditional.specificRule, role: e.target.value } } }))}>
                        {APPROVER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <span className="text-sm text-muted-foreground">approves → auto-approve entire chain</span>
                    </div>
                  )}
                </div>

                {/* Rule 3 — Hybrid */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <Switch checked={rules.conditional.hybridRule.enabled} onCheckedChange={v => setRules(r => ({ ...r, conditional: { ...r.conditional, hybridRule: { ...r.conditional.hybridRule, enabled: v } } }))} />
                    <Label className="text-sm font-medium">Hybrid Rule</Label>
                  </div>
                  {rules.conditional.hybridRule.enabled && (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Combine Rule 1</span>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1 text-sm">
                          <input type="radio" name="hybrid" checked={rules.conditional.hybridRule.operator === 'AND'} onChange={() => setRules(r => ({ ...r, conditional: { ...r.conditional, hybridRule: { ...r.conditional.hybridRule, operator: 'AND' } } }))} />
                          AND
                        </label>
                        <label className="flex items-center gap-1 text-sm">
                          <input type="radio" name="hybrid" checked={rules.conditional.hybridRule.operator === 'OR'} onChange={() => setRules(r => ({ ...r, conditional: { ...r.conditional, hybridRule: { ...r.conditional.hybridRule, operator: 'OR' } } }))} />
                          OR
                        </label>
                      </div>
                      <span className="text-sm text-muted-foreground">Rule 2</span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        <Button className="mt-8" onClick={handleSave}>Save Approval Rules</Button>
      </div>
    </SidebarLayout>
  );
};

export default ApprovalRulesPage;
