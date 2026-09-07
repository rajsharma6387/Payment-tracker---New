import React, { useState } from 'react';
import { ARCHITECTURE_DELIVERABLES } from '../docs/architectureDeliverables';
import { 
  X, 
  Database, 
  Layers, 
  ShieldAlert, 
  Check, 
  Copy, 
  FileCode2, 
  Terminal, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface ArchitectureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureGuideModal: React.FC<ArchitectureGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'step1' | 'step2' | 'step3' | 'step4' | 'setup'>('step1');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>Architecture, Schema & Setup Guide</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-normal">
                  Senior Full-Stack Deliverables
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Database structures (JSON, SQL, Firestore), tech stack trade-offs, and Firebase RBAC implementation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-4 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('step1')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'step1'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Step 1: Database Schemas
          </button>
          <button
            onClick={() => setActiveTab('step2')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'step2'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Step 2: Tech Stack Analysis
          </button>
          <button
            onClick={() => setActiveTab('step3')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'step3'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Step 3: Front-End Architecture
          </button>
          <button
            onClick={() => setActiveTab('step4')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'step4'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Step 4: Firebase RBAC & Rules
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'setup'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Step 5: Setup & Deployment
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-300 text-xs sm:text-sm">
          
          {/* STEP 1: Database Schema */}
          {activeTab === 'step1' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Step 1: Database Architecture & Models
                </h3>
                <p className="text-slate-400 text-xs">
                  Below are the production schemas in Firestore NoSQL, PostgreSQL Relational DDL, and JSON-Schema formats.
                </p>
              </div>

              {/* Firestore Document Model */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-400 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5" />
                    <span>Firestore Document Collections Structure</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(ARCHITECTURE_DELIVERABLES.step1DatabaseSchema.firestoreCollections, 'firestore')}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                  >
                    {copiedKey === 'firestore' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'firestore' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-[11px] font-mono text-emerald-300 leading-relaxed">
                  {ARCHITECTURE_DELIVERABLES.step1DatabaseSchema.firestoreCollections}
                </pre>
              </div>

              {/* PostgreSQL Schema */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-400 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>PostgreSQL / Cloud SQL Relational DDL</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(ARCHITECTURE_DELIVERABLES.step1DatabaseSchema.sqlDDL, 'sql')}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                  >
                    {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'sql' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-[11px] font-mono text-cyan-300 leading-relaxed">
                  {ARCHITECTURE_DELIVERABLES.step1DatabaseSchema.sqlDDL}
                </pre>
              </div>
            </div>
          )}

          {/* STEP 2: Recommended Tech Stack */}
          {activeTab === 'step2' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Step 2: Recommended Tech Stack Comparison
                </h3>
                <p className="text-emerald-400 font-semibold text-xs">
                  {ARCHITECTURE_DELIVERABLES.step2TechStackComparison.recommendation}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ARCHITECTURE_DELIVERABLES.step2TechStackComparison.options.map((opt, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-sm text-white">{opt.name}</h4>
                    <p className="text-xs text-slate-400 italic">{opt.verdict}</p>
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Advantages:</span>
                      <ul className="mt-1 space-y-1">
                        {opt.pros.map((p, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start space-x-1.5">
                            <span className="text-emerald-500">✓</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Limitations:</span>
                      <ul className="mt-1 space-y-1">
                        {opt.cons.map((c, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start space-x-1.5">
                            <span className="text-rose-500">⚠</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Front-End Architecture */}
          {activeTab === 'step3' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step 3: Front-End Component Hierarchy & Flow</h3>
              <p className="text-xs text-slate-400">
                The application uses a modular, state-driven React 19 architecture styled with Tailwind CSS utility tokens.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="font-bold text-indigo-400 mb-1">1. State & Storage Service</div>
                  <p className="text-slate-400">
                    `storageService.ts` handles client queries, balance recalculations (Total - Received), persistent storage, and CSV exports.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="font-bold text-indigo-400 mb-1">2. Role-Based Views (RBAC)</div>
                  <p className="text-slate-400">
                    Team Member view filters all collections strictly to `assignedMemberId == currentUser.id`. Manager view unlocks master analytics, team breakdown, and reassignment.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="font-bold text-indigo-400 mb-1">3. KPI Aggregator</div>
                  <p className="text-slate-400">
                    `KPICards.tsx` computes expected, collected, pending, and overdue risk metrics live as filters change.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="font-bold text-indigo-400 mb-1">4. Interactive Controls</div>
                  <p className="text-slate-400">
                    One-click status toggle ("Receipt Received" / "Not Received"), quick payment modal, category badges, and dynamic date remaining tags.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Firebase RBAC & Rules */}
          {activeTab === 'step4' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Step 4: Backend / Firebase Integration Code for RBAC
                </h3>
                <p className="text-xs text-slate-400">
                  Security rules that enforce zero-trust data access on Cloud Firestore:
                </p>
              </div>

              {/* Firestore Rules */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-400 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>firestore.rules (Deployable to Production)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(ARCHITECTURE_DELIVERABLES.step4RBACImplementation.rulesSnippet, 'rules')}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                  >
                    {copiedKey === 'rules' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'rules' ? 'Copied' : 'Copy Rules'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-[11px] font-mono text-emerald-300 leading-relaxed">
                  {ARCHITECTURE_DELIVERABLES.step4RBACImplementation.rulesSnippet}
                </pre>
              </div>

              {/* Client Query Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-400 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>Client-side Query Wrapper (RBAC Query Isolation)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(ARCHITECTURE_DELIVERABLES.step4RBACImplementation.clientQuerySnippet, 'clientQ')}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                  >
                    {copiedKey === 'clientQ' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'clientQ' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-[11px] font-mono text-amber-300 leading-relaxed">
                  {ARCHITECTURE_DELIVERABLES.step4RBACImplementation.clientQuerySnippet}
                </pre>
              </div>
            </div>
          )}

          {/* STEP 5: Setup & Deployment Instructions */}
          {activeTab === 'setup' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step-by-Step Production Setup Instructions</h3>
              
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-sm text-indigo-300 mb-1">Phase 1: Firebase Project Setup</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                    <li>Go to <span className="text-white font-medium">console.firebase.google.com</span> and create a new project.</li>
                    <li>Enable <span className="text-white font-medium">Cloud Firestore</span> in production mode.</li>
                    <li>Enable <span className="text-white font-medium">Firebase Authentication</span> (Email/Password or Google Sign-In).</li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-sm text-indigo-300 mb-1">Phase 2: Deploy Security Rules</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                    <li>Install Firebase CLI: <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-400 font-mono">npm install -g firebase-tools</code></li>
                    <li>Authenticate: <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-400 font-mono">firebase login</code></li>
                    <li>Deploy rules: <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-400 font-mono">firebase deploy --only firestore:rules</code></li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-sm text-indigo-300 mb-1">Phase 3: Deploy Frontend</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                    <li>Run <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-400 font-mono">npm run build</code> to generate the optimized production bundle in <code className="text-slate-400">/dist</code>.</li>
                    <li>Deploy to Firebase Hosting or Cloud Run: <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-400 font-mono">firebase deploy --only hosting</code></li>
                  </ol>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            All database schemas & security rules are available directly in this project's source tree (`/firestore.rules` & `firebase-blueprint.json`).
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
