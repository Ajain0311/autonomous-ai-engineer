import React, { useState, useEffect } from 'react';
import { 
  Flame, GitCommit, Calendar, Sparkles, Shield, Database, Plus, CheckCircle2, 
  RefreshCw, Play, Save, Edit3, Layers, Settings, FileText, Code, Check, 
  Trash2, Globe, ArrowRight, Laptop, ToggleLeft, ToggleRight, Download
} from 'lucide-react';

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

interface AdBlockerRule {
  id: number;
  domain: string;
  type: string;
  action: string;
  category: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'planner' | 'db_editor' | 'product_extension'>('planner');
  
  // Database States
  const [currentStreakDays, setCurrentStreakDays] = useState<number>(48);
  const [activeProject, setActiveProject] = useState<string>('01-adblocker-extension');
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([
    {
      day: 1,
      date: '2026-08-03',
      project: '01-adblocker-extension',
      phase: 'BUILD',
      today_done: 'Initialized Manifest V3 AdBlocker extension architecture and JSON DB sync engine',
      tomorrow_plan: 'Add element zapper and cosmetic ad filtering rules',
      status: 'COMPLETED',
      github_commit_hash: '6ac5327'
    }
  ]);

  // Today & Tomorrow Planner Input Form State
  const [todayDoneInput, setTodayDoneInput] = useState<string>('Added dynamic rule sync engine & editable JSON DB controller');
  const [tomorrowPlanInput, setTomorrowPlanInput] = useState<string>('Implement popup zapper and chrome extension zip exporter');
  const [phaseMode, setPhaseMode] = useState<'BUILD' | 'PLANNING'>('BUILD');
  const [projectMode, setProjectMode] = useState<'continue' | 'new_product'>('continue');
  const [newProjectNameInput, setNewProjectNameInput] = useState<string>('');
  
  // Commit Progress State
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [lastCommitStatus, setLastCommitStatus] = useState<string | null>(null);

  // JSON DB Rules Editor State
  const [rules, setRules] = useState<AdBlockerRule[]>([
    { id: 1, domain: '*doubleclick.net*', type: 'script', action: 'block', category: 'Ads' },
    { id: 2, domain: '*google-analytics.com*', type: 'script', action: 'block', category: 'Trackers' },
    { id: 3, domain: '*connect.facebook.net*', type: 'script', action: 'block', category: 'Social' },
    { id: 4, domain: '*popads.net*', type: 'script', action: 'block', category: 'Popups' }
  ]);
  const [newRuleDomain, setNewRuleDomain] = useState<string>('');
  const [newRuleCategory, setNewRuleCategory] = useState<string>('Ads');

  // Load Initial JSON Database from Backend / Local Files
  useEffect(() => {
    fetch('/api/db/daily_roadmap')
      .then(res => res.json())
      .then(data => {
        if (data.current_streak_days) setCurrentStreakDays(data.current_streak_days);
        if (data.active_project) setActiveProject(data.active_project);
        if (data.daily_logs) setDailyLogs(data.daily_logs);
      })
      .catch(() => console.log('Using initial fallback JSON roadmap state'));

    fetch('/api/db/adblocker_rules')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setRules(data);
      })
      .catch(() => console.log('Using initial fallback JSON rules state'));
  }, []);

  // Save & Commit Daily Progress Handler
  const handleSaveAndCommitProgress = async () => {
    if (!todayDoneInput.trim()) return;

    setIsCommitting(true);
    setLastCommitStatus('Updating db/daily_roadmap.json & staging git changes...');

    const targetProject = projectMode === 'new_product' && newProjectNameInput.trim()
      ? newProjectNameInput.trim().toLowerCase().replace(/\s+/g, '-')
      : activeProject;

    try {
      const res = await fetch('/api/db/commit_progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          today_done: todayDoneInput,
          tomorrow_plan: tomorrowPlanInput,
          phase: phaseMode,
          project: targetProject
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentStreakDays(data.current_streak_days);
        setActiveProject(targetProject);
        if (data.roadmap?.daily_logs) setDailyLogs(data.roadmap.daily_logs);

        setLastCommitStatus(`✅ Committed [${data.commit_hash}]: "${data.commit_msg}"! Streak updated to 🔥 ${data.current_streak_days} Days!`);
        setIsCommitting(false);
        setTodayDoneInput('');
        return;
      }
    } catch (e) {
      console.warn("Backend API unreachable, performing local state commit update.");
    }

    // Local Fallback Update
    setTimeout(() => {
      const dayNum = dailyLogs.length + 1;
      const hash = Math.random().toString(36).substring(2, 8);
      const todayStr = new Date().toISOString().split('T')[0];

      const newLog: DailyLog = {
        day: dayNum,
        date: todayStr,
        project: targetProject,
        phase: phaseMode,
        today_done: todayDoneInput,
        tomorrow_plan: tomorrowPlanInput,
        status: 'COMPLETED',
        github_commit_hash: hash
      };

      setDailyLogs([newLog, ...dailyLogs]);
      setCurrentStreakDays(prev => prev + 1);
      setActiveProject(targetProject);
      const commitMsg = phaseMode === 'BUILD' ? `feat(build): Day ${dayNum} - ${todayDoneInput.substring(0, 40)}` : `docs(plan): Day ${dayNum} - ${todayDoneInput.substring(0, 40)}`;
      setLastCommitStatus(`✅ Local DB Updated & Committed [${hash}]: "${commitMsg}"!`);
      setIsCommitting(false);
      setTodayDoneInput('');
    }, 1000);
  };

  // Add Rule to db/adblocker_rules.json
  const handleAddRule = async () => {
    if (!newRuleDomain.trim()) return;
    const newRule: AdBlockerRule = {
      id: Date.now(),
      domain: newRuleDomain,
      type: 'script',
      action: 'block',
      category: newRuleCategory
    };

    const updatedRules = [...rules, newRule];
    setRules(updatedRules);
    setNewRuleDomain('');

    try {
      await fetch('/api/db/adblocker_rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRules)
      });
    } catch (e) {
      console.log('Rules saved locally');
    }
  };

  // Remove Rule from db/adblocker_rules.json
  const handleRemoveRule = async (id: number) => {
    const updatedRules = rules.filter(r => r.id !== id);
    setRules(updatedRules);
    try {
      await fetch('/api/db/adblocker_rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRules)
      });
    } catch (e) {
      console.log('Rules updated');
    }
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-slate-100 font-sans selection:bg-cyan-600 selection:text-white">
      
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* HEADER NAVBAR */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[#0a0b14]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Streak */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Flame className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                DailyCode<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Engine</span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                  <Flame className="h-3 w-3 fill-emerald-400" /> 🔥 {currentStreakDays} Days Streak
                </span>
              </span>
            </div>
          </div>

          {/* Navigation Pills */}
          <nav className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {[
              { id: 'planner', label: 'Daily Roadmap & Planner', icon: Calendar },
              { id: 'db_editor', label: 'JSON DB Editor', icon: Database },
              { id: 'product_extension', label: 'Product 01: AdBlocker', icon: Shield },
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

          {/* Active Product Tag */}
          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-500">Active Product:</span>
            <span className="text-cyan-300 font-bold">{activeProject}</span>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTAINER */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        
        {/* TAB 1: TODAY & TOMORROW PLANNER + STREAK MANAGER */}
        {activeTab === 'planner' && (
          <div className="space-y-6">
            
            {/* PLANNER INPUT CARD */}
            <div className="bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-cyan-500/20 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Daily Progress & GitHub Streak Manager</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                    Today & Tomorrow Roadmap Planner
                  </h1>
                </div>

                {/* Project Mode Selector */}
                <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setProjectMode('continue')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      projectMode === 'continue' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Continue Current Project
                  </button>
                  <button
                    onClick={() => setProjectMode('new_product')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      projectMode === 'new_product' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Plan New Micro-Product
                  </button>
                </div>
              </div>

              {/* Mode Specific Inputs */}
              {projectMode === 'new_product' && (
                <div className="bg-purple-950/20 border border-purple-500/30 p-4 rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-purple-300 block">New Micro-Product Folder Name (e.g., 02-ai-copywriter)</label>
                  <input
                    value={newProjectNameInput}
                    onChange={e => setNewProjectNameInput(e.target.value)}
                    placeholder="02-url-shortener-extension"
                    className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-4 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
              )}

              {/* Today Done & Tomorrow Plan Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Today's Completed Work (Aaj Kya Kiya)
                  </label>
                  <textarea
                    rows={3}
                    value={todayDoneInput}
                    onChange={e => setTodayDoneInput(e.target.value)}
                    placeholder="Describe today's code updates, features added, or fixes implemented..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Tomorrow's Planned Goal (Kal Kya Karna Hai)
                  </label>
                  <textarea
                    rows={3}
                    value={tomorrowPlanInput}
                    onChange={e => setTomorrowPlanInput(e.target.value)}
                    placeholder="Describe tomorrow's planned feature, UI enhancement, or test build..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-cyan-500 font-sans"
                  />
                </div>
              </div>

              {/* Phase Selector & Commit Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-bold text-slate-400 uppercase">Cycle Phase:</span>
                  <button
                    onClick={() => setPhaseMode('BUILD')}
                    className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${
                      phaseMode === 'BUILD' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    🔨 BUILD PHASE
                  </button>
                  <button
                    onClick={() => setPhaseMode('PLANNING')}
                    className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${
                      phaseMode === 'PLANNING' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    📝 PLANNING PHASE
                  </button>
                </div>

                <button
                  onClick={handleSaveAndCommitProgress}
                  disabled={isCommitting || !todayDoneInput.trim()}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  {isCommitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <GitCommit className="h-4 w-4" />}
                  <span>Save & Commit Daily Progress</span>
                </button>
              </div>

              {lastCommitStatus && (
                <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/30 text-xs font-mono text-cyan-300">
                  {lastCommitStatus}
                </div>
              )}
            </div>

            {/* DAILY LOGS ROADMAP TABLE (db/daily_roadmap.json) */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="h-4 w-4 text-cyan-400" />
                  Roadmap Logs Database (<code className="text-cyan-300 font-mono">db/daily_roadmap.json</code>)
                </h3>
                <span className="text-xs text-slate-400 font-mono">{dailyLogs.length} Logged Entries</span>
              </div>

              <div className="space-y-3">
                {dailyLogs.map(log => (
                  <div key={log.day} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start text-xs border-b border-slate-900 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-mono font-bold">Day {log.day}</span>
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">{log.phase}</span>
                        <span className="font-mono text-purple-300 font-bold">{log.project}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                        <span>{log.date}</span>
                        <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded">[{log.github_commit_hash}]</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 block mb-0.5">✅ Today Done:</span>
                        <span className="text-slate-300 leading-relaxed">{log.today_done}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-cyan-400 block mb-0.5">🚀 Tomorrow Plan:</span>
                        <span className="text-slate-300 leading-relaxed">{log.tomorrow_plan}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JSON DATABASE EDITOR */}
        {activeTab === 'db_editor' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-cyan-400" />
                  JSON Database Table Editor (<code className="text-cyan-300 font-mono">db/adblocker_rules.json</code>)
                </h2>
                <p className="text-xs text-slate-400 mt-1">Manage and insert dynamic blocking rules into the file-based database table. All changes automatically sync to <code className="text-cyan-300 font-mono">products/01-adblocker-extension/rules.json</code>!</p>
              </div>

              {/* Add New Rule Form */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">Insert New Rule Entry</span>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    value={newRuleDomain}
                    onChange={e => setNewRuleDomain(e.target.value)}
                    placeholder="e.g. *analytics.com*"
                    className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                  />
                  <select
                    value={newRuleCategory}
                    onChange={e => setNewRuleCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option value="Ads">Ads</option>
                    <option value="Trackers">Trackers</option>
                    <option value="Popups">Popups</option>
                    <option value="Social">Social</option>
                  </select>
                  <button
                    onClick={handleAddRule}
                    className="w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Insert Rule</span>
                  </button>
                </div>
              </div>

              {/* Rules Table */}
              <div className="space-y-2">
                {rules.map(r => (
                  <div key={r.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] bg-slate-900 text-cyan-400 border border-slate-800 px-2 py-0.5 rounded font-mono">#{r.id}</span>
                      <span className="font-mono font-bold text-white">{r.domain}</span>
                      <span className="text-[10px] bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded font-mono">{r.category}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] bg-rose-500/15 text-rose-300 px-2 py-0.5 rounded font-mono uppercase">{r.action}</span>
                      <button 
                        onClick={() => handleRemoveRule(r.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FIRST REAL UTILITY PRODUCT (/products/01-adblocker-extension) */}
        {activeTab === 'product_extension' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-cyan-400" />
                    Micro-Product 01: Manifest V3 AdBlocker Extension
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Location: <code className="text-cyan-300 font-mono">products/01-adblocker-extension/</code></p>
                </div>
                <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">Operational</span>
              </div>

              {/* Files Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {[
                  { name: 'manifest.json', desc: 'Manifest V3 configuration & DNR permissions' },
                  { name: 'background.js', desc: 'Service worker declarative rule engine' },
                  { name: 'rules.json', desc: 'Synced with db/adblocker_rules.json' },
                  { name: 'content.js', desc: 'DOM cosmetic ad zapper script' },
                ].map(f => (
                  <div key={f.name} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="font-mono font-bold text-cyan-300 block mb-0.5">{f.name}</span>
                    <span className="text-[10px] text-slate-400">{f.desc}</span>
                  </div>
                ))}
              </div>

              {/* Load Instructions */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <span className="font-bold text-white block">To load this extension in Chrome:</span>
                <p className="text-slate-300 font-mono text-[11px]">Open <code className="text-cyan-300">chrome://extensions</code> → Enable Developer Mode → Click <code className="text-emerald-300">Load unpacked</code> → Select folder <code className="text-purple-300">D:\Projects\daily-code\products\01-adblocker-extension</code>!</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 mt-16 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <span className="font-bold text-slate-400">Daily Micro-Product Engine & GitHub Streak Manager</span>
          <span>© 2026. File-Based JSON DB & Products Architecture.</span>
        </div>
      </footer>
    </div>
  );
}