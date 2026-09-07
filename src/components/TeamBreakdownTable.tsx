import React from 'react';
import { CustomerPaymentRecord, UserProfile } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Target,
  BarChart3
} from 'lucide-react';

interface TeamBreakdownTableProps {
  teamMembers: UserProfile[];
  allCustomers: CustomerPaymentRecord[];
  activeRepFilter: string;
  onSelectRep: (repId: string) => void;
}

export const TeamBreakdownTable: React.FC<TeamBreakdownTableProps> = ({
  teamMembers,
  allCustomers,
  activeRepFilter,
  onSelectRep,
}) => {
  // Compute metrics per team member
  const memberStats = teamMembers.map((member) => {
    const assignedCustomers = allCustomers.filter((c) => c.assignedMemberId === member.id);
    const totalExpected = assignedCustomers.reduce((acc, c) => acc + c.totalAmount, 0);
    const totalReceived = assignedCustomers.reduce((acc, c) => acc + c.receivedAmount, 0);
    const totalPending = assignedCustomers.reduce((acc, c) => acc + c.balanceAmount, 0);
    const rate = totalExpected > 0 ? Math.round((totalReceived / totalExpected) * 100) : 0;
    const clearedCount = assignedCustomers.filter((c) => c.receiptReceived && c.balanceAmount === 0).length;

    return {
      member,
      clientCount: assignedCustomers.length,
      totalExpected,
      totalReceived,
      totalPending,
      rate,
      clearedCount,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Team Performance & Recovery Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Comparative collection quotas, received payments, and pending balances by team member
            </p>
          </div>
        </div>

        {activeRepFilter !== 'ALL' && (
          <button
            onClick={() => onSelectRep('ALL')}
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 flex items-center space-x-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Viewing Single Rep • Click to View All</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Team Member</th>
              <th className="py-3.5 px-4 text-center">Assigned Clients</th>
              <th className="py-3.5 px-4 text-right">Total Expected</th>
              <th className="py-3.5 px-4 text-right">Received Amount</th>
              <th className="py-3.5 px-4 text-right">Pending Balance</th>
              <th className="py-3.5 px-4 text-center">Collection %</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {memberStats.map(({ member, clientCount, totalExpected, totalReceived, totalPending, rate, clearedCount }) => {
              const isSelected = activeRepFilter === member.id;
              return (
                <tr
                  key={member.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isSelected ? 'bg-purple-50/50 font-medium' : ''
                  }`}
                >
                  {/* Member Name and Avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm flex items-center space-x-1.5">
                          <span>{member.name}</span>
                          {isSelected && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-600 text-white font-normal">
                              Active Filter
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{member.department || 'Account Manager'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Assigned Clients */}
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                      {clientCount} clients
                    </span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {clearedCount} fully cleared
                    </div>
                  </td>

                  {/* Total Expected */}
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">
                    {formatCurrency(totalExpected)}
                  </td>

                  {/* Total Received */}
                  <td className="py-3 px-4 text-right font-bold text-emerald-600">
                    {formatCurrency(totalReceived)}
                  </td>

                  {/* Total Pending */}
                  <td className="py-3 px-4 text-right font-semibold text-amber-600">
                    {formatCurrency(totalPending)}
                  </td>

                  {/* Collection Rate & Progress Bar */}
                  <td className="py-3 px-4">
                    <div className="w-32 mx-auto">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className={rate >= 60 ? 'text-emerald-600' : 'text-slate-600'}>{rate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            rate >= 75 ? 'bg-emerald-500' : rate >= 40 ? 'bg-indigo-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(rate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Action to Filter */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectRep(isSelected ? 'ALL' : member.id)}
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{isSelected ? 'Reset' : 'Filter Clients'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
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
