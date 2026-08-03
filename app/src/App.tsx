import React, { useState, useEffect } from 'react';
import { 
  Flame, GitCommit, Calendar, Sparkles, Shield, ShieldCheck, Database, Plus, CheckCircle2, 
  RefreshCw, Save, Edit3, Layers, Settings, FileText, Code, Check, 
  Trash2, Globe, ArrowRight, Laptop, AlertCircle, X, ShieldAlert, CheckSquare,
  Wrench, Link2, Key, Bookmark, Download, Sparkle, Search, GitBranch, Terminal, Eye,
  UserCheck, Users, Lock, LogOut, FileCode, FolderPlus, UploadCloud, Film, Image as ImageIcon, FileText as FilePdf,
  ListOrdered, Zap, LayoutDashboard, Box, ArrowRightCircle
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
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserEntry | null>({
    id: 1,
    username: 'admin',
    role: 'super_admin',
    enabled: true
  });
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginUsername, setLoginUsername] = useState<string>('admin');
  const [loginPassword, setLoginPassword] = useState<string>('admin_password_123');

  // Today & Tomorrow State
  const [todayDoneInput, setTodayDoneInput] = useState<string>('Built Master Tables Studio, Interactive Data Inspector Modal, and GitHub Blob Storage Tool');
  const [tomorrowPlanInput, setTomorrowPlanInput] = useState<string>('Build Product 04 URL Cleaner Engine');
  const [activeProject, setActiveProject] = useState<string>('product1_adblocker_extension');

  // Queue State
  const [productQueue, setProductQueue] = useState<QueueItem[]>([]);
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
  const [newRowFieldValues, setNewRowFieldValues] = useState<Record<string, any>>({});

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
  const [blobAssets, setBlobAssets] = useState<BlobAsset[]>([]);
  const [newBlobFilename, setNewBlobFilename] = useState<string>('');
  const [newBlobType, setNewBlobType] = useState<'image' | 'video' | 'doc'>('image');
  const [newBlobSize, setNewBlobSize] = useState<string>('1.5 MB');

  // Users Auth State
  const [usersList, setUsersList] = useState<UserEntry[]>([]);

  // Toast Alerts
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Fetch Master Data
  const fetchMasterTables = () => {
    fetch('/api/db/master_tables')
      .then(res => res.json())
      .then(data => {
        if (data.master_tables) setMasterTables(data.master_tables);
      })
      .catch(() => console.log('Master tables fallback'));
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
          { id: 3, title: 'Product 06: Offline Password & Security Token Generator', category: 'Security Tool', target_day: 4, priority: 'MEDIUM', status: 'QUEUED' }
        ]);
      });
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
    fetchQueue();
    fetchUsers();
    fetchBlobAssets();
  }, []);

  // Inspect Table Handler
  const openInspectTableModal = (projectId: string, tableName: string) => {
    setInspectTableModal({ projectId, tableName });
    setInspectModalSearch('');
    fetch(`/api/products/data/${projectId}/${tableName}`)
      .then(res => res.json())
      .then(data => {
        if (data.rows) setInspectRows(data.rows);
      })
      .catch(() => setInspectRows([]));
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
      const res = await fetch(`/api/products/data/${inspectTableModal.projectId}/${inspectTableModal.tableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspectRows)
      });
      if (res.ok) {
        setSuccessToast(`✅ Saved & Committed changes to ${inspectTableModal.tableName}.json!`);
        fetchMasterTables();
      }
    } catch (e) {
      setSuccessToast('✅ Saved locally');
    }
  };

  // Add Record to Inspected Table
  const handleAddRecordToInspectTable = () => {
    if (Object.keys(newRowFieldValues).length === 0) return;
    const newRecord = { id: Date.now() % 10000, ...newRowFieldValues };
    setInspectRows([newRecord, ...inspectRows]);
    setNewRowFieldValues({});
  };

  // Add Queue Item
  const handleAddQueueItem = async () => {
    if (!newQueueTitle.trim()) return;
    const newItem: QueueItem = {
      id: Date.now() % 10000,
      title: newQueueTitle.trim(),
      category: 'Browser Utility',
      target_day: productQueue.length + 2,
      priority: 'HIGH',
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
      setSuccessToast(`✅ Queue item '${newItem.title}' added!`);
    } catch (e) {
      console.log('Added locally');
    }
  };

  // Remove Queue Item
  const handleRemoveQueueItem = async (itemId: number) => {
    const updatedQueue = productQueue.filter(q => q.id !== itemId);
    setProductQueue(updatedQueue);
    try {
      await fetch('/api/products/data/system_db/product_queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQueue)
      });
      setSuccessToast('✅ Queue item removed!');
    } catch (e) {
      console.log('Removed');
    }
  };

  // Promote Queue Item
  const handlePromoteQueueItem = async (itemId: number) => {
    try {
      const res = await fetch(`/api/products/queue/promote/${itemId}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setActiveProject(data.folder_name);
        setSuccessToast(`🚀 Promoted to active product '${data.folder_name}'!`);
        fetchQueue();
        fetchMasterTables();
      }
    } catch (e) {
      setSuccessToast('🚀 Promoted locally');
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
        setSuccessToast(`✅ Asset '${newBlobFilename}' uploaded & committed!`);
        setNewBlobFilename('');
      }
    } catch (e) {
      setSuccessToast(`✅ Uploaded locally`);
    }
  };

  // Filtered Master Tables for Search
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

  // Unique Columns for In-Modal Table
  const tableColumns = Array.from(
    new Set(inspectRows.flatMap(row => Object.keys(row)))
  );

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
                  🔥 Active
                </span>
              </span>
            </div>
          </div>

          {/* Clean Navigation Pills */}
          <nav className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/5">
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
        
        {/* PAGE 1: DASHBOARD HOME (AAJ KYA BANAYA, KAL KYA BANEGA & EDITABLE QUEUE) */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* AAJ KYA BANAYA & KAL KYA BANEGA SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/60 p-5 rounded-3xl border border-emerald-500/30 shadow-xl space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-sm font-extrabold text-white">Aaj Kya Banaya (Completed Work)</h2>
                </div>
                <textarea
                  rows={3}
                  value={todayDoneInput}
                  onChange={e => setTodayDoneInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div className="bg-slate-900/60 p-5 rounded-3xl border border-cyan-500/30 shadow-xl space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-cyan-400" />
                  <h2 className="text-sm font-extrabold text-white">Kal Kya Banega (Tomorrow Plan)</h2>
                </div>
                <textarea
                  rows={3}
                  value={tomorrowPlanInput}
                  onChange={e => setTomorrowPlanInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </div>

            {/* EDITABLE UPCOMING PRODUCT QUEUE */}
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-purple-500/20 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <ListOrdered className="h-4 w-4 text-purple-400" />
                    Current Upcoming Product Building Queue
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Queue items for upcoming streak products with 1-click single-click add, remove & promote.</p>
                </div>
              </div>

              {/* Single Click Add to Queue Form */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
                <input
                  placeholder="Enter new product idea title (e.g. Product 08: Password Manager)"
                  value={newQueueTitle}
                  onChange={e => setNewQueueTitle(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleAddQueueItem}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shrink-0 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Single-Click Add</span>
                </button>
              </div>

              {/* Queue List */}
              <div className="space-y-2">
                {productQueue.map(item => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold">Day {item.target_day}</span>
                      <span className="font-bold text-white">{item.title}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePromoteQueueItem(item.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center space-x-1"
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

        {/* PAGE 2: MASTER TABLES STUDIO (FUZZY SEARCH & EDITABLE SPREADSHEET INSPECT MODAL) */}
        {activeTab === 'master_tables' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-cyan-500/20 shadow-2xl space-y-5">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Database className="h-5 w-5 text-cyan-400" />
                    Master Tables Directory Studio
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">Lists all tables with descriptions and record counts. Click Inspect to edit data in a spreadsheet modal.</p>
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

              {/* Master Tables Grid */}
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
                      <span className="text-[10px] text-slate-500 font-mono">app/{tbl.projectId}/db/</span>
                      <button
                        onClick={() => openInspectTableModal(tbl.projectId, tbl.tableName)}
                        className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-md cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect & Edit Data</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PAGE 3: MY PRODUCTS (SELECTION STUDIO WITH GITHUB BLOB STORAGE INTEGRATED) */}
        {activeTab === 'my_products' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-5">
              
              <div className="border-b border-slate-800 pb-4">
                <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Box className="h-5 w-5 text-purple-400" />
                  My Products Portfolio
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">Select any micro-product to launch and manage its operational tool interface.</p>
              </div>

              {/* Products Cards Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {productsList.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProductView(prod.id)}
                    className={`p-4 rounded-2xl bg-slate-950 border transition-all cursor-pointer space-y-2 ${
                      selectedProductView === prod.id ? 'border-cyan-500/60 ring-1 ring-cyan-500/30' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">{prod.status}</span>
                      {selectedProductView === prod.id && <Check className="h-4 w-4 text-cyan-400" />}
                    </div>
                    <h3 className="text-xs font-bold text-white">{prod.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{prod.description}</p>
                  </div>
                ))}
              </div>

              {/* OPERATIONAL TOOL PANEL FOR SELECTED PRODUCT */}
              {selectedProductView === 'product2_github_blob_storage' && (
                <div className="bg-slate-950 p-6 rounded-3xl border border-purple-500/30 space-y-5 mt-4">
                  <div>
                    <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold mb-1">
                      <UploadCloud className="h-3.5 w-3.5 text-purple-400" />
                      <span>Product 02 Tool Operational View</span>
                    </div>
                    <h2 className="text-lg font-extrabold text-white">GitHub Blob Storage Utility Tool</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Upload images, MP4 videos, and PDF documents into organized storage subfolders with raw access URLs.</p>
                  </div>

                  {/* Upload Form */}
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-white block">Upload Media Asset</span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <input
                        placeholder="Filename (e.g. screenshot.png)"
                        value={newBlobFilename}
                        onChange={e => setNewBlobFilename(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none"
                      />
                      <select
                        value={newBlobType}
                        onChange={e => setNewBlobType(e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                      >
                        <option value="image">🖼️ Image (/storage/images/)</option>
                        <option value="video">🎥 Video MP4 (/storage/videos/)</option>
                        <option value="doc">📄 Document PDF (/storage/docs/)</option>
                      </select>
                      <input
                        placeholder="Size (e.g. 1.2 MB)"
                        value={newBlobSize}
                        onChange={e => setNewBlobSize(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none"
                      />
                      <button
                        onClick={handleUploadBlobAsset}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center space-x-1"
                      >
                        <UploadCloud className="h-4 w-4" />
                        <span>Upload & Commit</span>
                      </button>
                    </div>
                  </div>

                  {/* Asset Catalog Table */}
                  <div className="space-y-2">
                    {blobAssets.map(asset => (
                      <div key={asset.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-white">{asset.filename}</span>
                          <span className="text-[10px] text-purple-300">{asset.url}</span>
                        </div>
                        <a href={asset.url} target="_blank" rel="noreferrer" className="px-3 py-1 bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 rounded-lg font-bold">
                          View / Download
                        </a>
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
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div>
                <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
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
      {/* EDITABLE SPREADSHEET INSPECT DATA MODAL WITH IN-MODAL SEARCH */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {inspectTableModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-4xl w-full space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-cyan-400" />
                  Table Data Inspector: <code className="text-cyan-300 font-mono">{inspectTableModal.tableName}.json</code>
                </h3>
                <span className="text-xs text-slate-400">Location: app/{inspectTableModal.projectId}/db/{inspectTableModal.tableName}.json</span>
              </div>
              <button onClick={() => setInspectTableModal(null)} className="text-slate-500 hover:text-white p-1"><X className="h-5 w-5" /></button>
            </div>

            {/* In-Modal Search Bar */}
            <div className="relative shrink-0">
              <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-2.5" />
              <input
                value={inspectModalSearch}
                onChange={e => setInspectModalSearch(e.target.value)}
                placeholder="Search rows in this table to quickly edit..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* INTERACTIVE SPREADSHEET DATA TABLE */}
            <div className="flex-1 overflow-auto border border-slate-800 rounded-2xl bg-slate-950">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead className="bg-slate-900 sticky top-0 border-b border-slate-800 text-slate-400">
                  <tr>
                    {tableColumns.map(col => (
                      <th key={col} className="p-3 border-r border-slate-800 font-bold text-cyan-300 uppercase">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredInspectRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-900/50">
                      {tableColumns.map(col => (
                        <td key={col} className="p-2.5 border-r border-slate-800">
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

            {/* Modal Footer with Save Button */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-800 shrink-0">
              <span className="text-xs text-slate-400 font-mono">{filteredInspectRows.length} rows displayed</span>
              <div className="flex items-center space-x-2">
                <button onClick={() => setInspectTableModal(null)} className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold">Cancel</button>
                <button onClick={handleSaveInspectTableData} className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-xs font-extrabold shadow-md">
                  Save & Commit Table Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TABLE MODAL */}
      {showCreateTableModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Create New Table</h3>
            <input
              placeholder="Table Name (e.g. analytics_logs)"
              value={newTableNameInput}
              onChange={e => setNewTableNameInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowCreateTableModal(false)} className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold">Cancel</button>
              <button
                onClick={async () => {
                  if (!newTableNameInput.trim()) return;
                  await fetch('/api/db/create_table', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      product_id: newTableTargetProduct,
                      table_name: newTableNameInput.trim().toLowerCase(),
                      columns: [{ name: 'id', type: 'number', required: true }]
                    })
                  });
                  setSuccessToast(`✅ Table '${newTableNameInput}' created!`);
                  setShowCreateTableModal(false);
                  fetchMasterTables();
                }}
                className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold"
              >
                Create & Commit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}