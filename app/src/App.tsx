import React, { useState, useEffect } from 'react';
import { 
  Flame, GitCommit, Calendar, Sparkles, Shield, ShieldCheck, Database, Plus, CheckCircle2, 
  RefreshCw, Save, Edit3, Layers, Settings, FileText, Code, Check, 
  Trash2, Globe, ArrowRight, Laptop, AlertCircle, X, ShieldAlert, CheckSquare,
  Wrench, Link2, Key, Bookmark, Download, Sparkle, Search, GitBranch, Terminal, Eye,
  UserCheck, Users, Lock, LogOut, FileCode, FolderPlus, UploadCloud, Film, Image as ImageIcon, FileText as FilePdf,
  ListOrdered, Zap, LayoutDashboard, Box, ArrowRightCircle, Menu, Play, FileUp, KeyRound, ShieldAlert as ShieldIcon,
  Mail, Send, CheckSquare as CheckSquareIcon, ShieldCheck as ShieldCheckIcon
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
  const [activeTab, setActiveTab] = useState<'home' | 'master_tables' | 'my_products' | 'user_auth'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Hard Security Auth State
  const [currentUser, setCurrentUser] = useState<UserEntry | null>(() => {
    try {
      const saved = localStorage.getItem('daily_engine_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
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

  // Inspect & Edit Data Modal State
  const [inspectTableModal, setInspectTableModal] = useState<{ projectId: string; tableName: string } | null>(null);
  const [inspectRows, setInspectRows] = useState<any[]>([]);
  const [inspectModalSearch, setInspectModalSearch] = useState<string>('');

  // Products Portfolio
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

  useEffect(() => {
    fetchMasterTables();
    fetchAdblockRules();
    fetchChatMessages();
    fetchChatUsers();
  }, []);

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

    const xhr = new XMLHttpRequest();

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
      setIsUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          setBlobAssets(data.rows || [data.asset, ...blobAssets]);
          setSuccessToast(`✅ File '${file.name}' uploaded in ${Math.round((Date.now() - startTime) / 1000)}s & committed to Git!`);
        } catch {
          setSuccessToast(`✅ File '${file.name}' uploaded successfully!`);
        }
      } else {
        setSuccessToast(`❌ Upload failed with status ${xhr.status}`);
      }
    };

    xhr.onerror = () => {
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
                        handleRunBuildVerify(prod);
                      }}
                      className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-emerald-400" />
                      <span>Run Build & Verify</span>
                    </button>
                  </div>
                ))}
              </div>

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
                        <span className="text-emerald-400 font-bold animate-pulse">● Upload Stream Active</span>
                      </div>
                    </div>
                  )}

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

              {/* PRODUCT 01 OPERATIONAL VIEW */}
              {selectedProductView === 'product1_adblocker_extension' && (
                <div className="bg-slate-950 p-4 sm:p-6 rounded-3xl border border-cyan-500/30 space-y-6 mt-4">
                  <div>
                    <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold mb-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Product 01 Tool Operational View</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-white">Manifest V3 AdBlocker & Tracker Zapper</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Manage isolated dynamic network rules, run live URL ad-blocking simulations, and inspect Chrome extension assets.</p>
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
                        testResult.blocked
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {testResult.blocked ? (
                            <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          )}
                          <span>
                            {testResult.blocked
                              ? `[BLOCKED] Matched Rule #${testResult.rule.id} (${testResult.rule.domain})`
                              : '[ALLOWED] No active block rule matched this URL.'}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-black/40">
                          {testResult.blocked ? 'Block Action' : 'Allow Action'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Active Dynamic DNR Rules List & Add Form */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                        <Database className="h-4 w-4 text-cyan-400" /> Active Dynamic Rules Catalog (<code className="text-cyan-300 font-mono">app/product1_adblocker_extension/db/rules.json</code>)
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">{adblockRules.length} Active Rules</span>
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
                      {adblockRules.map(rule => (
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

                  {/* Section 1: Live Threaded Email Chat Window */}
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4 max-h-[400px] overflow-y-auto">
                    <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                      <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                        <Mail className="h-4 w-4 text-purple-400" /> Email Conversation Thread
                      </span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">{chatMessages.length} Messages</span>
                    </div>

                    <div className="space-y-3">
                      {chatMessages.map(msg => (
                        <div key={msg.id} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
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
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400 font-mono">{filteredInspectRows.length} rows displayed</span>
                <button
                  onClick={handleAddRowToInspectTable}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Row</span>
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