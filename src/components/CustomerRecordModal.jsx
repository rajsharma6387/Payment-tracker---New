import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Calendar,
  Building,
  Layers,
  FileText,
  User,
  ThumbsUp,
  Sparkles
} from 'lucide-react';
import { CATEGORIES, formatCurrency, getDisplayName, cleanAmount } from '../constants';

export default function CustomerRecordModal({
  isOpen,
  onClose,
  onSave,
  initialData = null, // null for Add, customer object for Edit
  isManager = false,
  teamProfiles = [],
  currentUserId,
  theme = 'light'
}) {
  const isEditing = Boolean(initialData);

  const [customerName, setCustomerName] = useState('');
  const [category, setCategory] = useState('AMC');
  const [expectedAmount, setExpectedAmount] = useState('');
  const [receivedAmount, setReceivedAmount] = useState('0');
  const [expectedDate, setExpectedDate] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [isReceipt, setIsReceipt] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [validationError, setValidationError] = useState(null);

  // Sync state when initialData changes or modal opens
  useEffect(() => {
    if (initialData) {
      setCustomerName(initialData.customer_name || '');
      setCategory(initialData.category || 'AMC');
      setExpectedAmount(initialData.expected_amount != null ? String(cleanAmount(initialData.expected_amount)) : '');
      setReceivedAmount(initialData.received_amount != null ? String(cleanAmount(initialData.received_amount)) : '0');
      setExpectedDate(initialData.expected_date || new Date().toISOString().slice(0, 10));
      setReceiptDate(initialData.receipt_date || '');
      setIsReceipt(Boolean(initialData.is_receipt));
      setRemarks(initialData.remarks || '');
      setAssignedTo(initialData.assigned_to || currentUserId || '');
    } else {
      setCustomerName('');
      setCategory('AMC');
      setExpectedAmount('');
      setReceivedAmount('0');
      setExpectedDate(new Date().toISOString().slice(0, 10));
      setReceiptDate('');
      setIsReceipt(false);
      setRemarks('');
      setAssignedTo(currentUserId || '');
    }
    setValidationError(null);
  }, [initialData, isOpen, currentUserId]);

  const numExpected = cleanAmount(expectedAmount);
  const numReceived = cleanAmount(receivedAmount);

  // Validation: Received Amount cannot exceed Expected Amount
  const isExceeding = numReceived > numExpected;

  // Automation handler: When Received Amount changes
  const handleReceivedAmountChange = (val) => {
    setReceivedAmount(val);
    const parsedRec = cleanAmount(val);
    const parsedExp = cleanAmount(expectedAmount);
    const todayStr = new Date().toISOString().slice(0, 10);

    if (parsedRec > parsedExp) {
      setValidationError(`Received Amount (${formatCurrency(parsedRec)}) cannot exceed Expected Amount (${formatCurrency(parsedExp)}).`);
    } else {
      setValidationError(null);
    }

    // Auto-Date & Auto-Completion Automation:
    // 1. When received_amount > 0: auto-set receipt_date to today's date if not already filled.
    // 2. If received_amount == expected_amount and receipt_date is empty, set receipt_date = expected_date.
    if (parsedRec > 0) {
      if (parsedExp > 0 && parsedRec === parsedExp) {
        setIsReceipt(true);
        setRemarks('Received successfully');
        if (!receiptDate) {
          setReceiptDate(expectedDate || todayStr);
        }
      } else {
        setIsReceipt(false);
        if (!receiptDate) {
          setReceiptDate(todayStr);
        }
      }
    } else {
      setIsReceipt(false);
      setReceiptDate('');
    }
  };

  // When Expected Amount changes, check if received exceeds it
  const handleExpectedAmountChange = (val) => {
    setExpectedAmount(val);
    const parsedExp = cleanAmount(val);
    const parsedRec = cleanAmount(receivedAmount);
    const todayStr = new Date().toISOString().slice(0, 10);

    if (parsedRec > parsedExp) {
      setValidationError(`Received Amount (${formatCurrency(parsedRec)}) cannot exceed Expected Amount (${formatCurrency(parsedExp)}).`);
    } else {
      setValidationError(null);
    }

    if (parsedExp > 0 && parsedRec === parsedExp) {
      setIsReceipt(true);
      setRemarks('Received successfully');
      if (!receiptDate) {
        setReceiptDate(expectedDate || todayStr);
      }
    }
  };

  // 100% Paid quick button action
  const handleQuickMarkFullPayment = () => {
    if (numExpected <= 0) {
      setValidationError('Please enter a valid Expected Amount first.');
      return;
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    setReceivedAmount(String(numExpected));
    setIsReceipt(true);
    setRemarks('Received successfully');
    if (!receiptDate) {
      setReceiptDate(expectedDate || todayStr);
    }
    setValidationError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanExpected = cleanAmount(expectedAmount);
    const cleanReceived = cleanAmount(receivedAmount);

    // 1. Mandatory Field: Expected Amount must be provided and > 0
    if (!expectedAmount || cleanExpected <= 0) {
      setValidationError('Expected Payment Amount is a required mandatory field and must be greater than zero.');
      return;
    }

    // 2. Validation Rule: Prevent received_amount > expected_amount
    if (cleanReceived > cleanExpected) {
      setValidationError(`Validation Error: Received Amount (${formatCurrency(cleanReceived)}) cannot exceed Expected Payment Amount (${formatCurrency(cleanExpected)}).`);
      return;
    }

    if (!customerName.trim()) {
      setValidationError('Customer / Organization Name is required.');
      return;
    }

    if (!expectedDate) {
      setValidationError('Expected Payment Date is required.');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    let finalReceiptDate = receiptDate || null;
    let finalRemarks = remarks;
    let finalReceipt = isReceipt;

    if (cleanReceived > 0) {
      if (!finalReceiptDate) {
        if (cleanReceived === cleanExpected && expectedDate) {
          finalReceiptDate = expectedDate;
        } else {
          finalReceiptDate = todayStr;
        }
      }
      if (cleanReceived === cleanExpected && cleanExpected > 0) {
        finalReceipt = true;
        if (!finalRemarks || finalRemarks.trim() === '') {
          finalRemarks = 'Received successfully';
        }
      }
    } else {
      finalReceiptDate = null;
      finalReceipt = false;
    }

    onSave({
      customer_name: customerName.trim(),
      category,
      expected_amount: cleanExpected,
      received_amount: cleanReceived,
      expected_date: expectedDate,
      receipt_date: finalReceiptDate,
      is_receipt: finalReceipt,
      remarks: finalRemarks,
      assigned_to: assignedTo || currentUserId,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className={`max-w-lg w-full rounded-2xl border p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
      }`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-950 dark:text-white">
              {isEditing ? 'Update Payment Record' : isManager ? 'Add New Client & Assign Member' : 'Add New Customer Account'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {isEditing ? `Modifying customer entry: ${customerName}` : 'Register client with scheduled collection details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Warning Alert Banner */}
        {(validationError || isExceeding) && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-950 dark:text-rose-200 flex items-start space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>
              {validationError || `Received Amount (${formatCurrency(numReceived)}) cannot exceed Total Expected Amount (${formatCurrency(numExpected)}). Please adjust the value.`}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Customer Name */}
          <div>
            <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">
              Customer / Organization Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Apex Industrial Technologies Ltd"
              className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500'
                  : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Category, Expected Date & Receipt Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">
                Category Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold cursor-pointer ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
                }`}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">
                Expected Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-900 dark:text-slate-100">
                  Receipt Date
                </label>
                {receiptDate && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Auto</span>
                )}
              </div>
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
                }`}
              />
            </div>
          </div>

          {/* Expected Amount & Received Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* MANDATORY Expected Amount */}
            <div>
              <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">
                Total Expected Payment (₹) <span className="text-rose-500">* (Mandatory)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={expectedAmount}
                  onChange={(e) => handleExpectedAmountChange(e.target.value)}
                  placeholder="150000"
                  className={`w-full pl-8 pr-3 py-2.5 rounded-xl border text-xs sm:text-sm font-bold ${
                    !expectedAmount || numExpected <= 0
                      ? 'border-amber-400 focus:border-amber-500'
                      : ''
                  } ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500'
                  }`}
                />
              </div>
            </div>

            {/* Received Amount with 100% Paid shortcut */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-900 dark:text-slate-100">
                  Received Amount (₹)
                </label>
                <button
                  type="button"
                  onClick={handleQuickMarkFullPayment}
                  className="text-[11px] text-emerald-700 dark:text-emerald-400 font-extrabold hover:underline flex items-center space-x-1 cursor-pointer"
                  title="Click to set Received = Expected and mark funds as received"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>100% Paid</span>
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={receivedAmount}
                  onChange={(e) => handleReceivedAmountChange(e.target.value)}
                  placeholder="0"
                  className={`w-full pl-8 pr-3 py-2.5 rounded-xl border text-xs sm:text-sm font-bold ${
                    isExceeding
                      ? 'border-rose-500 text-rose-600 dark:text-rose-400 focus:ring-2 focus:ring-rose-500'
                      : theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-emerald-400 placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-emerald-700 placeholder:text-slate-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Balance Preview Chip */}
          <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
            theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-slate-600 dark:text-slate-400 font-medium">Calculated Balance Pending:</span>
            <span className={`font-black text-sm ${
              cleanAmount(numExpected - numReceived) === 0 && numExpected > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-800 dark:text-amber-400'
            }`}>
              {formatCurrency(Math.max(0, cleanAmount(numExpected - numReceived)))}
            </span>
          </div>

          {/* Manager: Member Assignment Dropdown */}
          {isManager && (
            <div>
              <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">
                Assign To Team Member / Account
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold cursor-pointer ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
                }`}
              >
                {teamProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {getDisplayName(p)} {p.role === 'manager' ? '(Manager)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Remarks & Notes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-900 dark:text-slate-100">
                Remarks & Status Notes
              </label>
              {numReceived === numExpected && numExpected > 0 && (
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Auto-set to "Received successfully"</span>
                </span>
              )}
            </div>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. NEFT transfer scheduled, or payment cleared"
              className={`w-full px-3 py-2 rounded-xl border text-xs font-medium ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500'
                  : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Receipt Received Checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="customer_is_receipt_toggle"
              checked={isReceipt}
              onChange={(e) => setIsReceipt(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label
              htmlFor="customer_is_receipt_toggle"
              className="font-bold text-slate-900 dark:text-slate-100 cursor-pointer flex items-center space-x-1"
            >
              <span>Receipt Received (Funds Confirmed)</span>
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 inline ml-1" />
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl font-bold border transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'border-slate-800 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-300 text-slate-800 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExceeding || !expectedAmount || numExpected <= 0}
              className={`px-5 py-2.5 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                isExceeding || !expectedAmount || numExpected <= 0
                  ? 'bg-slate-400 cursor-not-allowed opacity-60'
                  : isEditing
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
            >
              <span>{isEditing ? 'Save Changes' : 'Create Customer Record'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
