import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
  Plus, 
  FileCode2, 
  Download, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  onOpenAddModal: () => void;
  onOpenArchitectureModal: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenAddModal,
  onOpenArchitectureModal,
  onExportCSV,
  onResetData,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const isManager = currentUser.role === 'manager';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-inner font-bold text-xl tracking-tight">
              ₹
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">CollectIQ</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                  Payment Collection & Client Management
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Role-Based Collection Tracker & Recovery Forecasts
              </p>
            </div>
          </div>

          {/* Actions & User Role Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Step 1-4 Architecture & Setup Button */}
            <button
              id="btn-open-arch-guide"
              onClick={onOpenArchitectureModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-950 text-indigo-300 border border-indigo-700/60 hover:bg-indigo-900 transition-colors shadow-sm"
              title="View Step 1-4 Deliverables (Schema, Stack, Front-end, RBAC)"
            >
              <FileCode2 className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline">Specs & Architecture</span>
              <span className="md:hidden">Specs</span>
            </button>

            {/* Export CSV */}
            <button
              id="btn-export-csv"
              onClick={onExportCSV}
              className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors"
              title="Export filtered records to CSV"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export CSV</span>
            </button>

            {/* Add New Customer CTA */}
            <button
              id="btn-add-customer-nav"
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                id="btn-user-switcher"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-lg border transition-all ${
                  isManager 
                    ? 'bg-purple-950/70 border-purple-600/60 text-purple-200 hover:bg-purple-900/80' 
                    : 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700'
                }`}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-600"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold leading-none flex items-center space-x-1">
                    <span>{currentUser.name}</span>
                    {isManager ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {isManager ? 'Manager (Full Access)' : 'Team Member (Assigned Only)'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Switcher Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200">
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Simulate Logged-in User (RBAC Test)
                  </div>

                  <div className="py-1">
                    {allUsers.map((user) => {
                      const active = user.id === currentUser.id;
                      const userIsMgr = user.role === 'manager';
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            onSwitchUser(user);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center space-x-3 hover:bg-slate-800 transition-colors ${
                            active ? 'bg-slate-800/80 border-l-2 border-indigo-500' : ''
                          }`}
                        >
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-white truncate">{user.name}</p>
                              {active && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                            </div>
                            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                                userIsMgr ? 'bg-purple-900/60 text-purple-300' : 'bg-slate-700 text-slate-300'
                              }`}>
                                {userIsMgr ? 'Manager' : 'Team Member'}
                              </span>
                              <span className="truncate">{user.department || user.role}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-800 pt-2 px-2">
                    <button
                      onClick={() => {
                        setShowResetConfirm(true);
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 flex items-center space-x-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Original Demo Data</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-5 shadow-2xl text-slate-100">
            <h3 className="text-base font-semibold text-white">Reset Demo Data?</h3>
            <p className="text-xs text-slate-300 mt-2">
              This will restore all default customer entries, assigned reps, payment statuses, and notes back to the starting sample data.
            </p>
            <div className="mt-5 flex justify-end space-x-2.5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg border border-slate-700 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
