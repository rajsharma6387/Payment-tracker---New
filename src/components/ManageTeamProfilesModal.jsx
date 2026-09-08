import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  UserCheck,
  ShieldCheck,
  User,
  Check,
  Save,
  Search,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { getDisplayName } from '../constants';

export default function ManageTeamProfilesModal({
  isOpen,
  onClose,
  teamProfiles = [],
  onSaveMemberName,
  theme = 'light'
}) {
  const [namesMap, setNamesMap] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [savedSuccessId, setSavedSuccessId] = useState(null);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  // Sync names map when profiles change or modal opens
  useEffect(() => {
    if (isOpen) {
      const initialMap = {};
      teamProfiles.forEach((p) => {
        initialMap[p.id] = p.full_name || '';
      });
      setNamesMap(initialMap);
      setErrorMsg(null);
      setSavedSuccessId(null);
    }
  }, [isOpen, teamProfiles]);

  if (!isOpen) return null;

  const handleNameChange = (id, val) => {
    setNamesMap((prev) => ({ ...prev, [id]: val }));
  };

  const handleSaveRow = async (profile) => {
    const newName = (namesMap[profile.id] ?? profile.full_name ?? '').trim();
    setSavingId(profile.id);
    setErrorMsg(null);

    try {
      await onSaveMemberName(profile.id, newName);
      setSavedSuccessId(profile.id);
      setTimeout(() => {
        setSavedSuccessId((prev) => (prev === profile.id ? null : prev));
      }, 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile name.');
    } finally {
      setSavingId(null);
    }
  };

  const filteredProfiles = teamProfiles.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.email?.toLowerCase().includes(q) ||
      p.full_name?.toLowerCase().includes(q) ||
      getDisplayName(p).toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        className={`max-w-2xl w-full rounded-2xl border p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-950 dark:text-white">
                Manage Team Member Profiles
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Set clean display names for each account in Supabase <code className="text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">profiles.full_name</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 rounded-xl text-xs text-purple-900 dark:text-purple-200 flex items-start space-x-2 shrink-0">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Manager Authority:</span> As Manager, you can directly set clean names (e.g., "Sagar", "Indu", "Raj") for any team member. These names will immediately replace raw email handles across all customer records, tables, and dropdowns.
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-950 dark:text-rose-200 flex items-center space-x-2 shrink-0 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium ${
              theme === 'dark'
                ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500'
                : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500'
            }`}
          />
        </div>

        {/* Profiles Table */}
        <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead
              className={`sticky top-0 z-10 border-b text-[11px] font-bold uppercase tracking-wider ${
                theme === 'dark' ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              <tr>
                <th className="py-2.5 px-3">Role & Email</th>
                <th className="py-2.5 px-3">Full Display Name</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800 text-slate-200' : 'divide-slate-200 text-slate-800'}`}>
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">
                    No team accounts found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => {
                  const isManagerRole = p.role === 'manager';
                  const isSaving = savingId === p.id;
                  const isSaved = savedSuccessId === p.id;
                  const currentVal = namesMap[p.id] ?? p.full_name ?? '';
                  const hasChanged = currentVal.trim() !== (p.full_name || '').trim();

                  return (
                    <tr
                      key={p.id}
                      className={theme === 'dark' ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}
                    >
                      {/* Role & Email */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          {isManagerRole ? (
                            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                          ) : (
                            <User className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <div className="truncate max-w-[200px]">
                            <div className="font-semibold text-slate-900 dark:text-white truncate">
                              {p.email}
                            </div>
                            <span
                              className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                                isManagerRole
                                  ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {isManagerRole ? 'Manager' : 'Team Member'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Display Name Input */}
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={currentVal}
                          onChange={(e) => handleNameChange(p.id, e.target.value)}
                          placeholder="e.g. Sagar Sharma"
                          className={`w-full px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                            hasChanged
                              ? 'border-purple-500 ring-1 ring-purple-500/20'
                              : theme === 'dark'
                              ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600'
                              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                          }`}
                        />
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleSaveRow(p)}
                          disabled={isSaving}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center space-x-1 cursor-pointer border ${
                            isSaved
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : hasChanged
                              ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600 shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSaving ? (
                            <span>Saving...</span>
                          ) : isSaved ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Saved</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {teamProfiles.length} registered accounts
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
