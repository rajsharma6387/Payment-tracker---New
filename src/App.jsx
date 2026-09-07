import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  CheckCircle,
  Clock,
  Plus,
  LogOut,
  User,
  Users,
  Filter,
  DollarSign,
  AlertCircle,
  Calendar,
  Building,
  Search,
  RefreshCw,
  CreditCard,
  Edit3,
  Trash2,
  X,
  ShieldCheck,
  Layers,
  Lock,
  Mail,
  Download,
  Sun,
  Moon,
  Key,
  ChevronDown,
  Check,
  ArrowRight,
  TrendingUp,
  FileText,
  ThumbsUp,
  Sparkles,
  PartyPopper,
  ExternalLink
} from 'lucide-react';

// ============================================================================
// 1. SUPABASE CLIENT CONFIGURATION
// ============================================================================
const SUPABASE_URL = "https://wqobylynejifeqlfknda.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxb2J5bHluZWppZmVxbGZrbmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1OTczMTUsImV4cCI6MjEwNDE3MzMxNX0.PWcUCK-FzkAok6esDCxb3tf-ozfHvxku6MVM5WvfRGE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================================
// 2. DEMO SEED DATA (Includes Manager with assigned accounts & Customization category)
// ============================================================================
const DEMO_PROFILES = [
  { id: "11111111-1111-4111-8111-111111111111", email: "manager@company.com", role: "manager" },
  { id: "22222222-2222-4222-8222-222222222222", email: "rajesh.team@company.com", role: "team" },
  { id: "33333333-3333-4333-8333-333333333333", email: "priya.team@company.com", role: "team" },
  { id: "44444444-4444-4444-8444-444444444444", email: "amit.team@company.com", role: "team" },
];

const INITIAL_CUSTOMERS = [
  {
    id: 1,
    created_at: new Date().toISOString(),
    customer_name: "Apex Industrial Tech Ltd",
    category: "AMC",
    expected_amount: 185000,
    received_amount: 185000,
    expected_date: "2026-09-15",
    is_receipt: true,
    remarks: "Annual maintenance renewal cleared via NEFT #98421.",
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
    is_receipt: true,
    remarks: "API integration completed. Payment verified.",
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
    is_receipt: false,
    remarks: "Custom barcode inventory plugin & billing slip tailoring.",
    assigned_to: "33333333-3333-4333-8333-333333333333",
  },
  {
    id: 6,
    created_at: new Date().toISOString(),
    customer_name: "Kaveri Packaging Pvt Ltd",
    category: "Outstanding",
    expected_amount: 115000,
    received_amount: 0,
    expected_date: "2026-09-02",
    is_receipt: false,
    remarks: "Audit clearance pending from client finance desk.",
    assigned_to: "44444444-4444-4444-8444-444444444444",
  },
  {
    id: 7,
    created_at: new Date().toISOString(),
    customer_name: "OmniCorp Infrastructure",
    category: "Solution",
    expected_amount: 450000,
    received_amount: 225000,
    expected_date: "2026-09-28",
    is_receipt: false,
    remarks: "50% milestone advance credited. Final 50% on UAT signoff.",
    assigned_to: "44444444-4444-4444-8444-444444444444",
  },
  {
    id: 8,
    created_at: new Date().toISOString(),
    customer_name: "Vertex FinTech Solutions",
    category: "Customization",
    expected_amount: 275000,
    received_amount: 275000,
    expected_date: "2026-09-18",
    is_receipt: true,
    remarks: "Enterprise custom payment gateway adapter and custom ledger reports.",
    assigned_to: "11111111-1111-4111-8111-111111111111", // Assigned to Manager!
  }
];

// Currency formatting helper (INR)
const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export default function App() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  // Theme state: default is 'light' as required
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('fincollect_theme') || 'light';
  });

  // Auth & Session
  const [sessionUser, setSessionUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRole, setAuthRole] = useState('team'); // 'team' | 'manager'
  const [authError, setAuthError] = useState(null);

  // Application Data
  const [customers, setCustomers] = useState([]);
  const [teamProfiles, setTeamProfiles] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // 'ALL' | 'received' | 'pending'
  const [selectedRep, setSelectedRep] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  // Modals & UI Actions
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Celebration Banner / Modal state (Thumbs Up 👍 / Well Done!)
  const [celebrationData, setCelebrationData] = useState(null);

  // Realtime Presence / Online Users
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isPresenceOpen, setIsPresenceOpen] = useState(false);

  // Toast Helper
  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Trigger celebration popup
  const triggerCelebration = (customerName, amount) => {
    setCelebrationData({
      customerName,
      amount,
      id: Date.now(),
    });
    // Auto-dismiss celebration popup after 4 seconds
    setTimeout(() => {
      setCelebrationData((curr) => (curr ? null : curr));
    }, 4500);
  };

  // Toggle Theme
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('fincollect_theme', nextTheme);
  };

  // Sync html class for dark mode styling
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // ============================================================================
  // 3. AUTHENTICATION & INITIALIZATION
  // ============================================================================
  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setSessionUser(session.user);
          await fetchProfile(session.user.id, session.user.email || '');
        } else {
          // Check if user was logged in with demo profile
          const savedDemo = localStorage.getItem('fincollect_active_user');
          if (savedDemo) {
            try {
              const parsed = JSON.parse(savedDemo);
              setUserProfile(parsed);
              setSessionUser({ id: parsed.id, email: parsed.email });
            } catch {
              // No valid saved demo
            }
          }
        }
      } catch (err) {
        console.warn('Session check warning:', err);
      } finally {
        setLoadingSession(false);
      }
    };

    checkInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSessionUser(session.user);
        await fetchProfile(session.user.id, session.user.email || '');
      } else if (isLiveSupabase) {
        setSessionUser(null);
        setUserProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch or upsert profile in Supabase
  const fetchProfile = async (userId, email) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setUserProfile(data);
        setIsLiveSupabase(true);
      } else {
        // Create profile if missing in profiles table
        const newProfile = {
          id: userId,
          email: email,
          role: authRole || 'team',
        };
        const { error: insertErr } = await supabase.from('profiles').insert(newProfile);
        if (!insertErr) {
          setUserProfile(newProfile);
          setIsLiveSupabase(true);
        } else {
          setUserProfile({ id: userId, email, role: 'team' });
        }
      }
    } catch (err) {
      console.warn('Error fetching profile from Supabase:', err);
      setUserProfile({ id: userId, email, role: 'team' });
    }
  };

  // Handle Login & Signup
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });

        if (error) throw error;
        if (data.user) {
          setSessionUser(data.user);
          await fetchProfile(data.user.id, data.user.email || '');
          showToast(`Welcome back, ${data.user.email}!`, 'success');
        }
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });

        if (error) throw error;
        if (data.user) {
          const profileEntry = {
            id: data.user.id,
            email: authEmail,
            role: authRole,
          };
          await supabase.from('profiles').upsert(profileEntry);
          setSessionUser(data.user);
          setUserProfile(profileEntry);
          setIsLiveSupabase(true);
          showToast(`Account registered as ${authRole.toUpperCase()}!`, 'success');
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed.');
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // Instant Demo Login (For seamless preview/testing without manual auth steps)
  const handleQuickDemoLogin = (profile) => {
    localStorage.setItem('fincollect_active_user', JSON.stringify(profile));
    setUserProfile(profile);
    setSessionUser({ id: profile.id, email: profile.email });
    setIsLiveSupabase(false);
    showToast(`Logged in as ${profile.role.toUpperCase()} (${profile.email})`, 'info');
  };

  // Logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('fincollect_active_user');
    setSessionUser(null);
    setUserProfile(null);
    showToast('Logged out successfully.', 'info');
  };

  // Change Password
  const handleChangePassword = async (newPassword) => {
    try {
      if (isLiveSupabase) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }
      setIsPasswordModalOpen(false);
      showToast('Password updated successfully!', 'success');
    } catch (err) {
      showToast(`Password update failed: ${err.message}`, 'error');
    }
  };

  // ============================================================================
  // 4. DATA LOADING & SYNCHRONIZATION
  // ============================================================================
  const loadData = async () => {
    if (!userProfile) return;
    setDataLoading(true);

    try {
      // 1. Fetch team profiles from Supabase
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*');

      if (profilesData && profilesData.length > 0) {
        setTeamProfiles(profilesData);
      } else {
        setTeamProfiles(DEMO_PROFILES);
      }

      // 2. Fetch customers from Supabase
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .order('expected_date', { ascending: true });

      if (customerData && customerData.length > 0) {
        setCustomers(customerData);
        setIsLiveSupabase(true);
      } else {
        // Fallback to local storage cache
        const localSaved = localStorage.getItem('fincollect_customers_cache');
        if (localSaved) {
          setCustomers(JSON.parse(localSaved));
        } else {
          setCustomers(INITIAL_CUSTOMERS);
          localStorage.setItem('fincollect_customers_cache', JSON.stringify(INITIAL_CUSTOMERS));
        }
      }
    } catch (err) {
      console.warn('Using local fallback dataset:', err);
      setTeamProfiles(DEMO_PROFILES);
      setCustomers(INITIAL_CUSTOMERS);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile) {
      loadData();
    }
  }, [userProfile]);

  // ============================================================================
  // SUPABASE REALTIME PRESENCE (Track Live Active Users)
  // ============================================================================
  useEffect(() => {
    if (!userProfile) {
      setOnlineUsers([]);
      return;
    }

    const presenceKey = userProfile.id || userProfile.email;
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: presenceKey,
        },
      },
    });

    const updatePresenceState = () => {
      const state = channel.presenceState();
      const onlineList = [];
      Object.keys(state).forEach((key) => {
        const presences = state[key];
        if (presences && presences.length > 0) {
          onlineList.push(presences[0]);
        }
      });

      // Deduplicate by id or email
      const map = new Map();
      onlineList.forEach((u) => {
        const k = u.id || u.email;
        if (k && !map.has(k)) {
          map.set(k, u);
        }
      });

      setOnlineUsers(Array.from(map.values()));
    };

    channel
      .on('presence', { event: 'sync' }, () => {
        updatePresenceState();
      })
      .on('presence', { event: 'join' }, () => {
        updatePresenceState();
      })
      .on('presence', { event: 'leave' }, () => {
        updatePresenceState();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            await channel.track({
              id: userProfile.id,
              email: userProfile.email,
              role: userProfile.role,
              online_at: new Date().toISOString(),
            });
          } catch (trackErr) {
            console.warn('Presence track warning:', trackErr);
          }
        }
      });

    return () => {
      try {
        channel.untrack();
        supabase.removeChannel(channel);
      } catch (cleanupErr) {
        // ignore
      }
    };
  }, [userProfile?.id, userProfile?.email, userProfile?.role]);

  // Online team members roster: always ensure currently logged-in user is present
  const effectiveOnlineUsers = useMemo(() => {
    const list = [...onlineUsers];
    if (userProfile) {
      const exists = list.some((u) => u.id === userProfile.id || u.email === userProfile.email);
      if (!exists) {
        list.unshift({
          id: userProfile.id,
          email: userProfile.email,
          role: userProfile.role,
          online_at: new Date().toISOString(),
        });
      }
    }
    return list;
  }, [onlineUsers, userProfile]);

  const updateLocalCustomers = (updated) => {
    setCustomers(updated);
    localStorage.setItem('fincollect_customers_cache', JSON.stringify(updated));
  };

  // ============================================================================
  // 5. CUSTOMER RECORD ACTIONS & CELEBRATION
  // ============================================================================
  // Toggle Receipt status (is_receipt)
  const handleToggleReceipt = async (customer) => {
    const nextReceipt = !customer.is_receipt;
    const totalExp = Number(customer.expected_amount) || 0;
    const currentRec = Number(customer.received_amount) || 0;
    // When marking receipt as received, auto-fill received amount to match invoice if currently zero or partial
    const nextRec = nextReceipt && currentRec < totalExp ? totalExp : customer.received_amount;

    try {
      if (isLiveSupabase) {
        await supabase
          .from('customers')
          .update({
            is_receipt: nextReceipt,
            received_amount: nextRec,
          })
          .eq('id', customer.id);
      }

      const updated = customers.map((c) =>
        c.id === customer.id
          ? { ...c, is_receipt: nextReceipt, received_amount: nextRec }
          : c
      );
      updateLocalCustomers(updated);

      if (nextReceipt) {
        // Trigger Thumbs Up / Well Done celebration popup!
        triggerCelebration(customer.customer_name, nextRec || totalExp);
        showToast(`Receipt received for ${customer.customer_name}! 👍`, 'success');
      } else {
        showToast(`Receipt marked as Pending`, 'info');
      }
    } catch (err) {
      showToast(`Update error: ${err.message}`, 'error');
    }
  };

  // Save Customer Changes (Add / Edit)
  const handleSaveCustomer = async (formData) => {
    try {
      const isEditing = Boolean(editCustomer);
      const assignedToId =
        userProfile?.role === 'manager'
          ? formData.assigned_to
          : userProfile?.id;

      const recordData = {
        customer_name: formData.customer_name,
        category: formData.category,
        expected_amount: Number(formData.expected_amount) || 0,
        received_amount: Number(formData.received_amount) || 0,
        expected_date: formData.expected_date,
        is_receipt: Boolean(formData.is_receipt),
        remarks: formData.remarks || '',
        assigned_to: assignedToId,
      };

      if (isEditing) {
        if (isLiveSupabase) {
          await supabase
            .from('customers')
            .update(recordData)
            .eq('id', editCustomer.id);
        }
        const updated = customers.map((c) =>
          c.id === editCustomer.id ? { ...c, ...recordData } : c
        );
        updateLocalCustomers(updated);

        // If newly marked as receipt received, trigger celebration!
        if (recordData.is_receipt && !editCustomer.is_receipt) {
          triggerCelebration(recordData.customer_name, recordData.received_amount);
        }

        setEditCustomer(null);
        showToast(`Customer "${formData.customer_name}" updated!`, 'success');
      } else {
        // Add new customer
        if (isLiveSupabase) {
          const { data, error } = await supabase
            .from('customers')
            .insert({ ...recordData, created_at: new Date().toISOString() })
            .select()
            .single();

          if (error) throw error;
          if (data) {
            updateLocalCustomers([data, ...customers]);
          }
        } else {
          const localNew = {
            ...recordData,
            id: Date.now(),
            created_at: new Date().toISOString(),
          };
          updateLocalCustomers([localNew, ...customers]);
        }

        // If added with receipt already received, trigger celebration
        if (recordData.is_receipt) {
          triggerCelebration(recordData.customer_name, recordData.received_amount);
        }

        setIsAddModalOpen(false);
        showToast(`New client "${formData.customer_name}" registered!`, 'success');
      }
    } catch (err) {
      showToast(`Action failed: ${err.message}`, 'error');
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the record for "${name}"?`)) return;

    try {
      if (isLiveSupabase) {
        await supabase.from('customers').delete().eq('id', id);
      }
      const updated = customers.filter((c) => c.id !== id);
      updateLocalCustomers(updated);
      showToast(`Removed "${name}" from dashboard.`, 'info');
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  // ============================================================================
  // 6. ROLE-BASED DATA FILTERING & KPIS
  // ============================================================================
  const isManager = userProfile?.role === 'manager';

  // Base scope based on RBAC
  const roleScopedCustomers = useMemo(() => {
    if (!userProfile) return [];
    if (isManager) {
      return customers; // Manager sees all
    }
    // Team member: ONLY see records where assigned_to === userProfile.id
    return customers.filter((c) => c.assigned_to === userProfile.id);
  }, [customers, userProfile, isManager]);

  // Secondary filters (Search, Category, Status, Rep, Month)
  const filteredCustomers = useMemo(() => {
    let list = [...roleScopedCustomers];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.customer_name?.toLowerCase().includes(q) ||
          c.remarks?.toLowerCase().includes(q)
      );
    }

    // Category Filter (AMC, Solution, Outstanding, Customization)
    if (selectedCategory !== 'ALL') {
      list = list.filter((c) => c.category === selectedCategory);
    }

    // Status (Received / Pending)
    if (selectedStatus === 'received') {
      list = list.filter((c) => c.is_receipt);
    } else if (selectedStatus === 'pending') {
      list = list.filter((c) => !c.is_receipt);
    }

    // Manager Rep Filter
    if (isManager && selectedRep !== 'ALL') {
      list = list.filter((c) => c.assigned_to === selectedRep);
    }

    // Month Filter
    if (selectedMonth !== 'ALL') {
      list = list.filter((c) => c.expected_date?.startsWith(selectedMonth));
    }

    return list;
  }, [roleScopedCustomers, searchQuery, selectedCategory, selectedStatus, selectedRep, selectedMonth, isManager]);

  // Aggregate KPI metrics
  const totalExpected = useMemo(() => {
    return filteredCustomers.reduce((acc, c) => acc + (Number(c.expected_amount) || 0), 0);
  }, [filteredCustomers]);

  const totalReceived = useMemo(() => {
    return filteredCustomers.reduce((acc, c) => acc + (Number(c.received_amount) || 0), 0);
  }, [filteredCustomers]);

  const totalBalance = useMemo(() => {
    return Math.max(0, totalExpected - totalReceived);
  }, [totalExpected, totalReceived]);

  const recoveryPercent = totalExpected > 0 ? Math.round((totalReceived / totalExpected) * 100) : 0;

  // Manager: Team Performance Breakdown
  // NOTE: Includes all profiles (including the Manager's own account) seamlessly!
  const teamBreakdown = useMemo(() => {
    if (!isManager) return [];
    const repMap = new Map();

    // Map all team profiles, including the manager's account
    teamProfiles.forEach((p) => {
      repMap.set(p.id, {
        email: p.email,
        role: p.role,
        expected: 0,
        received: 0,
        count: 0
      });
    });

    // Also verify any customer with assigned_to is included in case not in profiles
    customers.forEach((c) => {
      if (c.assigned_to && !repMap.has(c.assigned_to)) {
        repMap.set(c.assigned_to, {
          email: getRepEmail(c.assigned_to),
          role: 'team',
          expected: 0,
          received: 0,
          count: 0,
        });
      }
    });

    // Aggregate values
    customers.forEach((c) => {
      const rep = repMap.get(c.assigned_to);
      if (rep) {
        rep.expected += Number(c.expected_amount) || 0;
        rep.received += Number(c.received_amount) || 0;
        rep.count += 1;
      }
    });

    return Array.from(repMap.entries()).map(([id, data]) => ({
      id,
      email: data.email,
      role: data.role,
      count: data.count,
      expected: data.expected,
      received: data.received,
      balance: Math.max(0, data.expected - data.received),
      percent: data.expected > 0 ? Math.round((data.received / data.expected) * 100) : 0,
    }));
  }, [customers, teamProfiles, isManager]);

  // Helper: Get Rep Email
  const getRepEmail = (assignedId) => {
    const p = teamProfiles.find((t) => t.id === assignedId);
    return p?.email || (assignedId ? assignedId.slice(0, 8) + '...' : 'Unassigned');
  };

  // Handle Click on Grand Total KPI Cards in Manager View
  const handleKpiCardClick = (targetStatus) => {
    if (!isManager) return;
    // If already active, reset to 'ALL', otherwise set to clicked status
    setSelectedStatus((prev) => (prev === targetStatus ? 'ALL' : targetStatus));
    // Smoothly scroll down to the Customer Ledger Table section
    const ledgerElem = document.getElementById('customer-ledger-section');
    if (ledgerElem) {
      ledgerElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // CSV Export
  const exportCSV = () => {
    const headers = ['Customer Name', 'Category', 'Expected Amount', 'Received Amount', 'Balance', 'Expected Date', 'Status', 'Remarks', 'Assigned Rep'];
    const rows = filteredCustomers.map((c) => [
      `"${(c.customer_name || '').replace(/"/g, '""')}"`,
      c.category,
      c.expected_amount,
      c.received_amount,
      Math.max(0, Number(c.expected_amount) - Number(c.received_amount)),
      c.expected_date,
      c.is_receipt ? 'Receipt Received' : 'Not Received',
      `"${(c.remarks || '').replace(/"/g, '""')}"`,
      getRepEmail(c.assigned_to),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payment_collections_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading Screen
  if (loadingSession) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Initializing CollectIQ Portal...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 7. AUTHENTICATION FIRST ROUTING (LOGIN / SIGNUP SCREEN)
  // ============================================================================
  if (!userProfile) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 transition-colors ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
        {/* Floating Theme Switcher on Login Page */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-200 hover:text-white'
                : 'bg-white border-slate-300 text-slate-800 hover:text-slate-950 shadow-xs'
            }`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        <div className="max-w-md w-full space-y-6">
          {/* Brand Header */}
          <div className="text-center">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-600/25 mb-3">
              ₹
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              CollectIQ
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
              Payment Collection & Client Management Dashboard
            </p>
          </div>

          {/* Login Card */}
          <div className={`p-6 sm:p-7 rounded-2xl border transition-all ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800 shadow-2xl'
              : 'bg-white border-slate-300 shadow-xl'
          }`}>
            {/* Mode Switcher */}
            <div className={`grid grid-cols-2 p-1 rounded-xl mb-5 text-xs font-semibold ${
              theme === 'dark' ? 'bg-slate-950 border border-slate-800' : 'bg-slate-100 border border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(null); }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'login'
                    ? (theme === 'dark' ? 'bg-indigo-600 text-white font-bold' : 'bg-white text-slate-950 shadow-xs font-bold border border-slate-200')
                    : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white font-medium'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? (theme === 'dark' ? 'bg-indigo-600 text-white font-bold' : 'bg-white text-slate-950 shadow-xs font-bold border border-slate-200')
                    : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white font-medium'
                }`}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div className="p-3 mb-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="rep@company.com"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm border transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden'
                        : 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-hidden'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm border transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden'
                        : 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-hidden'
                    }`}
                  />
                </div>
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Select Account Role
                  </label>
                  <select
                    value={authRole}
                    onChange={(e) => setAuthRole(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm border transition-colors cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden'
                        : 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden'
                    }`}
                  >
                    <option value="team">Team Member (Assigned Clients Only)</option>
                    <option value="manager">Manager (Master Company Oversight)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                {authLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{authMode === 'login' ? 'Sign In to Dashboard' : 'Create & Sign In'}</span>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials / Test Accounts */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-center mb-3">
                1-Click Instant Preview (Demo Bypass)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(DEMO_PROFILES[0])}
                  className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-purple-950/40 border-purple-800/60 hover:bg-purple-900/60'
                      : 'bg-purple-50 border-purple-300 hover:bg-purple-100'
                  }`}
                >
                  <div className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Manager View</span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate mt-0.5 font-medium">
                    Full company scope
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(DEMO_PROFILES[1])}
                  className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-emerald-950/40 border-emerald-800/60 hover:bg-emerald-900/60'
                      : 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Team Rep View</span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate mt-0.5 font-medium">
                    Assigned portfolio only
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 8. LOGGED-IN ROLE DASHBOARD
  // ============================================================================
  return (
    <div className={`min-h-screen flex flex-col antialiased transition-colors ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* ==================================================================== */}
      {/* CELEBRATION MODAL (Thumbs Up 👍 / Well Done! Animation) */}
      {/* ==================================================================== */}
      {celebrationData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`relative max-w-sm w-full rounded-2xl border p-6 text-center shadow-2xl overflow-hidden transition-all transform scale-100 ${
            theme === 'dark'
              ? 'bg-slate-900 border-emerald-500/50 text-white shadow-emerald-950/50'
              : 'bg-white border-emerald-300 text-slate-900 shadow-xl'
          }`}>
            
            {/* Background glowing rings */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Close button */}
            <button
              onClick={() => setCelebrationData(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Thumbs Up Icon with animation */}
            <div className="relative inline-flex items-center justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/20 animate-bounce">
                <ThumbsUp className="w-8 h-8 fill-emerald-500/20 stroke-emerald-600 dark:stroke-emerald-400" />
              </div>
              <span className="absolute -top-1 -right-1 text-lg">🎉</span>
              <span className="absolute -bottom-1 -left-1 text-lg">✨</span>
            </div>

            {/* Congratulatory Text */}
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Well Done! 👍
            </h3>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center justify-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Payment Receipt Received & Confirmed</span>
            </p>

            <div className={`mt-3.5 p-3 rounded-xl border text-xs text-left ${
              theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300'
            }`}>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium">
                <span>Customer</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[170px]">
                  {celebrationData.customerName}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1 text-slate-700 dark:text-slate-300 font-medium">
                <span>Payment Cleared</span>
                <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                  {formatCurrency(celebrationData.amount)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setCelebrationData(null)}
              className="w-full mt-4 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
            >
              Awesome! Continue
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-2xl flex items-center space-x-2 transition-all ${
            toastMessage.type === 'success'
              ? (theme === 'dark' ? 'bg-emerald-950 border-emerald-700 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-950')
              : toastMessage.type === 'error'
              ? (theme === 'dark' ? 'bg-rose-950 border-rose-700 text-rose-200' : 'bg-rose-50 border-rose-300 text-rose-950')
              : (theme === 'dark' ? 'bg-indigo-950 border-indigo-700 text-indigo-200' : 'bg-indigo-50 border-indigo-300 text-indigo-950')
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Header / Navbar */}
      <header className={`sticky top-0 z-30 border-b transition-colors ${
        theme === 'dark' ? 'bg-slate-900/95 border-slate-800 shadow-md backdrop-blur-md' : 'bg-white/95 border-slate-200 shadow-xs backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-600/30">
                ₹
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                    CollectIQ
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                    isManager
                      ? (theme === 'dark' ? 'bg-purple-950 text-purple-300 border-purple-800' : 'bg-purple-100 text-purple-800 border-purple-300')
                      : (theme === 'dark' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-emerald-100 text-emerald-800 border-emerald-300')
                  }`}>
                    {isManager ? 'Manager Dashboard' : 'Team Member View'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  Payment Collection & Client Management Dashboard
                </p>
              </div>
            </div>

            {/* Actions & Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Add Customer Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{isManager ? 'Add & Assign Client' : 'Add New Customer'}</span>
                <span className="sm:hidden">Add</span>
              </button>

              {/* Manager Only: Realtime Online Team Members Badge & Popover */}
              {isManager && (
                <div className="relative">
                  <button
                    onClick={() => setIsPresenceOpen((prev) => !prev)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-emerald-500/60'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100 shadow-xs'
                    }`}
                    title="Click to view live online team members"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      <strong className="font-bold">{effectiveOnlineUsers.length}</strong> Online
                    </span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isPresenceOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Popover */}
                  {isPresenceOpen && (
                    <div className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white shadow-slate-950/80' : 'bg-white border-slate-300 text-slate-900 shadow-xl'
                    }`}>
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center space-x-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-white">
                            Active Team Members ({effectiveOnlineUsers.length})
                          </h4>
                        </div>
                        <button
                          onClick={() => setIsPresenceOpen(false)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-2.5 space-y-2 max-h-60 overflow-y-auto">
                        {effectiveOnlineUsers.map((u, idx) => {
                          const isSelf = u.id === userProfile.id || u.email === userProfile.email;
                          return (
                            <div
                              key={u.id || u.email || idx}
                              className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-colors ${
                                theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center space-x-2 min-w-0">
                                <div className="relative shrink-0">
                                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-[11px] text-indigo-700 dark:text-indigo-400">
                                    {u.email ? u.email.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-slate-900"></span>
                                </div>
                                <div className="truncate">
                                  <p className="font-bold truncate text-slate-900 dark:text-white">
                                    {u.email}
                                  </p>
                                  <p className="text-[10px] text-slate-600 dark:text-slate-400">
                                    {u.role === 'manager' ? 'Manager' : 'Team Member'} {isSelf && '• You'}
                                  </p>
                                </div>
                              </div>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 shrink-0 ml-2 border border-emerald-300 dark:border-emerald-800">
                                Active Now
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Realtime channel info footer */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
                        <span>Supabase Realtime Presence</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                          <span>Channel: online-users</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Theme Toggle (Light / Dark) */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white'
                    : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200 shadow-xs'
                }`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>

              {/* Change Password Modal Trigger */}
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                title="Change Password"
                className={`hidden md:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white'
                    : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200 shadow-xs'
                }`}
              >
                <Key className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Password</span>
              </button>

              {/* User Pill */}
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                theme === 'dark' ? 'bg-slate-800/90 border-slate-700 text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-900'
              }`}>
                <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="max-w-[130px] truncate">{userProfile.email}</span>
              </div>

              {/* Demo Role Switch Shortcut */}
              <button
                onClick={() => {
                  const target = isManager ? DEMO_PROFILES[1] : DEMO_PROFILES[0];
                  handleQuickDemoLogin(target);
                }}
                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border transition-colors hidden lg:block cursor-pointer ${
                  theme === 'dark' ? 'border-slate-700 hover:bg-slate-800 text-slate-200' : 'border-slate-300 hover:bg-slate-100 text-slate-800 shadow-xs'
                }`}
                title="Switch demo role to verify RBAC rules instantly"
              >
                Switch to {isManager ? 'Team' : 'Manager'}
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Role Notice & Sub-bar */}
      <div className={`border-b px-4 py-2 text-xs transition-colors ${
        isManager
          ? (theme === 'dark' ? 'bg-purple-950/40 border-purple-900/60 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-950 font-medium')
          : (theme === 'dark' ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium')
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isManager ? (
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            ) : (
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span>
              {isManager ? (
                <>
                  <strong className="font-bold">Manager Oversight Active:</strong> Viewing full company collections across all sales team members.
                </>
              ) : (
                <>
                  <strong className="font-bold">Team Member View:</strong> Showing only customer accounts assigned to <em>{userProfile.email}</em>.
                </>
              )}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            {isManager && (
              <div className="hidden sm:flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{effectiveOnlineUsers.length} Active Now</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Database:</span>
              <span className={`font-bold ${isLiveSupabase ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {isLiveSupabase ? 'Supabase Live' : 'Local Seed Cache'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* ==================================================================== */}
        {/* KPI SUMMARY CARDS (Clickable Grand Totals for Manager) */}
        {/* ==================================================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Total Expected */}
          <div
            id="kpi-card-total-expected"
            onClick={() => isManager && handleKpiCardClick('ALL')}
            className={`p-5 rounded-2xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white border-slate-300 shadow-xs'
            } ${
              isManager ? 'cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md' : ''
            }`}
            title={isManager ? "Click to view all customer records" : undefined}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isManager ? 'Grand Total Expected' : 'My Total Expected'}
              </span>
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                {formatCurrency(totalExpected)}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                <span>Across {filteredCustomers.length} active clients</span>
                {isManager && selectedStatus === 'ALL' && (
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                    Showing All
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full w-full" />
            </div>
          </div>

          {/* Card 2: Total Received Amount (CLICKABLE IN MANAGER DASHBOARD) */}
          <div
            id="kpi-card-total-received"
            onClick={() => isManager && handleKpiCardClick('received')}
            className={`p-5 rounded-2xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white border-slate-300 shadow-xs'
            } ${
              isManager
                ? 'cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md active:scale-[0.99]'
                : ''
            } ${
              isManager && selectedStatus === 'received'
                ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30'
                : ''
            }`}
            title={isManager ? "Click to filter table to only cleared/received customers" : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                  {isManager ? 'Grand Total Received' : 'My Total Received'}
                </span>
                {isManager && (
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-800/60">
                    Filter ↗
                  </span>
                )}
              </div>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-700 dark:text-emerald-400">
                {formatCurrency(totalReceived)}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
                <span className="font-bold text-emerald-800 dark:text-emerald-400">{recoveryPercent}% Collected</span>
                <span>
                  {isManager && selectedStatus === 'received' ? (
                    <span className="text-emerald-800 dark:text-emerald-300 font-bold underline">
                      Filter Active (Click to reset)
                    </span>
                  ) : (
                    `${filteredCustomers.filter(c => c.is_receipt).length} cleared receipts`
                  )}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(recoveryPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Card 3: Total Balance Pending (CLICKABLE IN MANAGER DASHBOARD) */}
          <div
            id="kpi-card-total-balance"
            onClick={() => isManager && handleKpiCardClick('pending')}
            className={`p-5 rounded-2xl border sm:col-span-2 lg:col-span-1 transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white border-slate-300 shadow-xs'
            } ${
              isManager
                ? 'cursor-pointer hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md active:scale-[0.99]'
                : ''
            } ${
              isManager && selectedStatus === 'pending'
                ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/30 dark:bg-amber-950/30'
                : ''
            }`}
            title={isManager ? "Click to filter table to only pending/unreceived balance customers" : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                  {isManager ? 'Grand Balance Pending' : 'My Balance Pending'}
                </span>
                {isManager && (
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-800/60">
                    Filter ↗
                  </span>
                )}
              </div>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-amber-700 dark:text-amber-400">
                {formatCurrency(totalBalance)}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                <span>Awaiting payment clearance</span>
                {isManager && selectedStatus === 'pending' && (
                  <span className="text-amber-800 dark:text-amber-300 font-bold underline">
                    Filter Active (Click to reset)
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-amber-500 h-1.5 rounded-full w-full" />
            </div>
          </div>

        </section>

        {/* ==================================================================== */}
        {/* MANAGER ONLY: TEAM PERFORMANCE SUMMARY TABLE */}
        {/* ==================================================================== */}
        {isManager && (
          <section className={`rounded-2xl border overflow-hidden transition-all ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white border-slate-300 shadow-xs'
          }`}>
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                    Team Performance Summary Table
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Breakdown of Total Expected vs. Total Collected across all members (including Manager)
                  </p>
                </div>
              </div>

              {selectedRep !== 'ALL' && (
                <button
                  onClick={() => setSelectedRep('ALL')}
                  className="text-xs text-purple-700 dark:text-purple-300 font-bold px-2.5 py-1 rounded-lg border border-purple-300 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors cursor-pointer"
                >
                  Clear Rep Filter
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-800 border-slate-300'
                }`}>
                  <tr>
                    <th className="py-3 px-4">Member / Account</th>
                    <th className="py-3 px-4 text-center">Assigned Clients</th>
                    <th className="py-3 px-4 text-right">Total Expected</th>
                    <th className="py-3 px-4 text-right">Total Collected</th>
                    <th className="py-3 px-4 text-right">Pending Balance</th>
                    <th className="py-3 px-4 text-center">Recovery Progress</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800 text-slate-200' : 'divide-slate-200 text-slate-800'}`}>
                  {teamBreakdown.map((rep) => {
                    const isFiltered = selectedRep === rep.id;
                    const isManagerRow = rep.role === 'manager';
                    const isCurrentUser = rep.id === userProfile.id;
                    const isRepOnline = effectiveOnlineUsers.some((u) => u.id === rep.id || u.email === rep.email);

                    return (
                      <tr
                        key={rep.id}
                        className={`transition-colors ${
                          isFiltered
                            ? (theme === 'dark' ? 'bg-purple-950/30' : 'bg-purple-50')
                            : (theme === 'dark' ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50')
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-950 dark:text-white">
                          <div className="flex items-center space-x-2">
                            {isManagerRow ? (
                              <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                            ) : (
                              <User className="w-4 h-4 text-slate-500 shrink-0" />
                            )}
                            <span className="truncate max-w-[200px]">{rep.email}</span>
                            {isRepOnline && (
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                                <span>Online</span>
                              </span>
                            )}
                            {isManagerRow && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                                Manager {isCurrentUser ? '(You)' : ''}
                              </span>
                            )}
                            {!isManagerRow && isCurrentUser && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                                (You)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                            theme === 'dark' ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}>
                            {rep.count} clients
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-950 dark:text-white">
                          {formatCurrency(rep.expected)}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(rep.received)}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-amber-800 dark:text-amber-400">
                          {formatCurrency(rep.balance)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="w-24 mx-auto">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{rep.percent}%</span>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-1.5 rounded-full"
                                style={{ width: `${Math.min(rep.percent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedRep(isFiltered ? 'ALL' : rep.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                              isFiltered
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : (theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300')
                            }`}
                          >
                            {isFiltered ? 'Viewing' : 'Filter Ledger'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ==================================================================== */}
        {/* CUSTOMERS LEDGER & ACTION TOOLBAR */}
        {/* ==================================================================== */}
        <section
          id="customer-ledger-section"
          className={`rounded-2xl border p-4 sm:p-5 space-y-4 transition-all scroll-mt-20 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white border-slate-300 shadow-xs'
          }`}
        >
          
          {/* Action & Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search client name or remarks..."
                className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm border transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden'
                    : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Category Filter - Supported options: AMC, Solution, Outstanding, Customization */}
              <div className={`flex items-center space-x-1.5 border rounded-xl px-2.5 py-1.5 text-xs ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
              }`}>
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent font-semibold focus:outline-hidden cursor-pointer text-slate-900 dark:text-slate-200"
                >
                  <option value="ALL" className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    All Categories
                  </option>
                  <option value="AMC" className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    AMC
                  </option>
                  <option value="Solution" className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    Solution
                  </option>
                  <option value="Outstanding" className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    Outstanding
                  </option>
                  <option value="Customization" className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    Customization
                  </option>
                </select>
              </div>

              {/* Status Filter */}
              <div className={`flex items-center space-x-1.5 border rounded-xl px-2.5 py-1.5 text-xs ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
              }`}>
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent font-semibold focus:outline-hidden cursor-pointer text-slate-900 dark:text-slate-200"
                >
                  <option value="ALL" className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    All Statuses
                  </option>
                  <option value="received" className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    Receipt Received
                  </option>
                  <option value="pending" className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    Not Received (Pending)
                  </option>
                </select>
              </div>

              {/* Manager Only: Team Member Filter */}
              {isManager && (
                <div className={`flex items-center space-x-1.5 border rounded-xl px-2.5 py-1.5 text-xs ${
                  theme === 'dark'
                    ? 'bg-purple-950/40 border-purple-800/80 text-purple-300'
                    : 'bg-purple-50 border-purple-300 text-purple-950 font-bold shadow-xs'
                }`}>
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  <select
                    value={selectedRep}
                    onChange={(e) => setSelectedRep(e.target.value)}
                    className="bg-transparent font-bold focus:outline-hidden cursor-pointer text-purple-950 dark:text-purple-200"
                  >
                    <option value="ALL" className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                      All Team Members
                    </option>
                    {teamProfiles.map((p) => (
                      <option key={p.id} value={p.id} className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                        {p.email} {p.role === 'manager' ? '(Manager)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Month Filter */}
              <div className={`flex items-center space-x-1.5 border rounded-xl px-2.5 py-1.5 text-xs ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
              }`}>
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent font-semibold focus:outline-hidden cursor-pointer text-slate-900 dark:text-slate-200"
                >
                  <option value="ALL" className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    All Months
                  </option>
                  <option value="2026-09" className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    September 2026
                  </option>
                  <option value="2026-08" className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    August 2026
                  </option>
                  <option value="2026-10" className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    October 2026
                  </option>
                </select>
              </div>

              {/* Export CSV Button */}
              <button
                onClick={exportCSV}
                className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
                }`}
                title="Export current table view to CSV file"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

            </div>

          </div>

          {/* Active Status Badge filter notification */}
          {selectedStatus !== 'ALL' && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-300 dark:border-indigo-800 text-xs">
              <span className="text-indigo-950 dark:text-indigo-300 font-semibold">
                Filtering by: <strong>{selectedStatus === 'received' ? 'Receipt Received (Cleared)' : 'Pending Balances'}</strong> ({filteredCustomers.length} records)
              </span>
              <button
                onClick={() => setSelectedStatus('ALL')}
                className="text-indigo-700 dark:text-indigo-300 hover:underline font-bold text-[11px] cursor-pointer"
              >
                Clear Filter (Show All)
              </button>
            </div>
          )}

          {/* Customer Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-300 dark:border-slate-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                theme === 'dark' ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-800 border-slate-300'
              }`}>
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-3">Category</th>
                  {isManager && <th className="py-3 px-3">Assigned Rep</th>}
                  <th className="py-3 px-3 text-right">Expected</th>
                  <th className="py-3 px-3 text-right">Received</th>
                  <th className="py-3 px-3 text-right">Balance</th>
                  <th className="py-3 px-3 text-center">Due Date</th>
                  <th className="py-3 px-3 text-center">Receipt Status</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800 text-slate-200' : 'divide-slate-200 text-slate-800'}`}>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={isManager ? 10 : 9} className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs font-medium">
                      No customer payment records match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => {
                    const balance = Math.max(0, Number(c.expected_amount) - Number(c.received_amount));
                    return (
                      <tr
                        key={c.id}
                        className={`transition-colors ${theme === 'dark' ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}
                      >
                        {/* Customer Name */}
                        <td className="py-3 px-4 font-bold text-slate-950 dark:text-white">
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>{c.customer_name}</span>
                          </div>
                        </td>

                        {/* Category Badge (Supports AMC, Solution, Outstanding, Customization) */}
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            c.category === 'AMC'
                              ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-900'
                              : c.category === 'Solution'
                              ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-900'
                              : c.category === 'Customization'
                              ? 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-900'
                              : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-900'
                          }`}>
                            {c.category}
                          </span>
                        </td>

                        {/* Assigned Rep (Manager Only) */}
                        {isManager && (
                          <td className="py-3 px-3 text-xs text-slate-800 dark:text-slate-300 font-semibold">
                            <div className="flex items-center space-x-1.5">
                              <User className="w-3.5 h-3.5 text-slate-500" />
                              <span className="truncate max-w-[130px]">{getRepEmail(c.assigned_to)}</span>
                            </div>
                          </td>
                        )}

                        {/* Expected Amount */}
                        <td className="py-3 px-3 text-right font-bold text-slate-950 dark:text-white">
                          {formatCurrency(c.expected_amount)}
                        </td>

                        {/* Received Amount */}
                        <td className="py-3 px-3 text-right font-black text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(c.received_amount)}
                        </td>

                        {/* Balance */}
                        <td className="py-3 px-3 text-right font-black text-amber-800 dark:text-amber-400">
                          {formatCurrency(balance)}
                        </td>

                        {/* Expected Date */}
                        <td className="py-3 px-3 text-center text-xs text-slate-800 dark:text-slate-300 font-mono font-medium">
                          {c.expected_date}
                        </td>

                        {/* Inline Receipt Toggle */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleReceipt(c)}
                            title="Click to toggle Receipt status"
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                              c.is_receipt
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 shadow-xs'
                                : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {c.is_receipt ? <Check className="w-3 h-3 text-emerald-700 dark:text-emerald-400" /> : <Clock className="w-3 h-3 text-slate-500" />}
                            <span>{c.is_receipt ? 'Receipt Received' : 'Not Received'}</span>
                          </button>
                        </td>

                        {/* Remarks */}
                        <td className="py-3 px-4 text-xs text-slate-700 dark:text-slate-300 font-medium max-w-[180px] truncate" title={c.remarks}>
                          {c.remarks || '—'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => setEditCustomer(c)}
                              className="p-1.5 rounded-lg text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit amount, remarks, or receipt status"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(c.id, c.customer_name)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Delete customer record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ==================================================================== */}
      {/* 9. MODALS: ADD CUSTOMER, EDIT RECORD, CHANGE PASSWORD */}
      {/* ==================================================================== */}

      {/* MODAL 1: ADD NEW CUSTOMER (Includes "Customization" option) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className={`max-w-lg w-full rounded-2xl border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-950 dark:text-white">
                {isManager ? 'Add New Client & Assign Member' : 'Add New Customer Account'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveCustomer({
                  customer_name: formData.get('customer_name'),
                  category: formData.get('category'),
                  expected_amount: formData.get('expected_amount'),
                  received_amount: formData.get('received_amount'),
                  expected_date: formData.get('expected_date'),
                  is_receipt: formData.get('is_receipt') === 'on',
                  remarks: formData.get('remarks'),
                  assigned_to: formData.get('assigned_to') || userProfile.id,
                });
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">Customer / Organization Name</label>
                <input
                  name="customer_name"
                  type="text"
                  required
                  placeholder="e.g. Acme Industrial Technologies"
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">Category Type</label>
                  <select
                    name="category"
                    defaultValue="AMC"
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
                    }`}
                  >
                    <option value="AMC">AMC</option>
                    <option value="Solution">Solution</option>
                    <option value="Outstanding">Outstanding</option>
                    <option value="Customization">Customization</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">Expected Payment Date</label>
                  <input
                    name="expected_date"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">Total Expected Amount (₹)</label>
                  <input
                    name="expected_amount"
                    type="number"
                    min="0"
                    required
                    placeholder="150000"
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">Initial Received Amount (₹)</label>
                  <input
                    name="received_amount"
                    type="number"
                    min="0"
                    defaultValue="0"
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
                    }`}
                  />
                </div>
              </div>

              {/* Manager: Member Assignment Dropdown (Includes All Profiles & Manager) */}
              {isManager && (
                <div>
                  <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">Assign To Team Member / Account</label>
                  <select
                    name="assigned_to"
                    defaultValue={userProfile.id}
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
                    }`}
                  >
                    {teamProfiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.email} {p.role === 'manager' ? '(Manager)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">Remarks & Notes</label>
                <textarea
                  name="remarks"
                  rows={2}
                  placeholder="e.g. Cheque due on 15th, awaiting client director approval"
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500'
                  }`}
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  name="is_receipt"
                  type="checkbox"
                  id="add_receipt_status"
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="add_receipt_status" className="font-semibold text-slate-900 dark:text-slate-100 cursor-pointer">
                  Payment Receipt already received and verified (Triggers Thumbs Up celebration)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-3 py-2 rounded-xl font-bold border cursor-pointer ${
                    theme === 'dark' ? 'border-slate-800 text-slate-200 hover:bg-slate-800' : 'border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Create Customer Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CUSTOMER / IN-LINE UPDATER (Includes "Customization" option) */}
      {editCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className={`max-w-lg w-full rounded-2xl border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-950 dark:text-white">Update Payment Record</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{editCustomer.customer_name}</p>
              </div>
              <button onClick={() => setEditCustomer(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveCustomer({
                  customer_name: formData.get('customer_name'),
                  category: formData.get('category'),
                  expected_amount: formData.get('expected_amount'),
                  received_amount: formData.get('received_amount'),
                  expected_date: formData.get('expected_date'),
                  is_receipt: formData.get('is_receipt') === 'on',
                  remarks: formData.get('remarks'),
                  assigned_to: formData.get('assigned_to') || editCustomer.assigned_to,
                });
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">Customer Name</label>
                <input
                  name="customer_name"
                  type="text"
                  required
                  defaultValue={editCustomer.customer_name}
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editCustomer.category}
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
                    }`}
                  >
                    <option value="AMC">AMC</option>
                    <option value="Solution">Solution</option>
                    <option value="Outstanding">Outstanding</option>
                    <option value="Customization">Customization</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">Expected Date</label>
                  <input
                    name="expected_date"
                    type="date"
                    required
                    defaultValue={editCustomer.expected_date}
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">Expected Amount (₹)</label>
                  <input
                    name="expected_amount"
                    type="number"
                    min="0"
                    required
                    id="edit_expected_amount"
                    defaultValue={editCustomer.expected_amount}
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-900 dark:text-slate-100">Received Amount (₹)</label>
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('edit_received_amount');
                        const exp = document.getElementById('edit_expected_amount');
                        const chk = document.getElementById('edit_is_receipt');
                        if (input && exp) {
                          input.value = exp.value;
                        }
                        if (chk) {
                          chk.checked = true;
                        }
                      }}
                      className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      100% Paid
                    </button>
                  </div>
                  <input
                    name="received_amount"
                    type="number"
                    min="0"
                    id="edit_received_amount"
                    defaultValue={editCustomer.received_amount}
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
                    }`}
                  />
                </div>
              </div>

              {/* Manager: Reassign Dropdown (Includes All Profiles & Manager) */}
              {isManager && (
                <div>
                  <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">Assigned Representative / Account</label>
                  <select
                    name="assigned_to"
                    defaultValue={editCustomer.assigned_to}
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
                    }`}
                  >
                    {teamProfiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.email} {p.role === 'manager' ? '(Manager)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">Remarks & Status Notes</label>
                <textarea
                  name="remarks"
                  rows={2}
                  defaultValue={editCustomer.remarks}
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
                  }`}
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  name="is_receipt"
                  type="checkbox"
                  id="edit_is_receipt"
                  defaultChecked={editCustomer.is_receipt}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="edit_is_receipt" className="font-semibold text-slate-900 dark:text-slate-100 cursor-pointer">
                  Receipt Received (Funds Confirmed) 👍
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditCustomer(null)}
                  className={`px-3 py-2 rounded-xl font-bold border cursor-pointer ${
                    theme === 'dark' ? 'border-slate-800 text-slate-200 hover:bg-slate-800' : 'border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CHANGE PASSWORD */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className={`max-w-md w-full rounded-2xl border p-6 shadow-2xl space-y-4 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-950 dark:text-white">Change Password</h3>
              </div>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const p1 = formData.get('new_password');
                const p2 = formData.get('confirm_password');
                if (p1 !== p2) {
                  showToast('Passwords do not match.', 'error');
                  return;
                }
                if (p1.length < 6) {
                  showToast('Password must be at least 6 characters.', 'error');
                  return;
                }
                handleChangePassword(p1);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">New Password</label>
                <input
                  name="new_password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">Confirm New Password</label>
                <input
                  name="confirm_password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className={`px-3 py-2 rounded-xl font-bold border cursor-pointer ${
                    theme === 'dark' ? 'border-slate-800 text-slate-200 hover:bg-slate-800' : 'border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
