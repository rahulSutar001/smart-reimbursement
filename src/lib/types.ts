export interface Company {
  id: string;
  name: string;
  domain: string;
  country: string;
  currency: string;
  currencySymbol: string;
  adminEmail: string;
  adminName: string;
  password: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'Employee' | 'Manager' | 'Director' | 'Finance' | 'CFO';
  department: string;
  managerId: string;
  companyId: string;
  status: 'approved' | 'pending';
  password: string;
  prn: string;
  gender?: string;
  age?: number;
}

export interface ApprovalStep {
  role: string;
  approverId?: string;
  approverName?: string;
  status: 'approved' | 'rejected' | 'pending' | 'not_reached';
  comment?: string;
  timestamp?: string;
}

export interface Claim {
  id: string;
  employeeId: string;
  companyId: string;
  billNo: string;
  vendor: string;
  category: string;
  date: string;
  currency: string;
  amount: number;
  amountInBase: number;
  description: string;
  paidBy: string;
  receiptUrl: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'transferred';
  createdAt: string;
  aiFlag: 'green' | 'red';
  aiReason: string;
  approvalSteps: ApprovalStep[];
}

export interface ApprovalRules {
  companyId: string;
  enabled: boolean;
  sequential: { step: number; role: string }[];
  conditional: {
    percentageRule: { enabled: boolean; value: number };
    specificRule: { enabled: boolean; role: string };
    hybridRule: { enabled: boolean; operator: 'AND' | 'OR' };
  };
}
