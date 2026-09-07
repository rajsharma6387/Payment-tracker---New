import React, { useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Filter,
  ArrowRight,
  ShieldCheck,
  User,
  CalendarCheck
} from 'lucide-react';
import { formatCurrency } from '../constants';

export default function DateBreakdownWidget({
  customers = [],
  isManager = false,
  userProfile,
  theme = 'light',
  onSelectDateFilter,
  selectedDateFilter
}) {
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

      const exp = Number(c.expected_amount) || 0;
      const rec = Number(c.received_amount) || 0;
      const bal = Math.max(0, exp - rec);

      map[dateKey].expected += exp;
      map[dateKey].received += rec;
      map[dateKey].balance += bal;
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

  const totalScheduledDates = dateGroups.length;
  const overdueDatesCount = dateGroups.filter((g) => g.statusTag === 'overdue').length;
  const totalBalanceDue = dateGroups.reduce((acc, g) => acc + g.balance, 0);

  // Format date helper: "2026-09-15" -> "Tue, 15 Sep 2026"
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

  return (
    <section className={`rounded-2xl border transition-all overflow-hidden ${
      theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white border-slate-300 shadow-xs'
    }`}>
      {/* Widget Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl border shrink-0 ${
            isManager
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
          }`}>
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                {isManager
                  ? 'Daily Expected Collection Breakdown'
                  : 'My Date-wise Expected Payments'}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isManager
                  ? 'bg-purple-50 text-purple-950 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                  : 'bg-emerald-50 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              }`}>
                {isManager ? 'All Team Members' : 'My Accounts'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              {isManager
                ? 'Master scheduled collection timeline grouped by target invoice clearing dates'
                : `Personal expected collection forecast for ${userProfile?.email || 'your assigned clients'}`}
            </p>
          </div>
        </div>

        {/* Quick Meta Pills */}
        <div className="flex items-center space-x-2 text-xs">
          {overdueDatesCount > 0 && (
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-950 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>{overdueDatesCount} Overdue Target{overdueDatesCount > 1 ? 's' : ''}</span>
            </span>
          )}
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-[11px]">
            {totalScheduledDates} Target Date{totalScheduledDates !== 1 ? 's' : ''}
          </span>
          {selectedDateFilter && (
            <button
              onClick={() => onSelectDateFilter && onSelectDateFilter('')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Reset Date Filter
            </button>
          )}
        </div>
      </div>

      {/* Date Breakdown Content */}
      {dateGroups.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="font-bold text-sm text-slate-800 dark:text-slate-300">No scheduled payment dates found</p>
          <p className="text-xs text-slate-500 mt-1">Add clients with expected payment dates to see timeline analytics.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
              theme === 'dark' ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-800 border-slate-300'
            }`}>
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
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800 text-slate-200' : 'divide-slate-200 text-slate-800'}`}>
              {dateGroups.map((group) => {
                const isSelected = selectedDateFilter === group.date;

                return (
                  <tr
                    key={group.date}
                    className={`transition-colors ${
                      isSelected
                        ? (theme === 'dark' ? 'bg-indigo-950/40' : 'bg-indigo-50')
                        : (theme === 'dark' ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80')
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
                        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border ${
                          theme === 'dark' ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}>
                          {group.count} Client{group.count !== 1 ? 's' : ''}
                        </span>
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {group.clients.slice(0, 2).map((c) => (
                            <span
                              key={c.id}
                              title={c.customer_name}
                              className="text-[10px] text-slate-600 dark:text-slate-400 font-medium truncate max-w-[100px] block"
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
                        onClick={() => onSelectDateFilter && onSelectDateFilter(isSelected ? '' : group.date)}
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
    </section>
  );
}
