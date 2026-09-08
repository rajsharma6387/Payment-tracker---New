import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Table as TableIcon,
  Filter,
  ArrowRight,
  ShieldCheck,
  User,
  CalendarCheck,
  ChevronRight,
  Check,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { formatCurrency, getCategoryBadgeStyle, getDisplayName, cleanAmount } from '../constants';

export default function DateBreakdownWidget({
  customers = [],
  isManager = false,
  userProfile,
  theme = 'light',
  onSelectDateFilter,
  selectedDateFilter
}) {
  // View Switcher state: 'chart' (default) | 'table'
  const [viewMode, setViewMode] = useState('chart');
  // Chart layout style: 'dual' (side-by-side) | 'stacked'
  const [chartLayout, setChartLayout] = useState('dual');
  // Local active hover/click state for quick preview
  const [activeDateKey, setActiveDateKey] = useState(null);

  // Compute date-wise grouping
  const dateGroups = useMemo(() => {
    const map = {};
    const todayStr = new Date().toISOString().slice(0, 10);

    customers.forEach((c) => {
      const dateKey = c.expected_date || 'No Date';
      if (!map[dateKey]) {
        map[dateKey] = {
          date: dateKey,
          expected: 0,
          received: 0,
          balance: 0,
          count: 0,
          clients: [],
          allCleared: true,
        };
      }

      const exp = cleanAmount(c.expected_amount);
      const rec = cleanAmount(c.received_amount);
      const bal = Math.max(0, cleanAmount(exp - rec));

      map[dateKey].expected = Math.round((map[dateKey].expected + exp) * 100) / 100;
      map[dateKey].received = Math.round((map[dateKey].received + rec) * 100) / 100;
      map[dateKey].balance = Math.max(0, Math.round((map[dateKey].expected - map[dateKey].received) * 100) / 100);
      map[dateKey].count += 1;
      map[dateKey].clients.push(c);

      if (!c.is_receipt || bal > 0) {
        map[dateKey].allCleared = false;
      }
    });

    // Convert to sorted array
    const list = Object.values(map).map((group) => {
      const percent = group.expected > 0 ? Math.round((group.received / group.expected) * 100) : 0;
      let statusTag = 'upcoming';
      if (group.date !== 'No Date') {
        if (group.date < todayStr && group.balance > 0) {
          statusTag = 'overdue';
        } else if (group.date === todayStr) {
          statusTag = 'today';
        }
      }

      return {
        ...group,
        percent,
        statusTag,
      };
    });

    // Sort chronologically
    list.sort((a, b) => {
      if (a.date === 'No Date') return 1;
      if (b.date === 'No Date') return -1;
      return a.date.localeCompare(b.date);
    });

    return list;
  }, [customers]);

  // Chart-ready data formatted with clean date labels
  const chartData = useMemo(() => {
    return dateGroups.map((g) => {
      let displayDate = 'Unscheduled';
      let shortDate = 'No Date';

      if (g.date && g.date !== 'No Date') {
        try {
          const [y, m, d] = g.date.split('-').map(Number);
          const dt = new Date(y, m - 1, d);
          const weekday = dt.toLocaleDateString('en-IN', { weekday: 'short' });
          const day = dt.getDate();
          const month = dt.toLocaleDateString('en-IN', { month: 'short' });
          displayDate = `${weekday} ${day} ${month}`;
          shortDate = `${day} ${month}`;
        } catch {
          displayDate = g.date;
          shortDate = g.date;
        }
      }

      return {
        date: g.date,
        displayDate,
        shortDate,
        collected_amount: g.received,
        balance_pending: g.balance,
        expected_amount: g.expected,
        percent: g.percent,
        count: g.count,
        statusTag: g.statusTag,
        allCleared: g.allCleared,
        clients: g.clients
      };
    });
  }, [dateGroups]);

  const totalScheduledDates = dateGroups.length;
  const overdueDatesCount = dateGroups.filter((g) => g.statusTag === 'overdue').length;
  const totalBalanceDue = Math.round(dateGroups.reduce((acc, g) => acc + g.balance, 0) * 100) / 100;
  const totalExpectedAmount = Math.round(dateGroups.reduce((acc, g) => acc + g.expected, 0) * 100) / 100;
  const totalCollectedAmount = Math.round(dateGroups.reduce((acc, g) => acc + g.received, 0) * 100) / 100;

  // Helper date formatter for table and headers
  const formatDateLabel = (dateStr) => {
    if (!dateStr || dateStr === 'No Date') return 'No Scheduled Date';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Handle drill down selection
  const handleDateSelect = (dateStr) => {
    if (!onSelectDateFilter) return;
    if (selectedDateFilter === dateStr) {
      onSelectDateFilter('');
      setActiveDateKey(null);
    } else {
      onSelectDateFilter(dateStr);
      setActiveDateKey(dateStr);
    }
  };

  // Scroll to customer ledger
  const scrollToLedger = () => {
    const el = document.getElementById('customer-ledger-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Find currently active drill-down group
  const activeGroup = useMemo(() => {
    const key = selectedDateFilter || activeDateKey;
    if (!key) return null;
    return dateGroups.find((g) => g.date === key) || null;
  }, [selectedDateFilter, activeDateKey, dateGroups]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className={`p-3.5 rounded-xl border shadow-xl text-xs max-w-xs transition-all pointer-events-none z-50 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="font-bold text-sm flex items-center space-x-1.5">
              <CalendarCheck className="w-4 h-4 text-indigo-500" />
              <span>{data.displayDate}</span>
            </div>
            {data.statusTag === 'overdue' && (
              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px]">
                Overdue
              </span>
            )}
            {data.statusTag === 'today' && (
              <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-[10px]">
                Due Today
              </span>
            )}
            {data.allCleared && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                100% Cleared
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Total Expected:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(data.expected_amount)}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>Collected:</span>
              </span>
              <span className="font-bold">{formatCurrency(data.collected_amount)} ({data.percent}%)</span>
            </div>
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                <span>Pending Balance:</span>
              </span>
              <span className="font-bold">{formatCurrency(data.balance_pending)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Scheduled Clients:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{data.count} client{data.count !== 1 ? 's' : ''}</span>
            </div>
            {data.clients && data.clients.length > 0 && (
              <div className="pt-1 text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                {data.clients.slice(0, 3).map((c) => c.customer_name).join(', ')}
                {data.clients.length > 3 ? ` +${data.clients.length - 3} more` : ''}
              </div>
            )}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold flex items-center justify-center space-x-1">
            <span>Click to filter ledger for this date</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section
      id="daily-collection-breakdown-section"
      className={`rounded-2xl border transition-all overflow-hidden ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white border-slate-300 shadow-xs'
      }`}
    >
      {/* Widget Header with View Switcher */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Title & Scope */}
        <div className="flex items-start space-x-3">
          <div
            className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
              isManager
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                {isManager
                  ? 'Daily Expected Collection Breakdown'
                  : 'My Date-wise Expected Payments'}
              </h2>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isManager
                    ? 'bg-purple-50 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                    : 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }`}
              >
                {isManager ? 'All Team Members' : 'My Accounts'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              {isManager
                ? 'Master scheduled collection timeline grouped by target invoice clearing dates across all clients'
                : `Personal expected collection forecast for ${userProfile?.full_name ? `${userProfile.full_name} (${userProfile.email})` : (getDisplayName(userProfile) || 'your assigned client accounts')}`}
            </p>
          </div>
        </div>

        {/* Right Controls: View Switcher Toggle & Meta Stats */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* View Switcher Toggle Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('chart')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'chart'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>📊 Chart View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>📋 Table View</span>
            </button>
          </div>

          {/* Quick Status Badges */}
          {overdueDatesCount > 0 && (
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-950 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>{overdueDatesCount} Overdue</span>
            </span>
          )}

          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-[11px]">
            {totalScheduledDates} Date{totalScheduledDates !== 1 ? 's' : ''}
          </span>

          {selectedDateFilter && (
            <button
              type="button"
              onClick={() => handleDateSelect('')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer px-1"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {dateGroups.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-400" />
          <p className="font-bold text-sm text-slate-800 dark:text-slate-300">
            No scheduled payment dates found
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {isManager
              ? 'Add clients with expected payment dates in the ledger below to generate timeline analytics.'
              : 'You have no assigned clients with upcoming scheduled dates. Add or update clients to forecast recovery.'}
          </p>
        </div>
      ) : (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
            <div className={`p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Total Scheduled:</span>
              <strong className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(totalExpectedAmount)}</strong>
            </div>
            <div className={`p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-emerald-50/70 border-emerald-200'}`}>
              <span className="text-emerald-700 dark:text-emerald-400 block text-[11px] font-semibold">Collected Amount:</span>
              <strong className="text-sm font-black text-emerald-700 dark:text-emerald-400">{formatCurrency(totalCollectedAmount)}</strong>
            </div>
            <div className={`p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-amber-950/30 border-amber-900/50' : 'bg-amber-50/70 border-amber-200'}`}>
              <span className="text-amber-800 dark:text-amber-400 block text-[11px] font-semibold">Pending Balance:</span>
              <strong className="text-sm font-black text-amber-800 dark:text-amber-400">{formatCurrency(totalBalanceDue)}</strong>
            </div>
            <div className={`p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-indigo-950/30 border-indigo-900/50' : 'bg-indigo-50/70 border-indigo-200'}`}>
              <span className="text-indigo-700 dark:text-indigo-400 block text-[11px] font-semibold">Overall Recovery:</span>
              <strong className="text-sm font-black text-indigo-700 dark:text-indigo-400">
                {totalExpectedAmount > 0 ? Math.round((totalCollectedAmount / totalExpectedAmount) * 100) : 0}%
              </strong>
            </div>
          </div>

          {/* VIEW 1: DUAL BAR CHART VIEW (Default) */}
          {viewMode === 'chart' && (
            <div className="space-y-4">
              {/* Chart Toolbar & Legend */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div className="flex items-center space-x-4 text-xs font-semibold">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500 shrink-0"></span>
                    <span className="text-slate-700 dark:text-slate-300">Collected Amount (₹)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-sm bg-amber-500 shrink-0"></span>
                    <span className="text-slate-700 dark:text-slate-300">Pending Balance (₹)</span>
                  </div>
                </div>

                {/* Sub-layout toggle: Dual vs Stacked */}
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Chart Style:</span>
                  <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setChartLayout('dual')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                        chartLayout === 'dual'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Dual Bars
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartLayout('stacked')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                        chartLayout === 'stacked'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Stacked
                    </button>
                  </div>
                </div>
              </div>

              {/* Responsive Recharts Container */}
              <div className={`w-full p-2 sm:p-4 rounded-xl border ${
                theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/50 border-slate-200'
              }`}>
                <div className="h-72 sm:h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 15, right: 15, left: 5, bottom: 25 }}
                      onClick={(state) => {
                        if (state && state.activePayload && state.activePayload[0]) {
                          handleDateSelect(state.activePayload[0].payload.date);
                        }
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme === 'dark' ? '#334155' : '#e2e8f0'}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="displayDate"
                        tick={{
                          fill: theme === 'dark' ? '#94a3b8' : '#475569',
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                        axisLine={{ stroke: theme === 'dark' ? '#334155' : '#cbd5e1' }}
                        tickLine={false}
                        interval={0}
                        angle={chartData.length > 5 ? -25 : 0}
                        textAnchor={chartData.length > 5 ? 'end' : 'middle'}
                        height={chartData.length > 5 ? 55 : 30}
                      />
                      <YAxis
                        tickFormatter={(val) => {
                          if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
                          if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
                          return `₹${val}`;
                        }}
                        tick={{
                          fill: theme === 'dark' ? '#94a3b8' : '#475569',
                          fontSize: 11,
                        }}
                        axisLine={{ stroke: theme === 'dark' ? '#334155' : '#cbd5e1' }}
                        tickLine={false}
                        width={58}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      
                      {/* Green Bar: Collected Amount */}
                      <Bar
                        dataKey="collected_amount"
                        name="Collected Amount"
                        stackId={chartLayout === 'stacked' ? 'a' : undefined}
                        fill="#10b981"
                        radius={chartLayout === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                        cursor="pointer"
                      >
                        {chartData.map((entry) => {
                          const isSelected = selectedDateFilter === entry.date;
                          return (
                            <Cell
                              key={`cell-rec-${entry.date}`}
                              fill={isSelected ? '#059669' : '#10b981'}
                              stroke={isSelected ? '#34d399' : undefined}
                              strokeWidth={isSelected ? 2 : 0}
                            />
                          );
                        })}
                      </Bar>

                      {/* Amber/Orange Bar: Pending Balance */}
                      <Bar
                        dataKey="balance_pending"
                        name="Pending Balance"
                        stackId={chartLayout === 'stacked' ? 'a' : undefined}
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                        cursor="pointer"
                      >
                        {chartData.map((entry) => {
                          const isSelected = selectedDateFilter === entry.date;
                          return (
                            <Cell
                              key={`cell-bal-${entry.date}`}
                              fill={isSelected ? '#d97706' : '#f59e0b'}
                              stroke={isSelected ? '#fbbf24' : undefined}
                              strokeWidth={isSelected ? 2 : 0}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2">
                  💡 Tip: Hover to inspect expected vs received figures. Click any date bar to filter and drill down to clients in the ledger below.
                </p>
              </div>

              {/* Interactive Drill-Down Date Inspector Panel */}
              {activeGroup && (
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    theme === 'dark'
                      ? 'bg-indigo-950/30 border-indigo-800 text-slate-100'
                      : 'bg-indigo-50/70 border-indigo-200 text-slate-900'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-indigo-200/50 dark:border-indigo-800/50">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Target Date Selected
                      </span>
                      <strong className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        {formatDateLabel(activeGroup.date)}
                      </strong>
                      <span className="text-xs font-mono text-slate-500">({activeGroup.date})</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={scrollToLedger}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <span>View {activeGroup.count} Client{activeGroup.count !== 1 ? 's' : ''} in Ledger ↓</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDateSelect('')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 cursor-pointer"
                      >
                        Clear Filter
                      </button>
                    </div>
                  </div>

                  {/* Date Drill Down Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                    <div className="text-xs space-y-1">
                      <span className="text-slate-500 dark:text-slate-400">Target Date Status:</span>
                      <div className="flex items-center space-x-2">
                        {activeGroup.allCleared ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>100% Cleared</span>
                          </span>
                        ) : activeGroup.percent > 0 ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Partial ({activeGroup.percent}% Collected)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                            <span>Pending Payment</span>
                          </span>
                        )}
                        {activeGroup.statusTag === 'overdue' && (
                          <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                            ⚠️ Overdue
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      <span className="text-slate-500 dark:text-slate-400">Recovery Breakdown:</span>
                      <div className="flex items-center space-x-3 font-mono">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          Rec: {formatCurrency(activeGroup.received)}
                        </span>
                        <span className="text-amber-800 dark:text-amber-400 font-bold">
                          Bal: {formatCurrency(activeGroup.balance)}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      <span className="text-slate-500 dark:text-slate-400">Scheduled Clients Preview:</span>
                      <div className="flex flex-wrap gap-1">
                        {activeGroup.clients.map((c) => (
                          <span
                            key={c.id}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                              theme === 'dark' ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-white text-slate-800 border-slate-300'
                            }`}
                          >
                            {c.customer_name} ({formatCurrency(c.expected_amount)})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: DETAILED TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead
                  className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    theme === 'dark' ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  <tr>
                    <th className="py-3 px-4">Expected Date</th>
                    <th className="py-3 px-4">Timing & Status</th>
                    <th className="py-3 px-4">Scheduled Clients</th>
                    <th className="py-3 px-4 text-right">Total Expected</th>
                    <th className="py-3 px-4 text-right">Collected Amount</th>
                    <th className="py-3 px-4 text-right">Balance Pending</th>
                    <th className="py-3 px-4 text-center">Collection Progress</th>
                    <th className="py-3 px-4 text-right">Quick Filter</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    theme === 'dark' ? 'divide-slate-800 text-slate-200' : 'divide-slate-200 text-slate-800'
                  }`}
                >
                  {dateGroups.map((group) => {
                    const isSelected = selectedDateFilter === group.date;

                    return (
                      <tr
                        key={group.date}
                        className={`transition-colors ${
                          isSelected
                            ? theme === 'dark'
                              ? 'bg-indigo-950/40'
                              : 'bg-indigo-50'
                            : theme === 'dark'
                            ? 'hover:bg-slate-800/40'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Expected Date */}
                        <td className="py-3 px-4 font-bold text-slate-950 dark:text-white">
                          <div className="flex items-center space-x-2">
                            <CalendarCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                            <div>
                              <span className="text-xs sm:text-sm block">{formatDateLabel(group.date)}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                {group.date}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Timing & Clearance Status */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col space-y-1">
                            {group.allCleared ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 w-fit">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>100% Cleared</span>
                              </span>
                            ) : group.percent > 0 ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 w-fit">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Partial ({group.percent}%)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 w-fit">
                                <span>Pending</span>
                              </span>
                            )}

                            {group.statusTag === 'overdue' && (
                              <span className="text-[10px] font-black text-rose-600 dark:text-rose-400">
                                ⚠️ Overdue Payment
                              </span>
                            )}
                            {group.statusTag === 'today' && (
                              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                                ⭐ Due Today
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Scheduled Clients */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border ${
                                theme === 'dark'
                                  ? 'bg-slate-800 text-slate-200 border-slate-700'
                                  : 'bg-slate-100 text-slate-800 border-slate-300'
                              }`}
                            >
                              {group.count} Client{group.count !== 1 ? 's' : ''}
                            </span>
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {group.clients.slice(0, 2).map((c) => (
                                <span
                                  key={c.id}
                                  title={c.customer_name}
                                  className="text-[10px] text-slate-600 dark:text-slate-400 font-medium truncate max-w-[110px] block"
                                >
                                  • {c.customer_name}
                                </span>
                              ))}
                              {group.clients.length > 2 && (
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                                  +{group.clients.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Total Expected */}
                        <td className="py-3 px-4 text-right font-bold text-slate-950 dark:text-white">
                          {formatCurrency(group.expected)}
                        </td>

                        {/* Collected Amount */}
                        <td className="py-3 px-4 text-right font-black text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(group.received)}
                        </td>

                        {/* Balance Pending */}
                        <td className="py-3 px-4 text-right font-black text-amber-800 dark:text-amber-400">
                          {formatCurrency(group.balance)}
                        </td>

                        {/* Progress Bar */}
                        <td className="py-3 px-4 text-center">
                          <div className="w-24 mx-auto">
                            <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                              <span className="text-slate-800 dark:text-slate-200">{group.percent}%</span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {group.allCleared ? 'Done' : 'Target'}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  group.allCleared
                                    ? 'bg-emerald-500'
                                    : group.statusTag === 'overdue'
                                    ? 'bg-rose-500'
                                    : 'bg-indigo-500'
                                }`}
                                style={{ width: `${Math.min(group.percent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Action Button */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              handleDateSelect(group.date);
                              scrollToLedger();
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : theme === 'dark'
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                            }`}
                          >
                            {isSelected ? 'Viewing' : 'Filter Ledger'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
