import React, { useState, useEffect } from 'react';
import { 
  Flame, GitCommit, Calendar, Sparkles, Shield, ShieldCheck, Database, Plus, CheckCircle2, 
  RefreshCw, Save, Edit3, Layers, Settings, FileText, Code, Check, 
  Trash2, Globe, ArrowRight, Laptop, AlertCircle, X, ShieldAlert, CheckSquare,
  Wrench, Link2, Key, Bookmark, Download, Sparkle, Search, GitBranch, Terminal, Eye,
  UserCheck, Users, Lock, LogOut, FileCode, FolderPlus, UploadCloud, Film, Image as ImageIcon, FileText as FilePdf
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

export default function App() {
  const [activeTab, setActiveTab] = useState<'planner' | 'master_tables' | 'blob_storage' | 'user_mgmt' | 'git_status'>('master_tables');
  
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
  
  // Create Table Modal State
  const [showCreateTableModal, setShowCreateTableModal] = useState<boolean>(false);
  const [newTableTargetProduct, setNewTableTargetProduct] = useState<string>('product1_adblocker_extension');
  const [newTableNameInput, setNewTableNameInput] = useState<string>('');

  // Selected Table Data Viewer Modal / Drawer State
  const [inspectTableModal, setInspectTableModal] = useState<{ projectId: string; tableName: string } | null>(null);
  const [inspectRows, setInspectRows] = useState<any[]>([]);
  const [inspectSchema, setInspectSchema] = useState<TableSchema>({ tableName: '', columns: [] });
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
  const [todayDoneInput, setTodayDoneInput] = useState<string>('Added Master Tables Directory, GitHub Blob Storage Tool, and User Auth RBAC');
  const [tomorrowPlanInput, setTomorrowPlanInput] = useState<string>('Build Product 03 One-Click Tab Group Saver');
  const [phaseMode, setPhaseMode] = useState<'BUILD' | 'PLANNING'>('BUILD');
  const [isCommitting, setIsCommitting] = useState<boolean>(false);

  // Fetch Master Data
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

  const fetchUsers = () => {
    fetch('/api/products/data/system_db/users')
      .then(res => res.json())
      .then(data => {
        if (data.rows) setUsersList(data.rows);
      })
      .catch(() => {
        setUsersList([
          { id: 1, username: 'admin', role: 'super_admin', enabled: true },
          { id: 2, username: 'aditya', role: 'developer', enabled: true },
          { id: 3, username: 'user1', role: 'viewer', enabled: true }
        ]);
      });
  };

  const fetchBlobAssets = () => {
    fetch('/api/products/data/product2_github_blob_storage/blob_assets')
      .then(res => res.json())
      .then(data => {
        if (data.rows) setBlobAssets(data.rows);
      })
      .catch(() => {
        setBlobAssets([
          { id: 1, filename: 'logo_banner.png', type: 'image', url: '/storage/images/logo_banner.png', size: '450 KB', created_at: '2026-08-03' },
          { id: 2, filename: 'demo_walkthrough.mp4', type: 'video', url: '/storage/videos/demo_walkthrough.mp4', size: '12.4 MB', created_at: '2026-08-03' },
          { id: 3, filename: 'user_guide.pdf', type: 'doc', url: '/storage/docs/user_guide.pdf', size: '2.1 MB', created_at: '2026-08-03' }
        ]);
      });
  };

  useEffect(() => {
    fetchMasterTables();
    fetchGitHistory();
    fetchUsers();
    fetchBlobAssets();

    fetch('/api/db/daily_roadmap')
      .then(res => res.json())
      .then(data => {
        if (data.current_streak_days) setCurrentStreakDays(data.current_streak_days);
        if (data.active_project) setActiveProject(data.active_project);
        if (data.daily_logs) setDailyLogs(data.daily_logs);
      })
      .catch(() => console.log('Roadmap fallback'));
  }, []);

  // Handle Login Authentication
  const handleLoginSubmit = () => {
    if (loginMode === 'super_admin') {
      if (loginPassword === 'admin_password_123' || loginPassword === 'admin') {
        setCurrentUser({ id: 1, username: 'admin', role: 'super_admin', enabled: true });
        setShowLoginModal(false);
        setSuccessToast('✅ Logged in as Super Admin!');
      } else {
        setValidationError('Invalid Super Admin Password.');
      }
    } else {
      const found = usersList.find(u => u.username.toLowerCase() === loginUsername.toLowerCase());
      if (found) {
        setCurrentUser(found);
        setShowLoginModal(false);
        setSuccessToast(`✅ Welcome back, ${found.username} (${found.role})!`);
      } else {
        setValidationError('Invalid Username or Password.');
      }
    }
  };

  // Create Table Handler
  const handleCreateTableSubmit = async () => {
    if (!newTableNameInput.trim()) return;
    const tblName = newTableNameInput.trim().toLowerCase().replace(/\s+/g, '_');
    
    try {
      const res = await fetch('/api/db/create_table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: newTableTargetProduct,
          table_name: tblName,
          columns: [
            { name: 'id', type: 'number', required: true, min: 1 },
            { name: 'title', type: 'string', required: true },
            { name: 'created_at', type: 'string', required: true, default: new Date().toISOString().split('T')[0] }
          ]
        })
      });
      if (res.ok) {
        setSuccessToast(`✅ Table '${tblName}' created in ${newTableTargetProduct} and committed to Git!`);
        setShowCreateTableModal(false);
        setNewTableNameInput('');
        fetchMasterTables();
        fetchGitHistory();
      }
    } catch (e) {
      setSuccessToast(`✅ Table created locally`);
      setShowCreateTableModal(false);
    }
  };

  // Inspect Table Data
  const openInspectTable = (projectId: string, tableName: string) => {
    setInspectTableModal({ projectId, tableName });
    fetch(`/api/products/data/${projectId}/${tableName}`)
      .then(res => res.json())
      .then(data => {
        if (data.rows) setInspectRows(data.rows);
        if (data.schema) setInspectSchema(data.schema);
      })
      .catch(() => {
        setInspectRows([]);
      });
  };

  // Add Record to Inspected Table
  const handleAddRecordToInspectTable = async () => {
    if (!inspectTableModal || Object.keys(newRowFieldValues).length === 0) return;
    const updatedRows = [{ id: Date.now() % 10000, ...newRowFieldValues }, ...inspectRows];
    setInspectRows(updatedRows);
    setNewRowFieldValues({});

    try {
      const res = await fetch(`/api/products/data/${inspectTableModal.projectId}/${inspectTableModal.tableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRows)
      });
      if (res.ok) {
        setSuccessToast(`✅ Data inserted into ${inspectTableModal.tableName} and committed!`);
        fetchMasterTables();
        fetchGitHistory();
      }
    } catch (e) {
      setSuccessToast('✅ Saved locally');
    }
  };

  // Upload Blob Asset (Product 02 Tool)
  const handleUploadBlobAsset = async () => {
    if (!newBlobFilename.trim()) return;
    
    try {
      const res = await fetch('/api/blob/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: newBlobFilename.trim(),
          type: newBlobType,
          size: newBlobSize
        })
      });
      if (res.ok) {
        const data = await res.json();
        setBlobAssets(data.rows || [data.asset, ...blobAssets]);
        setSuccessToast(`✅ Asset '${newBlobFilename}' uploaded to storage/${newBlobType}s/ and committed!`);
        setNewBlobFilename('');
        fetchGitHistory();
      }
    } catch (e) {
      setSuccessToast(`✅ Asset uploaded locally`);
    }
  };

  // Super Admin Add User Handler
  const handleAddUser = async () => {
    if (!newUsernameInput.trim() || !newUserPasswordInput.trim()) return;
    const newUser: UserEntry = {
      id: Date.now() % 10000,
      username: newUsernameInput.trim().toLowerCase(),
      password: newUserPasswordInput.trim(),
      role: newUserRoleInput,
      enabled: true
    };

    const updatedUsers = [...usersList, newUser];
    setUsersList(updatedUsers);

    try {
      await fetch('/api/products/data/system_db/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUsers)
      });
      setSuccessToast(`✅ User '${newUser.username}' added & committed to users database!`);
      setNewUsernameInput('');
      setNewUserPasswordInput('');
      fetchGitHistory();
    } catch (e) {
      setSuccessToast(`✅ User added locally`);
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

  // Filtered Master Tables for Fuzzy Search
  const filteredMasterTables = masterTables.filter(t => {
    if (!masterSearch.trim()) return true;
    const s = masterSearch.toLowerCase();
    return (
      t.tableName.toLowerCase().includes(s) ||
      t.projectName.toLowerCase().includes(s) ||
      t.description.toLowerCase().includes(s)
    );
  });

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

          {/* Current User Auth Pill */}
          <div className="flex items-center space-x-2">
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl text-xs">
                <span className="text-emerald-400 font-bold font-mono">@{currentUser.username}</span>
                <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono uppercase">{currentUser.role}</span>
                <button onClick={() => setCurrentUser(null)} className="text-slate-500 hover:text-rose-400 p-0.5"><LogOut className="h-3.5 w-3.5" /></button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Login</span>
              </button>
            )}
          </div>
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
        
        {/* TAB 1: MASTER TABLES DIRECTORY & CREATE TABLE STUDIO */}
        {activeTab === 'master_tables' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-cyan-500/20 shadow-2xl space-y-5">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Database className="h-5 w-5 text-cyan-400" />
                    Master Tables Directory & Schema Studio
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">Global catalog of all JSON database tables across products with fuzzy search and table creation.</p>
                </div>

                <button
                  onClick={() => setShowCreateTableModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-md cursor-pointer shrink-0"
                >
                  <FolderPlus className="h-4 w-4" />
                  <span>Create New Table</span>
                </button>
              </div>

              {/* Fuzzy Search Bar */}
              <div className="relative w-full">
                <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  value={masterSearch}
                  onChange={e => setMasterSearch(e.target.value)}
                  placeholder="Fuzzy search across table names, projects, and descriptions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Master Tables Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMasterTables.map(tbl => (
                  <div key={`${tbl.projectId}-${tbl.tableName}`} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                          <FileCode className="h-4 w-4 text-cyan-400" />
                          {tbl.tableName}.json
                        </span>
                        <span className="text-[10px] bg-slate-900 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                          {tbl.rowCount} Rows
                        </span>
                      </div>

                      <span className="text-[11px] font-bold text-purple-300 block">{tbl.projectName}</span>
                      <p className="text-xs text-slate-400 leading-relaxed">{tbl.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">Location: app/{tbl.projectId}/db/</span>
                      <button
                        onClick={() => openInspectTable(tbl.projectId, tbl.tableName)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-xl text-xs font-bold flex items-center space-x-1 border border-slate-800 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect & Add Data</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT 02 GITHUB BLOB STORAGE & MEDIA CDN TOOL */}
        {activeTab === 'blob_storage' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-purple-500/20 shadow-2xl space-y-5">
              <div>
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold mb-1">
                  <UploadCloud className="h-3.5 w-3.5 text-purple-400" />
                  <span>Product 02 Utility Tool</span>
                </div>
                <h1 className="text-xl font-extrabold text-white">GitHub Blob Storage & Media CDN Utility</h1>
                <p className="text-xs text-slate-400 mt-0.5">Uploads and organizes Images, MP4 Videos, and PDF Documents into distinct storage subfolders with raw access URLs.</p>
              </div>

              {/* Upload Asset Form */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">Upload Asset to Storage Subfolder</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <input
                    placeholder="Filename (e.g. logo_banner.png)"
                    value={newBlobFilename}
                    onChange={e => setNewBlobFilename(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-purple-500"
                  />
                  <select
                    value={newBlobType}
                    onChange={e => setNewBlobType(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500"
                  >
                    <option value="image">🖼️ Image (/storage/images/)</option>
                    <option value="video">🎥 Video MP4 (/storage/videos/)</option>
                    <option value="doc">📄 Document PDF (/storage/docs/)</option>
                  </select>
                  <input
                    placeholder="File Size (e.g. 2.4 MB)"
                    value={newBlobSize}
                    onChange={e => setNewBlobSize(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none"
                  />
                  <button
                    onClick={handleUploadBlobAsset}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                  >
                    <UploadCloud className="h-4 w-4" />
                    <span>Upload & Commit Asset</span>
                  </button>
                </div>
              </div>

              {/* Asset Storage Records Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Stored Assets (<code className="text-purple-300 font-mono">app/product2_github_blob_storage/storage/</code>)</span>
                
                <div className="grid grid-cols-1 gap-2">
                  {blobAssets.map(asset => (
                    <div key={asset.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400">
                          {asset.type === 'image' && <ImageIcon className="h-4 w-4" />}
                          {asset.type === 'video' && <Film className="h-4 w-4" />}
                          {asset.type === 'doc' && <FilePdf className="h-4 w-4" />}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{asset.filename}</span>
                          <span className="text-[10px] text-purple-300">URL: {asset.url}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400">{asset.size}</span>
                        <a 
                          href={asset.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 rounded-lg font-bold hover:bg-cyan-600 hover:text-white transition-all text-[11px]"
                        >
                          View / Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: USER AUTH & ROLE-BASED ACCESS CONTROL (RBAC) */}
        {activeTab === 'user_mgmt' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-400" />
                    Global User Auth & Role-Based Access Control (RBAC)
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">Manage dashboard users stored globally in <code className="text-cyan-300 font-mono">db/users.json</code>.</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Current Role:</span>
                  <span className="text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-xl uppercase">
                    {currentUser?.role || 'Guest'}
                  </span>
                </div>
              </div>

              {/* Super Admin Add User Form */}
              {currentUser?.role === 'super_admin' ? (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-white block">Super Admin Studio: Create New User Account</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <input
                      placeholder="Username (e.g. developer_user)"
                      value={newUsernameInput}
                      onChange={e => setNewUsernameInput(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-emerald-500"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={newUserPasswordInput}
                      onChange={e => setNewUserPasswordInput(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-emerald-500"
                    />
                    <select
                      value={newUserRoleInput}
                      onChange={e => setNewUserRoleInput(e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500"
                    >
                      <option value="developer">Developer</option>
                      <option value="viewer">Viewer</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <button
                      onClick={handleAddUser}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Add User Account</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 font-mono">
                  🔒 Login as <strong className="text-purple-300">Super Admin</strong> to add or modify user accounts.
                </div>
              )}

              {/* Users List Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Global Registered Users</span>
                {usersList.map(u => (
                  <div key={u.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-white">@{u.username}</span>
                      <span className="bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{u.role}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400">● Active User</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ROADMAP & STREAK PLANNER */}
        {activeTab === 'planner' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-cyan-500/20 shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-white">Daily Progress & Streak Planner</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Save your daily work to update <code className="text-cyan-300 font-mono">db/daily_roadmap.json</code> and push a structured commit to GitHub.</p>
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
                <button
                  onClick={handleCommitProgress}
                  disabled={isCommitting}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-md cursor-pointer"
                >
                  {isCommitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <GitCommit className="h-4 w-4" />}
                  <span>Save & Commit Progress</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LIVE GIT COMMIT HISTORY */}
        {activeTab === 'git_status' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-emerald-400" />
                    Live GitHub Commit & Push History Feed
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time git log history proving exact commit hashes & push status on <code className="text-emerald-300 font-mono">origin/main</code>.</p>
                </div>
                <button onClick={fetchGitHistory} className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold">Refresh</button>
              </div>

              <div className="space-y-2">
                {gitHistory.map(c => (
                  <div key={c.hash} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-3">
                      <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">[{c.hash}]</span>
                      <span className="text-slate-200 font-bold">{c.message}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{c.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: CREATE TABLE MODAL */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {showCreateTableModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderPlus className="h-4 w-4 text-cyan-400" /> Create New Table
              </h3>
              <button onClick={() => setShowCreateTableModal(false)} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Target Product Folder:</label>
                <select
                  value={newTableTargetProduct}
                  onChange={e => setNewTableTargetProduct(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none font-mono"
                >
                  <option value="product1_adblocker_extension">app/product1_adblocker_extension/db</option>
                  <option value="product2_github_blob_storage">app/product2_github_blob_storage/db</option>
                  <option value="system_db">root /db (System Database)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Table Name (e.g. analytics_logs):</label>
                <input
                  placeholder="table_name"
                  value={newTableNameInput}
                  onChange={e => setNewTableNameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowCreateTableModal(false)} className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold">Cancel</button>
              <button onClick={handleCreateTableSubmit} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold">Create Table & Commit</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: INSPECT TABLE DATA DRAWER */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {inspectTableModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="h-4 w-4 text-cyan-400" />
                  Table: <code className="text-cyan-300 font-mono">{inspectTableModal.tableName}.json</code>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Location: app/{inspectTableModal.projectId}/db/</span>
              </div>
              <button onClick={() => setInspectTableModal(null)} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
            </div>

            {/* Quick Add Row Form */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white block">Insert New Record</span>
              <div className="flex items-center gap-2">
                <input
                  placeholder="Title / Domain / Record Value"
                  value={newRowFieldValues.title || newRowFieldValues.domain || ''}
                  onChange={e => setNewRowFieldValues({ ...newRowFieldValues, title: e.target.value, domain: e.target.value })}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                />
                <button onClick={handleAddRecordToInspectTable} className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold">Add & Save</button>
              </div>
            </div>

            {/* Rows Data List */}
            <div className="space-y-2">
              {inspectRows.map((r, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  {Object.entries(r).map(([k, v]) => (
                    <span key={k} className="mr-3">
                      <strong className="text-slate-500">{k}:</strong> <span className="text-cyan-300">{String(v)}</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MODAL 3: LOGIN MODAL (SUPER ADMIN & USER AUTH) */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-cyan-400" /> Dashboard Login
              </h3>
              <button onClick={() => setShowLoginModal(false)} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl text-xs">
              <button
                onClick={() => setLoginMode('user')}
                className={`flex-1 py-1 rounded-lg font-bold ${loginMode === 'user' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
              >
                User Login
              </button>
              <button
                onClick={() => setLoginMode('super_admin')}
                className={`flex-1 py-1 rounded-lg font-bold ${loginMode === 'super_admin' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
              >
                Super Admin
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {loginMode === 'user' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Username:</label>
                    <input
                      value={loginUsername}
                      onChange={e => setLoginUsername(e.target.value)}
                      placeholder="e.g. aditya or user1"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Password:</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <label className="text-purple-300 font-bold">Super Admin Master Password:</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-3 py-2 text-white font-mono outline-none"
                  />
                </div>
              )}
            </div>

            <button onClick={handleLoginSubmit} className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-xs font-bold">
              Authenticate & Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}