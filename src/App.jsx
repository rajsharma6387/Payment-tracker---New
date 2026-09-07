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
  ExternalLink,
  MessageSquare,
  CalendarCheck,
  UserCheck
} from 'lucide-react';

import {
  CATEGORIES,
  DEMO_PROFILES,
  INITIAL_CUSTOMERS,
  formatCurrency,
  getCategoryBadgeStyle,
  formatEmailPrefix,
  getDisplayName,
} from './constants';

import TeamChatModal from './components/TeamChatModal';
import DateBreakdownWidget from './components/DateBreakdownWidget';
import CustomerRecordModal from './components/CustomerRecordModal';

// ============================================================================
// 1. SUPABASE CLIENT CONFIGURATION
// ============================================================================
const SUPABASE_URL = "https://wqobylynejifeqlfknda.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxb2J5bHluZWppZmVxbGZrbmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1OTczMTUsImV4cCI6MjEwNDE3MzMxNX0.PWcUCK-FzkAok6esDCxb3tf-ozfHvxku6MVM5WvfRGE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  // Theme state
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
  const [authFullName, setAuthFullName] = useState('');
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
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  // Modals & UI Actions
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
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
  // AUTHENTICATION & INITIALIZATION
  // ============================================================================
  useEffect(() => {
    // Clear any obsolete demo bypass entries from previous sessions
    localStorage.removeItem('fincollect_active_user');

    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setSessionUser(session.user);
          await fetchProfile(session.user.id, session.user.email || '');
        } else {
          setSessionUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.warn('Session check warning:', err);
        setSessionUser(null);
        setUserProfile(null);
      } finally {
        setLoadingSession(false);
      }
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSessionUser(session.user);
        await fetchProfile(session.user.id, session.user.email || '');
      } else {
        setSessionUser(null);
        setUserProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId, email) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setUserProfile(data);
        setIsLiveSupabase(true);
      } else {
        const newProfile = {
          id: userId,
          email: email,
          role: 'team', // All self-registered users are assigned 'team' by default
          full_name: null,
        };
        const { error: insertErr } = await supabase.from('profiles').insert(newProfile);
        if (!insertErr) {
          setUserProfile(newProfile);
          setIsLiveSupabase(true);
        } else {
          setUserProfile({ id: userId, email, role: 'team', full_name: null });
        }
      }
    } catch (err) {
      console.warn('Profile lookup note:', err);
      setUserProfile({ id: userId, email, role: 'team', full_name: null });
    }
  };

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
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });

        if (error) throw error;
        if (data.user) {
          const profileEntry = {
            id: data.user.id,
            email: authEmail,
            role: 'team', // Enforced default: Team Member only
            full_name: authFullName.trim() || null,
          };
          await supabase.from('profiles').upsert(profileEntry);
          setSessionUser(data.user);
          setUserProfile(profileEntry);
          setIsLiveSupabase(true);
          showToast('Account registered successfully as Team Member!', 'success');
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed.');
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdateProfile = async (newFullName) => {
    if (!userProfile) return;
    setProfileSaving(true);
    const trimmed = (newFullName || '').trim();

    try {
      if (isLiveSupabase) {
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: trimmed || null })
          .eq('id', userProfile.id);

        if (error) throw error;
      }

      const updatedProfile = {
        ...userProfile,
        full_name: trimmed || null,
      };

      setUserProfile(updatedProfile);
      setTeamProfiles((prev) =>
        prev.map((p) => (p.id === userProfile.id ? { ...p, full_name: trimmed || null } : p))
      );

      // Re-track presence so active colleagues see updated display name
      const channel = supabase.channel('online-users');
      try {
        await channel.track({
          id: updatedProfile.id,
          email: updatedProfile.email,
          role: updatedProfile.role,
          full_name: updatedProfile.full_name || null,
          online_at: new Date().toISOString(),
        });
      } catch {
        // ignore
      }

      setIsProfileModalOpen(false);
      showToast('Profile display name updated successfully in Supabase!', 'success');
    } catch (err) {
      console.error('Update profile error:', err);
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

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
  // DATA LOADING & SYNCHRONIZATION
  // ============================================================================
  const loadData = async () => {
    if (!userProfile) return;
    setDataLoading(true);

    try {
      const { data: profilesData } = await supabase.from('profiles').select('*');
      if (profilesData && profilesData.length > 0) {
        setTeamProfiles(profilesData);
      } else {
        setTeamProfiles(DEMO_PROFILES);
      }

      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .order('expected_date', { ascending: true });

      if (customerData && customerData.length > 0) {
        setCustomers(customerData);
        setIsLiveSupabase(true);
      } else {
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
      .on('presence', { event: 'sync' }, updatePresenceState)
      .on('presence', { event: 'join' }, updatePresenceState)
      .on('presence', { event: 'leave' }, updatePresenceState)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            await channel.track({
              id: userProfile.id,
              email: userProfile.email,
              role: userProfile.role,
              full_name: userProfile.full_name || null,
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
      } catch {
        // ignore
      }
    };
  }, [userProfile?.id, userProfile?.email, userProfile?.role, userProfile?.full_name]);

  const effectiveOnlineUsers = useMemo(() => {
    const list = [...onlineUsers];
    if (userProfile) {
      const exists = list.some((u) => u.id === userProfile.id || u.email === userProfile.email);
      if (!exists) {
        list.unshift({
          id: userProfile.id,
          email: userProfile.email,
          role: userProfile.role,
          full_name: userProfile.full_name || null,
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
  // CUSTOMER RECORD ACTIONS & AUTOMATIONS
  // ============================================================================
  const handleToggleReceipt = async (customer) => {
    const nextReceipt = !customer.is_receipt;
    const totalExp = Number(customer.expected_amount) || 0;
    const currentRec = Number(customer.received_amount) || 0;
    
    // When marking receipt as received, auto-fill received amount to match expected invoice
    const nextRec = nextReceipt && currentRec < totalExp ? totalExp : customer.received_amount;
    const nextRemarks = nextReceipt && (currentRec === 0 || !customer.remarks)
      ? "Received successfully"
      : customer.remarks;

    try {
      if (isLiveSupabase) {
        await supabase
          .from('customers')
          .update({
            is_receipt: nextReceipt,
            received_amount: nextRec,
            remarks: nextRemarks,
          })
          .eq('id', customer.id);
      }

      const updated = customers.map((c) =>
        c.id === customer.id
          ? { ...c, is_receipt: nextReceipt, received_amount: nextRec, remarks: nextRemarks }
          : c
      );
      updateLocalCustomers(updated);

      if (nextReceipt) {
        triggerCelebration(customer.customer_name, nextRec || totalExp);
        showToast(`Receipt received for ${customer.customer_name}! 👍`, 'success');
      } else {
        showToast(`Receipt marked as Pending`, 'info');
      }
    } catch (err) {
      showToast(`Update error: ${err.message}`, 'error');
    }
  };

  // Save Customer Changes (Add / Edit) with Mandatory Field & Exceeding Validation
  const handleSaveCustomer = async (recordData) => {
    try {
      const isEditing = Boolean(editCustomer);
      const assignedToId =
        userProfile?.role === 'manager'
          ? recordData.assigned_to
          : userProfile?.id;

      const payload = {
        customer_name: recordData.customer_name,
        category: recordData.category,
        expected_amount: Number(recordData.expected_amount) || 0,
        received_amount: Number(recordData.received_amount) || 0,
        expected_date: recordData.expected_date,
        is_receipt: Boolean(recordData.is_receipt),
        remarks: recordData.remarks || '',
        assigned_to: assignedToId,
      };

      if (isEditing) {
        if (isLiveSupabase) {
          await supabase
            .from('customers')
            .update(payload)
            .eq('id', editCustomer.id);
        }
        const updated = customers.map((c) =>
          c.id === editCustomer.id ? { ...c, ...payload } : c
        );
        updateLocalCustomers(updated);

        if (payload.is_receipt && !editCustomer.is_receipt) {
          triggerCelebration(payload.customer_name, payload.received_amount);
        }

        setEditCustomer(null);
        showToast(`Customer "${payload.customer_name}" updated successfully!`, 'success');
      } else {
        if (isLiveSupabase) {
          const { data, error } = await supabase
            .from('customers')
            .insert({ ...payload, created_at: new Date().toISOString() })
            .select()
            .single();

          if (error) throw error;
          if (data) {
            updateLocalCustomers([data, ...customers]);
          }
        } else {
          const localNew = {
            ...payload,
            id: Date.now(),
            created_at: new Date().toISOString(),
          };
          updateLocalCustomers([localNew, ...customers]);
        }

        if (payload.is_receipt) {
          triggerCelebration(payload.customer_name, payload.received_amount);
        }

        setIsAddModalOpen(false);
        showToast(`New client "${payload.customer_name}" registered!`, 'success');
      }
    } catch (err) {
      showToast(`Action failed: ${err.message}`, 'error');
    }
  };

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
  // ROLE-BASED SCOPING & METRICS
  // ============================================================================
  const isManager = userProfile?.role === 'manager';

  const roleScopedCustomers = useMemo(() => {
    if (!userProfile) return [];
    if (isManager) {
      return customers;
    }
    return customers.filter((c) => c.assigned_to === userProfile.id);
  }, [customers, userProfile, isManager]);

  const filteredCustomers = useMemo(() => {
    let list = [...roleScopedCustomers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.customer_name?.toLowerCase().includes(q) ||
          c.remarks?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'ALL') {
      list = list.filter((c) => c.category === selectedCategory);
    }

    if (selectedStatus === 'received') {
      list = list.filter((c) => c.is_receipt);
    } else if (selectedStatus === 'pending') {
      list = list.filter((c) => !c.is_receipt);
    }

    if (isManager && selectedRep !== 'ALL') {
      list = list.filter((c) => c.assigned_to === selectedRep);
    }

    if (selectedMonth !== 'ALL') {
      list = list.filter((c) => c.expected_date?.startsWith(selectedMonth));
    }

    if (selectedDateFilter) {
      list = list.filter((c) => c.expected_date === selectedDateFilter);
    }

    return list;
  }, [roleScopedCustomers, searchQuery, selectedCategory, selectedStatus, selectedRep, selectedMonth, selectedDateFilter, isManager]);

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

  const getRepDisplayName = (assignedId) => {
    const p = teamProfiles.find((t) => t.id === assignedId);
    if (p) return getDisplayName(p);
    return assignedId ? assignedId.slice(0, 8) + '...' : 'Unassigned';
  };

  const getRepEmail = (assignedId) => {
    const p = teamProfiles.find((t) => t.id === assignedId);
    return p?.email || (assignedId ? assignedId.slice(0, 8) + '...' : 'Unassigned');
  };

  const teamBreakdown = useMemo(() => {
    if (!isManager) return [];
    const repMap = new Map();

    teamProfiles.forEach((p) => {
      repMap.set(p.id, {
        email: p.email,
        full_name: p.full_name || null,
        role: p.role,
        expected: 0,
        received: 0,
        count: 0
      });
    });

    customers.forEach((c) => {
      if (c.assigned_to && !repMap.has(c.assigned_to)) {
        const found = teamProfiles.find((t) => t.id === c.assigned_to);
        repMap.set(c.assigned_to, {
          email: getRepEmail(c.assigned_to),
          full_name: found?.full_name || null,
          role: 'team',
          expected: 0,
          received: 0,
          count: 0,
        });
      }
    });

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
      full_name: data.full_name,
      role: data.role,
      count: data.count,
      expected: data.expected,
      received: data.received,
      balance: Math.max(0, data.expected - data.received),
      percent: data.expected > 0 ? Math.round((data.received / data.expected) * 100) : 0,
    }));
  }, [customers, teamProfiles, isManager]);

  const handleKpiCardClick = (targetStatus) => {
    if (!isManager) return;
    setSelectedStatus((prev) => (prev === targetStatus ? 'ALL' : targetStatus));
    const ledgerElem = document.getElementById('customer-ledger-section');
    if (ledgerElem) {
      ledgerElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
  // AUTHENTICATION FIRST ROUTING (LOGIN / SIGNUP SCREEN)
  // ============================================================================
  if (!userProfile) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 transition-colors ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
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

          <div className={`p-6 sm:p-7 rounded-2xl border transition-all ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800 shadow-2xl'
              : 'bg-white border-slate-300 shadow-xl'
          }`}>
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

              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Full Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      placeholder="e.g. Rajesh Sharma"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm border transition-colors ${
                        theme === 'dark'
                          ? 'bg-slate-950 border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden'
                          : 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-hidden'
                      }`}
                    />
                  </div>
                </div>
              )}

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
                    Assigned Account Role
                  </label>
                  <div
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl border text-xs transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                        : 'bg-slate-50 border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-white">Role: Team Member</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Default
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Access restricted to assigned clients. Manager oversight can only be granted by existing administrators.
                      </p>
                    </div>
                  </div>
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
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN DASHBOARD INTERFACE
  // ============================================================================
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* CELEBRATION POPUP BANNER (Thumbs Up 👍 / Well Done!) */}
      {celebrationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-200">
          <div className={`max-w-md w-full rounded-2xl border p-6 text-center shadow-2xl relative overflow-hidden ${
            theme === 'dark' ? 'bg-slate-900 border-emerald-600/80 text-white' : 'bg-white border-emerald-400 text-slate-950 shadow-emerald-500/10'
          }`}>
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 border-2 border-emerald-400 dark:border-emerald-600 mx-auto flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-3xl shadow-lg shadow-emerald-500/20 mb-3 animate-bounce">
              👍
            </div>
            
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>PAYMENT RECEIVED & VERIFIED</span>
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white mt-1">
              Well Done!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 font-medium">
              Funds confirmed for <strong className="text-slate-950 dark:text-white font-bold">{celebrationData.customerName}</strong>!
            </p>

            <div className="my-4 py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-black text-lg">
              {formatCurrency(celebrationData.amount)} Credited
            </div>

            <button
              onClick={() => setCelebrationData(null)}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
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

            {/* Actions & Header Tools */}
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              
              {/* Add Customer Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{isManager ? 'Add & Assign Client' : 'Add New Customer'}</span>
                <span className="sm:hidden">Add</span>
              </button>

              {/* Online Team Members Badge & Popover */}
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
                  <span className="hidden md:inline">
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

                    <div className="mt-2.5 space-y-2 max-h-56 overflow-y-auto">
                      {effectiveOnlineUsers.map((u, idx) => {
                        const isSelf = u.id === userProfile.id || u.email === userProfile.email;
                        const displayName = getDisplayName(u);
                        const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

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
                                  {initial}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-slate-900"></span>
                              </div>
                              <div className="truncate">
                                <p className="font-bold truncate text-slate-900 dark:text-white">
                                  {displayName}
                                </p>
                                <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate">
                                  {u.email} • {u.role === 'manager' ? 'Manager' : 'Team Member'} {isSelf && '• You'}
                                </p>
                              </div>
                            </div>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 shrink-0 ml-2 border border-emerald-300 dark:border-emerald-800">
                              Active
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Button to open Team Chat from dropdown */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setIsPresenceOpen(false);
                          setIsChatOpen(true);
                        }}
                        className="w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Open Live Team Chat</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* LIVE TEAM CHAT BUTTON (Feature 1) */}
              <button
                onClick={() => setIsChatOpen(true)}
                title="Live Team Chat with online members"
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-indigo-300 hover:text-white hover:border-indigo-500'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-950 hover:bg-indigo-100 shadow-xs'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">Live Team Chat</span>
              </button>

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

              {/* Edit Profile Modal Trigger */}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                title="Edit Profile & Display Name"
                className={`hidden md:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white'
                    : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200 shadow-xs'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Edit Profile</span>
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

              {/* Authenticated User Pill with Static Role & Clickable Profile Edit */}
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                title={`Logged in as ${userProfile.email}. Click to edit profile.`}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer text-left ${
                  theme === 'dark'
                    ? 'bg-slate-800/90 border-slate-700 text-slate-100 hover:bg-slate-800 hover:border-slate-600'
                    : 'bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200'
                }`}
              >
                {isManager ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                ) : (
                  <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
                <span className="max-w-[130px] truncate font-bold">{getDisplayName(userProfile)}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isManager
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                }`}>
                  {isManager ? 'Manager' : 'Team'}
                </span>
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
                  <strong className="font-bold">Team Member View:</strong> Showing only customer accounts assigned to <em>{userProfile.full_name ? `${userProfile.full_name} (${userProfile.email})` : (getDisplayName(userProfile) || userProfile.email)}</em>.
                </>
              )}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
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

          {/* Card 2: Total Received */}
          <div
            id="kpi-card-total-received"
            onClick={() => isManager && handleKpiCardClick('received')}
            className={`p-5 rounded-2xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white border-slate-300 shadow-xs'
            } ${
              isManager ? 'cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md' : ''
            }`}
            title={isManager ? "Click to filter ledger by Cleared Payments" : undefined}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isManager ? 'Grand Total Received' : 'My Total Received'}
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-700 dark:text-emerald-400">
                {formatCurrency(totalReceived)}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                <span>{recoveryPercent}% Collected Recovery</span>
                {isManager && selectedStatus === 'received' && (
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold underline">
                    Filter Active (Click to reset)
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(recoveryPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Card 3: Grand Balance Pending */}
          <div
            id="kpi-card-total-pending"
            onClick={() => isManager && handleKpiCardClick('pending')}
            className={`p-5 rounded-2xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white border-slate-300 shadow-xs'
            } ${
              isManager ? 'cursor-pointer hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md' : ''
            }`}
            title={isManager ? "Click to filter ledger by Pending Balances" : undefined}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isManager ? 'Grand Balance Pending' : 'My Balance Pending'}
              </span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-amber-800 dark:text-amber-400">
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
                            <div className="truncate max-w-[200px]">
                              <span className="font-bold text-slate-900 dark:text-white block truncate">
                                {getDisplayName(rep)}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate font-normal">
                                {rep.email}
                              </span>
                            </div>
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
        {/* EXPECTED DATE BREAKDOWN DUAL BAR CHART & TABLE WIDGET */}
        {/* ==================================================================== */}
        <DateBreakdownWidget
          customers={roleScopedCustomers}
          isManager={isManager}
          userProfile={userProfile}
          theme={theme}
          onSelectDateFilter={(dateStr) => {
            setSelectedDateFilter(dateStr);
            if (dateStr) {
              const el = document.getElementById('customer-ledger-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }}
          selectedDateFilter={selectedDateFilter}
        />

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
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, notes..."
                className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm border transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500'
                    : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 shadow-xs'
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

            {/* Filter Dropdowns (Includes Tally, TSS, Other, AMC, Solution, Outstanding, Customization) */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Category Filter */}
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
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                      {cat}
                    </option>
                  ))}
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

              {/* Manager: Rep Filter */}
              {isManager && (
                <div className={`flex items-center space-x-1.5 border rounded-xl px-2.5 py-1.5 text-xs ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                }`}>
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={selectedRep}
                    onChange={(e) => setSelectedRep(e.target.value)}
                    className="bg-transparent font-semibold focus:outline-hidden cursor-pointer text-slate-900 dark:text-slate-200 max-w-[140px] truncate"
                  >
                    <option value="ALL" className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                      All Representatives
                    </option>
                    {teamProfiles.map((p) => (
                      <option key={p.id} value={p.id} className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                        {getDisplayName(p)} ({p.email}) {p.role === 'manager' ? '• Manager' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Active Date Filter Chip if selected from widget */}
              {selectedDateFilter && (
                <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-300 text-xs font-bold">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Date: {selectedDateFilter}</span>
                  <button
                    onClick={() => setSelectedDateFilter('')}
                    className="text-indigo-600 hover:text-indigo-900 dark:hover:text-white ml-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* CSV Export Button */}
              <button
                onClick={exportCSV}
                title="Export current view to CSV"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-200'
                    : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800 shadow-xs'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* Customer Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                theme === 'dark' ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-800 border-slate-300'
              }`}>
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-4 text-right">Total Expected</th>
                  <th className="py-3 px-4 text-right">Received</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 px-3 text-center">Expected Date</th>
                  <th className="py-3 px-3 text-center">Receipt Status</th>
                  <th className="py-3 px-4">Remarks & Notes</th>
                  {isManager && <th className="py-3 px-3">Assigned Rep</th>}
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800 text-slate-200' : 'divide-slate-200 text-slate-800'}`}>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={isManager ? 10 : 9} className="py-8 text-center text-slate-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="font-bold text-slate-800 dark:text-slate-300">No customer records match your filter criteria.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('ALL');
                          setSelectedStatus('ALL');
                          setSelectedRep('ALL');
                          setSelectedDateFilter('');
                        }}
                        className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => {
                    const expected = Number(customer.expected_amount) || 0;
                    const received = Number(customer.received_amount) || 0;
                    const balance = Math.max(0, expected - received);
                    const isDark = theme === 'dark';

                    return (
                      <tr
                        key={customer.id}
                        className={`transition-colors ${
                          customer.is_receipt
                            ? (isDark ? 'hover:bg-emerald-950/20' : 'hover:bg-emerald-50/50')
                            : (isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80')
                        }`}
                      >
                        {/* Customer Name */}
                        <td className="py-3 px-4 font-bold text-slate-950 dark:text-white">
                          <div className="flex items-center space-x-2">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[200px]">{customer.customer_name}</span>
                          </div>
                        </td>

                        {/* Category Badge */}
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] border font-bold ${getCategoryBadgeStyle(customer.category, isDark)}`}>
                            {customer.category}
                          </span>
                        </td>

                        {/* Total Expected */}
                        <td className="py-3 px-4 text-right font-bold text-slate-950 dark:text-white">
                          {formatCurrency(expected)}
                        </td>

                        {/* Received Amount */}
                        <td className="py-3 px-4 text-right font-black text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(received)}
                        </td>

                        {/* Balance Amount */}
                        <td className="py-3 px-4 text-right font-black text-amber-800 dark:text-amber-400">
                          {formatCurrency(balance)}
                        </td>

                        {/* Expected Date */}
                        <td className="py-3 px-3 text-center whitespace-nowrap text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center justify-center space-x-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>{customer.expected_date}</span>
                          </div>
                        </td>

                        {/* Receipt Status Toggle Button */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleReceipt(customer)}
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                              customer.is_receipt
                                ? 'bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-900 hover:border-amber-300'
                            }`}
                            title="Click to toggle Receipt Confirmation and celebrate"
                          >
                            {customer.is_receipt ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Receipt Received</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                <span>Pending</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Remarks */}
                        <td className="py-3 px-4 text-xs max-w-[200px] truncate text-slate-700 dark:text-slate-300 font-medium" title={customer.remarks}>
                          {customer.remarks || <span className="text-slate-400 italic">None</span>}
                        </td>

                        {/* Manager: Assigned Rep */}
                        {isManager && (
                          <td className="py-3 px-3 text-xs text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                            <div className="font-bold text-slate-900 dark:text-white truncate">
                              {getRepDisplayName(customer.assigned_to)}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-normal">
                              {getRepEmail(customer.assigned_to)}
                            </div>
                          </td>
                        )}

                        {/* Actions */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => setEditCustomer(customer)}
                              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                              title="Edit Record"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(customer.id, customer.customer_name)}
                              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* Ledger Summary Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 gap-2">
            <span>
              Showing <strong className="font-bold text-slate-900 dark:text-white">{filteredCustomers.length}</strong> of {roleScopedCustomers.length} records
            </span>
            <div className="flex items-center space-x-4">
              <span>Expected: <strong className="font-bold text-slate-900 dark:text-white">{formatCurrency(totalExpected)}</strong></span>
              <span>Received: <strong className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(totalReceived)}</strong></span>
              <span>Pending: <strong className="font-bold text-amber-800 dark:text-amber-400">{formatCurrency(totalBalance)}</strong></span>
            </div>
          </div>

        </section>

      </main>

      {/* ==================================================================== */}
      {/* MODALS */}
      {/* ==================================================================== */}

      {/* MODAL 1: ADD NEW CUSTOMER RECORD */}
      <CustomerRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveCustomer}
        initialData={null}
        isManager={isManager}
        teamProfiles={teamProfiles}
        currentUserId={userProfile?.id}
        theme={theme}
      />

      {/* MODAL 2: UPDATE CUSTOMER PAYMENT RECORD */}
      <CustomerRecordModal
        isOpen={Boolean(editCustomer)}
        onClose={() => setEditCustomer(null)}
        onSave={handleSaveCustomer}
        initialData={editCustomer}
        isManager={isManager}
        teamProfiles={teamProfiles}
        currentUserId={userProfile?.id}
        theme={theme}
      />

      {/* MODAL 3: LIVE TEAM CHAT MODAL (Feature 1) */}
      <TeamChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        supabase={supabase}
        userProfile={userProfile}
        effectiveOnlineUsers={effectiveOnlineUsers}
        theme={theme}
      />

      {/* MODAL 4: CHANGE PASSWORD */}
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
                if (!p1 || p1.length < 6) {
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

      {/* ==================================================================== */}
      {/* MODAL: EDIT PROFILE / USER ACCOUNT */}
      {/* ==================================================================== */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className={`max-w-md w-full rounded-2xl border p-6 shadow-2xl space-y-4 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white shadow-slate-950/80' : 'bg-white border-slate-300 text-slate-950 shadow-xl'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-950 dark:text-white">Edit Profile</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Manage your display name & profile identity</p>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newName = formData.get('full_name')?.toString() || '';
                await handleUpdateProfile(newName);
              }}
              className="space-y-4 text-xs"
            >
              {/* Account Email (Read-Only) */}
              <div>
                <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={userProfile?.email || ''}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs sm:text-sm opacity-70 cursor-not-allowed ${
                      theme === 'dark' ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-600'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Supabase Auth identity. Used for login authentication and account recovery.
                </p>
              </div>

              {/* Assigned Role Badge */}
              <div>
                <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Assigned Security Role
                </label>
                <div className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl border ${
                  theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-300'
                }`}>
                  {isManager ? (
                    <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  ) : (
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {isManager ? 'Manager (Full Company Oversight)' : 'Team Member (Assigned Client Scope)'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ml-auto ${
                    isManager
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  }`}>
                    {isManager ? 'Manager' : 'Team'}
                  </span>
                </div>
              </div>

              {/* Full Name / Display Name Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-900 dark:text-slate-100">
                    Full Name / Display Name
                  </label>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    profiles.full_name
                  </span>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    name="full_name"
                    type="text"
                    defaultValue={userProfile?.full_name || ''}
                    placeholder={formatEmailPrefix(userProfile?.email) || 'e.g. Rajesh Sharma'}
                    autoFocus
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden'
                        : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-hidden'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-normal">
                  Displayed across tables, client cards, reports, online team badges, and live team chat. If left empty, your email prefix (<span className="font-semibold text-slate-700 dark:text-slate-300">{formatEmailPrefix(userProfile?.email)}</span>) is used automatically.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className={`px-3 py-2 rounded-xl font-bold border cursor-pointer transition-colors ${
                    theme === 'dark' ? 'border-slate-800 text-slate-200 hover:bg-slate-800' : 'border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  {profileSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
