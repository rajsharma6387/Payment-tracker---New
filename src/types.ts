export type UserRole = 'manager' | 'team_member';

export type CategoryType = 'AMC' | 'Solution' | 'Outstanding';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department?: string;
  targetMonthlyCollection: number;
}

export interface CustomerPaymentRecord {
  id: string;
  customerName: string;
  category: CategoryType;
  totalAmount: number;
  expectedDate: string; // YYYY-MM-DD
  receiptReceived: boolean; // "Receipt Received" or "Not Received"
  receivedAmount: number;
  balanceAmount: number; // Computed: totalAmount - receivedAmount
  remarks: string;
  assignedMemberId: string;
  assignedMemberName: string;
  clientContact?: string;
  clientEmail?: string;
  lastFollowupDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  searchQuery: string;
  category: 'ALL' | CategoryType;
  status: 'ALL' | 'RECEIVED' | 'NOT_RECEIVED' | 'OVERDUE' | 'PARTIAL';
  assignedMemberId: string; // 'ALL' or specific ID
  dateRange: 'ALL' | 'THIS_MONTH' | 'NEXT_30_DAYS' | 'OVERDUE' | 'CUSTOM';
  customStartDate?: string;
  customEndDate?: string;
  sortBy: 'expectedDate' | 'customerName' | 'totalAmount' | 'balanceAmount';
  sortOrder: 'asc' | 'desc';
}

export interface TeamMemberMetrics {
  memberId: string;
  memberName: string;
  avatar: string;
  clientCount: number;
  totalExpected: number;
  totalReceived: number;
  totalPending: number;
  completionRate: number; // percentage 0 - 100
}
