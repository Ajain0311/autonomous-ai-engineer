import React, { useState, useEffect } from 'react';
import { 
  Flame, GitCommit, Calendar, Sparkles, Shield, ShieldCheck, Database, Plus, CheckCircle2, 
  RefreshCw, Save, Edit3, Layers, Settings, FileText, Code, Check, 
  Trash2, Globe, ArrowRight, Laptop, AlertCircle, X, ShieldAlert, CheckSquare,
  Wrench, Link2, Key, Bookmark, Download, Sparkle, Search, GitBranch, Terminal, Eye,
  UserCheck, Users, Lock, LogOut, FileCode, FolderPlus, UploadCloud, Film, Image as ImageIcon, FileText as FilePdf,
  ListOrdered, ArrowUp, ArrowDown, Zap, PlayCircle
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

interface GitCommitItem {
  hash: string;
  message: string;
  date: string;
  author: string;
}

interface MasterTableEntry {
  tableName: string;
  projectId: string;
  projectName: string;
  description: string;
  rowCount: number;
}

interface UserEntry {
  id: number;
  username: string;
  password?: string;
  role: 'super_admin' | 'developer' | 'viewer';
  enabled: boolean;
}

interface BlobAsset {
  id: number;
  filename: string;
  type: 'image' | 'video' | 'doc';
  url: string;
  size: string;
  created_at: string;
}

interface QueueItem {
  id: number;
  title: string;
  category: string;
  target_day: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'QUEUED' | 'ACTIVE' | 'COMPLETED';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'master_tables' | 'queue' | 'blob_storage' | 'user_mgmt' | 'planner' | 'git_status'>('master_tables');
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserEntry | null>({
    id: 1,
    username: 'admin',
    role: 'super_admin',
    enabled: true
  });
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<'user' | 'super_admin'>('user');
  const [loginUsername, setLoginUsername] = useState<string>('admin');
  const [loginPassword, setLoginPassword] = useState<string>('admin_password_123');

  // Database & Product States
  const [currentStreakDays, setCurrentStreakDays] = useState<number>(48);
  const [activeProject, setActiveProject] = useState<string>('product1_adblocker_extension');
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);

  // Master Tables & Search State
  const [masterTables, setMasterTables] = useState<MasterTableEntry[]>([]);
  const [masterSearch, setMasterSearch] = useState<string>('');
  const [showCreateTableModal, setShowCreateTableModal] = useState<boolean>(false);
  const [newTableTargetProduct, setNewTableTargetProduct] = useState<string>('product1_adblocker_extension');
  const [newTableNameInput, setNewTableNameInput] = useState<string>('');

  // Queue State
  const [productQueue, setProductQueue] = useState<QueueItem[]>([]);
  const [newQueueTitle, setNewQueueTitle] = useState<string>('');
  const [newQueueCategory, setNewQueueCategory] = useState<string>('Browser Utility');
  const [newQueueTargetDay, setNewQueueTargetDay] = useState<number>(4);
  const [newQueuePriority, setNewQueuePriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  // Selected Table Data Drawer State
  const [inspectTableModal, setInspectTableModal] = useState<{ projectId: string; tableName: string } | null>(null);
  const [inspectRows, setInspectRows] = useState<any[]>([]);
  const [newRowFieldValues, setNewRowFieldValues] = useState<Record<string, any>>({});

  // Blob Storage Tool State (Product 02)
  const [blobAssets, setBlobAssets] = useState<BlobAsset[]>([]);
  const [newBlobFilename, setNewBlobFilename] = useState<string>('');
  const [newBlobType, setNewBlobType] = useState<'image' | 'video' | 'doc'>('image');
  const [newBlobSize, setNewBlobSize] = useState<string>('1.5 MB');

  // User Management State
  const [usersList, setUsersList] = useState<UserEntry[]>([]);
  const [newUsernameInput, setNewUsernameInput] = useState<string>('');
  const [newUserPasswordInput, setNewUserPasswordInput] = useState<string>('');
  const [newUserRoleInput, setNewUserRoleInput] = useState<'super_admin' | 'developer' | 'viewer'>('developer');

  // Git Commit History & Toast State
  const [gitHistory, setGitHistory] = useState<GitCommitItem[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Planner Form State
  const [todayDoneInput, setTodayDoneInput] = useState<string>('Added Editable High-UX Upcoming Product Queue Studio to Dashboard');
  const [tomorrowPlanInput, setTomorrowPlanInput] = useState<string>('Promote Product 04 (URL Cleaner & UTM Stripper) from Queue');
  const [phaseMode, setPhaseMode] = useState<'BUILD' | 'PLANNING'>('BUILD');
  const [isCommitting, setIsCommitting] = useState<boolean>(false);

  // Fetch Master Data & Queue
  const fetchMasterTables = () => {
    fetch('/api/db/master_tables')
      .then(res => res.json())
      .then(data => {
        if (data.master_tables) setMasterTables(data.master_tables);
      })
      .catch(() => console.log('Master tables fallback'));
  };

  const fetchGitHistory = () => {
    fetch('/api/git/history')
      .then(res => res.json())
      .then(data => {
        if (data.commits) setGitHistory(data.commits);
      })
      .catch(() => console.log('Git history fallback'));
  };

  const fetchQueue = () => {
    fetch('/api/products/data/system_db/product_queue')
      .then(res => res.json())
      .then(data => {
        if (data.rows) setProductQueue(data.rows);
      })
      .catch(() => {
        setProductQueue([
          { id: 1, title: 'Product 04: URL Cleaner & UTM Parameter Stripper', category: 'Browser Utility', target_day: 2, priority: 'HIGH', status: 'QUEUED' },
          { id: 2, title: 'Product 05: One-Click Tab Group & Session Saver', category: 'Productivity Tool', target_day: 3, priority: 'HIGH', status: 'QUEUED' },
          { id: 3, title: 'Product 06: Offline Password & Security Token Generator', category: 'Security Tool', target_day: 4, priority: 'MEDIUM', status: 'QUEUED' },
          { id: 4, title: 'Product 07: Web Article to Clean Markdown Exporter', category: 'Content Tool', target_day: 5, priority: 'MEDIUM', status: 'QUEUED' }
        ]);
      });
  };

  useEffect(() => {
    fetchMasterTables();
    fetchGitHistory();
    fetchQueue();

    fetch('/api/db/daily_roadmap')
      .then(res => res.json())
      .then(data => {
        if (data.current_streak_days) setCurrentStreakDays(data.current_streak_days);
        if (data.active_project) setActiveProject(data.active_project);
        if (data.daily_logs) setDailyLogs(data.daily_logs);
      })
      .catch(() => console.log('Roadmap fallback'));
  }, []);

  // Handle Queue Add
  const handleAddQueueItem = async () => {
    if (!newQueueTitle.trim()) return;
    const newItem: QueueItem = {
      id: Date.now() % 10000,
      title: newQueueTitle.trim(),
      category: newQueueCategory,
      target_day: newQueueTargetDay,
      priority: newQueuePriority,
      status: 'QUEUED'
    };

    const updatedQueue = [...productQueue, newItem];
    setProductQueue(updatedQueue);
    setNewQueueTitle('');

    try {
      await fetch('/api/products/data/system_db/product_queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQueue)
      });
      setSuccessToast(`✅ Added '${newItem.title}' to Upcoming Product Queue!`);
      fetchGitHistory();
    } catch (e) {
      setSuccessToast('✅ Queue item added locally');
    }
  };

  // Move Queue Item Up/Down
  const handleMoveQueueItem = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === productQueue.length - 1) return;

    const updatedQueue = [...productQueue];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = updatedQueue[index];
    updatedQueue[index] = updatedQueue[targetIdx];
    updatedQueue[targetIdx] = temp;

    setProductQueue(updatedQueue);

    try {
      await fetch('/api/products/data/system_db/product_queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQueue)
      });
      setSuccessToast('✅ Queue order re-ordered & committed!');
    } catch (e) {
      console.log('Reordered locally');
    }
  };

  // Promote Queue Item to Active Building Product
  const handlePromoteQueueItem = async (itemId: number) => {
    try {
      const res = await fetch(`/api/products/queue/promote/${itemId}`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setActiveProject(data.folder_name);
        setSuccessToast(`🚀 Promoted item to active product '${data.folder_name}' with isolated DB & Git commit!`);
        fetchQueue();
        fetchMasterTables();
        fetchGitHistory();
      }
    } catch (e) {
      setSuccessToast('🚀 Promoted queue item locally');
    }
  };

  // Delete Queue Item
  const handleDeleteQueueItem = async (itemId: number) => {
    const updatedQueue = productQueue.filter(q => q.id !== itemId);
    setProductQueue(updatedQueue);
    try {
      await fetch('/api/products/data/system_db/product_queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQueue)
      });
    } catch (e) {
      console.log('Deleted');
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
        fetchGitHistory();
        return;
      }
    } catch (e) {
      console.warn('Backend offline');
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
              { id: 'master_tables', label: 'Master Tables Studio', icon: Database },
              { id: 'queue', label: 'Upcoming Queue', icon: ListOrdered },
              { id: 'blob_storage', label: 'GitHub Blob Storage', icon: UploadCloud },
              { id: 'user_mgmt', label: 'User Auth & RBAC', icon: Users },
              { id: 'planner', label: 'Roadmap & Streak', icon: Calendar },
              { id: 'git_status', label: 'Git Commit Feed', icon: GitBranch },
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
        
        {/* TAB 1: MASTER TABLES DIRECTORY */}
        {activeTab === 'master_tables' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-cyan-500/20 shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Database className="h-5 w-5 text-cyan-400" />
                    Master Tables Directory & Schema Studio
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">Global directory of all tables across system and product folders.</p>
                </div>
                <button
                  onClick={() => setShowCreateTableModal(true)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-md"
                >
                  <FolderPlus className="h-4 w-4" />
                  <span>Create New Table</span>
                </button>
              </div>

              {/* Master Tables Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {masterTables.map(tbl => (
                  <div key={`${tbl.projectId}-${tbl.tableName}`} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-cyan-300">{tbl.tableName}.json</span>
                        <span className="text-[10px] bg-slate-900 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                          {tbl.rowCount} Rows
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-purple-300 block">{tbl.projectName}</span>
                      <p className="text-xs text-slate-400">{tbl.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>app/{tbl.projectId}/db/</span>
                      <button
                        onClick={() => {
                          setInspectTableModal({ projectId: tbl.projectId, tableName: tbl.tableName });
                          fetch(`/api/products/data/${tbl.projectId}/${tbl.tableName}`)
                            .then(r => r.json())
                            .then(d => { if (d.rows) setInspectRows(d.rows); });
                        }}
                        className="px-2.5 py-1 bg-slate-900 text-cyan-300 rounded-lg font-bold border border-slate-800"
                      >
                        Inspect Data
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UPCOMING PRODUCT QUEUE STUDIO (HIGH-UX EDITABLE ROADMAP QUEUE) */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-purple-500/20 shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold mb-1">
                    <ListOrdered className="h-3.5 w-3.5 text-purple-400" />
                    <span>Editable Roadmap Queue</span>
                  </div>
                  <h1 className="text-xl font-extrabold text-white">Upcoming Micro-Product Building Queue</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Re-order, add, or 1-click promote upcoming daily micro-products for future streak days!</p>
                </div>
              </div>

              {/* Add Queue Item Form */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">Add Tool Idea to Upcoming Queue</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                  <input
                    placeholder="Product Title (e.g. Product 08: Password Manager)"
                    value={newQueueTitle}
                    onChange={e => setNewQueueTitle(e.target.value)}
                    className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500"
                  />
                  <select
                    value={newQueueCategory}
                    onChange={e => setNewQueueCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none"
                  >
                    <option value="Browser Utility">Browser Utility</option>
                    <option value="Productivity Tool">Productivity Tool</option>
                    <option value="Security Tool">Security Tool</option>
                    <option value="Content Tool">Content Tool</option>
                  </select>
                  <select
                    value={newQueuePriority}
                    onChange={e => setNewQueuePriority(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none"
                  >
                    <option value="HIGH">🔥 HIGH Priority</option>
                    <option value="MEDIUM">⚡ MEDIUM Priority</option>
                    <option value="LOW">🔹 LOW Priority</option>
                  </select>
                  <button
                    onClick={handleAddQueueItem}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add to Queue</span>
                  </button>
                </div>
              </div>

              {/* Queue Items List */}
              <div className="space-y-3">
                {productQueue.map((item, idx) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col space-y-1">
                        <button onClick={() => handleMoveQueueItem(idx, 'up')} className="text-slate-500 hover:text-cyan-400 p-0.5"><ArrowUp className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleMoveQueueItem(idx, 'down')} className="text-slate-500 hover:text-cyan-400 p-0.5"><ArrowDown className="h-3.5 w-3.5" /></button>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold">Day {item.target_day}</span>
                          <span className="text-sm font-bold text-white">{item.title}</span>
                        </div>
                        <span className="text-xs text-slate-400 block mt-0.5">{item.category} • Priority: <strong className="text-cyan-300">{item.priority}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handlePromoteQueueItem(item.id)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md cursor-pointer"
                      >
                        <Zap className="h-3.5 w-3.5 fill-white" />
                        <span>Promote to Active Product</span>
                      </button>
                      <button onClick={() => handleDeleteQueueItem(item.id)} className="text-slate-500 hover:text-rose-400 p-2"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BLOB STORAGE */}
        {activeTab === 'blob_storage' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-purple-500/20 shadow-2xl space-y-4">
              <h1 className="text-xl font-extrabold text-white">GitHub Blob Storage Utility</h1>
              <div className="space-y-2">
                {blobAssets.map(asset => (
                  <div key={asset.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between text-xs font-mono">
                    <span className="text-white font-bold">{asset.filename} ({asset.type})</span>
                    <a href={asset.url} target="_blank" rel="noreferrer" className="text-cyan-300 font-bold">View / Download</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: USER AUTH */}
        {activeTab === 'user_mgmt' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h1 className="text-xl font-extrabold text-white">User Auth & RBAC Studio</h1>
              <div className="space-y-2">
                {usersList.map(u => (
                  <div key={u.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between text-xs font-mono">
                    <span className="font-bold text-white">@{u.username}</span>
                    <span className="text-purple-300 font-bold uppercase">{u.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ROADMAP & PLANNER */}
        {activeTab === 'planner' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-cyan-500/20 shadow-2xl space-y-4">
              <h1 className="text-xl font-extrabold text-white">Daily Progress Planner</h1>
              <button onClick={handleCommitProgress} className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-xs font-bold">Save & Commit Progress</button>
            </div>
          </div>
        )}

        {/* TAB 6: GIT FEED */}
        {activeTab === 'git_status' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white">Live GitHub Commit History</h2>
              <div className="space-y-2">
                {gitHistory.map(c => (
                  <div key={c.hash} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">[{c.hash}] {c.message}</span>
                    <span className="text-slate-500">{c.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: CREATE TABLE MODAL */}
      {showCreateTableModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Create New Table</h3>
            <input
              placeholder="Table Name (e.g. session_logs)"
              value={newTableNameInput}
              onChange={e => setNewTableNameInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowCreateTableModal(false)} className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold">Cancel</button>
              <button onClick={handleCreateTableSubmit} className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold">Create & Commit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}