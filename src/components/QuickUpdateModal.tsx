import React, { useState, useEffect } from 'react';
import { CustomerPaymentRecord } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface QuickUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerPaymentRecord | null;
  onSaveQuickUpdate: (id: string, updates: Partial<CustomerPaymentRecord>) => void;
}

export const QuickUpdateModal: React.FC<QuickUpdateModalProps> = ({
  isOpen,
  onClose,
  customer,
  onSaveQuickUpdate,
}) => {
  const [receiptReceived, setReceiptReceived] = useState(false);
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (customer) {
      setReceiptReceived(customer.receiptReceived);
      setReceivedAmount(customer.receivedAmount);
      setRemarks(customer.remarks || '');
    }
  }, [customer, isOpen]);

  if (!isOpen || !customer) return null;

  const total = customer.totalAmount;
  const balance = Math.max(0, total - receivedAmount);

  const handleSetFullPayment = () => {
    setReceivedAmount(total);
    setReceiptReceived(true);
    if (!remarks.includes('Full payment cleared')) {
      setRemarks(prev => prev ? `${prev} | Full payment cleared on ${new Date().toLocaleDateString()}` : `Full payment cleared on ${new Date().toLocaleDateString()}`);
    }
  };

  const handleSetZero = () => {
    setReceivedAmount(0);
    setReceiptReceived(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveQuickUpdate(customer.id, {
      receiptReceived,
      receivedAmount: Number(receivedAmount),
      balanceAmount: balance,
      remarks: remarks.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Quick Payment & Status Update</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[260px]">{customer.customerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Summary Overview */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 text-[11px]">Total Billed:</span>
              <div className="font-bold text-slate-800 text-sm">{formatCurrency(total)}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Category:</span>
              <div className="font-semibold text-indigo-600">{customer.category}</div>
            </div>
          </div>

          {/* Status Toggle Button */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Payment Status Flag
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setReceiptReceived(true);
                  if (receivedAmount === 0) setReceivedAmount(total);
                }}
                className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  receiptReceived
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Receipt Received</span>
              </button>

              <button
                type="button"
                onClick={() => setReceiptReceived(false)}
                className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  !receiptReceived
                    ? 'bg-rose-50 text-rose-800 border-rose-400 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Not Received</span>
              </button>
            </div>
          </div>

          {/* Received Amount & Live Balance */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Received Amount (₹)
              </label>
              <div className="space-x-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={handleSetFullPayment}
                  className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium hover:bg-emerald-200 transition-colors"
                >
                  Mark 100% Paid
                </button>
                <button
                  type="button"
                  onClick={handleSetZero}
                  className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <input
              type="number"
              min="0"
              max={total}
              step="100"
              value={receivedAmount}
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                setReceivedAmount(val);
                if (val >= total && total > 0) {
                  setReceiptReceived(true);
                }
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 font-semibold"
            />

            {/* Live Calculated Balance */}
            <div className="mt-2 flex items-center justify-between bg-amber-50/60 p-2.5 rounded-lg border border-amber-200 text-xs">
              <span className="text-amber-800 font-medium">Calculated Balance Due:</span>
              <span className="font-bold text-amber-900 text-sm">{formatCurrency(balance)}</span>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Remarks / Follow-up Note</span>
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Customer promised cheque clearance via RTGS..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm cursor-pointer"
            >
              Save Update
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
