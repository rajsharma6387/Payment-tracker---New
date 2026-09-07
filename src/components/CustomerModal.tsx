import React, { useState, useEffect } from 'react';
import { CustomerPaymentRecord, UserProfile, CategoryType } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  X, 
  Building, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MessageSquare,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  initialData?: CustomerPaymentRecord | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentUser,
  allUsers,
  initialData,
}) => {
  const isManager = currentUser.role === 'manager';
  const teamMembers = allUsers.filter(u => u.role === 'team_member');

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [category, setCategory] = useState<CategoryType>('AMC');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [expectedDate, setExpectedDate] = useState('');
  const [receiptReceived, setReceiptReceived] = useState(false);
  const [receivedAmount, setReceivedAmount] = useState<number | ''>('');
  const [remarks, setRemarks] = useState('');
  const [assignedMemberId, setAssignedMemberId] = useState(currentUser.id);
  const [clientContact, setClientContact] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setCustomerName(initialData.customerName);
      setCategory(initialData.category);
      setTotalAmount(initialData.totalAmount);
      setExpectedDate(initialData.expectedDate);
      setReceiptReceived(initialData.receiptReceived);
      setReceivedAmount(initialData.receivedAmount);
      setRemarks(initialData.remarks || '');
      setAssignedMemberId(initialData.assignedMemberId);
      setClientContact(initialData.clientContact || '');
      setClientEmail(initialData.clientEmail || '');
    } else {
      // Defaults for new entry
      setCustomerName('');
      setCategory('AMC');
      setTotalAmount('');
      // Default expected date 10 days in future
      const d = new Date();
      d.setDate(d.getDate() + 10);
      setExpectedDate(d.toISOString().slice(0, 10));
      setReceiptReceived(false);
      setReceivedAmount(0);
      setRemarks('');
      setAssignedMemberId(currentUser.role === 'team_member' ? currentUser.id : (teamMembers[0]?.id || currentUser.id));
      setClientContact('');
      setClientEmail('');
    }
    setFormErrors({});
  }, [initialData, isOpen, currentUser]);

  if (!isOpen) return null;

  // Auto-calculation of balance
  const numTotal = Number(totalAmount) || 0;
  const numReceived = Number(receivedAmount) || 0;
  const balance = Math.max(0, numTotal - numReceived);

  // When Receipt Received toggled to true, option to auto-fill received = total
  const handleToggleReceipt = (checked: boolean) => {
    setReceiptReceived(checked);
    if (checked && numTotal > 0 && numReceived === 0) {
      setReceivedAmount(numTotal);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!customerName.trim()) {
      errors.customerName = 'Customer Name is required';
    }
    if (!totalAmount || Number(totalAmount) <= 0) {
      errors.totalAmount = 'Please enter a valid total payment amount';
    }
    if (!expectedDate) {
      errors.expectedDate = 'Expected Payment Date is required';
    }
    if (Number(receivedAmount) < 0) {
      errors.receivedAmount = 'Received amount cannot be negative';
    }
    if (Number(receivedAmount) > numTotal) {
      errors.receivedAmount = 'Received amount cannot exceed total amount';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const assignedUser = allUsers.find(u => u.id === assignedMemberId) || currentUser;

    onSave({
      ...(initialData ? { id: initialData.id } : {}),
      customerName: customerName.trim(),
      category,
      totalAmount: numTotal,
      expectedDate,
      receiptReceived,
      receivedAmount: numReceived,
      balanceAmount: balance,
      remarks: remarks.trim(),
      assignedMemberId: assignedUser.id,
      assignedMemberName: assignedUser.name,
      clientContact: clientContact.trim(),
      clientEmail: clientEmail.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-600">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? 'Edit Customer Collection' : 'Add New Customer Record'}
              </h3>
              <p className="text-xs text-slate-400">
                {initialData ? 'Update contract details, payments & remarks' : 'Register expected payment & assign to team portfolio'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Row 1: Customer Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer / Enterprise Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Acme Industries Ltd"
                className={`w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 ${
                  formErrors.customerName ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {formErrors.customerName && (
                <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Type *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900"
              >
                <option value="AMC">AMC</option>
                <option value="Solution">Solution</option>
                <option value="Outstanding">Outstanding</option>
              </select>
            </div>
          </div>

          {/* Row 2: Financial Fields (Total Amount, Received Amount, Calculated Balance) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Payment Amount (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 150000"
                className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 ${
                  formErrors.totalAmount ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {formErrors.totalAmount && (
                <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.totalAmount}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Received Amount (₹)
                </label>
                {numTotal > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setReceivedAmount(numTotal);
                      setReceiptReceived(true);
                    }}
                    className="text-[10px] text-indigo-600 hover:underline"
                  >
                    Match Total
                  </button>
                )}
              </div>
              <input
                type="number"
                min="0"
                max={numTotal || undefined}
                step="100"
                value={receivedAmount}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Number(e.target.value);
                  setReceivedAmount(val);
                  if (Number(val) >= numTotal && numTotal > 0) {
                    setReceiptReceived(true);
                  }
                }}
                placeholder="0"
                className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold text-emerald-700 ${
                  formErrors.receivedAmount ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {formErrors.receivedAmount && (
                <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.receivedAmount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Balance Amount (Auto)
              </label>
              <div className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-200/70 border border-slate-300 rounded-lg font-bold text-amber-800">
                {formatCurrency(balance)}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Total - Received</p>
            </div>
          </div>

          {/* Row 3: Expected Date & Payment Status Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Expected Payment Date *</span>
              </label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className={`w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 ${
                  formErrors.expectedDate ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {formErrors.expectedDate && (
                <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.expectedDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Status / Flag
              </label>
              <div 
                onClick={() => handleToggleReceipt(!receiptReceived)}
                className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  receiptReceived 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                    : 'bg-slate-50 border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={receiptReceived}
                    onChange={(e) => handleToggleReceipt(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold">
                    {receiptReceived ? 'Receipt Received' : 'Not Received'}
                  </span>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  receiptReceived ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'
                }`}>
                  {receiptReceived ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Row 4: Assigned Team Member (RBAC Control) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Assigned Team Member</span>
            </label>
            {isManager ? (
              <select
                value={assignedMemberId}
                onChange={(e) => setAssignedMemberId(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-purple-50/50 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-900"
              >
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.department || 'Team Member'})
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium flex items-center justify-between">
                <span>{currentUser.name}</span>
                <span className="text-[10px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                  Locked to your portfolio
                </span>
              </div>
            )}
          </div>

          {/* Row 5: Contact Details (Optional helper fields) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Client Phone / Contact</span>
              </label>
              <input
                type="text"
                value={clientContact}
                onChange={(e) => setClientContact(e.target.value)}
                placeholder="+91 98XXX XXXXX"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Client Email Address</span>
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="accounts@clientcompany.com"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>
          </div>

          {/* Row 6: Remark / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Remarks / Notes (Follow-up history, payment promises, NEFT reference)</span>
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Spoke to CFO. Cheque promised by next Monday. NEFT ref pending."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {initialData ? 'Save Changes' : 'Create Customer Record'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
