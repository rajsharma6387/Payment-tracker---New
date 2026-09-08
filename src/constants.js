// ============================================================================
// APPLICATION CONSTANTS & SEED DATA
// ============================================================================

export const CATEGORIES = [
  'AMC',
  'Solution',
  'Outstanding',
  'Customization',
  'Tally',
  'TSS',
  'Other',
];

export const DEMO_PROFILES = [
  { id: "11111111-1111-4111-8111-111111111111", email: "manager@company.com", role: "manager", full_name: "Operations Manager" },
  { id: "22222222-2222-4222-8222-222222222222", email: "rajesh.team@company.com", role: "team", full_name: "Rajesh Sharma" },
  { id: "33333333-3333-4333-8333-333333333333", email: "priya.team@company.com", role: "team", full_name: "Priya Patel" },
  { id: "44444444-4444-4444-8444-444444444444", email: "amit.team@company.com", role: "team", full_name: "Amit Verma" },
];

export const INITIAL_CUSTOMERS = [
  {
    id: 1,
    created_at: new Date().toISOString(),
    customer_name: "Apex Industrial Tech Ltd",
    category: "AMC",
    expected_amount: 185000,
    received_amount: 185000,
    expected_date: "2026-09-15",
    receipt_date: "2026-09-15",
    is_receipt: true,
    remarks: "Received successfully",
    assigned_to: "22222222-2222-4222-8222-222222222222",
  },
  {
    id: 2,
    created_at: new Date().toISOString(),
    customer_name: "BlueSky Logistics Corp",
    category: "Solution",
    expected_amount: 320000,
    received_amount: 120000,
    expected_date: "2026-09-20",
    receipt_date: "2026-09-06",
    is_receipt: false,
    remarks: "Phase 1 ERP deployment milestone. Balance due next week.",
    assigned_to: "22222222-2222-4222-8222-222222222222",
  },
  {
    id: 3,
    created_at: new Date().toISOString(),
    customer_name: "Zenith Global Healthcare",
    category: "Outstanding",
    expected_amount: 95000,
    received_amount: 0,
    expected_date: "2026-08-28",
    receipt_date: null,
    is_receipt: false,
    remarks: "Overdue Q2 billing. Sent formal notice to finance desk.",
    assigned_to: "22222222-2222-4222-8222-222222222222",
  },
  {
    id: 4,
    created_at: new Date().toISOString(),
    customer_name: "Matrix Cloud Software",
    category: "Solution",
    expected_amount: 240000,
    received_amount: 240000,
    expected_date: "2026-09-12",
    receipt_date: "2026-09-12",
    is_receipt: true,
    remarks: "Received successfully",
    assigned_to: "33333333-3333-4333-8333-333333333333",
  },
  {
    id: 5,
    created_at: new Date().toISOString(),
    customer_name: "Horizon Retail Ventures",
    category: "Customization",
    expected_amount: 140000,
    received_amount: 50000,
    expected_date: "2026-09-25",
    receipt_date: "2026-09-04",
    is_receipt: false,
    remarks: "Custom barcode inventory plugin & billing slip tailoring.",
    assigned_to: "33333333-3333-4333-8333-333333333333",
  },
  {
    id: 6,
    created_at: new Date().toISOString(),
    customer_name: "Delta Manufacturing Works",
    category: "Tally",
    expected_amount: 75000,
    received_amount: 75000,
    expected_date: "2026-09-15",
    receipt_date: "2026-09-15",
    is_receipt: true,
    remarks: "Received successfully",
    assigned_to: "33333333-3333-4333-8333-333333333333",
  },
  {
    id: 7,
    created_at: new Date().toISOString(),
    customer_name: "Kaveri Packaging Pvt Ltd",
    category: "Outstanding",
    expected_amount: 115000,
    received_amount: 0,
    expected_date: "2026-09-02",
    receipt_date: null,
    is_receipt: false,
    remarks: "Audit clearance pending from client finance desk.",
    assigned_to: "44444444-4444-4444-8444-444444444444",
  },
  {
    id: 8,
    created_at: new Date().toISOString(),
    customer_name: "OmniCorp Infrastructure",
    category: "Solution",
    expected_amount: 450000,
    received_amount: 225000,
    expected_date: "2026-09-28",
    receipt_date: "2026-09-07",
    is_receipt: false,
    remarks: "50% milestone advance credited. Final 50% on UAT signoff.",
    assigned_to: "44444444-4444-4444-8444-444444444444",
  },
  {
    id: 9,
    created_at: new Date().toISOString(),
    customer_name: "Apex Logistics & Fleet",
    category: "TSS",
    expected_amount: 48000,
    received_amount: 24000,
    expected_date: "2026-09-18",
    receipt_date: "2026-09-05",
    is_receipt: false,
    remarks: "Tally Software Services annual renewal - part payment received.",
    assigned_to: "44444444-4444-4444-8444-444444444444",
  },
  {
    id: 10,
    created_at: new Date().toISOString(),
    customer_name: "Quantum Biotech Research",
    category: "Other",
    expected_amount: 60000,
    received_amount: 0,
    expected_date: "2026-09-30",
    receipt_date: null,
    is_receipt: false,
    remarks: "Third-party connector and hardware license integration fee.",
    assigned_to: "44444444-4444-4444-8444-444444444444",
  },
  {
    id: 11,
    created_at: new Date().toISOString(),
    customer_name: "Vertex FinTech Solutions",
    category: "Customization",
    expected_amount: 275000,
    received_amount: 275000,
    expected_date: "2026-09-18",
    receipt_date: "2026-09-18",
    is_receipt: true,
    remarks: "Received successfully",
    assigned_to: "11111111-1111-4111-8111-111111111111", // Manager assignment
  },
];

export const cleanAmount = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') {
    if (isNaN(val)) return 0;
    return Math.round(val * 100) / 100;
  }
  const cleanStr = String(val).replace(/,/g, '').trim();
  const num = Number(cleanStr);
  if (isNaN(num)) return 0;
  return Math.round(num * 100) / 100;
};

export const getPaymentStatus = (arg1, arg2) => {
  let exp = 0;
  let rec = 0;
  if (typeof arg1 === 'object' && arg1 !== null) {
    exp = cleanAmount(arg1.expected_amount);
    rec = cleanAmount(arg1.received_amount);
  } else {
    exp = cleanAmount(arg1);
    rec = cleanAmount(arg2);
  }

  if (rec >= exp && exp > 0) {
    return {
      status: 'received',
      type: 'received',
      label: 'Receipt Received',
      color: 'emerald',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
    };
  }

  if (rec > 0 && rec < exp) {
    return {
      status: 'partial',
      type: 'partial',
      label: 'Partially Received',
      color: 'blue',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800',
    };
  }

  return {
    status: 'pending',
    type: 'pending',
    label: 'Pending',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
  };
};

export const formatEmailPrefix = (email) => {
  if (!email || typeof email !== 'string') return '';
  const prefix = email.split('@')[0] || '';
  return prefix;
};

export const getDisplayName = (profileOrEmail) => {
  if (!profileOrEmail) return 'Unassigned';
  if (typeof profileOrEmail === 'object') {
    if (profileOrEmail.full_name && typeof profileOrEmail.full_name === 'string' && profileOrEmail.full_name.trim()) {
      return profileOrEmail.full_name.trim();
    }
    if (profileOrEmail.email) {
      return formatEmailPrefix(profileOrEmail.email);
    }
    return profileOrEmail.id ? profileOrEmail.id.slice(0, 8) + '...' : 'Unassigned';
  }
  if (typeof profileOrEmail === 'string') {
    if (profileOrEmail.includes('@')) {
      return formatEmailPrefix(profileOrEmail);
    }
    return profileOrEmail;
  }
  return 'Unassigned';
};

export const formatCurrency = (amount) => {
  const num = cleanAmount(amount);
  const rounded = Math.round(num);
  return '₹' + rounded.toLocaleString('en-IN');
};

export const getCategoryBadgeStyle = (category, isDark = false) => {
  switch (category) {
    case 'AMC':
      return isDark
        ? 'bg-blue-950/90 text-blue-300 border-blue-800'
        : 'bg-blue-100 text-blue-950 border-blue-300 font-bold';
    case 'Solution':
      return isDark
        ? 'bg-purple-950/90 text-purple-300 border-purple-800'
        : 'bg-purple-100 text-purple-950 border-purple-300 font-bold';
    case 'Outstanding':
      return isDark
        ? 'bg-amber-950/90 text-amber-300 border-amber-800'
        : 'bg-amber-100 text-amber-950 border-amber-300 font-bold';
    case 'Customization':
      return isDark
        ? 'bg-teal-950/90 text-teal-300 border-teal-800'
        : 'bg-teal-100 text-teal-950 border-teal-300 font-bold';
    case 'Tally':
      return isDark
        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
        : 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold';
    case 'TSS':
      return isDark
        ? 'bg-sky-950/90 text-sky-300 border-sky-800'
        : 'bg-sky-100 text-sky-950 border-sky-300 font-bold';
    case 'Other':
    default:
      return isDark
        ? 'bg-slate-800 text-slate-300 border-slate-700'
        : 'bg-slate-200 text-slate-900 border-slate-300 font-bold';
  }
};
