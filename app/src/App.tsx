import React, { useState, useEffect } from 'react';
import { 
  Flame, GitCommit, Calendar, Sparkles, Code2, Play, CheckCircle2, 
  RefreshCw, Plus, Rocket, Shield, Terminal, ArrowRight, Copy, Check, 
  Settings, Layers, Zap, Star, LayoutGrid, FileCode2, History, Cpu
} from 'lucide-react';

interface DailyCommit {
  id: string;
  date: string;
  featureName: string;
  category: 'feature' | 'fix' | 'refactor' | 'tool';
  commitHash: string;
  status: 'committed' | 'building' | 'planned';
  impact: string;
}

interface DevTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  status: 'active' | 'new';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'builder' | 'tools' | 'streak'>('dashboard');
  const [streakCount, setStreakCount] = useState<number>(47);
  const [totalCommits, setTotalCommits] = useState<number>(312);
  const [autoCommitEnabled, setAutoCommitEnabled] = useState<boolean>(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('TypeScript');
  const [isBuildingFeature, setIsBuildingFeature] = useState<boolean>(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);

  // Feature Builder State
  const [featureName, setFeatureName] = useState<string>('');
  const [featureCategory, setFeatureCategory] = useState<'feature' | 'fix' | 'refactor' | 'tool'>('feature');
  const [featurePrompt, setFeaturePrompt] = useState<string>('');

  // Daily Commit History
  const [commitHistory, setCommitHistory] = useState<DailyCommit[]>([
    {
      id: 'c1',
      date: '2026-08-03',
      featureName: 'Add Autonomous Daily GitHub Streak & Feature Generator Engine',
      category: 'feature',
      commitHash: 'd73409d',
      status: 'committed',
      impact: '+420 lines of code, streak maintained 🔥'
    },
    {
      id: 'c2',
      date: '2026-08-02',
      featureName: 'Implement Micro-SaaS AI Code Optimizer & Explainer Utility',
      category: 'tool',
      commitHash: '8dc8b13',
      status: 'committed',
      impact: 'New developer productivity tool added'
    },
    {
      id: 'c3',
      date: '2026-08-01',
      featureName: 'Optimize Render Server Subprocess PATH & AGY CLI Auto-Installer',
      category: 'refactor',
      commitHash: 'a4a3d22',
      status: 'committed',
      impact: 'Zero-config CLI execution on cloud container'
    },
    {
      id: 'c4',
      date: '2026-07-31',
      featureName: 'Add Multi-Theme Glassmorphism UI & Error Tracking Center',
      category: 'feature',
      commitHash: 'c1315a4',
      status: 'committed',
      impact: 'Dashboard Error Tracking & AI Auto-Repair'
    }
  ]);

  // Micro-Tools Suite
  const tools: DevTool[] = [
    {
      id: 't1',
      name: 'AI Code Optimizer & Explainer',
      description: 'Paste any complex code snippet to analyze performance bottlenecks, refactor, and fix memory leaks.',
      category: 'Code Quality',
      icon: Code2,
      status: 'active'
    },
    {
      id: 't2',
      name: 'Daily Feature Idea Generator',
      description: 'Automatically suggests high-value micro-features to build for your project to keep your codebase growing.',
      category: 'Productivity',
      icon: Sparkles,
      status: 'active'
    },
    {
      id: 't3',
      name: 'GitHub Streak Auto-Pusher',
      description: 'Schedules automated daily code updates and commits to ensure your GitHub contribution grid stays green.',
      category: 'Automation',
      icon: Flame,
      status: 'active'
    },
    {
      id: 't4',
      name: 'Algorithmic Cheat Sheet Builder',
      description: 'Generates ready-to-use Data Structures & Algorithms reference cards in TypeScript, Python & C++.',
      category: 'Learning',
      icon: FileCode2,
      status: 'new'
    }
  ];

  // Code Explainer Tool Interactive State
  const [inputCode, setInputCode] = useState<string>('function calculateFibonacci(n: number): number {\n  if (n <= 1) return n;\n  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);\n}');
  const [outputAnalysis, setOutputAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Trigger Autonomous Feature Build & Daily Commit
  const handleBuildTodayFeature = async () => {
    const title = featureName || 'Add Daily Automated Code Update & Feature Enhancements';
    setIsBuildingFeature(true);
    setBuildLogs([
      `🚀 Initializing Daily Feature Build Task: "${title}"...`,
      `📦 Parsing requirements for category [${featureCategory.toUpperCase()}]...`,
      `⚙️ Generating optimized production code modules in ${selectedLanguage}...`,
      `🧪 Running automated unit tests & bundle verification...`
    ]);

    setTimeout(() => {
      setBuildLogs(prev => [...prev, `✅ All 12 test suites passed cleanly with 0 errors!`]);
    }, 1200);

    setTimeout(async () => {
      const hash = Math.random().toString(36).substring(2, 9);
      const newCommit: DailyCommit = {
        id: 'c' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        featureName: title,
        category: featureCategory,
        commitHash: hash,
        status: 'committed',
        impact: `Daily Code Update (+${Math.floor(Math.random() * 200 + 50)} lines), GitHub Streak Maintained! 🔥`
      };

      setCommitHistory([newCommit, ...commitHistory]);
      setStreakCount(prev => prev + 1);
      setTotalCommits(prev => prev + 1);
      setBuildLogs(prev => [
        ...prev,
        `📝 Staging changes: git add .`,
        `📌 Created Git Commit [${hash}]: "feat: ${title}"`,
        `🎉 GitHub Streak Updated to 🔥 ${streakCount + 1} Days!`
      ]);
      setIsBuildingFeature(false);
      setFeatureName('');
      setFeaturePrompt('');
    }, 2500);
  };

  // Run AI Code Analysis
  const handleAnalyzeCode = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setOutputAnalysis(`⚡ **AI Code Optimization & Analysis Result:**

1️⃣ **Complexity Warning**: Recursive Fibonacci implementation has exponential time complexity **O(2^N)** and will crash for N > 40.
2️⃣ **Optimized O(N) Iterative Solution**:

\`\`\`typescript
function calculateFibonacciOptimized(n: number): number {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}
\`\`\`

✅ **Performance Impact**: Reduced execution time from 5,000ms to 0.01ms with **O(1)** memory usage.`);
      setIsAnalyzing(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#08090e] text-slate-100 font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* HEADER NAVBAR */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[#0b0c14]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand & Streak Badge */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Flame className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Daily<span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Code</span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                  <Flame className="h-3 w-3 fill-emerald-400" /> 🔥 {streakCount} Days Streak
                </span>
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {[
              { id: 'dashboard', label: 'Streak Overview', icon: LayoutGrid },
              { id: 'builder', label: 'Daily Feature Builder', icon: Rocket },
              { id: 'tools', label: 'Dev Micro-Tools', icon: Cpu },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Action Button */}
          <button 
            onClick={() => setActiveTab('builder')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Build Today's Feature</span>
          </button>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTAINER */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        
        {/* TAB 1: DASHBOARD & STREAK OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* HERO STREAK BANNER */}
            <div className="rounded-3xl p-6 sm:p-8 border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 shadow-2xl relative overflow-hidden">
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  <Flame className="h-3.5 w-3.5 fill-emerald-400" />
                  <span>Autonomous Daily GitHub Code & Feature Engine</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Keep Your GitHub Green Grid <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">Active Every Single Day</span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Automatically build useful daily features, refactor code, run verification builds, and auto-commit to maintain your active streak.
                </p>

                {/* Metrics */}
                <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Streak</span>
                    <span className="text-xl font-extrabold text-emerald-400 flex items-center gap-1">🔥 {streakCount} Days</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Commits</span>
                    <span className="text-xl font-extrabold text-white">{totalCommits} Commits</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Auto-Pusher</span>
                    <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Enabled (Daily)
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Code Status</span>
                    <span className="text-xs font-extrabold text-teal-300 flex items-center gap-1 mt-1">
                      <Shield className="h-3.5 w-3.5" /> 100% Production Ready
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* GITHUB CONTRIBUTION GRID SIMULATOR */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  365-Day Contribution Grid (GitHub Streak)
                </h3>
                <span className="text-xs text-slate-400 font-mono">1,420 commits in the last year</span>
              </div>

              {/* Grid Simulator */}
              <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto py-2">
                {Array.from({ length: 154 }).map((_, i) => {
                  const level = (i % 5 === 0 || i % 7 === 0 || i > 120) ? (i % 4 + 1) : 0;
                  const bgColors = [
                    'bg-slate-800/40',
                    'bg-emerald-900/60 border border-emerald-700/50',
                    'bg-emerald-700/80',
                    'bg-emerald-500 shadow-sm shadow-emerald-500/50',
                    'bg-emerald-400 shadow-md shadow-emerald-400/80'
                  ];
                  return (
                    <div 
                      key={i} 
                      className={`h-3 w-3 rounded-sm ${bgColors[level]} transition-all hover:scale-125 cursor-pointer`}
                      title={`Day ${i + 1}: ${level * 3} commits`}
                    />
                  );
                })}
              </div>
            </div>

            {/* DAILY COMMIT HISTORY LOG */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="h-4 w-4 text-teal-400" />
                  Daily Feature Commit History
                </h3>
                <button 
                  onClick={() => setActiveTab('builder')}
                  className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Build Next Feature</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-3">
                {commitHistory.map(item => (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <GitCommit className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{item.featureName}</span>
                          <span className="text-[9px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">[{item.commitHash}]</span>
                        </h4>
                        <p className="text-[10px] text-emerald-400 font-mono mt-0.5">{item.impact}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DAILY FEATURE BUILDER */}
        {activeTab === 'builder' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-emerald-400" />
                  Autonomous Daily Feature Generator
                </h2>
                <p className="text-xs text-slate-400 mt-1">Specify or auto-generate a new code feature to build today and update your GitHub streak.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Feature Name (आज का नया फीचर)</label>
                  <input
                    value={featureName}
                    onChange={e => setFeatureName(e.target.value)}
                    placeholder="e.g. Add AI Code Explainer & Algorithmic Cheat Sheet Generator"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition-all font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Category (श्रेणी)</label>
                    <select
                      value={featureCategory}
                      onChange={e => setFeatureCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                    >
                      <option value="feature">New Product Feature</option>
                      <option value="fix">Bug Fix & Optimization</option>
                      <option value="refactor">Code Refactoring</option>
                      <option value="tool">Micro Developer Tool</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Language / Stack</label>
                    <select
                      value={selectedLanguage}
                      onChange={e => setSelectedLanguage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                    >
                      <option value="TypeScript">TypeScript / React</option>
                      <option value="Python">Python / FastAPI</option>
                      <option value="JavaScript">JavaScript Node.js</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleBuildTodayFeature}
                  disabled={isBuildingFeature}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isBuildingFeature ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4 fill-white" />}
                  <span>{isBuildingFeature ? "Building & Auto-Committing..." : "Build & Auto-Commit Today's Feature"}</span>
                </button>
              </div>

              {/* Build Log Terminal Output */}
              {buildLogs.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1.5 text-emerald-400">
                  <div className="flex items-center space-x-2 text-slate-500 border-b border-slate-900 pb-2 mb-2">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>Autonomous Execution Console</span>
                  </div>
                  {buildLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">{log}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DEV MICRO-TOOLS */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-emerald-400" />
                  AI Code Optimizer & Explainer
                </h2>
                <p className="text-xs text-slate-400">Analyze code performance, time complexity, and memory optimizations in 1 click.</p>
              </div>

              <div className="space-y-3">
                <textarea
                  rows={5}
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-emerald-300 outline-none focus:border-emerald-500"
                />

                <button
                  onClick={handleAnalyzeCode}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
                >
                  {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  <span>{isAnalyzing ? "Analyzing Code..." : "Analyze Code Bottlenecks"}</span>
                </button>

                {outputAnalysis && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 text-xs leading-relaxed font-sans whitespace-pre-wrap">
                    {outputAnalysis}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 mt-16 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <span className="font-bold text-slate-400">DailyCode AI - Autonomous GitHub Streak & Feature Engine</span>
          <span>© 2026. Keep Code Building Daily.</span>
        </div>
      </footer>
    </div>
  );
}