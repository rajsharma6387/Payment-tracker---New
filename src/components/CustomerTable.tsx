import React from 'react';
import { CustomerPaymentRecord, UserProfile } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  isOverdue, 
  getDaysRemainingText 
} from '../utils/formatters';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  CreditCard, 
  MessageSquare,
  ArrowUpDown,
  User,
  Phone,
  Mail,
  Clock
} from 'lucide-react';

interface CustomerTableProps {
  customers: CustomerPaymentRecord[];
  currentUser: UserProfile;
  onQuickToggleStatus: (customer: CustomerPaymentRecord) => void;
  onOpenQuickUpdate: (customer: CustomerPaymentRecord) => void;
  onOpenEditModal: (customer: CustomerPaymentRecord) => void;
  onDeleteCustomer: (id: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (column: any) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  currentUser,
  onQuickToggleStatus,
  onOpenQuickUpdate,
  onOpenEditModal,
  onDeleteCustomer,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const isManager = currentUser.role === 'manager';

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'AMC':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            AMC
          </span>
        );
      case 'Solution':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Solution
          </span>
        );
      case 'Outstanding':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Outstanding
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
            {category}
          </span>
        );
    }
  };

  const renderSortHeader = (label: string, field: any, align: 'left' | 'right' | 'center' = 'left') => {
    const isActive = sortBy === field;
    return (
      <th
        onClick={() => onSortChange(field)}
        className={`py-3.5 px-4 font-semibold uppercase text-[11px] tracking-wider cursor-pointer hover:text-slate-900 transition-colors select-none text-${align}`}
      >
        <div className={`inline-flex items-center space-x-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : ''}`}>
          <span>{label}</span>
          <ArrowUpDown className={`w-3 h-3 ${isActive ? 'text-indigo-600 font-bold' : 'text-slate-400'}`} />
        </div>
      </th>
    );
  };

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No customer records found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          {isManager
            ? 'No collections match the current filter or search criteria. Try clearing filters or adding a customer.'
            : 'You have no assigned customer records matching these filters. Use "+ Add Customer" above to log a new collection.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              {renderSortHeader('Customer Name', 'customerName')}
              <th className="py-3.5 px-3 font-semibold uppercase text-[11px] tracking-wider">Category</th>
              {renderSortHeader('Total Amount', 'totalAmount', 'right')}
              <th className="py-3.5 px-3 text-right font-semibold uppercase text-[11px] tracking-wider">Received</th>
              {renderSortHeader('Balance', 'balanceAmount', 'right')}
              {renderSortHeader('Expected Date', 'expectedDate', 'center')}
              <th className="py-3.5 px-3 text-center font-semibold uppercase text-[11px] tracking-wider">Status Toggle</th>
              {isManager && (
                <th className="py-3.5 px-3 font-semibold uppercase text-[11px] tracking-wider">Assigned Rep</th>
              )}
              <th className="py-3.5 px-4 font-semibold uppercase text-[11px] tracking-wider">Remarks / Notes</th>
              <th className="py-3.5 px-4 text-right font-semibold uppercase text-[11px] tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {customers.map((c) => {
              const overdue = isOverdue(c.expectedDate, c.receiptReceived, c.balanceAmount);
              const dueInfo = getDaysRemainingText(c.expectedDate, c.receiptReceived, c.balanceAmount);
              const isSettled = c.receiptReceived && c.balanceAmount === 0;
              const isPartial = c.receivedAmount > 0 && c.balanceAmount > 0;

              return (
                <tr
                  key={c.id}
                  className={`hover:bg-slate-50/90 transition-colors ${
                    overdue ? 'bg-rose-50/20' : isSettled ? 'bg-emerald-50/15' : ''
                  }`}
                >
                  {/* Customer Name & Contact */}
                  <td className="py-3 px-4 max-w-[200px]">
                    <div className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                      {c.customerName}
                    </div>
                    {(c.clientContact || c.clientEmail) && (
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                        {c.clientContact && (
                          <span className="flex items-center space-x-0.5 truncate">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{c.clientContact}</span>
                          </span>
                        )}
                        {c.clientEmail && (
                          <span className="hidden md:flex items-center space-x-0.5 truncate">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{c.clientEmail}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Category Type */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getCategoryBadge(c.category)}
                  </td>

                  {/* Total Payment Amount */}
                  <td className="py-3 px-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                    {formatCurrency(c.totalAmount)}
                  </td>

                  {/* Received Amount */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="font-bold text-emerald-600">
                      {formatCurrency(c.receivedAmount)}
                    </div>
                    {c.totalAmount > 0 && (
                      <div className="text-[10px] text-slate-400">
                        {Math.round((c.receivedAmount / c.totalAmount) * 100)}% paid
                      </div>
                    )}
                  </td>

                  {/* Balance Amount (Total - Received) */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div
                      className={`font-bold ${
                        c.balanceAmount === 0
                          ? 'text-slate-400'
                          : overdue
                          ? 'text-rose-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {formatCurrency(c.balanceAmount)}
                    </div>
                    {c.balanceAmount === 0 ? (
                      <span className="text-[10px] text-emerald-600 font-medium">Cleared</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Pending</span>
                    )}
                  </td>

                  {/* Expected Payment Date */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="font-medium text-slate-800 text-xs">
                      {formatDate(c.expectedDate)}
                    </div>
                    <div className="mt-0.5">
                      <span
                        className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          isSettled
                            ? 'bg-emerald-100 text-emerald-700'
                            : overdue
                            ? 'bg-rose-100 text-rose-700 font-semibold'
                            : dueInfo.isUrgent
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {dueInfo.text}
                      </span>
                    </div>
                  </td>

                  {/* Payment Status / Flag (Interactive Quick Toggle) */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <button
                      id={`btn-toggle-status-${c.id}`}
                      onClick={() => onQuickToggleStatus(c)}
                      title={`Click to switch to ${c.receiptReceived ? 'Not Received' : 'Receipt Received'}`}
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs border ${
                        c.receiptReceived
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : isPartial
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {c.receiptReceived ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Receipt Received</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>{isPartial ? 'Partially Recv' : 'Not Received'}</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Manager View: Assigned Rep */}
                  {isManager && (
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-800 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[110px]">{c.assignedMemberName}</span>
                      </div>
                    </td>
                  )}

                  {/* Remarks / Notes */}
                  <td className="py-3 px-4 max-w-[220px]">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed" title={c.remarks}>
                      {c.remarks || <span className="text-slate-300 italic">No notes</span>}
                    </p>
                  </td>

                  {/* Actions Column */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1">
                      {/* Quick Payment / Amount Update */}
                      <button
                        id={`btn-quick-update-${c.id}`}
                        onClick={() => onOpenQuickUpdate(c)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Update Received Amount & Remarks"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>

                      {/* Full Edit Modal */}
                      <button
                        id={`btn-edit-customer-${c.id}`}
                        onClick={() => onOpenEditModal(c)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit full client record"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete (Accessible to manager or owner) */}
                      {(isManager || c.assignedMemberId === currentUser.id) && (
                        <button
                          id={`btn-delete-customer-${c.id}`}
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove "${c.customerName}"?`)) {
                              onDeleteCustomer(c.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete customer record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
