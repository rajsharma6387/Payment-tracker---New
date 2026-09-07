import { CustomerPaymentRecord, UserProfile } from '../types';
import { INITIAL_CUSTOMERS, INITIAL_USERS } from '../data/mockData';

const STORAGE_CUSTOMERS_KEY = 'fincollect_customers_v1';
const STORAGE_USERS_KEY = 'fincollect_users_v1';
const STORAGE_CURRENT_USER_KEY = 'fincollect_active_user_v1';

export const storageService = {
  getUsers(): UserProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_USERS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback to initial
    }
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  },

  getActiveUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (data) {
        const user = JSON.parse(data);
        const allUsers = this.getUsers();
        const matched = allUsers.find(u => u.id === user.id);
        if (matched) return matched;
      }
    } catch {
      // fallback
    }
    // Default to manager for first landing so they can see full master dashboard
    const defaultUser = INITIAL_USERS[0];
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  },

  setActiveUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
  },

  getCustomers(): CustomerPaymentRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_CUSTOMERS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
    return INITIAL_CUSTOMERS;
  },

  saveCustomers(customers: CustomerPaymentRecord[]): void {
    localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(customers));
  },

  addCustomer(customer: Omit<CustomerPaymentRecord, 'id' | 'balanceAmount' | 'createdAt' | 'updatedAt'>): CustomerPaymentRecord {
    const customers = this.getCustomers();
    const balance = Math.max(0, Number(customer.totalAmount) - Number(customer.receivedAmount || 0));
    const now = new Date().toISOString();
    const newRecord: CustomerPaymentRecord = {
      ...customer,
      id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      totalAmount: Number(customer.totalAmount),
      receivedAmount: Number(customer.receivedAmount || 0),
      balanceAmount: balance,
      createdAt: now,
      updatedAt: now,
    };
    customers.unshift(newRecord);
    this.saveCustomers(customers);
    return newRecord;
  },

  updateCustomer(id: string, updates: Partial<CustomerPaymentRecord>): CustomerPaymentRecord | null {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return null;

    const existing = customers[index];
    const total = updates.totalAmount !== undefined ? Number(updates.totalAmount) : existing.totalAmount;
    let received = updates.receivedAmount !== undefined ? Number(updates.receivedAmount) : existing.receivedAmount;
    
    // Auto calculate if receiptReceived toggled
    let receiptStatus = updates.receiptReceived !== undefined ? updates.receiptReceived : existing.receiptReceived;
    if (updates.receiptReceived === true && updates.receivedAmount === undefined && received < total) {
      received = total;
    } else if (updates.receiptReceived === false && updates.receivedAmount === undefined && received >= total && total > 0) {
      // Keep partial or if exact match, user might want to adjust
    }

    const balance = Math.max(0, total - received);

    const updated: CustomerPaymentRecord = {
      ...existing,
      ...updates,
      totalAmount: total,
      receivedAmount: received,
      receiptReceived: receiptStatus,
      balanceAmount: balance,
      updatedAt: new Date().toISOString(),
    };

    customers[index] = updated;
    this.saveCustomers(customers);
    return updated;
  },

  deleteCustomer(id: string): boolean {
    const customers = this.getCustomers();
    const filtered = customers.filter(c => c.id !== id);
    this.saveCustomers(filtered);
    return true;
  },

  resetToDemo(): { users: UserProfile[]; customers: CustomerPaymentRecord[] } {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
    return {
      users: INITIAL_USERS,
      customers: INITIAL_CUSTOMERS,
    };
  },

  exportToCSV(customers: CustomerPaymentRecord[]): void {
    const headers = [
      'Customer Name',
      'Category',
      'Total Amount',
      'Received Amount',
      'Balance Amount',
      'Status',
      'Expected Date',
      'Assigned Member',
      'Remarks',
      'Contact',
    ];

    const rows = customers.map(c => [
      `"${(c.customerName || '').replace(/"/g, '""')}"`,
      `"${c.category}"`,
      c.totalAmount,
      c.receivedAmount,
      c.balanceAmount,
      c.receiptReceived ? 'Receipt Received' : 'Not Received',
      c.expectedDate,
      `"${(c.assignedMemberName || '').replace(/"/g, '""')}"`,
      `"${(c.remarks || '').replace(/"/g, '""')}"`,
      `"${(c.clientContact || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payment_collection_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
