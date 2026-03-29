import { Company, Employee, Claim, ApprovalRules } from './types';

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Companies
export const getCompanies = (): Company[] => getItem('company_registry', []);
export const saveCompany = (c: Company) => {
  const list = getCompanies();
  list.push(c);
  setItem('company_registry', list);
};
export const findCompanyByDomain = (domain: string) =>
  getCompanies().find(c => c.domain === domain);
export const findCompanyById = (id: string) =>
  getCompanies().find(c => c.id === id);

// Employees
export const getEmployees = (): Employee[] => getItem('employees', []);
export const saveEmployee = (e: Employee) => {
  const list = getEmployees();
  list.push(e);
  setItem('employees', list);
};
export const updateEmployee = (id: string, updates: Partial<Employee>) => {
  const list = getEmployees().map(e => (e.id === id ? { ...e, ...updates } : e));
  setItem('employees', list);
};
export const deleteEmployee = (id: string) => {
  setItem('employees', getEmployees().filter(e => e.id !== id));
};
export const getEmployeesByCompany = (companyId: string) =>
  getEmployees().filter(e => e.companyId === companyId);
export const findEmployeeByEmail = (email: string) =>
  getEmployees().find(e => e.email === email);

// Pending Employees
export const getPendingEmployees = (): Employee[] => getItem('pending_employees', []);
export const savePendingEmployee = (e: Employee) => {
  const list = getPendingEmployees();
  list.push(e);
  setItem('pending_employees', list);
};
export const removePendingEmployee = (id: string) => {
  setItem('pending_employees', getPendingEmployees().filter(e => e.id !== id));
};

// Claims
export const getClaims = (): Claim[] => getItem('claims', []);
export const saveClaim = (c: Claim) => {
  const list = getClaims();
  const idx = list.findIndex(x => x.id === c.id);
  if (idx >= 0) list[idx] = c;
  else list.push(c);
  setItem('claims', list);
};
export const getClaimById = (id: string) => getClaims().find(c => c.id === id);
export const getClaimsByEmployee = (employeeId: string) =>
  getClaims().filter(c => c.employeeId === employeeId);
export const getClaimsByCompany = (companyId: string) =>
  getClaims().filter(c => c.companyId === companyId);
export const updateClaim = (id: string, updates: Partial<Claim>) => {
  const list = getClaims().map(c => (c.id === id ? { ...c, ...updates } : c));
  setItem('claims', list);
};

// Approval Rules
export const getApprovalRules = (companyId: string): ApprovalRules | null => {
  const all: ApprovalRules[] = getItem('approval_rules', []);
  return all.find(r => r.companyId === companyId) || null;
};
export const saveApprovalRules = (rules: ApprovalRules) => {
  const all: ApprovalRules[] = getItem('approval_rules', []);
  const idx = all.findIndex(r => r.companyId === rules.companyId);
  if (idx >= 0) all[idx] = rules;
  else all.push(rules);
  setItem('approval_rules', all);
};

// Session
export const setSession = (type: 'admin' | 'employee', data: any) =>
  setItem('session', { type, data });
export const getSession = () => getItem<{ type: string; data: any } | null>('session', null);
export const clearSession = () => localStorage.removeItem('session');

// UUID
export const uuid = () => crypto.randomUUID();
