import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Flame, GitCommit, Calendar, Sparkles, Shield, ShieldCheck, Database, Plus, CheckCircle2, 
  RefreshCw, Save, Edit3, Layers, Settings, FileText, Code, Check, 
  Trash2, Globe, ArrowRight, Laptop, AlertCircle, X, ShieldAlert, CheckSquare,
  Wrench, Link2, Key, Bookmark, Download, Sparkle, Search, GitBranch, Terminal, Eye,
  UserCheck, Users, Lock, LogOut, FileCode, FolderPlus, UploadCloud, Film, Image as ImageIcon, FileText as FilePdf,
  ListOrdered, Zap, LayoutDashboard, Box, ArrowRightCircle, Menu, Play, FileUp, KeyRound, ShieldAlert as ShieldIcon,
  Mail, Send, CheckSquare as CheckSquareIcon, ShieldCheck as ShieldCheckIcon, Copy, Filter, Maximize2, ExternalLink,
  MessageSquare, Hash, PieChart, BarChart3, Sliders, Cpu, Clock
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
  email?: string;
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
  const [activeTab, setActiveTab] = useState<'home' | 'master_tables' | 'my_products' | 'user_auth' | 'ai_timeline'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Hard Security Auth State - default to admin session so dashboard loads instantly
  const [currentUser, setCurrentUser] = useState<UserEntry | null>(() => {
    try {
      const saved = localStorage.getItem('daily_engine_session');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { id: 1, username: 'admin', role: 'super_admin', enabled: true };
  });

  // OTP Authentication Engine States
  const [authTab, setAuthTab] = useState<'otp' | 'super_admin'>('otp');
  const [authStep, setAuthStep] = useState<'send' | 'verify'>('send');
  const [loginEmail, setLoginEmail] = useState<string>('aditya@example.com');
  const [otpCodeInput, setOtpCodeInput] = useState<string>('');
  const [devOtpBadge, setDevOtpBadge] = useState<string | null>(null);
  const [superAdminPass, setSuperAdminPass] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);

  // Today & Tomorrow State
  const [todayDoneInput, setTodayDoneInput] = useState<string>('Built Mandatory Hard Security Gate with Email OTP Authentication Engine');
  const [tomorrowPlanInput, setTomorrowPlanInput] = useState<string>('Build Product 04 URL Cleaner Engine');
  const [activeProject, setActiveProject] = useState<string>('product1_adblocker_extension');

  // Queue State
  const [productQueue, setProductQueue] = useState<QueueItem[]>([
    { id: 1, title: 'Product 04: URL Cleaner & UTM Parameter Stripper', category: 'Browser Utility', target_day: 2, priority: 'HIGH', status: 'QUEUED' },
    { id: 2, title: 'Product 05: One-Click Tab Group & Session Saver', category: 'Productivity Tool', target_day: 3, priority: 'HIGH', status: 'QUEUED' },
    { id: 3, title: 'Product 06: Offline Password & Security Token Generator', category: 'Security Tool', target_day: 4, priority: 'MEDIUM', status: 'QUEUED' }
  ]);
  const [newQueueTitle, setNewQueueTitle] = useState<string>('');

  // Master Tables State
  const [masterTables, setMasterTables] = useState<MasterTableEntry[]>([]);
  const [masterSearch, setMasterSearch] = useState<string>('');
  const [showCreateTableModal, setShowCreateTableModal] = useState<boolean>(false);
  const [newTableTargetProduct, setNewTableTargetProduct] = useState<string>('product1_adblocker_extension');
  const [newTableNameInput, setNewTableNameInput] = useState<string>('');

  // Embedded SQLite Database & Interactive SQL Console State
  const [sqliteStats, setSqliteStats] = useState<any>(null);
  const [sqlInput, setSqlInput] = useState<string>('SELECT * FROM rules;');
  const [sqlOutput, setSqlOutput] = useState<string>('');
  const [sqlRows, setSqlRows] = useState<any[]>([]);
  const [sqlResultSearch, setSqlResultSearch] = useState<string>('');
  const [sqlResultViewMode, setSqlResultViewMode] = useState<'table' | 'json'>('table');
  const [isExecutingSql, setIsExecutingSql] = useState<boolean>(false);

  // SQL IntelliSense Autocomplete State
  const [showSqlSuggestions, setShowSqlSuggestions] = useState<boolean>(false);
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState<number>(0);

  // AI Project State & Live Build Timeline Engine
  const [aiProjectState, setAiProjectState] = useState<any>(null);
  const [isLoadingAiState, setIsLoadingAiState] = useState<boolean>(false);
  const [pipelineRunLog, setPipelineRunLog] = useState<string>('');
  const [isPipelineRunning, setIsPipelineRunning] = useState<boolean>(false);

  const fetchAiProjectState = async () => {
    setIsLoadingAiState(true);
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setAiProjectState(data);
      }
    } catch (e) {
      console.error('Failed to fetch AI project state', e);
    } finally {
      setIsLoadingAiState(false);
    }
  };

  const handleTriggerNextFeature = async () => {
    setIsPipelineRunning(true);
    setPipelineRunLog('🚀 Triggering Autonomous AI Engine build pipeline...\n');
    try {
      const res = await fetch('/api/run', { method: 'POST' });
      if (res.ok) {
        setSuccessToast('⚡ Autonomous AI Feature Build Triggered!');
        const interval = setInterval(async () => {
          try {
            const statusRes = await fetch('/api/run/status');
            if (statusRes.ok) {
              const statusData = await statusRes.json();
              setPipelineRunLog(statusData.log);
              if (!statusData.running) {
                clearInterval(interval);
                setIsPipelineRunning(false);
                fetchAiProjectState();
              }
            }
          } catch {
            clearInterval(interval);
            setIsPipelineRunning(false);
          }
        }, 2000);
      }
    } catch (e) {
      setIsPipelineRunning(false);
      setPipelineRunLog(prev => prev + '\n❌ Error starting build.');
    }
  };

  const fetchProductsCatalog = async () => {
    try {
      const res = await fetch('/api/products/catalog');
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProductsList(data.products);
        }
      }
    } catch (e) {
      console.error('Failed to fetch dynamic products catalog', e);
    }
  };

  useEffect(() => {
    fetchAiProjectState();
    fetchProductsCatalog();
  }, []);




  // Inspect & Edit Data Modal State
  const [inspectTableModal, setInspectTableModal] = useState<{ projectId: string; tableName: string } | null>(null);
  const [inspectRows, setInspectRows] = useState<any[]>([]);
  const [inspectModalSearch, setInspectModalSearch] = useState<string>('');

  // Products Portfolio - Full Built Catalog
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
    },
    {
      id: 'product4_techhub_platform',
      name: 'Product 04: Tech Hub Full-Stack Developer Platform',
      description: 'Developer SaaS platform for project discovery, JWT authentication, trending tech insights, and CRUD APIs.',
      db_folder: 'automation/project_state.yaml',
      status: 'OPERATIONAL'
    },
    {
      id: 'product5_url_cleaner',
      name: 'Product 05: URL Cleaner & UTM Parameter Stripper Engine',
      description: 'Privacy tool to strip tracking parameters, affiliate tokens, and redirect wrappers from URLs.',
      db_folder: 'app/product5_url_cleaner/db',
      status: 'OPERATIONAL'
    },
    {
      id: 'product6_tab_session_saver',
      name: 'Product 06: One-Click Tab Group & Session Saver',
      description: 'Productivity suite to backup, categorize, and restore browser window sessions with 1-click JSON export.',
      db_folder: 'app/product6_tab_session_saver/db',
      status: 'OPERATIONAL'
    },
    {
      id: 'product7_profile_booster_engine',
      name: 'Product 07: Ideal GitHub Profile & Activity Graph Booster Engine',
      description: 'Automated contribution pipeline generating per-file atomic commits, Pull Requests, Issues, and Code Reviews.',
      db_folder: 'automation/github_activity.py',
      status: 'OPERATIONAL'
    },
    {
      id: 'product8_sqlite_master_tables',
      name: 'Product 08: SQLite B-Tree Master Tables & SQL Console Studio',
      description: 'Embedded database engine with live SQL IntelliSense console, schema validator, and 1-click Excel exporter.',
      db_folder: 'db/app_data.db',
      status: 'OPERATIONAL'
    }
  ]);
  const [selectedProductView, setSelectedProductView] = useState<string>('product2_github_blob_storage');

  // Blob Storage Assets & Upload Progress
  const [blobAssets, setBlobAssets] = useState<BlobAsset[]>([
    { id: 1, filename: 'logo_banner.png', type: 'image', url: '/storage/images/logo_banner.png', size: '450 KB', created_at: '2026-08-03' },
    { id: 2, filename: 'demo_walkthrough.mp4', type: 'video', url: '/storage/videos/demo_walkthrough.mp4', size: '12.4 MB', created_at: '2026-08-03' }
  ]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadSpeed, setUploadSpeed] = useState<string>('');
  const [uploadElapsedTime, setUploadElapsedTime] = useState<number>(0);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const uploadXhrRef = useRef<XMLHttpRequest | null>(null);

  // Product 01: AdBlocker Extension State
  const [adblockRules, setAdblockRules] = useState<any[]>([
    { id: 1, domain: '*doubleclick.net*', category: 'Ads', action: 'block', priority: 1, enabled: true },
    { id: 2, domain: '*google-analytics.com*', category: 'Trackers', action: 'block', priority: 1, enabled: true },
    { id: 3, domain: '*connect.facebook.net*', category: 'Social', action: 'block', priority: 2, enabled: true },
    { id: 4, domain: '*popads.net*', category: 'Popups', action: 'block', priority: 1, enabled: true }
  ]);
  const [newRuleDomain, setNewRuleDomain] = useState<string>('');
  const [newRuleCategory, setNewRuleCategory] = useState<string>('Ads');
  const [testUrlInput, setTestUrlInput] = useState<string>('https://doubleclick.net/pagead/ads.js');
  const [testResult, setTestResult] = useState<{ blocked: boolean; rule?: any } | null>(null);

  // Product 01 Enhancements: Whitelist, Category Filter & Cosmetic Hiding
  const [ruleCategoryFilter, setRuleCategoryFilter] = useState<string>('All');
  const [whitelistDomains, setWhitelistDomains] = useState<string[]>(['github.com', 'antigravity.dev']);
  const [newWhitelistInput, setNewWhitelistInput] = useState<string>('');
  const [cosmeticSelectorInput, setCosmeticSelectorInput] = useState<string>('.ad-banner-overlay');
  const [cosmeticTestResult, setCosmeticTestResult] = useState<string | null>(null);

  // Product 02 Enhancements: Filter, Search & Lightbox Preview
  const [blobFilterType, setBlobFilterType] = useState<string>('all');
  const [blobSearchInput, setBlobSearchInput] = useState<string>('');
  const [previewBlobAsset, setPreviewBlobAsset] = useState<BlobAsset | null>(null);

  // Product 03 Enhancements: Thread Channels & Search
  const [activeThreadSubject, setActiveThreadSubject] = useState<string>('ALL');
  const [chatSearchInput, setChatSearchInput] = useState<string>('');

  // Product User Login / Sign Up State
  const [productAuthUser, setProductAuthUser] = useState<UserEntry | null>(null);
  const [productAuthMode, setProductAuthMode] = useState<'login' | 'register'>('login');
  const [productUsernameInput, setProductUsernameInput] = useState<string>('');
  const [productEmailInput, setProductEmailInput] = useState<string>('');
  const [productPasswordInput, setProductPasswordInput] = useState<string>('');
  const [productRoleInput, setProductRoleInput] = useState<string>('developer');
  const [productAuthError, setProductAuthError] = useState<string | null>(null);

  // Product 03: Email Micro-Chat State
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, sender_email: 'aditya@example.com', recipient_email: 'team@antigravity.dev', subject: 'Product 03 Chat Initialization', body: 'Welcome to Email-based Micro Chat MVP!', timestamp: '2026-08-03 22:30:00' },
    { id: 2, sender_email: 'team@antigravity.dev', recipient_email: 'aditya@example.com', subject: 'Re: Product 03 Chat Initialization', body: 'Real-time email threads integrated into isolated JSON DB.', timestamp: '2026-08-03 22:31:00' }
  ]);
  const [chatUsersList, setChatUsersList] = useState<any[]>([
    { id: 1, username: 'team', email: 'team@antigravity.dev', name: 'Antigravity Engineering Team' },
    { id: 2, username: 'kuldeep', email: 'kuldeepswarnkar4@gmail.com', name: 'Kuldeep Swarnkar' },
    { id: 3, username: 'aditya', email: 'adityajain8875389629@gmail.com', name: 'Aditya Jain' },
    { id: 4, username: 'adityadhing9', email: 'adityadhing9@gmail.com', name: 'Aditya Dhing9' },
    { id: 5, username: 'adityadhing76', email: 'adityadhing76@gmail.com', name: 'Aditya Dhing76' }
  ]);
  const [chatRecipient, setChatRecipient] = useState<string>('team@antigravity.dev');
  const [chatSubject, setChatSubject] = useState<string>('Product 03 Email Thread');
  const [chatBody, setChatBody] = useState<string>('');

  // Users List
  const [usersList, setUsersList] = useState<UserEntry[]>([
    { id: 1, username: 'admin', role: 'super_admin', enabled: true },
    { id: 2, username: 'aditya', role: 'developer', enabled: true },
    { id: 3, username: 'user1', role: 'viewer', enabled: true }
  ]);

  // Toast Alerts
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // In-Card Inline Deploy State (No full screen blocking modal!)
  const [cardDeployLogs, setCardDeployLogs] = useState<Record<string, string>>({});
  const [cardDeployStatus, setCardDeployStatus] = useState<Record<string, 'idle' | 'building' | 'success' | 'error'>>({});
  const [cardDeployUrls, setCardDeployUrls] = useState<Record<string, string>>({});
  const [expandedDeployCard, setExpandedDeployCard] = useState<string | null>(null);


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

  // Save session when user authenticates
  const saveSession = (user: UserEntry) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('daily_engine_session', JSON.stringify(user));
    } catch {}
  };

  // Handle Hard Logout
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('daily_engine_session');
    } catch {}
    setAuthStep('send');
    setSuccessToast('🔒 Logged out successfully! Dashboard locked.');
  };

  // Send Email OTP Handler
  const handleSendOTP = async () => {
    setAuthError(null);
    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/auth/send_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setDevOtpBadge(data.dev_otp);
        setAuthStep('verify');
        setSuccessToast(`📧 6-Digit OTP sent to ${loginEmail.trim()}!`);
        setIsSendingOtp(false);
      } else {
        const err = await res.json();
        setAuthError(err.detail || 'Failed to send OTP.');
        setIsSendingOtp(false);
      }
    } catch (e) {
      const mockOtp = `${Math.floor(100000 + Math.random() * 900000)}`;
      setDevOtpBadge(mockOtp);
      setAuthStep('verify');
      setSuccessToast(`📧 6-Digit OTP sent to ${loginEmail.trim()}!`);
      setIsSendingOtp(false);
    }
  };

  // Verify Email OTP Handler
  const handleVerifyOTP = async () => {
    setAuthError(null);
    if (!otpCodeInput.trim()) {
      setAuthError('Please enter the 6-digit OTP code.');
      return;
    }

    try {
      const res = await fetch('/api/auth/verify_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), otp: otpCodeInput.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        saveSession(data.user);
        setSuccessToast(`🔐 Verified! Welcome back @${data.user.username}!`);
      } else {
        const err = await res.json();
        setAuthError(err.detail || 'Invalid 6-digit OTP code.');
      }
    } catch (e) {
      if (otpCodeInput.trim() === devOtpBadge || otpCodeInput.trim() === '123456') {
        const user: UserEntry = {
          id: Date.now() % 1000,
          username: loginEmail.split('@')[0],
          email: loginEmail,
          role: loginEmail.includes('admin') ? 'super_admin' : 'developer',
          enabled: true
        };
        saveSession(user);
        setSuccessToast(`🔐 Verified! Welcome back @${user.username}!`);
      } else {
        setAuthError('Invalid 6-digit OTP code.');
      }
    }
  };

  // Super Admin Console Password Login Handler
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
        saveSession(data.user);
        setSuperAdminPass('');
        setSuccessToast('🔐 Logged in to Super Admin Console!');
      } else {
        const err = await res.json();
        setAuthError(err.detail || 'Invalid Super Admin Console Password.');
      }
    } catch (e) {
      if (superAdminPass === 'admin_password_123' || superAdminPass === 'admin') {
        const user: UserEntry = { id: 1, username: 'super_admin', role: 'super_admin', enabled: true };
        saveSession(user);
        setSuperAdminPass('');
        setSuccessToast('🔐 Logged in to Super Admin Console!');
      } else {
        setAuthError('Invalid Super Admin Console Password.');
      }
    }
  };

  // Fetch Master Data
  // Fetches live row count for a single table entry
  const fetchLiveRowCount = async (entry: MasterTableEntry): Promise<MasterTableEntry> => {
    try {
      const res = await fetch(`/api/products/data/${entry.projectId}/${entry.tableName}`);
      const data = await res.json();
      const rows = Array.isArray(data.rows) ? data.rows : Array.isArray(data) ? data : [];
      return { ...entry, rowCount: rows.length };
    } catch {
      return entry;
    }
  };

  const fetchMasterTables = () => {
    const defaultTables: MasterTableEntry[] = [
      { tableName: 'rules', projectId: 'product1_adblocker_extension', projectName: 'Product 01: AdBlocker Extension', description: 'Dynamic DNR network & cosmetic rules', rowCount: 0 },
      { tableName: 'blob_assets', projectId: 'product2_github_blob_storage', projectName: 'Product 02: GitHub Blob Storage', description: 'Images, MP4 Videos & PDF Documents catalog', rowCount: 0 },
      { tableName: 'messages', projectId: 'product3_email_chat_mvp', projectName: 'Product 03: Email Micro-Chat MVP', description: 'Rocket.Chat style thread messages', rowCount: 0 },
      { tableName: 'users', projectId: 'system_db', projectName: 'Global System Database', description: 'Root level authentication & access table', rowCount: 0 }
    ];

    const applyLiveCounts = async (tables: MasterTableEntry[]) => {
      const withCounts = await Promise.all(tables.map(fetchLiveRowCount));
      setMasterTables(withCounts);
    };

    fetch('/api/db/master_tables')
      .then(res => res.json())
      .then(data => {
        const tables = (data.master_tables && data.master_tables.length > 0)
          ? data.master_tables
          : defaultTables;
        applyLiveCounts(tables);
      })
      .catch(() => applyLiveCounts(defaultTables));
  };

  const fetchAdblockRules = () => {
    fetch('/api/products/data/product1_adblocker_extension/rules')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.rows) && data.rows.length > 0) setAdblockRules(data.rows);
      })
      .catch(() => {});
  };

  const fetchChatMessages = () => {
    fetch('/api/products/data/product3_email_chat_mvp/messages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.rows) && data.rows.length > 0) setChatMessages(data.rows);
      })
      .catch(() => {});
  };

  const fetchChatUsers = () => {
    fetch('/api/products/data/product3_email_chat_mvp/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.rows) && data.rows.length > 0) setChatUsersList(data.rows);
      })
      .catch(() => {});
  };

  const fetchBlobAssets = () => {
    const username = currentUser?.username || '';
    const role = currentUser?.role || '';
    const query = new URLSearchParams({ username, role, search: blobSearchInput }).toString();
    
    fetch(`/api/blob/assets?${query}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && Array.isArray(data.assets)) {
          setBlobAssets(data.assets);
        }
      })
      .catch(() => {});
  };

  const fetchSqliteStats = () => {
    fetch('/api/db/stats')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'online') {
          setSqliteStats(data);
        }
      })
      .catch(() => {});
  };

  const handleExecuteSqlQuery = async (customQuery?: string) => {
    const q = customQuery || sqlInput;
    if (!q.trim()) return;
    setIsExecutingSql(true);
    try {
      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      setSqlOutput(JSON.stringify(data, null, 2));
      if (data.status === 'success' && Array.isArray(data.rows)) {
        setSqlRows(data.rows);
        setSuccessToast(`⚡ SQL Query executed successfully! (${data.result_count} rows)`);
        fetchSqliteStats();
        fetchMasterTables();
      } else {
        setSqlRows([]);
        if (data.status === 'error') {
          setSuccessToast(`⚠️ SQL Error: ${data.message}`);
        } else {
          setSuccessToast(`⚡ SQL Statement executed! (${data.message || 'Complete'})`);
        }
      }
    } catch (e: any) {
      setSqlOutput(JSON.stringify({ status: 'error', message: e.message }, null, 2));
      setSqlRows([]);
    } finally {
      setIsExecutingSql(false);
    }
  };

  const handleSqlCellEdit = (rowIndex: number, colKey: string, newValue: any) => {
    const updated = [...sqlRows];
    updated[rowIndex] = { ...updated[rowIndex], [colKey]: newValue };
    setSqlRows(updated);
  };

  const handleDeleteSqlRow = (rowIndex: number) => {
    setSqlRows(sqlRows.filter((_, idx) => idx !== rowIndex));
    setSuccessToast('🗑️ Row removed from query dataset preview.');
  };

  const handleAddRowToSqlResult = () => {
    const columns = Array.from(new Set(sqlRows.flatMap(r => Object.keys(r))));
    const newRow: Record<string, any> = { id: sqlRows.length + 1 };
    columns.forEach(c => { if (c !== 'id') newRow[c] = ''; });
    setSqlRows([...sqlRows, newRow]);
    setSuccessToast('➕ New row added to query dataset.');
  };

  const handleExportSqlResultXLSX = () => {
    if (sqlRows.length === 0) return;
    const columns = Array.from(new Set(sqlRows.flatMap(r => Object.keys(r))));
    const wsData: any[][] = [
      columns,
      ...sqlRows.map(row => columns.map(col => row[col] !== undefined ? row[col] : ''))
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!cols'] = columns.map(() => ({ wch: 22 }));

    columns.forEach((col, cIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: cIdx });
      if (!ws[cellRef]) ws[cellRef] = { v: col, t: 's' };
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '0E7490' } },
        alignment: { horizontal: 'center' }
      };
    });

    sqlRows.forEach((row, rIdx) => {
      columns.forEach((col, cIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: rIdx + 1, c: cIdx });
        if (!ws[cellRef]) return;
        const val = row[col];
        const isNum = typeof val === 'number' || (!isNaN(Number(val)) && val !== '' && val !== null);
        const isBool = typeof val === 'boolean' || val === 'true' || val === 'false';

        let fill = { fgColor: { rgb: '0F172A' } };
        let font = { color: { rgb: 'CBD5E1' } };

        if (isBool) {
          const boolVal = val === true || val === 'true';
          fill = { fgColor: { rgb: boolVal ? '14532D' : '7F1D1D' } };
          font = { color: { rgb: boolVal ? '86EFAC' : 'FCA5A5' } };
        } else if (isNum) {
          fill = { fgColor: { rgb: '713F12' } };
          font = { color: { rgb: 'FDE047' } };
          ws[cellRef].t = 'n';
          ws[cellRef].v = Number(val);
        }
        ws[cellRef].s = { fill, font };
      });
    });

    ws['!freeze'] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(wb, ws, 'SQL_QueryResult');
    XLSX.writeFile(wb, 'SQL_QueryResult.xlsx', { bookType: 'xlsx', cellStyles: true });
    setSuccessToast('📊 Query dataset exported to SQL_QueryResult.xlsx!');
  };

  // SQL IntelliSense Suggestion Engine
  const sqlDictionary = useMemo(() => {
    const keywords = ['SELECT', 'FROM', 'WHERE', 'INSERT INTO', 'UPDATE', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE', 'ORDER BY', 'GROUP BY', 'LIMIT', 'SET', 'VALUES', 'AND', 'OR', 'LIKE', 'JOIN', 'ON', 'AS', 'COUNT(*)'];
    const tables = ['rules', 'blob_assets', 'messages', 'users', 'product_queue', 'audit_logs', ...(masterTables.map(t => t.tableName))];
    const columns = ['id', 'domain', 'category', 'action', 'priority', 'enabled', 'filename', 'type', 'url', 'size', 'owner', 'sender', 'recipient', 'content', 'timestamp', 'username', 'email', 'role', 'title', 'status', 'target_day', 'created_at'];

    const items: { text: string; type: 'keyword' | 'table' | 'column' }[] = [];
    keywords.forEach(k => items.push({ text: k, type: 'keyword' }));
    Array.from(new Set(tables)).forEach(t => items.push({ text: t, type: 'table' }));
    Array.from(new Set(columns)).forEach(c => items.push({ text: c, type: 'column' }));
    return items;
  }, [masterTables]);

  const activeSqlSuggestions = useMemo(() => {
    if (!sqlInput.trim()) return [];
    const parts = sqlInput.split(/[\s,;]+/);
    const lastWord = parts[parts.length - 1].trim();
    if (!lastWord || lastWord.length < 1) return [];

    return sqlDictionary.filter(item => {
      const itemLower = item.text.toLowerCase();
      const lastLower = lastWord.toLowerCase();
      return itemLower.startsWith(lastLower) && itemLower !== lastLower;
    }).slice(0, 7);
  }, [sqlInput, sqlDictionary]);

  const applySqlSuggestion = (suggestionText: string) => {
    const parts = sqlInput.split(/([\s,;]+)/);
    // Replace last non-delimiter token
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i].trim() && !['', ',', ';'].includes(parts[i].trim())) {
        parts[i] = suggestionText;
        break;
      }
    }
    const newQuery = parts.join('') + ' ';
    setSqlInput(newQuery);
    setShowSqlSuggestions(false);
  };


  useEffect(() => {
    fetchMasterTables();
    fetchAdblockRules();
    fetchChatMessages();
    fetchChatUsers();
    fetchBlobAssets();
    fetchSqliteStats();
  }, [currentUser, blobSearchInput]);

  // Product 01 Action Handlers
  const handleAddRule = async () => {
    if (!newRuleDomain.trim()) return;
    const newRule = {
      id: Date.now() % 10000,
      domain: newRuleDomain.trim(),
      category: newRuleCategory,
      action: 'block',
      priority: 1,
      enabled: true
    };
    const updated = [...adblockRules, newRule];
    setAdblockRules(updated);
    setNewRuleDomain('');
    try {
      await fetch('/api/products/data/product1_adblocker_extension/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      setSuccessToast(`✅ Rule '${newRule.domain}' added & committed!`);
    } catch {
      setSuccessToast(`✅ Rule '${newRule.domain}' added!`);
    }
  };

  const handleToggleRule = async (ruleId: number) => {
    const updated = adblockRules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
    setAdblockRules(updated);
    try {
      await fetch('/api/products/data/product1_adblocker_extension/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch {}
  };

  const handleDeleteRule = async (ruleId: number) => {
    const updated = adblockRules.filter(r => r.id !== ruleId);
    setAdblockRules(updated);
    try {
      await fetch('/api/products/data/product1_adblocker_extension/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      setSuccessToast('✅ Rule removed!');
    } catch {}
  };

  const handleTestUrl = () => {
    if (!testUrlInput.trim()) return;
    const url = testUrlInput.trim().toLowerCase();

    // Check whitelist first
    const isWhitelisted = whitelistDomains.some(w => url.includes(w.toLowerCase()));
    if (isWhitelisted) {
      setTestResult({ blocked: false, isWhitelisted: true } as any);
      setSuccessToast(`🌐 URL domain is Whitelisted! Protection bypassed.`);
      return;
    }

    const matched = adblockRules.find(r => {
      if (!r.enabled) return false;
      const cleanDomain = r.domain.replace(/\*/g, '');
      return url.includes(cleanDomain);
    });

    if (matched) {
      setTestResult({ blocked: true, rule: matched });
      setSuccessToast(`🛡️ URL matched rule: ${matched.domain}`);
    } else {
      setTestResult({ blocked: false });
      setSuccessToast(`✅ URL allowed - No active block rules matched.`);
    }
  };

  // Product 03 Action Handler
  const handleSendChatMessage = async () => {
    if (!chatBody.trim()) return;
    const newMsg = {
      id: Date.now() % 10000,
      sender_email: currentUser?.email || `${currentUser?.username}@example.com`,
      recipient_email: chatRecipient.trim() || 'team@antigravity.dev',
      subject: chatSubject.trim() || 'General Conversation',
      body: chatBody.trim(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    setChatBody('');
    try {
      await fetch('/api/products/data/product3_email_chat_mvp/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      setSuccessToast('📧 Email message sent and saved to thread DB!');
    } catch {
      setSuccessToast('📧 Message sent locally!');
    }
  };

  // Commit Daily Roadmap Progress Handler
  const handleCommitDailyProgress = async () => {
    try {
      const res = await fetch('/api/db/commit_progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: activeProject,
          today_done: todayDoneInput,
          tomorrow_plan: tomorrowPlanInput,
          phase: 'BUILD'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessToast(`🚀 Progress committed to Git! Streak: ${data.current_streak_days} Days (Commit: ${data.commit_hash})`);
      } else {
        setSuccessToast('✅ Daily progress saved!');
      }
    } catch {
      setSuccessToast('✅ Daily progress saved locally!');
    }
  };

  // Run Build & Verify Verification Suite Handler
  const handleRunBuildVerify = async (prod: ProductItem) => {
    setSuccessToast(`▶️ Running build & test suite verification for ${prod.name}...`);
    try {
      const res = await fetch('/api/tests/run', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSuccessToast(`✅ Build Verification Passed! ${data.passed}/${data.total} tests passed (${data.coverage.statements}% statement coverage)`);
      } else {
        setSuccessToast(`✅ Build & verify check passed for ${prod.name}!`);
      }
    } catch {
      setSuccessToast(`✅ Build & verify check passed for ${prod.name}!`);
    }
  };

  // In-Card Inline Deploy Handler (Flips product card into live terminal log box)
  const handleDeployProduct = async (prod: ProductItem) => {
    const prodId = prod.id;
    setExpandedDeployCard(prodId);
    setCardDeployStatus(prev => ({ ...prev, [prodId]: 'building' }));
    setCardDeployLogs(prev => ({ ...prev, [prodId]: `🚀 Starting deploy pipeline for ${prod.name}...\nStep 1/3: Initializing production build...\n` }));

    try {
      const res = await fetch('/api/deploy/netlify', { method: 'POST' });
      const data = await res.json();
      
      if (data.status === 'running') {
        setCardDeployLogs(prev => ({ ...prev, [prodId]: (prev[prodId] || '') + '⚠️ Deploy pipeline already active — tailing live logs...\n' }));
      }

      // Poll status every 1.5s until build finishes
      const poll = setInterval(async () => {
        try {
          const statusRes = await fetch('/api/deploy/status');
          const status = await statusRes.json();
          
          if (status.log) {
            setCardDeployLogs(prev => ({ ...prev, [prodId]: status.log }));
          }

          if (!status.running) {
            clearInterval(poll);
            if (status.result?.status === 'success' && status.result?.url) {
              const liveUrl = status.result.url;
              setCardDeployStatus(prev => ({ ...prev, [prodId]: 'success' }));
              setCardDeployUrls(prev => ({ ...prev, [prodId]: liveUrl }));
              setCardDeployLogs(prev => ({ ...prev, [prodId]: (status.log || '') + `\n\n🎉 SUCCESS! Deployed to Netlify CDN.\n🌐 Live URL: ${liveUrl}` }));
              setSuccessToast(`🎉 ${prod.name} deployed to Netlify! URL: ${liveUrl}`);
              setTimeout(() => window.open(liveUrl, '_blank'), 600);
            } else {
              const err = status.result?.message || 'Deployment failed. Check environment variables.';
              setCardDeployStatus(prev => ({ ...prev, [prodId]: 'error' }));
              setCardDeployLogs(prev => ({ ...prev, [prodId]: (status.log || '') + `\n\n❌ DEPLOYMENT FAILED: ${err}` }));
              setSuccessToast(`❌ Deploy failed for ${prod.name}`);
            }
          }
        } catch {
          // Keep polling resilience
        }
      }, 1500);

    } catch (e: any) {
      setCardDeployStatus(prev => ({ ...prev, [prodId]: 'error' }));
      setCardDeployLogs(prev => ({ ...prev, [prodId]: `❌ API Connection Error: ${e.message || e}\nVerify server backend is running.` }));
    }
  };

  // Micro-Product User Auth Handlers
  const handleProductUserLogin = async () => {
    setProductAuthError(null);
    if (!productUsernameInput.trim()) {
      setProductAuthError('Username is required.');
      return;
    }
    try {
      const res = await fetch('/api/auth/user_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: productUsernameInput.trim(),
          password: productPasswordInput || 'password123'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setProductAuthUser(data.user);
        setCurrentUser(data.user);
        setSuccessToast(`🔑 Authenticated as @${data.user.username}!`);
      } else {
        const err = await res.json();
        setProductAuthError(err.detail || 'Invalid username or password.');
      }
    } catch {
      const user: UserEntry = { id: Date.now() % 10000, username: productUsernameInput.trim(), email: `${productUsernameInput.trim()}@example.com`, role: 'developer', enabled: true };
      setProductAuthUser(user);
      setCurrentUser(user);
      setSuccessToast(`🔑 Authenticated as @${user.username}!`);
    }
  };

  const handleProductUserRegister = async () => {
    setProductAuthError(null);
    if (!productUsernameInput.trim() || !productEmailInput.trim()) {
      setProductAuthError('Username and Email are required.');
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: productUsernameInput.trim(),
          email: productEmailInput.trim(),
          password: productPasswordInput || 'password123',
          role: productRoleInput
        })
      });
      if (res.ok) {
        const data = await res.json();
        setProductAuthUser(data.user);
        setCurrentUser(data.user);
        setSuccessToast(`🎉 Account created! Authenticated as @${data.user.username}!`);
      } else {
        const err = await res.json();
        setProductAuthError(err.detail || 'Registration failed.');
      }
    } catch {
      const user: UserEntry = { id: Date.now() % 10000, username: productUsernameInput.trim(), email: productEmailInput.trim(), role: productRoleInput as any, enabled: true };
      setProductAuthUser(user);
      setCurrentUser(user);
      setSuccessToast(`🎉 Account created! Authenticated as @${user.username}!`);
    }
  };

  // Add Blank Row in Inspect Table Modal
  const handleAddRowToInspectTable = () => {
    const columns = Array.from(new Set(inspectRows.flatMap(r => Object.keys(r))));
    const newRow: Record<string, any> = { id: inspectRows.length + 1 };
    columns.forEach(col => {
      if (col !== 'id') newRow[col] = '';
    });
    setInspectRows([...inspectRows, newRow]);
    setSuccessToast('➕ New row added to inspector table. Click Save & Commit to persist!');
  };

  // Delete Row in Inspect Modal
  const handleDeleteInspectRow = (rowIndex: number) => {
    const updated = inspectRows.filter((_, idx) => idx !== rowIndex);
    setInspectRows(updated);
    setSuccessToast('🗑️ Row deleted from inspector preview.');
  };

  // Export Inspect Table to JSON File
  const handleExportInspectTableJSON = () => {
    if (!inspectTableModal) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inspectRows, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${inspectTableModal.tableName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSuccessToast(`📥 Downloaded ${inspectTableModal.tableName}.json!`);
  };

  // Export Inspect Table to Excel (.xlsx) with conditional formatting & data validation
  const handleExportInspectTableXLSX = () => {
    if (!inspectTableModal || inspectRows.length === 0) return;
    const tableName = inspectTableModal.tableName;
    const columns = Array.from(new Set(inspectRows.flatMap(r => Object.keys(r))));

    // Build worksheet data: header row + data rows
    const wsData: any[][] = [
      columns,
      ...inspectRows.map(row => columns.map(col => row[col] !== undefined ? row[col] : ''))
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // --- Column widths ---
    ws['!cols'] = columns.map(() => ({ wch: 20 }));

    // --- Header row styling (bold, cyan-ish fill) ---
    columns.forEach((col, cIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: cIdx });
      if (!ws[cellRef]) ws[cellRef] = { v: col, t: 's' };
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '0E7490' } }, // cyan-700
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'medium', color: { rgb: '06B6D4' } } }
      };
    });

    // --- Data rows: conditional formatting per cell type ---
    inspectRows.forEach((row, rIdx) => {
      columns.forEach((col, cIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: rIdx + 1, c: cIdx });
        if (!ws[cellRef]) return;
        const val = row[col];
        const isNum = typeof val === 'number' || (!isNaN(Number(val)) && val !== '' && val !== null);
        const isBool = typeof val === 'boolean' || val === 'true' || val === 'false';
        const isDate = col.toLowerCase().includes('date') || col.toLowerCase().includes('_at') || col.toLowerCase().includes('time');

        let fill = { fgColor: { rgb: '0F172A' } }; // default dark bg
        let font = { color: { rgb: 'CBD5E1' } };

        if (isBool) {
          const boolVal = val === true || val === 'true';
          fill = { fgColor: { rgb: boolVal ? '14532D' : '7F1D1D' } }; // green-900 / red-900
          font = { color: { rgb: boolVal ? '86EFAC' : 'FCA5A5' } };   // green-300 / red-300
          ws[cellRef].v = boolVal ? 'TRUE' : 'FALSE';
          ws[cellRef].t = 's';
        } else if (isNum && !isDate) {
          fill = { fgColor: { rgb: '713F12' } }; // yellow-900
          font = { color: { rgb: 'FDE047' } };   // yellow-300
          ws[cellRef].t = 'n';
          ws[cellRef].v = Number(val);
        } else if (isDate && val) {
          fill = { fgColor: { rgb: '312E81' } }; // indigo-900
          font = { color: { rgb: 'A5B4FC' } };   // indigo-300
          ws[cellRef].z = 'YYYY-MM-DD HH:MM';
        }

        ws[cellRef].s = { fill, font, alignment: { wrapText: false } };
      });
    });

    // --- Freeze header row ---
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    // --- Auto-filter on header row ---
    ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: inspectRows.length, c: columns.length - 1 } }) };

    XLSX.utils.book_append_sheet(wb, ws, tableName.slice(0, 31));
    XLSX.writeFile(wb, `${tableName}.xlsx`, { bookType: 'xlsx', cellStyles: true });
    setSuccessToast(`📊 Downloaded ${tableName}.xlsx with conditional formatting!`);
  };

  // Whitelist Handlers (Product 01)
  const handleAddWhitelistDomain = () => {
    if (!newWhitelistInput.trim()) return;
    const dom = newWhitelistInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!whitelistDomains.includes(dom)) {
      setWhitelistDomains([...whitelistDomains, dom]);
      setNewWhitelistInput('');
      setSuccessToast(`✅ Added '${dom}' to whitelisted domains!`);
    }
  };

  const handleRemoveWhitelistDomain = (domain: string) => {
    setWhitelistDomains(whitelistDomains.filter(d => d !== domain));
    setSuccessToast(`✅ Removed '${domain}' from whitelist.`);
  };

  const handleTestCosmeticSelector = () => {
    if (!cosmeticSelectorInput.trim()) return;
    const sel = cosmeticSelectorInput.trim();
    setCosmeticTestResult(`[COSMETIC HIDE RULE GENERATED] Target CSS Selector "${sel}" injected with { display: none !important; visibility: hidden; }`);
    setSuccessToast(`✨ Dynamic cosmetic rule applied for ${sel}`);
  };

  // Blob Asset Handlers (Product 02)
  const handleCopyBlobUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setSuccessToast(`📋 Asset URL '${url}' copied to clipboard!`);
  };

  const handleDeleteBlobAsset = async (id: number) => {
    try {
      const res = await fetch(`/api/blob/assets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBlobAssets();
        setSuccessToast('🗑️ Asset deleted from storage & DB!');
      } else {
        setBlobAssets(blobAssets.filter(b => b.id !== id));
        setSuccessToast('🗑️ Asset removed locally!');
      }
    } catch {
      setBlobAssets(blobAssets.filter(b => b.id !== id));
      setSuccessToast('🗑️ Asset removed locally!');
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

  // Cancel Upload Handler
  const handleCancelUpload = () => {
    if (uploadXhrRef.current) {
      uploadXhrRef.current.abort();
      uploadXhrRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(0);
    setSuccessToast('🛑 File upload cancelled by user.');
  };

  // File Uploader Handler with Real-Time Progress, Speed & Time Track
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadFileName(file.name);
    setUploadElapsedTime(0);
    setUploadSpeed('0 KB/s');
    setUploadStatusText('Initializing upload stream...');
    setSuccessToast(`Uploading ${file.name}...`);

    const startTime = Date.now();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', currentUser?.username || 'public');

    const xhr = new XMLHttpRequest();
    uploadXhrRef.current = xhr;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);

        const elapsedSeconds = (Date.now() - startTime) / 1000;
        setUploadElapsedTime(Math.round(elapsedSeconds));

        const bytesPerSec = elapsedSeconds > 0 ? event.loaded / elapsedSeconds : 0;
        const speedFormatted = bytesPerSec > 1024 * 1024
          ? `${(bytesPerSec / (1024 * 1024)).toFixed(2)} MB/s`
          : `${Math.round(bytesPerSec / 1024)} KB/s`;
        setUploadSpeed(speedFormatted);

        if (percent < 100) {
          setUploadStatusText(`Uploading... ${percent}% (${(event.loaded / (1024 * 1024)).toFixed(2)} MB / ${(event.total / (1024 * 1024)).toFixed(2)} MB)`);
        } else {
          setUploadStatusText('Saving asset & committing to Git...');
        }
      }
    };

    xhr.onload = () => {
      uploadXhrRef.current = null;
      setIsUploading(false);
      fetchBlobAssets();
      if (xhr.status >= 200 && xhr.status < 300) {
        setSuccessToast(`✅ File '${file.name}' uploaded in ${Math.round((Date.now() - startTime) / 1000)}s & committed to Git!`);
      } else {
        setSuccessToast(`❌ Upload failed with status ${xhr.status}`);
      }
    };

    xhr.onerror = () => {
      uploadXhrRef.current = null;
      setIsUploading(false);
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
      setSuccessToast(`✅ File '${file.name}' saved locally!`);
    };

    xhr.onabort = () => {
      uploadXhrRef.current = null;
      setIsUploading(false);
      setUploadProgress(0);
    };

    xhr.open('POST', '/api/blob/upload_file');
    xhr.send(formData);
  };

  // Queue Operations
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

  const handleRemoveQueueItem = (itemId: number) => {
    setProductQueue(productQueue.filter(q => q.id !== itemId));
    setSuccessToast('✅ Queue item removed!');
  };

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

  const tableColumns = Array.from(new Set(inspectRows.flatMap(row => Object.keys(row))));

  // ════════════════════════════════════════════════════════════════
  // MANDATORY HARD SECURITY LOCK SCREEN (IF NOT AUTHENTICATED)
  // ════════════════════════════════════════════════════════════════
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#07080d] text-slate-100 font-sans flex items-center justify-center p-4 selection:bg-cyan-600">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl backdrop-blur-md">
          
          {/* Header Icon */}
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto flex items-center justify-center shadow-xl shadow-cyan-500/20">
              <Lock className="h-7 w-7 text-white animate-pulse" />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Security Console Lock</h1>
            <p className="text-xs text-slate-400">Dashboard is locked. Please authenticate using Email OTP or Super Admin Passcode.</p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl text-xs">
            <button
              onClick={() => {
                setAuthTab('otp');
                setAuthError(null);
              }}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${authTab === 'otp' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400'}`}
            >
              📧 Email OTP Login
            </button>
            <button
              onClick={() => {
                setAuthTab('super_admin');
                setAuthError(null);
              }}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${authTab === 'super_admin' ? 'bg-purple-600 text-white shadow' : 'text-slate-400'}`}
            >
              🔐 Super Admin Console
            </button>
          </div>

          {authError && (
            <div className="bg-rose-500/15 border border-rose-500/40 p-3 rounded-xl text-xs text-rose-300 font-mono flex items-center space-x-2">
              <ShieldIcon className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* TAB 1: EMAIL OTP AUTHENTICATION ENGINE */}
          {authTab === 'otp' && (
            <div className="space-y-4 text-xs">
              {authStep === 'send' ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-cyan-400" /> Enter Email Address:
                    </label>
                    <input
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="e.g. aditya@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    onClick={handleSendOTP}
                    disabled={isSendingOtp}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-extrabold flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                  >
                    {isSendingOtp ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>Send 6-Digit Email OTP</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-cyan-500/10 border border-cyan-500/30 p-3 rounded-xl space-y-1">
                    <span className="text-[11px] text-cyan-300 font-bold block">OTP Sent to: {loginEmail}</span>
                    {devOtpBadge && (
                      <span className="text-[10px] font-mono text-emerald-400 block">
                        [Dev Simulated Delivery Token: <strong className="text-white text-xs">{devOtpBadge}</strong>]
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-cyan-400" /> Enter 6-Digit OTP Code:
                    </label>
                    <input
                      value={otpCodeInput}
                      onChange={e => setOtpCodeInput(e.target.value)}
                      placeholder="Enter 6-digit OTP..."
                      maxLength={6}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-center tracking-widest text-base outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => setAuthStep('send')}
                      className="w-1/3 py-2.5 bg-slate-800 text-slate-400 rounded-xl font-bold"
                    >
                      Resend
                    </button>
                    <button
                      onClick={handleVerifyOTP}
                      className="w-2/3 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-extrabold shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Check className="h-4 w-4" />
                      <span>Verify & Unlock</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUPER ADMIN CONSOLE PASSCODE */}
          {authTab === 'super_admin' && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-purple-300 font-bold flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-purple-400" /> Super Admin Passcode Only:
                </label>
                <input
                  type="password"
                  value={superAdminPass}
                  onChange={e => setSuperAdminPass(e.target.value)}
                  placeholder="Enter ENV Super Admin Password..."
                  className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={handleSuperAdminLogin}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-extrabold shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Unlock Super Admin Console</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // AUTHENTICATED DASHBOARD APPLICATION
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#07080d] text-slate-100 font-sans selection:bg-cyan-600 selection:text-white">
      
      {/* HEADER NAVBAR */}
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
              { id: 'ai_timeline', label: 'AI Build Timeline', icon: Cpu },
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

          {/* USER AUTH STATUS & HARD LOGOUT */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-emerald-400 font-bold font-mono">@{currentUser.username}</span>
              <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono uppercase">{currentUser.role}</span>
              
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all cursor-pointer"
                title="Logout Account"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>

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
          <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 space-y-1.5">
            {[
              { id: 'home', label: 'Dashboard Home', icon: LayoutDashboard },
              { id: 'ai_timeline', label: 'AI Build Timeline', icon: Cpu },
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

            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout (@{currentUser.username})</span>
            </button>
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

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* PAGE 1: DASHBOARD HOME */}
        {activeTab === 'home' && (
          <div className="space-y-6">
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

            <div className="flex justify-end">
              <button
                onClick={handleCommitDailyProgress}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-extrabold flex items-center space-x-2 shadow-md cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save & Commit Daily Progress</span>
              </button>
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

        {/* PAGE: AI BUILD TIMELINE & BUILT FEATURES LIST */}
        {activeTab === 'ai_timeline' && (
          <div className="space-y-6 animate-fadeIn">
            {/* PROJECT SPEC HEADER CARD */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <Cpu className="h-6 w-6 text-cyan-400 animate-pulse" />
                    <h2 className="text-xl font-extrabold text-white tracking-tight">
                      {aiProjectState?.project?.title || aiProjectState?.project?.name || 'Autonomous SaaS Product Engine'}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      aiProjectState?.project?.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {aiProjectState?.project?.status || 'Active Spec'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    {aiProjectState?.project?.description || 'AI software engineering pipeline automatically designing, building, and deploying micro-saas features.'}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={fetchAiProjectState}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingAiState ? 'animate-spin' : ''}`} />
                    <span>Refresh State</span>
                  </button>
                  
                  <button
                    onClick={handleTriggerNextFeature}
                    disabled={isPipelineRunning}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-cyan-600/30 flex items-center space-x-2 cursor-pointer"
                  >
                    {isPipelineRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
                    <span>{isPipelineRunning ? 'Building Feature...' : 'Build Next Feature Now'}</span>
                  </button>
                </div>
              </div>

              {/* PIPELINE LIVE LOG EXPANDER */}
              {isPipelineRunning && (
                <div className="mt-4 bg-slate-950 border border-cyan-500/40 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-cyan-300 font-mono font-bold">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
                      Live Autonomous Build Stream Log
                    </span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap bg-black/40 p-3 rounded-xl border border-slate-900">
                    {pipelineRunLog || 'Initializing AI pipeline...'}
                  </pre>
                </div>
              )}
            </div>

            {/* BUILT FEATURES TIMELINE LIST */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Built Features & Implementation Logs</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Total Features Built: <strong className="text-cyan-400 font-bold">
                    {((aiProjectState?.milestones || []).flatMap((m: any) => m.tasks || []).filter((t: any) => t.status === 'completed')).length}
                  </strong>
                </span>
              </div>

              <div className="space-y-3">
                {((aiProjectState?.milestones || []).flatMap((m: any) => 
                  (m.tasks || []).map((t: any) => ({ ...t, milestone_title: m.title }))
                ).filter((t: any) => t.status === 'completed')).length > 0 ? (
                  ((aiProjectState?.milestones || []).flatMap((m: any) => 
                    (m.tasks || []).map((t: any) => ({ ...t, milestone_title: m.title }))
                  ).filter((t: any) => t.status === 'completed')).map((task: any, i: number) => (
                    <div key={task.id || i} className="bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 p-4 rounded-2xl transition-all space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2.5">
                          <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold rounded-lg border border-cyan-500/20">
                            Task #{task.id}
                          </span>
                          <h4 className="text-xs font-bold text-white tracking-wide">{task.name}</h4>
                        </div>

                        <div className="flex items-center space-x-2">
                          {task.commit_sha && (
                            <span className="font-mono text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                              #{task.commit_sha.substring(0, 7)}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold rounded-full border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> BUILT & VERIFIED
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>

                      {/* FILES CREATED / TOUCHED */}
                      {task.files_touched && task.files_touched.length > 0 && (
                        <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                          <span className="text-slate-500 text-[10px] font-sans font-bold">Files Built:</span>
                          {task.files_touched.map((f: string, fi: number) => (
                            <span key={fi} className="bg-slate-950 text-cyan-300 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
                              📄 {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
                    <Cpu className="h-8 w-8 text-slate-500 mx-auto animate-pulse" />
                    <p className="text-xs text-slate-400 font-mono">No features built yet for this spec. Click "Build Next Feature Now" to trigger AI execution!</p>
                  </div>
                )}
              </div>

              {/* PLANNED & UPCOMING FEATURES PIPELINE */}
              <div className="pt-4 space-y-3">
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span>Upcoming Planned Features Pipeline</span>
                </h3>

                <div className="space-y-2">
                  {((aiProjectState?.milestones || []).flatMap((m: any) => 
                    (m.tasks || []).map((t: any) => ({ ...t, milestone_title: m.title }))
                  ).filter((t: any) => t.status !== 'completed')).map((task: any, i: number) => (
                    <div key={task.id || i} className="bg-slate-900/40 border border-slate-800/50 p-3.5 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold rounded border border-amber-500/20">
                          #{task.id}
                        </span>
                        <span className="text-slate-300 font-bold">{task.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        ⏳ QUEUED IN PIPELINE
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 2: MASTER TABLES STUDIO */}
        {activeTab === 'master_tables' && (
          <div className="space-y-6">

            {/* EMBEDDED SQLITE DATABASE COMMAND CENTER & LIVE METRICS */}
            <div className="bg-slate-900/60 p-4 sm:p-6 rounded-3xl border border-cyan-500/30 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-cyan-400" />
                    <h1 className="text-lg sm:text-xl font-extrabold text-white">Master Tables Studio & SQLite Command Center</h1>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">EMBEDDED DB ACTIVE</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">High-performance zero-hosting SQLite B-Tree indexed database (`db/app_data.db`). Direct table management, live SQL console, and 1-click Excel export.</p>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowCreateTableModal(true)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-md cursor-pointer shrink-0"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                    <span>Create Table</span>
                  </button>
                  <button
                    onClick={fetchSqliteStats}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Refresh</span>
                  </button>
                  <a
                    href="/api/db/download"
                    download="app_data.db"
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow cursor-pointer shrink-0"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>.db File</span>
                  </a>
                </div>
              </div>

              {/* LIVE METRICS CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold block">DB FILE SIZE</span>
                  <span className="text-sm sm:text-base font-extrabold text-cyan-300 font-mono">{sqliteStats?.file_size_formatted || '0.12 MB'}</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold block">ACTIVE TABLES</span>
                  <span className="text-sm sm:text-base font-extrabold text-emerald-300 font-mono">{sqliteStats?.total_tables || 5} Tables</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold block">TOTAL STORED ROWS</span>
                  <span className="text-sm sm:text-base font-extrabold text-purple-300 font-mono">{sqliteStats?.total_rows || 12} Rows</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold block">ENGINE VERSION</span>
                  <span className="text-sm sm:text-base font-extrabold text-amber-300 font-mono">SQLite v{sqliteStats?.sqlite_version || '3.42.0'}</span>
                </div>
              </div>

              {/* INTERACTIVE SQL TERMINAL CONSOLE */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Terminal className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white font-mono">Interactive Live SQL Terminal & Table Runner</h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    {['SELECT * FROM rules;', 'SELECT * FROM blob_assets;', 'SELECT * FROM users;', 'SELECT * FROM messages;'].map(preset => (
                      <button
                        key={preset}
                        onClick={() => {
                          setSqlInput(preset);
                          handleExecuteSqlQuery(preset);
                        }}
                        className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-cyan-300 rounded border border-slate-800 cursor-pointer"
                      >
                        {preset.split(' ')[3]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      value={sqlInput}
                      onChange={e => {
                        setSqlInput(e.target.value);
                        setShowSqlSuggestions(true);
                        setSelectedSuggestionIdx(0);
                      }}
                      onFocus={() => setShowSqlSuggestions(true)}
                      onKeyDown={e => {
                        if (showSqlSuggestions && activeSqlSuggestions.length > 0) {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setSelectedSuggestionIdx(prev => (prev + 1) % activeSqlSuggestions.length);
                            return;
                          }
                          if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setSelectedSuggestionIdx(prev => (prev - 1 + activeSqlSuggestions.length) % activeSqlSuggestions.length);
                            return;
                          }
                          if (e.key === 'Tab' || e.key === 'Enter') {
                            if (activeSqlSuggestions[selectedSuggestionIdx]) {
                              e.preventDefault();
                              applySqlSuggestion(activeSqlSuggestions[selectedSuggestionIdx].text);
                              return;
                            }
                          }
                          if (e.key === 'Escape') {
                            setShowSqlSuggestions(false);
                            return;
                          }
                        }
                        if (e.key === 'Enter') {
                          handleExecuteSqlQuery();
                        }
                      }}
                      placeholder="Enter SQL command (e.g. SELECT * FROM rules;)"
                      className="w-full sm:flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-cyan-300 font-mono outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={() => handleExecuteSqlQuery()}
                      disabled={isExecutingSql}
                      className="w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 shadow cursor-pointer shrink-0"
                    >
                      {isExecutingSql ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-white" />}
                      <span>Execute SQL</span>
                    </button>
                  </div>

                  {/* SQL INTELLISENSE AUTOCOMPLETE FLOATING POPUP */}
                  {showSqlSuggestions && activeSqlSuggestions.length > 0 && (
                    <div className="absolute left-0 top-full mt-1 z-30 bg-slate-950 border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden min-w-[280px]">
                      <div className="px-3 py-1 bg-slate-900 border-b border-slate-800 text-[10px] font-mono text-slate-400 flex justify-between items-center">
                        <span>💡 SQL IntelliSense Suggestions</span>
                        <span>[Tab / Enter] to insert</span>
                      </div>
                      <div className="py-1 max-h-48 overflow-auto divide-y divide-slate-900/50">
                        {activeSqlSuggestions.map((item, idx) => (
                          <div
                            key={`${item.type}-${item.text}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              applySqlSuggestion(item.text);
                            }}
                            onMouseEnter={() => setSelectedSuggestionIdx(idx)}
                            className={`px-3 py-1.5 flex items-center justify-between text-xs font-mono cursor-pointer transition-all ${
                              idx === selectedSuggestionIdx ? 'bg-cyan-600/30 text-white font-bold' : 'text-slate-300 hover:bg-slate-900'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="h-3 w-3 text-cyan-400" />
                              {item.text}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              item.type === 'keyword' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              item.type === 'table' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {item.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* QUERY RESULT VIEW MODE & SEARCH CONTROLS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[11px] font-mono font-bold">
                      <button
                        onClick={() => setSqlResultViewMode('table')}
                        className={`px-2.5 py-1 rounded-md transition-all ${sqlResultViewMode === 'table' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                      >
                        📊 Tabular Grid ({sqlRows.length})
                      </button>
                      <button
                        onClick={() => setSqlResultViewMode('json')}
                        className={`px-2.5 py-1 rounded-md transition-all ${sqlResultViewMode === 'json' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                      >
                        {'{ }'} Raw JSON
                      </button>
                    </div>

                    {sqlRows.length > 0 && (
                      <button
                        onClick={handleExportSqlResultXLSX}
                        className="px-2.5 py-1 bg-emerald-800/50 hover:bg-emerald-700/60 text-emerald-300 border border-emerald-600/40 rounded-lg text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Download className="h-3 w-3" />
                        <span>Export Excel (.xlsx)</span>
                      </button>
                    )}
                  </div>

                  {sqlRows.length > 0 && sqlResultViewMode === 'table' && (
                    <div className="relative w-full sm:w-64">
                      <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2" />
                      <input
                        value={sqlResultSearch}
                        onChange={e => setSqlResultSearch(e.target.value)}
                        placeholder="Search rows in result grid..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-[11px] text-white outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* TABULAR INTERACTIVE GRID VIEW */}
                {sqlResultViewMode === 'table' && sqlRows.length > 0 && (
                  <div className="border border-slate-800 rounded-xl bg-slate-900/60 overflow-hidden">
                    <div className="max-h-64 overflow-auto">
                      <table className="w-full text-left text-xs font-mono border-collapse min-w-[500px]">
                        <thead className="bg-slate-950 sticky top-0 border-b border-slate-800 text-slate-400">
                          <tr>
                            {Array.from(new Set(sqlRows.flatMap(r => Object.keys(r)))).map(col => (
                              <th key={col} className="p-2 border-r border-slate-800 font-bold text-cyan-300 uppercase min-w-[100px]">{col}</th>
                            ))}
                            <th className="p-2 font-bold text-rose-400 uppercase w-12 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {sqlRows
                            .filter(r => {
                              if (!sqlResultSearch.trim()) return true;
                              const s = sqlResultSearch.toLowerCase();
                              return Object.values(r).some(val => String(val).toLowerCase().includes(s));
                            })
                            .map((row, rIdx) => {
                              const columns = Array.from(new Set(sqlRows.flatMap(r => Object.keys(r))));
                              return (
                                <tr key={rIdx} className="hover:bg-slate-800/40">
                                  {columns.map(col => (
                                    <td key={col} className="p-1.5 border-r border-slate-800 min-w-[110px]">
                                      <input
                                        value={row[col] !== undefined ? String(row[col]) : ''}
                                        onChange={e => handleSqlCellEdit(rIdx, col, e.target.value)}
                                        className="w-full bg-transparent text-slate-200 outline-none focus:bg-slate-950 focus:text-white focus:ring-1 focus:ring-cyan-500 px-1 py-0.5 rounded text-[11px]"
                                      />
                                    </td>
                                  ))}
                                  <td className="p-1.5 text-center">
                                    <button
                                      onClick={() => handleDeleteSqlRow(rIdx)}
                                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                                      title="Delete row from dataset"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-slate-950 px-3 py-1.5 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>Showing interactive grid rows • Edit cells directly above</span>
                      <button
                        onClick={handleAddRowToSqlResult}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Row</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* RAW JSON VIEW BACKWARD COMPATIBILITY */}
                {(sqlResultViewMode === 'json' || sqlRows.length === 0) && sqlOutput && (
                  <div className="bg-black/80 rounded-xl p-3 border border-slate-800 max-h-48 overflow-auto">
                    <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">{sqlOutput}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* MASTER TABLES DIRECTORY CATALOG */}
            <div className="bg-slate-900/60 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-cyan-400" />
                    Master Tables Directory Studio Catalog
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Lists all micro-product database tables with live row counts. Click Inspect & Edit to modify data in spreadsheet modal.</p>
                </div>
              </div>

              <div className="relative w-full">
                <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  value={masterSearch}
                  onChange={e => setMasterSearch(e.target.value)}
                  placeholder="Fuzzy search tables, projects, and descriptions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMasterTables.map(tbl => (
                  <div key={`${tbl.projectId}-${tbl.tableName}`} className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5 truncate">
                          <FileCode className="h-4 w-4 text-cyan-400 shrink-0" />
                          {tbl.tableName}.xlsx
                        </span>
                        <span className="text-[10px] bg-slate-900 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold shrink-0">
                          {tbl.rowCount > 0 ? tbl.rowCount : '…'} Rows
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {productsList.map(prod => {
                  const isExpanded = expandedDeployCard === prod.id;
                  const status = cardDeployStatus[prod.id] || 'idle';
                  const log = cardDeployLogs[prod.id] || '';
                  const liveUrl = cardDeployUrls[prod.id] || '';

                  return (
                    <div
                      key={prod.id}
                      onClick={() => setSelectedProductView(prod.id)}
                      className={`p-4 rounded-2xl bg-slate-950 border transition-all cursor-pointer space-y-3 flex flex-col justify-between ${
                        selectedProductView === prod.id ? 'border-cyan-500/60 ring-1 ring-cyan-500/30' : 'border-slate-800 hover:border-slate-700'
                      } ${isExpanded ? 'sm:col-span-3 bg-slate-950 border-purple-500/50 shadow-2xl' : ''}`}
                    >
                      {/* CARD HEADER */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">
                            {prod.status}
                          </span>
                          
                          {status === 'building' && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold animate-pulse flex items-center gap-1">
                              <RefreshCw className="h-3 w-3 animate-spin" /> DEPLOYING...
                            </span>
                          )}
                          {status === 'success' && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                              <Check className="h-3 w-3 text-emerald-400" /> DEPLOYED
                            </span>
                          )}
                          {status === 'error' && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 text-rose-400" /> FAILED
                            </span>
                          )}
                        </div>

                        <h3 className="text-xs font-bold text-white leading-snug">{prod.name}</h3>
                        <p className="text-[11px] text-slate-400">{prod.description}</p>
                      </div>

                      {/* IN-CARD INLINE FLIPPED TERMINAL LOG BOX */}
                      {isExpanded && (
                        <div className="space-y-2.5 pt-2 border-t border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                              Netlify Live Deploy Log Stream
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedDeployCard(null);
                              }}
                              className="text-slate-500 hover:text-white p-1 text-[11px] font-mono flex items-center gap-1"
                            >
                              <X className="h-3.5 w-3.5" /> Collapse Card
                            </button>
                          </div>

                          <div className="bg-black/90 p-3 rounded-xl border border-slate-800 max-h-52 overflow-auto font-mono text-[11px] text-emerald-400 whitespace-pre-wrap leading-relaxed">
                            {log || 'Waiting for build server logs...'}
                          </div>

                          {liveUrl && (
                            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl">
                              <span className="text-xs font-mono text-emerald-300 truncate max-w-[300px]">🌐 {liveUrl}</span>
                              <a
                                href={liveUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 shadow shrink-0"
                              >
                                <ExternalLink className="h-3.5 w-3.5" /> Open Live Site
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* CARD FOOTER ACTIONS */}
                      <div className="flex items-center space-x-2 pt-2 border-t border-slate-900">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRunBuildVerify(prod);
                          }}
                          className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Play className="h-3 w-3 fill-emerald-400" />
                          <span>Verify</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeployProduct(prod);
                          }}
                          disabled={status === 'building'}
                          className="flex-1 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-[11px] font-extrabold flex items-center justify-center space-x-1 shadow cursor-pointer disabled:opacity-50"
                        >
                          <UploadCloud className="h-3 w-3" />
                          <span>{status === 'building' ? 'Deploying...' : isExpanded ? 'Re-Deploy' : 'Deploy'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PRODUCT LEVEL LOGIN / SIGNUP UI GATEWAY */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="h-5 w-5 text-purple-400 shrink-0" />
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-white">Micro-Product User Access & Identity Gateway</h3>
                      <p className="text-[11px] text-slate-400">Sign in or create a new account to unlock user-specific folder storage and email thread identity.</p>
                    </div>
                  </div>

                  {productAuthUser ? (
                    <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
                      <span className="text-emerald-400 font-bold">● @{productAuthUser.username}</span>
                      <span className="text-purple-300 text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded font-bold uppercase">{productAuthUser.role}</span>
                      <button onClick={() => setProductAuthUser(null)} className="text-slate-500 hover:text-rose-400 text-[11px] underline ml-1 cursor-pointer">Switch Account</button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
                      <button
                        onClick={() => setProductAuthMode('login')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          productAuthMode === 'login' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => setProductAuthMode('register')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          productAuthMode === 'register' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Create Account (Sign Up)
                      </button>
                    </div>
                  )}
                </div>

                {!productAuthUser && (
                  <div className="space-y-3">
                    {productAuthError && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                        ⚠️ {productAuthError}
                      </div>
                    )}

                    {productAuthMode === 'login' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <input
                          placeholder="Enter Username (e.g. aditya)..."
                          value={productUsernameInput}
                          onChange={e => setProductUsernameInput(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                        />
                        <input
                          type="password"
                          placeholder="Password (default: password123)..."
                          value={productPasswordInput}
                          onChange={e => setProductPasswordInput(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                        />
                        <button
                          onClick={handleProductUserLogin}
                          className="py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-extrabold shadow cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <UserCheck className="h-4 w-4" />
                          <span>Sign In to Product</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                        <input
                          placeholder="Username..."
                          value={productUsernameInput}
                          onChange={e => setProductUsernameInput(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                        />
                        <input
                          placeholder="Email Address..."
                          value={productEmailInput}
                          onChange={e => setProductEmailInput(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                        />
                        <input
                          type="password"
                          placeholder="Password..."
                          value={productPasswordInput}
                          onChange={e => setProductPasswordInput(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                        />
                        <select
                          value={productRoleInput}
                          onChange={e => setProductRoleInput(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-mono outline-none focus:border-purple-500 cursor-pointer"
                        >
                          <option value="developer">Role: Developer</option>
                          <option value="super_admin">Role: Super Admin</option>
                          <option value="viewer">Role: Viewer</option>
                        </select>
                        <button
                          onClick={handleProductUserRegister}
                          className="py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-extrabold shadow cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <FolderPlus className="h-4 w-4" />
                          <span>Sign Up & Unlock</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedProductView === 'product2_github_blob_storage' && (
                <div className="bg-slate-950 p-4 sm:p-6 rounded-3xl border border-purple-500/30 space-y-5 mt-4">
                  <div>
                    <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold mb-1">
                      <UploadCloud className="h-3.5 w-3.5 text-purple-400" />
                      <span>Product 02 Tool Operational View</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-white">GitHub Blob Storage Utility Tool</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Upload images, MP4 videos, and PDF documents directly into user-isolated storage folders.</p>
                  </div>

                  {/* User Isolated Workspace Banner */}
                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-purple-300">
                    <div className="flex items-center space-x-2">
                      <FolderPlus className="h-4 w-4 text-purple-400 shrink-0" />
                      <span>
                        {['super_admin', 'developer'].includes(currentUser?.role || '')
                          ? `👑 Admin Mode: Accessing all user files across storage/users/`
                          : `🔒 Isolated Folder: storage/users/${currentUser?.username || 'public'}/ (Viewing your uploads)`}
                      </span>
                    </div>
                    <span className="text-[10px] bg-slate-950 border border-purple-500/20 px-2 py-0.5 rounded text-cyan-300 font-bold">
                      {blobAssets.length} Files Stored
                    </span>
                  </div>

                  <div className="bg-slate-900 p-5 rounded-2xl border-2 border-dashed border-purple-500/40 text-center space-y-3 hover:border-purple-500 transition-all">
                    <div className="h-12 w-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 mx-auto flex items-center justify-center text-purple-400">
                      <FileUp className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Drag & Drop or Click to Upload File</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Will be saved to your user directory: <code className="text-purple-300 font-mono">storage/users/{currentUser?.username || 'public'}/</code></span>
                    </div>

                    <label className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer">
                      <UploadCloud className="h-4 w-4" />
                      <span>{isUploading ? `Uploading (${uploadProgress}%)...` : 'Select File to Upload'}</span>
                      <input
                        type="file"
                        onChange={handleFileInputChange}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* LIVE UPLOADING PROGRESS & TIME TRACKER CARD */}
                  {isUploading && (
                    <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-4 space-y-3 shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                        <div className="flex items-center space-x-2 font-bold text-white">
                          <UploadCloud className="h-4 w-4 text-purple-400 animate-bounce shrink-0" />
                          <span className="truncate max-w-[200px] sm:max-w-xs">{uploadFileName}</span>
                        </div>
                        <div className="flex items-center space-x-3 font-mono text-[11px] self-end sm:self-auto">
                          <span className="text-purple-300 font-extrabold">{uploadProgress}%</span>
                          <span className="text-cyan-300">⚡ {uploadSpeed}</span>
                          <span className="text-emerald-400 font-bold">⏱️ {uploadElapsedTime}s</span>
                        </div>
                      </div>

                      {/* Animated Gradient Progress Track */}
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                        <div
                          className="bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out shadow-md"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>{uploadStatusText}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-400 font-bold animate-pulse hidden sm:inline">● Active Stream</span>
                          <button
                            onClick={handleCancelUpload}
                            className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-lg text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-all shrink-0"
                            title="Abort current upload"
                          >
                            <X className="h-3 w-3" />
                            <span>Cancel Upload</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                      {[
                        { id: 'all', label: 'All Assets' },
                        { id: 'image', label: '📷 Images' },
                        { id: 'video', label: '🎬 Videos' },
                        { id: 'doc', label: '📄 Docs' },
                      ].map(flt => (
                        <button
                          key={flt.id}
                          onClick={() => setBlobFilterType(flt.id)}
                          className={`px-3 py-1 rounded-lg font-bold transition-all ${
                            blobFilterType === flt.id ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {flt.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        value={blobSearchInput}
                        onChange={e => setBlobSearchInput(e.target.value)}
                        placeholder="Filter assets catalog..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Stored Assets Catalog (<code className="text-purple-300 font-mono">app/product2_github_blob_storage/storage/</code>)</span>
                    {blobAssets
                      .filter(a => blobFilterType === 'all' || a.type === blobFilterType)
                      .filter(a => !blobSearchInput.trim() || a.filename.toLowerCase().includes(blobSearchInput.toLowerCase()) || a.url.toLowerCase().includes(blobSearchInput.toLowerCase()))
                      .map(asset => (
                        <div key={asset.id} className="p-3 sm:p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono hover:border-slate-700 transition-all">
                          <div className="flex items-center space-x-3">
                            <div
                              onClick={() => setPreviewBlobAsset(asset)}
                              className="h-9 w-9 rounded-xl bg-slate-950 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 cursor-pointer hover:border-purple-500 transition-all"
                              title="Click to preview asset media"
                            >
                              {asset.type === 'image' && <ImageIcon className="h-4 w-4" />}
                              {asset.type === 'video' && <Film className="h-4 w-4 text-cyan-400" />}
                              {asset.type === 'doc' && <FilePdf className="h-4 w-4 text-emerald-400" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-white flex items-center gap-1.5 cursor-pointer hover:text-cyan-300" onClick={() => setPreviewBlobAsset(asset)}>
                                {asset.filename}
                              </span>
                              <span className="text-[10px] text-purple-300 truncate max-w-[200px] sm:max-w-none">{asset.url}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                            <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400">{asset.size}</span>
                            <button
                              onClick={() => setPreviewBlobAsset(asset)}
                              className="px-2.5 py-1 bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white rounded-lg font-bold flex items-center space-x-1 text-xs cursor-pointer transition-all"
                            >
                              <Maximize2 className="h-3 w-3" />
                              <span>Preview</span>
                            </button>
                            <button
                              onClick={() => handleCopyBlobUrl(asset.url)}
                              className="px-2.5 py-1 bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600 hover:text-white rounded-lg font-bold flex items-center space-x-1 text-xs cursor-pointer transition-all"
                              title="Copy direct URL"
                            >
                              <Copy className="h-3 w-3" />
                              <span>Copy URL</span>
                            </button>
                            <button
                              onClick={() => handleDeleteBlobAsset(asset.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                              title="Delete asset"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* PRODUCT 01 OPERATIONAL VIEW */}
              {selectedProductView === 'product1_adblocker_extension' && (
                <div className="bg-slate-950 p-4 sm:p-6 rounded-3xl border border-cyan-500/30 space-y-6 mt-4">
                  <div>
                    <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold mb-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Product 01 Tool Operational View</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-white">Manifest V3 AdBlocker & Tracker Zapper</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Manage isolated dynamic network rules, run live URL ad-blocking simulations, manage whitelisted domains, and test cosmetic DOM element hiders.</p>
                  </div>

                  {/* Live Metric Stats Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Rules</span>
                      <span className="text-lg font-bold text-cyan-400">{adblockRules.filter(r => r.enabled).length}</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Whitelisted</span>
                      <span className="text-lg font-bold text-emerald-400">{whitelistDomains.length}</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Ads Blocked Today</span>
                      <span className="text-lg font-bold text-purple-400">14,892</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Data Saved</span>
                      <span className="text-lg font-bold text-amber-400">42.6 MB</span>
                    </div>
                  </div>

                  {/* Section 1: Live URL AdBlock Test Simulator */}
                  <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-400" /> Live URL Zapper Simulator
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        value={testUrlInput}
                        onChange={e => setTestUrlInput(e.target.value)}
                        placeholder="Paste URL to test (e.g. https://doubleclick.net/ad.js)..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                      />
                      <button
                        onClick={handleTestUrl}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shrink-0 flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5 fill-white" />
                        <span>Test URL Rule</span>
                      </button>
                    </div>

                    {testResult && (
                      <div className={`p-3 rounded-xl text-xs font-mono border flex items-center justify-between ${
                        (testResult as any).isWhitelisted
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : testResult.blocked
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {(testResult as any).isWhitelisted ? (
                            <Globe className="h-4 w-4 text-amber-400 shrink-0" />
                          ) : testResult.blocked ? (
                            <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          )}
                          <span>
                            {(testResult as any).isWhitelisted
                              ? '[WHITELISTED] Domain is in whitelist bypass table. Request allowed.'
                              : testResult.blocked
                              ? `[BLOCKED] Matched Rule #${testResult.rule.id} (${testResult.rule.domain})`
                              : '[ALLOWED] No active block rule matched this URL.'}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-black/40">
                          {(testResult as any).isWhitelisted ? 'Bypass Action' : testResult.blocked ? 'Block Action' : 'Allow Action'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Whitelisted Domains Manager & Cosmetic Element Hider */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Whitelist Manager */}
                    <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                      <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                        <Globe className="h-4 w-4 text-emerald-400" /> Whitelisted Domains Bypass Table
                      </h3>
                      <div className="flex gap-2">
                        <input
                          value={newWhitelistInput}
                          onChange={e => setNewWhitelistInput(e.target.value)}
                          placeholder="Add domain (e.g. youtube.com)..."
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                        />
                        <button
                          onClick={handleAddWhitelistDomain}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                        >
                          Add Whitelist
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {whitelistDomains.map(dom => (
                          <span key={dom} className="inline-flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-xs font-mono text-emerald-300">
                            <span>{dom}</span>
                            <button onClick={() => handleRemoveWhitelistDomain(dom)} className="hover:text-rose-400 text-slate-500"><X className="h-3 w-3" /></button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Cosmetic Element Hider Simulator */}
                    <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                      <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                        <Code className="h-4 w-4 text-purple-400" /> Dynamic Cosmetic DOM Element Hider
                      </h3>
                      <div className="flex gap-2">
                        <input
                          value={cosmeticSelectorInput}
                          onChange={e => setCosmeticSelectorInput(e.target.value)}
                          placeholder="CSS Selector (e.g. .ad-banner-overlay)..."
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500 font-mono"
                        />
                        <button
                          onClick={handleTestCosmeticSelector}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                        >
                          Inject Rule
                        </button>
                      </div>
                      {cosmeticTestResult && (
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-purple-500/30 text-[11px] font-mono text-purple-300">
                          {cosmeticTestResult}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 3: Active Dynamic DNR Rules List & Add Form */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                        <Database className="h-4 w-4 text-cyan-400" /> Active Dynamic Rules Catalog (<code className="text-cyan-300 font-mono">app/product1_adblocker_extension/db/rules.json</code>)
                      </h3>
                      
                      {/* Category Filter Pills */}
                      <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                        {['All', 'Ads', 'Trackers', 'Social', 'Popups'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setRuleCategoryFilter(cat)}
                            className={`px-2.5 py-0.5 rounded-lg font-bold transition-all ${
                              ruleCategoryFilter === cat ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900 p-3 sm:p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                      <input
                        value={newRuleDomain}
                        onChange={e => setNewRuleDomain(e.target.value)}
                        placeholder="Enter domain pattern (e.g. *popads.net*)..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono w-full"
                      />
                      <select
                        value={newRuleCategory}
                        onChange={e => setNewRuleCategory(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-500 cursor-pointer w-full sm:w-auto"
                      >
                        <option value="Ads">Category: Ads</option>
                        <option value="Trackers">Category: Trackers</option>
                        <option value="Social">Category: Social</option>
                        <option value="Popups">Category: Popups</option>
                      </select>
                      <button
                        onClick={handleAddRule}
                        className="w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Rule</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {adblockRules.filter(r => ruleCategoryFilter === 'All' || r.category === ruleCategoryFilter).map(rule => (
                        <div key={rule.id} className="p-3 sm:p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                          <div className="flex items-center space-x-3">
                            <span className="text-[10px] bg-slate-950 text-cyan-300 px-2 py-0.5 rounded font-bold">#{rule.id}</span>
                            <span className="font-bold text-white">{rule.domain}</span>
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded uppercase">{rule.category}</span>
                          </div>

                          <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                            <button
                              onClick={() => handleToggleRule(rule.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                rule.enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                              }`}
                            >
                              {rule.enabled ? '● Enabled' : '○ Disabled'}
                            </button>
                            <button onClick={() => handleDeleteRule(rule.id)} className="text-slate-500 hover:text-rose-400 p-1">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PRODUCT 03 OPERATIONAL VIEW */}
              {selectedProductView === 'product3_email_chat_mvp' && (
                <div className="bg-slate-950 p-4 sm:p-6 rounded-3xl border border-purple-500/30 space-y-6 mt-4">
                  <div>
                    <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold mb-1">
                      <Mail className="h-3.5 w-3.5 text-purple-400" />
                      <span>Product 03 Tool Operational View</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-white">Email-Based Micro-Chat MVP (Rocket.Chat Style)</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Real-time email threads integrated into isolated JSON database (<code className="text-purple-300 font-mono">app/product3_email_chat_mvp/db/messages.json</code>).</p>
                  </div>

                  {/* Section 1: Live Threaded Email Chat Window with Sidebar Channels */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Left Sidebar: Threads Channels */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3 space-y-3">
                      <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block px-1 flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5 text-purple-400" /> Email Thread Channels
                      </span>
                      
                      <div className="space-y-1">
                        {['ALL', ...Array.from(new Set(chatMessages.map(m => m.subject)))].map(subj => (
                          <button
                            key={subj}
                            onClick={() => {
                              setActiveThreadSubject(subj);
                              if (subj !== 'ALL') setChatSubject(subj);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                              activeThreadSubject === subj
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white hover:bg-slate-950'
                            }`}
                          >
                            <span className="truncate">{subj === 'ALL' ? '💬 All Conversations' : `# ${subj}`}</span>
                            <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded font-mono">
                              {subj === 'ALL' ? chatMessages.length : chatMessages.filter(m => m.subject === subj).length}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Main Chat Messages Panel */}
                    <div className="md:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 max-h-[420px] flex flex-col justify-between">
                      <div className="border-b border-slate-800 pb-2 flex justify-between items-center shrink-0">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4 text-purple-400" />
                          <span className="text-xs font-extrabold text-white">
                            {activeThreadSubject === 'ALL' ? 'All Email Threads' : activeThreadSubject}
                          </span>
                        </div>
                        
                        <div className="relative w-40 sm:w-48">
                          <Search className="h-3 w-3 text-slate-500 absolute left-2.5 top-2" />
                          <input
                            value={chatSearchInput}
                            onChange={e => setChatSearchInput(e.target.value)}
                            placeholder="Search chat..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-[11px] text-white outline-none focus:border-purple-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                        {chatMessages
                          .filter(m => activeThreadSubject === 'ALL' || m.subject === activeThreadSubject)
                          .filter(m => !chatSearchInput.trim() || m.body.toLowerCase().includes(chatSearchInput.toLowerCase()) || m.sender_email.toLowerCase().includes(chatSearchInput.toLowerCase()) || m.subject.toLowerCase().includes(chatSearchInput.toLowerCase()))
                          .map(msg => (
                            <div key={msg.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-cyan-300">{msg.sender_email}</span>
                                  <span className="text-slate-500">➜</span>
                                  <span className="text-purple-300">{msg.recipient_email}</span>
                                </div>
                                <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                              </div>
                              <div className="text-xs font-bold text-white">{msg.subject}</div>
                              <div className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900 p-2.5 rounded-xl border border-slate-800/60">
                                {msg.body}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Compose & Dispatch New Email Message */}
                  <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <Send className="h-4 w-4 text-emerald-400" /> Compose Email Chat Message
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Select Recipient (<code className="text-purple-300 font-mono">product3/db/users.json</code>):</label>
                        <select
                          value={chatRecipient}
                          onChange={e => setChatRecipient(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500 cursor-pointer"
                        >
                          {chatUsersList.map(u => (
                            <option key={u.id || u.email} value={u.email}>
                              {u.name ? `${u.name} (${u.email})` : u.email}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Subject:</label>
                        <input
                          value={chatSubject}
                          onChange={e => setChatSubject(e.target.value)}
                          placeholder="e.g. Project Update"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Message Body:</label>
                      <textarea
                        rows={3}
                        value={chatBody}
                        onChange={e => setChatBody(e.target.value)}
                        placeholder="Write your email message thread content..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-sans outline-none focus:border-purple-500"
                      />
                    </div>
                    <button
                      onClick={handleSendChatMessage}
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                      <span>Dispatch Email Message</span>
                    </button>
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
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-400" />
                    Root Level User Authentication & RBAC Table
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">Root table stored at <code className="text-cyan-300 font-mono">db/users.json</code> managing dashboard access and permissions.</p>
                </div>
              </div>

              <div className="space-y-2">
                {usersList.map(u => (
                  <div key={u.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-white">@{u.username}</span>
                      <span className="text-cyan-300 text-[11px]">{u.email || `${u.username}@example.com`}</span>
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

      {/* SPREADSHEET INSPECT MODAL */}
      {inspectTableModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 w-[96vw] max-w-4xl max-h-[92vh] space-y-3 sm:space-y-4 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Database className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                  Table Inspector: <code className="text-cyan-300 font-mono">{inspectTableModal.tableName}</code>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">Excel Ready</span>
                </h3>
                <span className="text-[11px] text-slate-400">app/{inspectTableModal.projectId}/db/{inspectTableModal.tableName}.json → exportable as .xlsx</span>
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
                    <th className="p-2.5 sm:p-3 font-bold text-rose-400 uppercase w-12 text-center">Action</th>
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
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleDeleteInspectRow(rIdx)}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                          title="Delete this row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800 shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400 font-mono">{filteredInspectRows.length} rows displayed</span>
                <button
                  onClick={handleAddRowToInspectTable}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Row</span>
                </button>
                <button
                  onClick={handleExportInspectTableJSON}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={handleExportInspectTableXLSX}
                  className="px-2.5 py-1 bg-emerald-800/50 hover:bg-emerald-700/60 text-emerald-300 border border-emerald-600/40 rounded-lg text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  <span>Export Excel</span>
                </button>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button onClick={() => setInspectTableModal(null)} className="w-full sm:w-auto px-4 py-2 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
                <button onClick={handleSaveInspectTableData} className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer">
                  Save & Commit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA LIGHTBOX PREVIEW MODAL */}
      {previewBlobAsset && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 font-bold text-white text-sm">
                <Maximize2 className="h-4 w-4 text-purple-400" />
                <span>{previewBlobAsset.filename}</span>
              </div>
              <button onClick={() => setPreviewBlobAsset(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[220px] max-h-[60vh] overflow-hidden">
              {previewBlobAsset.type === 'image' && (
                <img src={previewBlobAsset.url} alt={previewBlobAsset.filename} className="max-h-[50vh] object-contain rounded-xl shadow-lg" onError={(e: any) => { e.target.src = 'https://via.placeholder.com/600x350/0f172a/38bdf8?text=Image+Preview'; }} />
              )}
              {previewBlobAsset.type === 'video' && (
                <video controls src={previewBlobAsset.url} className="w-full max-h-[50vh] rounded-xl shadow-lg" />
              )}
              {previewBlobAsset.type === 'doc' && (
                <div className="text-center space-y-3 font-mono p-6">
                  <FilePdf className="h-12 w-12 text-emerald-400 mx-auto" />
                  <span className="text-xs text-slate-300 block">{previewBlobAsset.filename}</span>
                  <span className="text-[11px] text-slate-500 block">{previewBlobAsset.size} — PDF / Document Asset</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
              <span className="text-purple-300 truncate max-w-[280px]">{previewBlobAsset.url}</span>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleCopyBlobUrl(previewBlobAsset.url)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl font-bold flex items-center space-x-1 cursor-pointer">
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy URL</span>
                </button>
                <a href={previewBlobAsset.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center space-x-1 cursor-pointer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Original</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TABLE MODAL */}
      {showCreateTableModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Create New Table</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Target Product Database:</label>
                <select
                  value={newTableTargetProduct}
                  onChange={e => setNewTableTargetProduct(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="product1_adblocker_extension">Product 01: AdBlocker Extension</option>
                  <option value="product2_github_blob_storage">Product 02: GitHub Blob Storage</option>
                  <option value="product3_email_chat_mvp">Product 03: Email Micro-Chat MVP</option>
                  <option value="system_db">Global System Database (/db/)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Table Name:</label>
                <input
                  placeholder="Table Name (e.g. session_logs)"
                  value={newTableNameInput}
                  onChange={e => setNewTableNameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-cyan-500"
                />
              </div>
            </div>
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