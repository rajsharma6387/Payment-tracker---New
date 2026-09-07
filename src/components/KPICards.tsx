import React from 'react';
import { CustomerPaymentRecord, UserProfile } from '../types';
import { formatCurrency, isOverdue } from '../utils/formatters';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Wallet,
  Users,
  Target
} from 'lucide-react';

interface KPICardsProps {
  currentUser: UserProfile;
  records: CustomerPaymentRecord[]; // already filtered according to RBAC or active filters
  allAssignedRecords?: CustomerPaymentRecord[]; // all records for this rep or all records for manager
}

export const KPICards: React.FC<KPICardsProps> = ({
  currentUser,
  records,
}) => {
  const isManager = currentUser.role === 'manager';

  // Calculations
  const totalExpected = records.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalReceived = records.reduce((acc, curr) => acc + curr.receivedAmount, 0);
  const totalBalance = records.reduce((acc, curr) => acc + curr.balanceAmount, 0);

  const completionRate = totalExpected > 0 ? Math.round((totalReceived / totalExpected) * 100) : 0;
  
  const overdueRecords = records.filter(r => isOverdue(r.expectedDate, r.receiptReceived, r.balanceAmount));
  const overdueAmount = overdueRecords.reduce((acc, curr) => acc + curr.balanceAmount, 0);

  const fullyPaidCount = records.filter(r => r.receiptReceived && r.balanceAmount === 0).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Expected Amount */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isManager ? 'Grand Total Expected' : 'My Total Expected'}
          </span>
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalExpected)}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
            <span>From {records.length} customer contracts</span>
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />
      </div>

      {/* 2. Received Total */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isManager ? 'Grand Total Received' : 'My Total Received'}
          </span>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-emerald-700 tracking-tight">
            {formatCurrency(totalReceived)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium text-emerald-600">{completionRate}% recovered</span>
            <span>{fullyPaidCount} of {records.length} cleared</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(completionRate, 100)}%` }}
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
      </div>

      {/* 3. Total Balance / Pending */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isManager ? 'Grand Balance Pending' : 'My Balance Pending'}
          </span>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-amber-600 tracking-tight">
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {100 - completionRate}% remaining to be collected
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
      </div>

      {/* 4. Overdue / Risk Alert Card */}
      <div className={`rounded-xl p-5 border shadow-xs relative overflow-hidden ${
        overdueRecords.length > 0 
          ? 'bg-rose-50/50 border-rose-200' 
          : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center space-x-1">
            <span>Overdue Amount</span>
          </span>
          <div className={`p-2 rounded-lg ${
            overdueRecords.length > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
          }`}>
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className={`text-2xl font-bold tracking-tight ${
            overdueRecords.length > 0 ? 'text-rose-700' : 'text-slate-800'
          }`}>
            {formatCurrency(overdueAmount)}
          </div>
          <p className="text-xs text-rose-600 mt-1 font-medium">
            {overdueRecords.length > 0 
              ? `${overdueRecords.length} client invoice(s) past expected date` 
              : 'All collections on schedule'}
          </p>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${
          overdueRecords.length > 0 ? 'bg-rose-500' : 'bg-slate-300'
        }`} />
      </div>
    </div>
  );
};
