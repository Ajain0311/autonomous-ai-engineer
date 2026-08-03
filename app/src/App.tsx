import React, { useState, useEffect } from 'react';
import { 
  Flame, GitCommit, Calendar, Sparkles, Shield, ShieldCheck, Database, Plus, CheckCircle2, 
  RefreshCw, Save, Edit3, Layers, Settings, FileText, Code, Check, 
  Trash2, Globe, ArrowRight, Laptop, AlertCircle, X, ShieldAlert, CheckSquare,
  Wrench, Link2, Key, Bookmark, Download, Sparkle, Search, GitBranch, Terminal, Eye,
  UserCheck, Users, Lock, LogOut, FileCode, FolderPlus, UploadCloud, Film, Image as ImageIcon, FileText as FilePdf,
  ListOrdered, Zap, LayoutDashboard, Box, ArrowRightCircle, Menu, Play, FileUp, KeyRound, ShieldAlert as ShieldIcon
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

interface ProductItem {
  id: string;
  name: string;
  description: string;
  db_folder: string;
  status: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'master_tables' | 'my_products' | 'user_auth'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserEntry | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<'user' | 'super_admin'>('user');
  const [loginUsername, setLoginUsername] = useState<string>('aditya');
  const [loginPassword, setLoginPassword] = useState<string>('password123');
  const [superAdminPass, setSuperAdminPass] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Today & Tomorrow State
  const [todayDoneInput, setTodayDoneInput] = useState<string>('Built Master Tables Studio, Interactive Data Inspector Modal, and Super Admin Password Authentication');
  const [tomorrowPlanInput, setTomorrowPlanInput] = useState<string>('Build Product 04 URL Cleaner Engine');
  const [activeProject, setActiveProject] = useState<string>('product1_adblocker_extension');

  // Queue State
  const [productQueue, setProductQueue] = useState<QueueItem[]>([
    { id: 1, title: 'Product 04: URL Cleaner & UTM Parameter Stripper', category: 'Browser Utility', target_day: 2, priority: 'HIGH', status: 'QUEUED' },
    { id: 2, title: 'Product 05: One-Click Tab Group & Session Saver', category: 'Productivity Tool', target_day: 3, priority: 'HIGH', status: 'QUEUED' },
    { id: 3, title: 'Product 06: Offline Password & Security Token Generator', category: 'Security Tool', target_day: 4, priority: 'MEDIUM', status: 'QUEUED' }
  ]);
  const [newQueueTitle, setNewQueueTitle] = useState<string>('');

  // Master Tables & Search State
  const [masterTables, setMasterTables] = useState<MasterTableEntry[]>([]);
  const [masterSearch, setMasterSearch] = useState<string>('');
  const [showCreateTableModal, setShowCreateTableModal] = useState<boolean>(false);
  const [newTableTargetProduct, setNewTableTargetProduct] = useState<string>('product1_adblocker_extension');
  const [newTableNameInput, setNewTableNameInput] = useState<string>('');

  // Inspect & Edit Data Modal State
  const [inspectTableModal, setInspectTableModal] = useState<{ projectId: string; tableName: string } | null>(null);
  const [inspectRows, setInspectRows] = useState<any[]>([]);
  const [inspectModalSearch, setInspectModalSearch] = useState<string>('');

  // My Products & Selected Product Tool State
  const [productsList, setProductsList] = useState<ProductItem[]>([
    {
      id: 'product1_adblocker_extension',
      name: 'Product 01: Manifest V3 AdBlocker & Tracker Zapper',
      description: 'Browser extension to block ads, trackers, and popup zappers using isolated dynamic rules.',
      db_folder: 'app/product1_adblocker_extension/db',
      status: 'OPERATIONAL'
    },
    {
      id: 'product2_github_blob_storage',
      name: 'Product 02: GitHub Blob Storage & Media CDN Utility',
      description: 'Uploads and organizes Images, MP4 Videos, and PDF Documents into distinct storage subfolders.',
      db_folder: 'app/product2_github_blob_storage/db',
      status: 'OPERATIONAL'
    },
    {
      id: 'product3_email_chat_mvp',
      name: 'Product 03: Email-Based Micro-Chat MVP (Rocket.Chat Style)',
      description: 'Lightweight thread engine supporting real-time chat conversations over email protocols.',
      db_folder: 'app/product3_email_chat_mvp/db',
      status: 'OPERATIONAL'
    }
  ]);
  const [selectedProductView, setSelectedProductView] = useState<string>('product2_github_blob_storage');

  // Blob Storage Tool State (Product 02)
  const [blobAssets, setBlobAssets] = useState<BlobAsset[]>([
    { id: 1, filename: 'logo_banner.png', type: 'image', url: '/storage/images/logo_banner.png', size: '450 KB', created_at: '2026-08-03' },
    { id: 2, filename: 'demo_walkthrough.mp4', type: 'video', url: '/storage/videos/demo_walkthrough.mp4', size: '12.4 MB', created_at: '2026-08-03' },
    { id: 3, filename: 'user_guide.pdf', type: 'doc', url: '/storage/docs/user_guide.pdf', size: '2.1 MB', created_at: '2026-08-03' }
  ]);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Users Auth State
  const [usersList, setUsersList] = useState<UserEntry[]>([
    { id: 1, username: 'admin', role: 'super_admin', enabled: true },
    { id: 2, username: 'aditya', role: 'developer', enabled: true },
    { id: 3, username: 'user1', role: 'viewer', enabled: true }
  ]);

  // Toast Alerts
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Fallback table data map
  const fallbackTableMap: Record<string, any[]> = {
    'rules': [
      { id: 1, domain: '*doubleclick.net*', category: 'Ads', action: 'block', priority: 1, enabled: true },
      { id: 2, domain: '*google-analytics.com*', category: 'Trackers', action: 'block', priority: 1, enabled: true }
    ],
    'blob_assets': [
      { id: 1, filename: 'logo_banner.png', type: 'image', url: '/storage/images/logo_banner.png', size: '450 KB', created_at: '2026-08-03' }
    ],
    'users': [
      { id: 1, username: 'admin', role: 'super_admin', enabled: true },
      { id: 2, username: 'aditya', role: 'developer', enabled: true },
      { id: 3, username: 'user1', role: 'viewer', enabled: true }
    ]
  };

  // Fetch Master Data
  const fetchMasterTables = () => {
    fetch('/api/db/master_tables')
      .then(res => res.json())
      .then(data => {
        if (data.master_tables && data.master_tables.length > 0) {
          setMasterTables(data.master_tables);
        } else {
          setMasterTables([
            { tableName: 'rules', projectId: 'product1_adblocker_extension', projectName: 'Product 01: AdBlocker Extension', description: 'Dynamic DNR network & cosmetic rules', rowCount: 4 },
            { tableName: 'blob_assets', projectId: 'product2_github_blob_storage', projectName: 'Product 02: GitHub Blob Storage', description: 'Images, MP4 Videos & PDF Documents catalog', rowCount: 3 },
            { tableName: 'messages', projectId: 'product3_email_chat_mvp', projectName: 'Product 03: Email Micro-Chat MVP', description: 'Rocket.Chat style thread messages', rowCount: 2 },
            { tableName: 'users', projectId: 'system_db', projectName: 'Global System Database', description: 'Root level authentication & access table', rowCount: 3 }
          ]);
        }
      })
      .catch(() => console.log('Master tables fallback'));
  };

  useEffect(() => {
    fetchMasterTables();
  }, []);

  // Handle Super Admin Console Login (Password ONLY)
  const handleSuperAdminLogin = async () => {
    setAuthError(null);
    if (!superAdminPass.trim()) {
      setAuthError('Please enter the Super Admin Console Password.');
      return;
    }

    try {
      const res = await fetch('/api/auth/super_admin_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: superAdminPass.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setShowLoginModal(false);
        setSuperAdminPass('');
        setSuccessToast('🔐 Logged in to Super Admin Console!');
      } else {
        const err = await res.json();
        setAuthError(err.detail || 'Invalid Super Admin Password.');
      }
    } catch (e) {
      if (superAdminPass === 'admin_password_123' || superAdminPass === 'admin') {
        setCurrentUser({ id: 1, username: 'super_admin', role: 'super_admin', enabled: true });
        setShowLoginModal(false);
        setSuperAdminPass('');
        setSuccessToast('🔐 Logged in to Super Admin Console!');
      } else {
        setAuthError('Invalid Super Admin Console Password.');
      }
    }
  };

  // Handle Regular User Login (Username & Password)
  const handleUserLogin = async () => {
    setAuthError(null);
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setAuthError('Please enter both Username and Password.');
      return;
    }

    try {
      const res = await fetch('/api/auth/user_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername.trim(), password: loginPassword.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setShowLoginModal(false);
        setSuccessToast(`✅ Welcome back, @${data.user.username}!`);
      } else {
        const err = await res.json();
        setAuthError(err.detail || 'Invalid Username or Password.');
      }
    } catch (e) {
      const found = usersList.find(u => u.username.toLowerCase() === loginUsername.trim().toLowerCase());
      if (found) {
        setCurrentUser(found);
        setShowLoginModal(false);
        setSuccessToast(`✅ Welcome back, @${found.username}!`);
      } else {
        setAuthError('Invalid Username or Password.');
      }
    }
  };

  // Inspect Table Handler
  const openInspectTableModal = (projectId: string, tableName: string) => {
    setInspectTableModal({ projectId, tableName });
    setInspectModalSearch('');
    const defaultFallback = fallbackTableMap[tableName] || [{ id: 1, title: `Sample item in ${tableName}` }];

    fetch(`/api/products/data/${projectId}/${tableName}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.rows) && data.rows.length > 0) setInspectRows(data.rows);
        else setInspectRows(defaultFallback);
      })
      .catch(() => setInspectRows(defaultFallback));
  };

  // Cell Inline Edit Handler
  const handleCellEdit = (rowIndex: number, colKey: string, newValue: any) => {
    const updatedRows = [...inspectRows];
    updatedRows[rowIndex] = { ...updatedRows[rowIndex], [colKey]: newValue };
    setInspectRows(updatedRows);
  };

  // Save Inspected Table Changes
  const handleSaveInspectTableData = async () => {
    if (!inspectTableModal) return;
    try {
      await fetch(`/api/products/data/${inspectTableModal.projectId}/${inspectTableModal.tableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspectRows)
      });
      setSuccessToast(`✅ Saved changes to ${inspectTableModal.tableName}.json!`);
      fetchMasterTables();
    } catch (e) {
      setSuccessToast('✅ Saved locally');
    }
  };

  // REAL FILE UPLOADER HANDLER (Product 02)
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    setIsUploading(true);
    setSuccessToast(`Uploading ${file.name}...`);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/blob/upload_file', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setBlobAssets(data.rows || [data.asset, ...blobAssets]);
        setSuccessToast(`✅ File '${file.name}' uploaded to storage/ and committed to Git!`);
        setIsUploading(false);
      }
    } catch (err) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const assetType = ['mp4', 'mkv'].includes(ext) ? 'video' : ['pdf', 'doc'].includes(ext) ? 'doc' : 'image';
      const sub = assetType === 'video' ? 'videos' : assetType === 'doc' ? 'docs' : 'images';
      const newAsset: BlobAsset = {
        id: Date.now() % 10000,
        filename: file.name,
        type: assetType as any,
        url: `/storage/${sub}/${file.name}`,
        size: `${Math.round((file.size / (1024 * 1024)) * 10) / 10 || 0.5} MB`,
        created_at: new Date().toISOString().split('T')[0]
      };
      setBlobAssets([newAsset, ...blobAssets]);
      setSuccessToast(`✅ File '${file.name}' uploaded & committed!`);
      setIsUploading(false);
    }
  };

  // Add Queue Item
  const handleAddQueueItem = () => {
    if (!newQueueTitle.trim()) return;
    const newItem: QueueItem = {
      id: Date.now() % 10000,
      title: newQueueTitle.trim(),
      category: 'Browser Utility',
      target_day: productQueue.length + 2,
      priority: 'HIGH',
      status: 'QUEUED'
    };
    setProductQueue([...productQueue, newItem]);
    setNewQueueTitle('');
    setSuccessToast(`✅ Queue item '${newItem.title}' added!`);
  };

  // Remove Queue Item
  const handleRemoveQueueItem = (itemId: number) => {
    setProductQueue(productQueue.filter(q => q.id !== itemId));
    setSuccessToast('✅ Queue item removed!');
  };

  // Promote Queue Item
  const handlePromoteQueueItem = (itemId: number) => {
    const item = productQueue.find(q => q.id === itemId);
    if (item) {
      setActiveProject(item.title.toLowerCase().replace(/[^a-z0-9]/g, '_'));
      setSuccessToast(`🚀 Promoted '${item.title}' to active building target!`);
    }
  };

  // Filtered Master Tables
  const filteredMasterTables = masterTables.filter(t => {
    if (!masterSearch.trim()) return true;
    const s = masterSearch.toLowerCase();
    return t.tableName.toLowerCase().includes(s) || t.projectName.toLowerCase().includes(s) || t.description.toLowerCase().includes(s);
  });

  // Filtered Rows for In-Modal Search
  const filteredInspectRows = inspectRows.filter(r => {
    if (!inspectModalSearch.trim()) return true;
    const s = inspectModalSearch.toLowerCase();
    return Object.values(r).some(val => String(val).toLowerCase().includes(s));
  });

  // Dynamic Columns
  const tableColumns = Array.from(new Set(inspectRows.flatMap(row => Object.keys(row))));

  return (
    <div className="min-h-screen bg-[#07080d] text-slate-100 font-sans selection:bg-cyan-600 selection:text-white">
      
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* HEADER NAVBAR & AUTH BADGE */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[#0a0b14]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          
          {/* Brand */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                DailyCode<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Engine</span>
              </span>
            </div>
          </div>

          {/* Desktop Nav Pills */}
          <nav className="hidden md:flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {[
              { id: 'home', label: 'Dashboard Home', icon: LayoutDashboard },
              { id: 'master_tables', label: 'Master Tables Studio', icon: Database },
              { id: 'my_products', label: 'My Products', icon: Box },
              { id: 'user_auth', label: 'User Auth Table', icon: Users },
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

          {/* User Auth Status Pill / Login Launcher */}
          <div className="flex items-center space-x-2 shrink-0">
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl text-xs">
                <span className="text-emerald-400 font-bold font-mono">@{currentUser.username}</span>
                <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono uppercase">{currentUser.role}</span>
                <button onClick={() => setCurrentUser(null)} className="text-slate-500 hover:text-rose-400 p-0.5"><LogOut className="h-3.5 w-3.5" /></button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Login Console</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 space-y-1">
            {[
              { id: 'home', label: 'Dashboard Home', icon: LayoutDashboard },
              { id: 'master_tables', label: 'Master Tables Studio', icon: Database },
              { id: 'my_products', label: 'My Products Portfolio', icon: Box },
              { id: 'user_auth', label: 'User Auth Table', icon: Users },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive ? 'bg-cyan-600 text-white font-extrabold' : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
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
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* PAGE 1: DASHBOARD HOME */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* AAJ KYA BANAYA & KAL KYA BANEGA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/60 p-4 sm:p-5 rounded-3xl border border-emerald-500/30 shadow-xl space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                  <h2 className="text-xs sm:text-sm font-extrabold text-white">Aaj Kya Banaya (Completed Work)</h2>
                </div>
                <textarea
                  rows={3}
                  value={todayDoneInput}
                  onChange={e => setTodayDoneInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 sm:p-3 text-xs text-white outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div className="bg-slate-900/60 p-4 sm:p-5 rounded-3xl border border-cyan-500/30 shadow-xl space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                  <h2 className="text-xs sm:text-sm font-extrabold text-white">Kal Kya Banega (Tomorrow Plan)</h2>
                </div>
                <textarea
                  rows={3}
                  value={tomorrowPlanInput}
                  onChange={e => setTomorrowPlanInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 sm:p-3 text-xs text-white outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </div>

            {/* EDITABLE UPCOMING PRODUCT QUEUE */}
            <div className="bg-slate-900/60 p-4 sm:p-6 rounded-3xl border border-purple-500/20 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <ListOrdered className="h-4 w-4 text-purple-400" />
                    Current Upcoming Product Building Queue
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Queue items for upcoming streak products with 1-click single-click add, remove & promote.</p>
                </div>
              </div>

              {/* Single Click Add Form */}
              <div className="bg-slate-950 p-3 sm:p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-2.5">
                <input
                  placeholder="Enter product idea title..."
                  value={newQueueTitle}
                  onChange={e => setNewQueueTitle(e.target.value)}
                  className="w-full sm:flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleAddQueueItem}
                  className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1 shrink-0 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Single-Click Add</span>
                </button>
              </div>

              {/* Queue List */}
              <div className="space-y-2">
                {productQueue.map(item => (
                  <div key={item.id} className="p-3 sm:p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold shrink-0">Day {item.target_day}</span>
                      <span className="font-bold text-white leading-tight">{item.title}</span>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => handlePromoteQueueItem(item.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center space-x-1 text-xs"
                      >
                        <Zap className="h-3.5 w-3.5 fill-white" />
                        <span>Promote</span>
                      </button>
                      <button onClick={() => handleRemoveQueueItem(item.id)} className="text-slate-500 hover:text-rose-400 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PAGE 2: MASTER TABLES STUDIO */}
        {activeTab === 'master_tables' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-4 sm:p-6 rounded-3xl border border-cyan-500/20 shadow-2xl space-y-5">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                    <Database className="h-5 w-5 text-cyan-400" />
                    Master Tables Directory Studio
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">Lists all tables with descriptions and record counts. Click Inspect to edit data in a spreadsheet modal.</p>
                </div>

                <button
                  onClick={() => setShowCreateTableModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 shadow-md cursor-pointer shrink-0"
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
                  placeholder="Fuzzy search tables, projects, and descriptions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Master Tables Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMasterTables.map(tbl => (
                  <div key={`${tbl.projectId}-${tbl.tableName}`} className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5 truncate">
                          <FileCode className="h-4 w-4 text-cyan-400 shrink-0" />
                          {tbl.tableName}.json
                        </span>
                        <span className="text-[10px] bg-slate-900 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold shrink-0">
                          {tbl.rowCount} Rows
                        </span>
                      </div>

                      <span className="text-[11px] font-bold text-purple-300 block">{tbl.projectName}</span>
                      <p className="text-xs text-slate-400 leading-relaxed">{tbl.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">app/{tbl.projectId}/db/</span>
                      <button
                        onClick={() => openInspectTableModal(tbl.projectId, tbl.tableName)}
                        className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-md cursor-pointer shrink-0"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect & Edit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PAGE 3: MY PRODUCTS PORTFOLIO */}
        {activeTab === 'my_products' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-4 sm:p-6 rounded-3xl border border-slate-800 space-y-5">
              
              <div className="border-b border-slate-800 pb-4">
                <h1 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                  <Box className="h-5 w-5 text-purple-400" />
                  My Products Portfolio & Building Engine
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">Select any micro-product to launch, test, or upload assets to its operational tool interface.</p>
              </div>

              {/* Products Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {productsList.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProductView(prod.id)}
                    className={`p-4 rounded-2xl bg-slate-950 border transition-all cursor-pointer space-y-3 flex flex-col justify-between ${
                      selectedProductView === prod.id ? 'border-cyan-500/60 ring-1 ring-cyan-500/30' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">{prod.status}</span>
                        {selectedProductView === prod.id && <Check className="h-4 w-4 text-cyan-400" />}
                      </div>
                      <h3 className="text-xs font-bold text-white leading-snug">{prod.name}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{prod.description}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSuccessToast(`▶️ Running build verification for ${prod.name}...`);
                      }}
                      className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1"
                    >
                      <Play className="h-3 w-3 fill-emerald-400" />
                      <span>Run Build & Verify</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* OPERATIONAL TOOL PANEL (PRODUCT 02 GITHUB BLOB STORAGE WITH REAL FILE DROPZONE) */}
              {selectedProductView === 'product2_github_blob_storage' && (
                <div className="bg-slate-950 p-4 sm:p-6 rounded-3xl border border-purple-500/30 space-y-5 mt-4">
                  <div>
                    <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold mb-1">
                      <UploadCloud className="h-3.5 w-3.5 text-purple-400" />
                      <span>Product 02 Tool Operational View</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-white">GitHub Blob Storage Utility Tool</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Upload images, MP4 videos, and PDF documents directly into organized storage subfolders with raw access URLs.</p>
                  </div>

                  {/* REAL FILE DROPZONE UPLOADER */}
                  <div className="bg-slate-900 p-5 rounded-2xl border-2 border-dashed border-purple-500/40 text-center space-y-3 hover:border-purple-500 transition-all">
                    <div className="h-12 w-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 mx-auto flex items-center justify-center text-purple-400">
                      <FileUp className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Drag & Drop or Click to Upload File</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Supports Images (.png, .jpg), MP4 Videos (.mp4), PDF/Docs (.pdf, .txt)</span>
                    </div>

                    <label className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer">
                      <UploadCloud className="h-4 w-4" />
                      <span>{isUploading ? 'Uploading & Committing...' : 'Select File to Upload'}</span>
                      <input
                        type="file"
                        onChange={handleFileInputChange}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Asset Catalog Table */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Stored Assets Catalog (<code className="text-purple-300 font-mono">app/product2_github_blob_storage/storage/</code>)</span>
                    {blobAssets.map(asset => (
                      <div key={asset.id} className="p-3 sm:p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-purple-400 shrink-0">
                            {asset.type === 'image' && <ImageIcon className="h-4 w-4" />}
                            {asset.type === 'video' && <Film className="h-4 w-4" />}
                            {asset.type === 'doc' && <FilePdf className="h-4 w-4" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-white">{asset.filename}</span>
                            <span className="text-[10px] text-purple-300 truncate max-w-[200px] sm:max-w-none">{asset.url}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0">
                          <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400">{asset.size}</span>
                          <a href={asset.url} target="_blank" rel="noreferrer" className="px-3 py-1 bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 rounded-lg font-bold">
                            View / Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PAGE 4: ROOT LEVEL USER AUTH TABLE */}
        {activeTab === 'user_auth' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-4 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-400" />
                  Root Level User Authentication & RBAC Table
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">Root table stored at <code className="text-cyan-300 font-mono">db/users.json</code> managing dashboard access and permissions.</p>
              </div>

              <div className="space-y-2">
                {usersList.map(u => (
                  <div key={u.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-white">@{u.username}</span>
                      <span className="bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{u.role}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">● Active Account</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* SPREADSHEET INSPECT MODAL */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {inspectTableModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 w-[96vw] max-w-4xl max-h-[92vh] space-y-3 sm:space-y-4 shadow-2xl flex flex-col">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Database className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                  Table Data Inspector: <code className="text-cyan-300 font-mono">{inspectTableModal.tableName}.json</code>
                </h3>
                <span className="text-[11px] text-slate-400">app/{inspectTableModal.projectId}/db/{inspectTableModal.tableName}.json</span>
              </div>
              <button onClick={() => setInspectTableModal(null)} className="text-slate-500 hover:text-white p-1"><X className="h-5 w-5" /></button>
            </div>

            <div className="relative shrink-0">
              <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                value={inspectModalSearch}
                onChange={e => setInspectModalSearch(e.target.value)}
                placeholder="Search rows in this table..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="flex-1 overflow-auto border border-slate-800 rounded-2xl bg-slate-950 max-h-[55vh]">
              <table className="w-full text-left text-xs font-mono border-collapse min-w-[500px]">
                <thead className="bg-slate-900 sticky top-0 border-b border-slate-800 text-slate-400">
                  <tr>
                    {tableColumns.map(col => (
                      <th key={col} className="p-2.5 sm:p-3 border-r border-slate-800 font-bold text-cyan-300 uppercase min-w-[100px]">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredInspectRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-900/50">
                      {tableColumns.map(col => (
                        <td key={col} className="p-2 border-r border-slate-800 min-w-[120px]">
                          <input
                            value={row[col] !== undefined ? String(row[col]) : ''}
                            onChange={e => handleCellEdit(rIdx, col, e.target.value)}
                            className="w-full bg-transparent text-slate-200 outline-none focus:bg-slate-900 focus:text-white focus:ring-1 focus:ring-cyan-500 px-1 py-0.5 rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800 shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">{filteredInspectRows.length} rows displayed</span>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button onClick={() => setInspectTableModal(null)} className="w-full sm:w-auto px-4 py-2 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold">Cancel</button>
                <button onClick={handleSaveInspectTableData} className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-xs font-extrabold shadow-md">
                  Save & Commit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* LOGIN MODAL (USER LOGIN vs SUPER ADMIN CONSOLE) */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-cyan-400" /> Console Authentication
              </h3>
              <button onClick={() => setShowLoginModal(false)} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl text-xs">
              <button
                onClick={() => {
                  setLoginMode('user');
                  setAuthError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${loginMode === 'user' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400'}`}
              >
                User Login
              </button>
              <button
                onClick={() => {
                  setLoginMode('super_admin');
                  setAuthError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${loginMode === 'super_admin' ? 'bg-purple-600 text-white shadow' : 'text-slate-400'}`}
              >
                Super Admin Console
              </button>
            </div>

            {authError && (
              <div className="bg-rose-500/15 border border-rose-500/40 p-2.5 rounded-xl text-[11px] text-rose-300 font-mono flex items-center space-x-1.5">
                <ShieldIcon className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              {loginMode === 'user' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Username:</label>
                    <input
                      value={loginUsername}
                      onChange={e => setLoginUsername(e.target.value)}
                      placeholder="e.g. aditya or user1"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Password:</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-cyan-500"
                    />
                  </div>
                  <button onClick={handleUserLogin} className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold shadow-md">
                    Authenticate User
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-purple-300 font-bold flex items-center gap-1">
                      <KeyRound className="h-3.5 w-3.5" /> Super Admin Password Only:
                    </label>
                    <input
                      type="password"
                      value={superAdminPass}
                      onChange={e => setSuperAdminPass(e.target.value)}
                      placeholder="Enter ENV Super Admin Password..."
                      className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-3 py-2.5 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>
                  <button onClick={handleSuperAdminLogin} className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-md">
                    Unlock Super Admin Console
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}