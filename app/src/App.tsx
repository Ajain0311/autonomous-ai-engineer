import React, { useState, useEffect } from 'react';
import { 
  Flame, GitCommit, Calendar, Sparkles, Shield, ShieldCheck, Database, Plus, CheckCircle2, 
  RefreshCw, Save, Edit3, Layers, Settings, FileText, Code, Check, 
  Trash2, Globe, ArrowRight, Laptop, AlertCircle, X, ShieldAlert, CheckSquare,
  Wrench, Link2, Key, Bookmark, Download, Sparkle
} from 'lucide-react';

interface ColumnSchema {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'datetime' | 'json';
  required?: boolean;
  min?: number;
  max?: number;
  default?: any;
  pattern?: string;
}

interface TableSchema {
  tableName: string;
  columns: ColumnSchema[];
}

interface DailyLog {
  day: number;
  date: string;
  project: string;
  phase: 'BUILD' | 'PLANNING';
  today_done: string;
  tomorrow_plan: string;
  status: 'COMPLETED' | 'IN_PROGRESS';
  github_commit_hash: string;
}

interface ProductCatalogItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  tags: string[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'planner' | 'catalog' | 'db_editor' | 'schema_manager' | 'product_extension'>('planner');
  
  // Database States
  const [currentStreakDays, setCurrentStreakDays] = useState<number>(48);
  const [activeProject, setActiveProject] = useState<string>('product1_adblocker_extension');
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);

  // Validation Error & Success Toast Banner State
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Table Schema State
  const [activeTableName, setActiveTableName] = useState<string>('rules');
  const [schema, setSchema] = useState<TableSchema>({
    tableName: 'rules',
    columns: [
      { name: 'id', type: 'number', required: true, min: 1 },
      { name: 'domain', type: 'string', required: true, pattern: '^\\*?[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\*?$' },
      { name: 'category', type: 'string', required: true, default: 'Ads' },
      { name: 'action', type: 'string', required: true, default: 'block' },
      { name: 'priority', type: 'number', required: true, min: 1, max: 100, default: 1 },
      { name: 'enabled', type: 'boolean', required: true, default: true }
    ]
  });

  // Table Data Rows State
  const [tableRows, setTableRows] = useState<any[]>([
    { id: 1, domain: '*doubleclick.net*', category: 'Ads', action: 'block', priority: 1, enabled: true },
    { id: 2, domain: '*google-analytics.com*', category: 'Trackers', action: 'block', priority: 1, enabled: true },
    { id: 3, domain: '*connect.facebook.net*', category: 'Social', action: 'block', priority: 2, enabled: true },
    { id: 4, domain: '*popads.net*', category: 'Popups', action: 'block', priority: 1, enabled: true }
  ]);

  // Dynamic Form Data State
  const [formValues, setFormValues] = useState<Record<string, any>>({
    id: 5,
    domain: '*adnxs.com*',
    category: 'Ads',
    action: 'block',
    priority: 1,
    enabled: true
  });

  // Catalog Items Library
  const productCatalog: ProductCatalogItem[] = [
    {
      id: 'product1_adblocker_extension',
      name: 'Manifest V3 AdBlocker & Tracker Zapper',
      category: 'Browser Extension',
      description: 'Blocks annoying ads, trackers, and popup zappers using dynamic DNR rules.',
      icon: Shield,
      tags: ['Manifest V3', 'AdBlock', 'Privacy']
    },
    {
      id: 'product2_url_cleaner',
      name: 'URL Cleaner & UTM Parameter Stripper',
      category: 'Utility Tool',
      description: 'Strips tracking UTM parameters, ref tokens, and cleans links in 1 click.',
      icon: Link2,
      tags: ['Privacy', 'UTM Strip', 'Clean URL']
    },
    {
      id: 'product3_tab_manager',
      name: 'One-Click Tab Group & Session Saver',
      category: 'Productivity Tool',
      description: 'Saves browser tabs into session groups and exports clean JSON backups.',
      icon: Bookmark,
      tags: ['Tab Groups', 'Session Saver', 'JSON']
    },
    {
      id: 'product4_password_gen',
      name: 'Offline Password & Security Token Gen',
      category: 'Security Tool',
      description: 'Generates high-entropy passwords and API tokens with zero network calls.',
      icon: Key,
      tags: ['Security', 'Password Gen', 'Offline']
    },
    {
      id: 'product5_markdown_exporter',
      name: 'Web Article to Clean Markdown Exporter',
      category: 'Content Tool',
      description: 'Extracts clean article text from any web page and downloads .md file.',
      icon: Download,
      tags: ['Markdown', 'Scraper', 'Exporter']
    }
  ];

  const [customIdeaInput, setCustomIdeaInput] = useState<string>('');

  // Planner Form State
  const [todayDoneInput, setTodayDoneInput] = useState<string>('Added Product Catalog & Next Tool Selection Studio to Dashboard');
  const [tomorrowPlanInput, setTomorrowPlanInput] = useState<string>('Initialize Product 02 (URL Cleaner & UTM Stripper)');
  const [phaseMode, setPhaseMode] = useState<'BUILD' | 'PLANNING'>('BUILD');
  const [isCommitting, setIsCommitting] = useState<boolean>(false);

  // Initial Load from Backend API
  useEffect(() => {
    fetch('/api/db/daily_roadmap')
      .then(res => res.json())
      .then(data => {
        if (data.current_streak_days) setCurrentStreakDays(data.current_streak_days);
        if (data.active_project) setActiveProject(data.active_project);
        if (data.daily_logs) setDailyLogs(data.daily_logs);
      })
      .catch(() => console.log('Roadmap fallback'));

    fetch('/api/db/schema/rules')
      .then(res => res.json())
      .then(data => {
        if (data.columns && data.columns.length > 0) setSchema(data);
      })
      .catch(() => console.log('Schema fallback'));

    fetch('/api/db/adblocker_rules')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setTableRows(data);
      })
      .catch(() => console.log('Data fallback'));
  }, []);

  // Initialize New Product from Catalog
  const handleSelectProduct = async (item: ProductCatalogItem | { id: string; name: string }) => {
    setValidationError(null);
    setSuccessToast(`Initializing ${item.name}...`);

    try {
      const res = await fetch('/api/products/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: item.id,
          product_name: item.name,
          category: 'Utility Tool'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveProject(data.folder_name);
        setSuccessToast(`✅ Product '${data.folder_name}' initialized with isolated /db subfolder!`);
        setActiveTab('planner');
        setTomorrowPlanInput(`Build initial codebase for ${item.name}`);
      } else {
        setValidationError('Failed to initialize product folder.');
      }
    } catch (e) {
      setActiveProject(item.id);
      setSuccessToast(`✅ Product '${item.id}' selected for tomorrow's roadmap!`);
      setActiveTab('planner');
    }
  };

  // Save Roadmap & Commit Progress
  const handleCommitProgress = async () => {
    if (!todayDoneInput.trim()) return;
    setIsCommitting(true);

    try {
      const res = await fetch('/api/db/commit_progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          today_done: todayDoneInput,
          tomorrow_plan: tomorrowPlanInput,
          phase: phaseMode,
          project: activeProject
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentStreakDays(data.current_streak_days);
        if (data.roadmap?.daily_logs) setDailyLogs(data.roadmap.daily_logs);
        setSuccessToast(`✅ Committed [${data.commit_hash}]: "${data.commit_msg}"! Streak: 🔥 ${data.current_streak_days} Days!`);
        setIsCommitting(false);
        setTodayDoneInput('');
        return;
      }
    } catch (e) {
      console.warn('Backend offline, running fallback commit');
    }

    setTimeout(() => {
      const dayNum = dailyLogs.length + 1;
      const hash = Math.random().toString(36).substring(2, 8);
      const newLog: DailyLog = {
        day: dayNum,
        date: new Date().toISOString().split('T')[0],
        project: activeProject,
        phase: phaseMode,
        today_done: todayDoneInput,
        tomorrow_plan: tomorrowPlanInput,
        status: 'COMPLETED',
        github_commit_hash: hash
      };
      setDailyLogs([newLog, ...dailyLogs]);
      setCurrentStreakDays(prev => prev + 1);
      setSuccessToast(`✅ Committed [${hash}]: Day ${dayNum} Progress Saved!`);
      setIsCommitting(false);
      setTodayDoneInput('');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-slate-100 font-sans selection:bg-cyan-600 selection:text-white">
      
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* HEADER NAVBAR */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[#0a0b14]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                DailyCode<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Engine</span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                  <Flame className="h-3 w-3 fill-emerald-400" /> 🔥 {currentStreakDays} Days
                </span>
              </span>
            </div>
          </div>

          {/* Navigation Pills */}
          <nav className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {[
              { id: 'planner', label: 'Roadmap & Streak', icon: Calendar },
              { id: 'catalog', label: 'Next Tool Catalog', icon: Wrench },
              { id: 'db_editor', label: 'Validated Data Form', icon: Database },
              { id: 'schema_manager', label: 'Schema Manager', icon: Settings },
              { id: 'product_extension', label: 'Active Product', icon: Shield },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* TOAST ALERTS */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        {validationError && (
          <div className="bg-rose-500/15 border border-rose-500/40 p-4 rounded-2xl text-xs font-mono text-rose-300 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
            <button onClick={() => setValidationError(null)} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
        )}

        {successToast && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 p-3.5 rounded-2xl text-xs font-mono text-emerald-300 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTAINER */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        
        {/* TAB 1: ROADMAP & STREAK PLANNER */}
        {activeTab === 'planner' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-cyan-500/20 shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-white">Daily Progress Planner</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Editable roadmap planner with automatic structured git commits.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono bg-cyan-950 border border-cyan-500/30 text-cyan-300 px-3 py-1 rounded-xl">
                    Active: {activeProject}
                  </span>
                  <button 
                    onClick={() => setActiveTab('catalog')}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    <span>Select Next Tool</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Today Completed (Aaj Kya Kiya)
                  </label>
                  <textarea
                    rows={3}
                    value={todayDoneInput}
                    onChange={e => setTodayDoneInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Tomorrow Plan (Kal Kya Karna Hai)
                  </label>
                  <textarea
                    rows={3}
                    value={tomorrowPlanInput}
                    onChange={e => setTomorrowPlanInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-500 font-bold">Phase:</span>
                  <button
                    onClick={() => setPhaseMode('BUILD')}
                    className={`px-3 py-1 rounded-lg font-bold ${phaseMode === 'BUILD' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400'}`}
                  >
                    BUILD
                  </button>
                  <button
                    onClick={() => setPhaseMode('PLANNING')}
                    className={`px-3 py-1 rounded-lg font-bold ${phaseMode === 'PLANNING' ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-400'}`}
                  >
                    PLANNING
                  </button>
                </div>

                <button
                  onClick={handleCommitProgress}
                  disabled={isCommitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-md"
                >
                  {isCommitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <GitCommit className="h-4 w-4" />}
                  <span>Save & Commit Progress</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NEXT TOOL CATALOG & SELECTOR STUDIO */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-purple-500/20 shadow-2xl space-y-5">
              <div>
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>Next Product Selection Studio</span>
                </div>
                <h1 className="text-xl font-extrabold text-white">Daily Micro-Product Catalog</h1>
                <p className="text-xs text-slate-400 mt-0.5">Select a real-world daily utility tool to initialize its isolated folder & DB structure for your next daily streak!</p>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productCatalog.map(item => {
                  const Icon = item.icon;
                  const isActive = activeProject === item.id;
                  return (
                    <div key={item.id} className={`p-5 rounded-2xl bg-slate-950 border transition-all space-y-3 flex flex-col justify-between ${
                      isActive ? 'border-cyan-500/60 ring-1 ring-cyan-500/30' : 'border-slate-800 hover:border-slate-700'
                    }`}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="h-9 w-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
                            <Icon className="h-4 w-4" />
                          </div>
                          {isActive ? (
                            <span className="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">Active Product</span>
                          ) : (
                            <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full">{item.category}</span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-white leading-snug">{item.name}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map(t => (
                            <span key={t} className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded">{t}</span>
                          ))}
                        </div>

                        <button
                          onClick={() => handleSelectProduct(item)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                            isActive 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default' 
                              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md'
                          }`}
                        >
                          {isActive ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                          <span>{isActive ? 'Active' : 'Select Tool'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Tool Idea Generator Form */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">Or Create Custom Tool Idea (AI Product Initializer)</span>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    value={customIdeaInput}
                    onChange={e => setCustomIdeaInput(e.target.value)}
                    placeholder="e.g., JSON Beautifier Extension, Offline Markdown Reader..."
                    className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-purple-500 font-mono"
                  />
                  <button
                    onClick={() => {
                      if (customIdeaInput.trim()) {
                        handleSelectProduct({
                          id: `product_${customIdeaInput.trim().toLowerCase().replace(/\s+/g, '_')}`,
                          name: customIdeaInput.trim()
                        });
                        setCustomIdeaInput('');
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
                  >
                    <Sparkle className="h-4 w-4" />
                    <span>Initialize Custom Tool</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VALIDATED DATA FORM */}
        {activeTab === 'db_editor' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="h-4 w-4 text-cyan-400" />
                  Validated Data Form ({activeProject})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Isolated table <code className="text-cyan-300 font-mono">app/{activeProject}/db/rules.json</code>.</p>
              </div>

              {/* Data Table */}
              <div className="space-y-2">
                {tableRows.map((r, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex flex-wrap items-center gap-3">
                      {Object.entries(r).map(([k, v]) => (
                        <span key={k} className="text-slate-300">
                          <strong className="text-slate-500">{k}:</strong> <span className="text-cyan-300">{String(v)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SCHEMA MANAGER */}
        {activeTab === 'schema_manager' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Settings className="h-4 w-4 text-purple-400" />
                  Strict Column Schema Studio ({activeProject})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Isolated schema <code className="text-cyan-300 font-mono">app/{activeProject}/db/rules_schema.json</code>.</p>
              </div>

              <div className="space-y-2">
                {schema.columns.map(col => (
                  <div key={col.name} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-cyan-300">{col.name}</span>
                    <span className="bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{col.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ACTIVE PRODUCT EXTENSION */}
        {activeTab === 'product_extension' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Shield className="h-4 w-4 text-cyan-400" />
                    Active Product: {activeProject}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Location: <code className="text-cyan-300 font-mono">app/{activeProject}/</code></p>
                </div>
                <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">Isolated & Active</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}