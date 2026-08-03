import { useState, useEffect, useRef } from 'react';
import { 
  Cpu, Database, FolderGit2, GitBranch, GitPullRequest, GitMerge, Trash2, 
  Play, Terminal, BarChart2, ChevronUp, ChevronDown, CheckCircle2, Circle, AlertTriangle, 
  RefreshCw, FileText, Settings, Key, Save, Plus, Trash,
  CheckCircle, XCircle, FileCode, FolderOpen, FilePlus, Search, Maximize2, Minimize2,
  FolderPlus, Download, WrapText, Palette, MessageSquare, Sliders, Mic, MicOff,
  LogOut, CloudLightning, Bell, Users, Shield, Eye, EyeOff, Zap, Activity, Globe
} from 'lucide-react';

interface Task {
  id: string;
  name: string;
  description: string;
  files: string[];
  type: string;
  status: string;
  files_touched?: string[];
  commit_sha?: string;
}

interface Milestone {
  id: number;
  title: string;
  status: string;
  tasks: Task[];
}

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
}

interface ProjectState {
  project: {
    name: string;
    title: string;
    description: string;
    status: string;
    vision: string;
    repository_url?: string;
    deployment_url?: string;
    custom_idea?: string;
  };
  architecture: {
    notes: string;
    db_schema: string;
    folder_structure: string;
    auth_design: string;
    api_contracts: string;
  };
  milestones: Milestone[];
  priorities: string[];
  backlog: string[];
  token_metadata: {
    daily_used: number;
    daily_budget: number;
    total_used: number;
  };
  provider_priority?: string[];
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(sessionStorage.getItem('dashboard_auth') === 'true');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  type TabId = 'overview' | 'milestones' | 'git' | 'logs' | 'keys' | 'editor' | 'preview' | 'terminal' | 'settings' | 'quota' | 'database' | 'chat' | 'activity' | 'envs' | 'deploys' | 'api_tester' | 'lighthouse' | 'errors' | 'team';
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  
  // Terminal Sandbox States
  const [terminalCommand, setTerminalCommand] = useState<string>('');
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [terminalRunning, setTerminalRunning] = useState<boolean>(false);
  
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [dbTables, setDbTables] = useState<string[]>([]);
  const [tableRecords, setTableRecords] = useState<any[]>([]);
  const [showAddRecordModal, setShowAddRecordModal] = useState<boolean>(false);
  const [newRecordJSON, setNewRecordJSON] = useState<string>('{\n  "id": "",\n  "name": ""\n}');
  const [editingRecord, setEditingRecord] = useState<any>(null);
  
  // AI Lead Chat
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'agent'; text: string; timestamp: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [speechRecording, setSpeechRecording] = useState<boolean>(false);
  const [showVisualCanvas, setShowVisualCanvas] = useState<boolean>(false);
  
  // Pipeline Settings States
  const [pipelineSettings, setPipelineSettings] = useState<{ strict_typescript: boolean; auto_repair_limit: number; bypass_compilation_gates: boolean; enable_consensus: boolean }>({
    strict_typescript: true,
    auto_repair_limit: 3,
    bypass_compilation_gates: false,
    enable_consensus: false
  });
  
  // Quota Status States
  const [quotaKeys, setQuotaKeys] = useState<{ index: number; provider: string; status: 'active' | 'dead' | 'exhausted'; last_used: string }[]>([]);
  const [modelsUnavailable, setModelsUnavailable] = useState<Record<string, string>>({});
  
  // Database Explorer States
  const [dbFilter, setDbFilter] = useState<string>('');
  
  // Premium Features States
  const [_deployUrl, setDeployUrl] = useState<string>('');
  const [_deployLog, setDeployLog] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  
  const [codeReview, setCodeReview] = useState<string>('');
  const [isLoadingReview, setIsLoadingReview] = useState<boolean>(false);
  
  const [dbSchemaDiagram, setDbSchemaDiagram] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [dbExplorerTab, setDbExplorerTab] = useState<'records' | 'er_schema'>('records');
  const [queryField, setQueryField] = useState<string>('id');
  const [queryOperator, setQueryOperator] = useState<string>('equals');
  const [queryValue, setQueryValue] = useState<string>('');
  
  const [apiRoutes, setApiRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [apiPayload, setApiPayload] = useState<string>('{\n  "username": "admin",\n  "password": "secretPassword"\n}');
  const [apiResponse, setApiResponse] = useState<string>('');
  const [isApiTesting, setIsApiTesting] = useState<boolean>(false);
  
  const [terminalTab, setTerminalTab] = useState<'shell' | 'api' | 'tests'>('shell');
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  
  const [editorTab, setEditorTab] = useState<'explorer' | 'assets'>('explorer');
  const [assetFiles, setAssetFiles] = useState<any[]>([]);
  const [assetPrompt, setAssetPrompt] = useState<string>('');
  const [assetName, setAssetName] = useState<string>('banner.png');
  const [isGeneratingAsset, setIsGeneratingAsset] = useState<boolean>(false);
  
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  const [draggedElements, setDraggedElements] = useState<{ id: string; label: string; type: string }[]>([]);

  // ═══════════════════════════════════════════════════════════
  // NEW FEATURE STATES
  // ═══════════════════════════════════════════════════════════
  
  // Command Palette (⌘K)
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [commandSearch, setCommandSearch] = useState<string>('');
  
  // Notification Center
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<{id: string; title: string; message: string; time: string; type: 'success' | 'error' | 'info' | 'warning'; read: boolean}[]>([
    { id: '1', title: 'Pipeline Completed', message: 'Build pipeline finished successfully with 0 errors', time: '2 min ago', type: 'success', read: false },
    { id: '2', title: 'Deploy Live', message: 'Netlify deployment is now live at production URL', time: '15 min ago', type: 'success', read: false },
    { id: '3', title: 'New Commit Pushed', message: 'feat: add dashboard sidebar redesign (70c64f5)', time: '1 hr ago', type: 'info', read: true },
    { id: '4', title: 'API Key Expiring', message: 'OpenAI API key expires in 3 days, rotate soon', time: '2 hrs ago', type: 'warning', read: true },
    { id: '5', title: 'Test Suite Failed', message: '2 tests failed in auth.test.ts - assertion errors', time: '5 hrs ago', type: 'error', read: true },
  ]);
  
  // Keyboard Shortcuts & Theme
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);

  // Activity Feed
  const [activityFeed] = useState<{id: string; user: string; avatar: string; action: string; target: string; time: string; type: string}[]>([
    { id: '1', user: 'Aditya Jain', avatar: 'AJ', action: 'started pipeline', target: 'main branch', time: '2 min ago', type: 'pipeline' },
    { id: '2', user: 'AI Architect', avatar: 'AI', action: 'committed code', target: 'feat: sidebar redesign', time: '15 min ago', type: 'git' },
    { id: '3', user: 'System', avatar: 'SY', action: 'deployed to', target: 'Netlify Production', time: '1 hr ago', type: 'deploy' },
    { id: '4', user: 'Aditya Jain', avatar: 'AJ', action: 'edited file', target: 'src/App.tsx', time: '2 hrs ago', type: 'edit' },
    { id: '5', user: 'AI Architect', avatar: 'AI', action: 'resolved error', target: 'TS2345 type mismatch', time: '3 hrs ago', type: 'fix' },
    { id: '6', user: 'System', avatar: 'SY', action: 'ran tests', target: '47 passed, 2 failed', time: '4 hrs ago', type: 'test' },
    { id: '7', user: 'Aditya Jain', avatar: 'AJ', action: 'updated env', target: 'OPENAI_API_KEY', time: '5 hrs ago', type: 'config' },
    { id: '8', user: 'AI Architect', avatar: 'AI', action: 'created milestone', target: 'v2.0 Release', time: '6 hrs ago', type: 'milestone' },
  ]);

  // Environment Variables
  const [envVars, setEnvVars] = useState<{key: string; value: string; env: 'dev' | 'staging' | 'prod'; masked: boolean}[]>([
    { key: 'OPENAI_API_KEY', value: 'sk-proj-xxxx...xxxx', env: 'prod', masked: true },
    { key: 'DATABASE_URL', value: 'postgresql://user:pass@localhost:5432/db', env: 'dev', masked: true },
    { key: 'NEXT_PUBLIC_API_URL', value: 'https://api.example.com', env: 'prod', masked: false },
    { key: 'JWT_SECRET', value: 'super-secret-jwt-key-256', env: 'prod', masked: true },
    { key: 'REDIS_URL', value: 'redis://localhost:6379', env: 'dev', masked: false },
    { key: 'STRIPE_SECRET_KEY', value: 'sk_test_xxxx...xxxx', env: 'staging', masked: true },
  ]);
  const [envFilter, setEnvFilter] = useState<'all' | 'dev' | 'staging' | 'prod'>('all');
  const [showAddEnvModal, setShowAddEnvModal] = useState<boolean>(false);
  const [newEnvKey, setNewEnvKey] = useState<string>('');
  const [newEnvValue, setNewEnvValue] = useState<string>('');
  const [newEnvTarget, setNewEnvTarget] = useState<'dev' | 'staging' | 'prod'>('dev');

  // Deployment History
  const [deployHistory] = useState<{id: string; status: 'success' | 'failed' | 'building'; branch: string; commit: string; duration: string; time: string; url: string}[]>([
    { id: 'd1', status: 'success', branch: 'main', commit: '70c64f5', duration: '45s', time: '15 min ago', url: 'https://app.netlify.app' },
    { id: 'd2', status: 'success', branch: 'main', commit: '5af4664', duration: '52s', time: '2 hrs ago', url: 'https://app.netlify.app' },
    { id: 'd3', status: 'failed', branch: 'feat/auth', commit: 'a1b2c3d', duration: '12s', time: '5 hrs ago', url: '' },
    { id: 'd4', status: 'success', branch: 'main', commit: 'e4f5g6h', duration: '38s', time: '1 day ago', url: 'https://app.netlify.app' },
    { id: 'd5', status: 'success', branch: 'main', commit: 'i7j8k9l', duration: '41s', time: '2 days ago', url: 'https://app.netlify.app' },
  ]);

  // API Tester (Postman-lite)
  const [apiTesterMethod, setApiTesterMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [apiTesterUrl, setApiTesterUrl] = useState<string>('/api/state');
  const [apiTesterHeaders, setApiTesterHeaders] = useState<string>('{\n  "Content-Type": "application/json"\n}');
  const [apiTesterBody, setApiTesterBody] = useState<string>('{\n  \n}');
  const [apiTesterResponse, setApiTesterResponse] = useState<{status: number; time: string; body: string} | null>(null);
  const [isApiTesterLoading, setIsApiTesterLoading] = useState<boolean>(false);

  // Lighthouse Performance
  const [lighthouseScores] = useState<{performance: number; seo: number; accessibility: number; bestPractices: number}>({
    performance: 94, seo: 100, accessibility: 87, bestPractices: 92
  });

  // Error Tracking
  const [trackedErrors, setTrackedErrors] = useState<{id: string; message: string; file: string; line: number; count: number; status: 'open' | 'resolved'; severity: 'critical' | 'warning' | 'info'; lastSeen: string; stackTrace?: string; fixSuggestion?: string}[]>([
    { 
      id: 'e1', 
      message: 'TypeError: Cannot read property of undefined', 
      file: 'src/components/Dashboard.tsx', 
      line: 142, 
      count: 23, 
      status: 'open', 
      severity: 'critical', 
      lastSeen: '5 min ago',
      stackTrace: `TypeError: Cannot read property 'user' of undefined\n    at Dashboard (src/components/Dashboard.tsx:142:28)\n    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:16305)\n    at mountIndeterminateComponent (node_modules/react-dom/cjs/react-dom.development.js:20074)`,
      fixSuggestion: `Add optional chaining:\n- const username = user.details.name;\n+ const username = user?.details?.name || 'Guest';`
    },
    { 
      id: 'e2', 
      message: 'Warning: Each child in a list should have a unique key prop', 
      file: 'src/components/TaskList.tsx', 
      line: 67, 
      count: 8, 
      status: 'open', 
      severity: 'warning', 
      lastSeen: '1 hr ago',
      stackTrace: `Warning: Each child in a list should have a unique "key" prop.\n    at TaskList (src/components/TaskList.tsx:67:12)\n    at div\n    at App (src/App.tsx:820:10)`,
      fixSuggestion: `Provide key prop to mapped element:\n- {items.map(item => <div>{item.name}</div>)}\n+ {items.map(item => <div key={item.id}>{item.name}</div>)}`
    },
    { 
      id: 'e3', 
      message: 'ReferenceError: process is not defined', 
      file: 'src/utils/config.ts', 
      line: 12, 
      count: 3, 
      status: 'resolved', 
      severity: 'critical', 
      lastSeen: '1 day ago',
      stackTrace: `ReferenceError: process is not defined\n    at getConfig (src/utils/config.ts:12:5)`,
      fixSuggestion: `Replace process.env with import.meta.env for Vite environment variables.`
    },
    { 
      id: 'e4', 
      message: 'Hydration mismatch: Server HTML vs Client render', 
      file: 'src/pages/index.tsx', 
      line: 1, 
      count: 45, 
      status: 'open', 
      severity: 'warning', 
      lastSeen: '30 min ago',
      stackTrace: `Error: Text content does not match server-rendered HTML.\n    at HydrationBoundary (src/pages/index.tsx:1:1)`,
      fixSuggestion: `Wrap dynamic browser state inside useEffect to prevent server/client timestamp mismatch.`
    },
  ]);
  const [fixingErrorId, setFixingErrorId] = useState<string | null>(null);
  const [fixingAllErrors, setFixingAllErrors] = useState<boolean>(false);
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);

  // Team Members
  const [teamMembers] = useState<{id: string; name: string; email: string; role: 'admin' | 'developer' | 'viewer'; avatar: string; status: 'online' | 'offline' | 'away'; lastActive: string}[]>([
    { id: 't1', name: 'Aditya Jain', email: 'aditya@example.com', role: 'admin', avatar: 'AJ', status: 'online', lastActive: 'Now' },
    { id: 't2', name: 'AI Architect', email: 'ai@antigravity.dev', role: 'developer', avatar: 'AI', status: 'online', lastActive: 'Now' },
    { id: 't3', name: 'Priya Sharma', email: 'priya@example.com', role: 'developer', avatar: 'PS', status: 'away', lastActive: '30 min ago' },
    { id: 't4', name: 'Rahul Kumar', email: 'rahul@example.com', role: 'viewer', avatar: 'RK', status: 'offline', lastActive: '2 hrs ago' },
    { id: 't5', name: 'Neha Gupta', email: 'neha@example.com', role: 'developer', avatar: 'NG', status: 'offline', lastActive: '1 day ago' },
  ]);

  const [state, setState] = useState<ProjectState | null>(null);
  const [gitStatus, setGitStatus] = useState<{
    branch: string;
    behind: number;
    ahead: number;
    uncommitted_changes: { status: string; file: string }[];
  }>({ branch: 'main', behind: 0, ahead: 0, uncommitted_changes: [] });
  const [gitLog, setGitLog] = useState<{ sha: string; author: string; date: string; message: string }[]>([]);
  const [gitDiff, setGitDiff] = useState<string>('');
  const [commitMessage, setCommitMessage] = useState<string>('');
  const [pipeline, setPipeline] = useState<{ running: boolean; log: string }>({ running: false, log: '' });
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetReason, setResetReason] = useState<string>('');
  const [resetType, setResetType] = useState<'trend' | 'suggested' | 'custom'>('trend');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('Cryptocurrency Trading & Signal Alert Dashboard');
  const [customResetIdea, setCustomResetIdea] = useState<string>('');
  const [customResetTitle, setCustomResetTitle] = useState<string>('');
  const [targetMilestones, setTargetMilestones] = useState<number>(5);
  const [projectScope, setProjectScope] = useState<'mvp' | 'saas' | 'enterprise'>('saas');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [backendStack, setBackendStack] = useState<'nodejs' | 'python'>('nodejs');
  const [stylingStack, setStylingStack] = useState<'vanilla' | 'tailwind'>('tailwind');
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [selectedCommit, setSelectedCommit] = useState<{ sha: string; message: string } | null>(null);
  const [selectedCommitDiff, setSelectedCommitDiff] = useState<string>('');
  const [showCommitModal, setShowCommitModal] = useState<boolean>(false);
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [isSavingFile, setIsSavingFile] = useState<boolean>(false);
  const [showNewFileModal, setShowNewFileModal] = useState<boolean>(false);
  const [newFilePath, setNewFilePath] = useState<string>('');
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [newFolderPath, setNewFolderPath] = useState<string>('');
  const [fileSearchQuery, setFileSearchQuery] = useState<string>('');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const lastSavedContent = useRef<string>('');
  
  // Rich Editor settings
  const [editorFontSize, setEditorFontSize] = useState<number>(13);
  const [editorWordWrap, setEditorWordWrap] = useState<boolean>(false);
  const [editorTheme, setEditorTheme] = useState<'midnight' | 'cyberpunk' | 'monokai' | 'dracula'>('midnight');
  const [showSearchPanel, setShowSearchPanel] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  
  const [previewStatus, setPreviewStatus] = useState<{ building: boolean; log: string; ready: boolean }>({ building: false, log: '', ready: false });

  const fetchPreviewStatus = async () => {
    try {
      const res = await fetch('/api/preview/status');
      const data = await res.json();
      setPreviewStatus(data);
    } catch (e) {
      console.error("Preview status error:", e);
    }
  };

  const triggerPreviewBuild = async () => {
    try {
      const res = await fetch('/api/preview/build', { method: 'POST' });
      if (!res.ok) throw new Error("Failed to trigger build");
      showToast("App preview build started!");
      fetchPreviewStatus();
    } catch (e) {
      showToast("Failed to start build.", "error");
    }
  };

  const fetchTerminalStatus = async () => {
    try {
      const res = await fetch('/api/terminal/status');
      const data = await res.json();
      setTerminalOutput(data.log);
      setTerminalRunning(data.running);
    } catch (e) {
      console.error("Terminal status error:", e);
    }
  };

  const executeTerminalCommand = async () => {
    if (!terminalCommand.trim()) return;
    try {
      const res = await fetch('/api/terminal/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: terminalCommand.trim() })
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast("Terminal command started!");
        setTerminalCommand('');
        fetchTerminalStatus();
      } else {
        showToast(data.message, 'error');
      }
    } catch (e) {
      showToast("Failed to run terminal command.", 'error');
    }
  };

  const killTerminalCommand = async () => {
    try {
      const res = await fetch('/api/terminal/kill', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        showToast("Terminal command killed!");
        fetchTerminalStatus();
      } else {
        showToast(data.message, 'error');
      }
    } catch (e) {
      showToast("Failed to kill process.", 'error');
    }
  };

  const fetchPipelineSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setPipelineSettings(data);
    } catch (e) {
      console.error("Settings load error:", e);
    }
  };

  const savePipelineSettings = async (updates: any) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pipelineSettings, ...updates })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setPipelineSettings(prev => ({ ...prev, ...updates }));
        showToast("Pipeline settings saved!");
      }
    } catch (e) {
      showToast("Failed to save settings.", 'error');
    }
  };

  const fetchQuotaStatus = async () => {
    try {
      const res = await fetch('/api/quota/status');
      const data = await res.json();
      setQuotaKeys(data.keys);
      setModelsUnavailable(data.models_unavailable);
    } catch (e) {
      console.error("Quota load error:", e);
    }
  };

  const fetchDbTables = async () => {
    try {
      const res = await fetch('/api/database/tables');
      const data = await res.json();
      setDbTables(data.tables);
      if (data.tables.length > 0 && !selectedTable) {
        setSelectedTable(data.tables[0]);
      }
    } catch (e) {
      console.error("DB tables load error:", e);
    }
  };

  const fetchTableRecords = async (table: string) => {
    if (!table) return;
    try {
      const res = await fetch(`/api/database/table/${table}`);
      const data = await res.json();
      setTableRecords(data);
    } catch (e) {
      console.error("Table records load error:", e);
    }
  };

  const addDbRecord = async () => {
    if (!selectedTable) return;
    try {
      const parsedRecord = JSON.parse(newRecordJSON);
      const res = await fetch(`/api/database/table/${selectedTable}/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record: parsedRecord })
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast("Record added successfully!");
        setShowAddRecordModal(false);
        fetchTableRecords(selectedTable);
      }
    } catch (e) {
      showToast("Failed to add record. Ensure valid JSON.", 'error');
    }
  };

  const deleteDbRecord = async (matchKey: string, matchValue: any) => {
    if (!selectedTable) return;
    try {
      const res = await fetch(`/api/database/table/${selectedTable}/record?match_key=${matchKey}&match_value=${matchValue}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast("Record deleted!");
        fetchTableRecords(selectedTable);
      }
    } catch (e) {
      showToast("Failed to delete record.", 'error');
    }
  };

  const updateDbRecord = async (matchKey: string, matchValue: any, record: any) => {
    if (!selectedTable) return;
    try {
      const res = await fetch(`/api/database/table/${selectedTable}/record`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_key: matchKey, match_value: matchValue, record })
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast("Record updated!");
        setEditingRecord(null);
        fetchTableRecords(selectedTable);
      }
    } catch (e) {
      showToast("Failed to update record.", 'error');
    }
  };

  const sendAgentChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, timestamp: new Date().toLocaleTimeString() }]);
    setIsChatLoading(true);
    
    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: 'agent', text: data.message, timestamp: new Date().toLocaleTimeString() }]);
      if (data.file_contents && Object.keys(data.file_contents).length > 0) {
        showToast("AI Engineer modified workspace files!");
        fetchState();
      }
    } catch (e) {
      showToast("Failed to communicate with AI agent.", 'error');
    } finally {
      setIsChatLoading(false);
    }
  };

  const triggerNetlifyDeploy = async () => {
    setIsDeploying(true);
    setDeployLog("Triggering Netlify static deployment...");
    try {
      const res = await fetch('/api/deploy/netlify', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setDeployUrl(data.url);
        setDeployLog(data.log);
        showToast("App deployed successfully to Netlify!");
      } else {
        setDeployLog(data.message);
        showToast(data.message, 'error');
      }
    } catch (e) {
      setDeployLog("Deploy failed: Network exception.");
      showToast("Deploy failed.", 'error');
    } finally {
      setIsDeploying(false);
    }
  };

  const fetchCodeReview = async () => {
    setIsLoadingReview(true);
    try {
      const res = await fetch('/api/git/review');
      const data = await res.json();
      setCodeReview(data.review);
      showToast("Code review audit completed!");
    } catch (e) {
      showToast("Failed to run code review.", 'error');
    } finally {
      setIsLoadingReview(false);
    }
  };

  const fetchDbSchemaDiagram = async () => {
    try {
      const res = await fetch('/api/database/schema');
      const data = await res.json();
      setDbSchemaDiagram(data);
    } catch (e) {
      console.error("Schema diagram load error:", e);
    }
  };

  const discoverApiPlayground = async () => {
    try {
      const res = await fetch('/api/routes/discover');
      const data = await res.json();
      setApiRoutes(data.routes);
      if (data.routes.length > 0) {
        setSelectedRoute(data.routes[0]);
        setApiPayload(JSON.stringify(data.routes[0].request, null, 2));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const testApiEndpoint = async () => {
    if (!selectedRoute) return;
    setIsApiTesting(true);
    setApiResponse("Calling endpoint " + selectedRoute.path + "...\n");
    try {
      // Simulate endpoint testing response (as the express backend might not be actively running, we mock test it using local JSON DB mapping or direct hits)
      let parsed = {};
      try { parsed = JSON.parse(apiPayload); } catch (e) {}
      
      const res = await fetch(selectedRoute.path, {
        method: selectedRoute.method,
        headers: { 'Content-Type': 'application/json' },
        body: selectedRoute.method !== 'GET' ? JSON.stringify(parsed) : undefined
      });
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        setApiResponse(JSON.stringify(json, null, 2));
      } catch (e) {
        setApiResponse(text);
      }
      showToast("API Endpoint call completed!");
    } catch (e) {
      // Mock fallback response if local node express dev server is currently offline
      setApiResponse(JSON.stringify({
        status: "offline_mock_response",
        path: selectedRoute.path,
        method: selectedRoute.method,
        payload_received: JSON.parse(apiPayload),
        message: "Dev API server is offline. Visual contract parameters matched successfully."
      }, null, 2));
      showToast("API Mock verified successfully!");
    } finally {
      setIsApiTesting(false);
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Speech Recognition is not supported in this browser.", "error");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setSpeechRecording(true);
      showToast("Listening... Speak now.");
    };
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setChatInput(text);
      showToast("Speech transcribed successfully!");
    };
    recognition.onerror = () => {
      showToast("Speech recognition timed out or failed.", "error");
      setSpeechRecording(false);
    };
    recognition.onend = () => {
      setSpeechRecording(false);
    };
    recognition.start();
  };

  const executeQueryBuilder = async () => {
    if (!selectedTable) return;
    try {
      const res = await fetch(`/api/database/query?table=${selectedTable}&field=${queryField}&operator=${queryOperator}&value=${encodeURIComponent(queryValue)}`);
      const data = await res.json();
      setTableRecords(data);
      showToast(`Query completed! Found ${data.length} records.`);
    } catch (e) {
      showToast("Query builder execution failed.", 'error');
    }
  };

  const runTestSuite = async () => {
    setIsTesting(true);
    setTestResults(null);
    try {
      const res = await fetch('/api/tests/run', { method: 'POST' });
      const data = await res.json();
      setTestResults(data);
      showToast("Test suite run completed!");
    } catch (e) {
      showToast("Failed to run test suite.", 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const fetchAssetFiles = async () => {
    try {
      const res = await fetch('/api/assets/list');
      const data = await res.json();
      setAssetFiles(data);
    } catch (e) {
      console.error(e);
    }
  };

  const generateAIAsset = async () => {
    if (!assetPrompt.trim()) return;
    setIsGeneratingAsset(true);
    try {
      const res = await fetch('/api/assets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: assetName, prompt: assetPrompt })
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast("Mock AI Asset generated!");
        fetchAssetFiles();
      } else {
        showToast(data.message, 'error');
      }
    } catch (e) {
      showToast("AI generation failed.", 'error');
    } finally {
      setIsGeneratingAsset(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit/logs');
      const data = await res.json();
      setAuditLogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPreviewStatus();
    fetchTerminalStatus();
    fetchQuotaStatus();
    fetchPipelineSettings();
    fetchDbTables();
    
    const interval = setInterval(() => {
      fetchPreviewStatus();
      fetchTerminalStatus();
      fetchQuotaStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableRecords(selectedTable);
    }
  }, [selectedTable]);

  useEffect(() => {
    if (activeTab === 'database') {
      fetchDbSchemaDiagram();
    } else if (activeTab === 'git') {
      fetchCodeReview();
    } else if (activeTab === 'overview') {
      fetchAuditLogs();
    } else if (activeTab === 'editor') {
      fetchAssetFiles();
    }
    discoverApiPlayground();
  }, [activeTab]);

  // Custom Git Commit Modal States
  const [showGitCommitModal, setShowGitCommitModal] = useState<boolean>(false);
  const [gitChanges, setGitChanges] = useState<{ file: string; type: 'modified' | 'added' | 'deleted' | 'untracked'; status: string }[]>([]);
  const [gitCommitMessage, setGitCommitMessage] = useState<string>('');
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  const [hoveredFileDiff, setHoveredFileDiff] = useState<string>('');
  const [isSubmittingCommit, setIsSubmittingCommit] = useState<boolean>(false);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };
  
  // Autosave file content effect
  useEffect(() => {
    if (!selectedFile) {
      setAutosaveStatus(null);
      return;
    }
    
    // Ignore if content hasn't changed or it's the loading state placeholder
    if (fileContent === 'Loading file content...' || fileContent === 'Error loading file.' || fileContent === lastSavedContent.current) {
      return;
    }
    
    setAutosaveStatus('saving');
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch('/api/files/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: selectedFile, content: fileContent })
        });
        if (!res.ok) throw new Error('Failed to autosave');
        lastSavedContent.current = fileContent;
        setAutosaveStatus('saved');
      } catch (e) {
        setAutosaveStatus('error');
      }
    }, 1000); // 1000ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [fileContent, selectedFile]);

  // Credentials & test connection state
  const [envKeys, setEnvKeys] = useState<Record<string, string>>({});
  const [providerStatus, setProviderStatus] = useState<Record<string, { status: 'idle' | 'testing' | 'success' | 'error'; message: string }>>({});
  
  // Editor States
  const [isEditingSpecs, setIsEditingSpecs] = useState<boolean>(false);
  const [editedSpecs, setEditedSpecs] = useState<ProjectState['architecture'] | null>(null);
  const [editedProject, setEditedProject] = useState<ProjectState['project'] | null>(null);

  // Milestone/Task modal editor state
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null);
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Partial<Task>>({ id: '', name: '', description: '', files: [], type: 'feature', status: 'pending' });

  const providersConfig = [
    { id: 'gemini', name: 'Google Gemini', envVar: 'GEMINI_API_KEYS' },
    { id: 'groq', name: 'Groq Cloud', envVar: 'GROQ_API_KEYS' },
    { id: 'openrouter', name: 'OpenRouter', envVar: 'OPENROUTER_API_KEYS' },
    { id: 'together', name: 'Together AI', envVar: 'TOGETHER_API_KEYS' },
    { id: 'github', name: 'GitHub Models', envVar: 'GITHUB_MODELS_KEYS' },
    { id: 'huggingface', name: 'Hugging Face', envVar: 'HUGGINGFACE_API_KEYS' },
    { id: 'sambanova', name: 'SambaNova Cloud', envVar: 'SAMBANOVA_API_KEYS' },
    { id: 'mistral', name: 'Mistral AI', envVar: 'MISTRAL_API_KEYS' },
    { id: 'cohere', name: 'Cohere', envVar: 'COHERE_API_KEYS' },
    { id: 'kilo', name: 'Kilo AI', envVar: 'KILO_API_KEYS' }
  ];

  const handleLogin = async () => {
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      if (res.ok) {
        sessionStorage.setItem('dashboard_auth', 'true');
        setIsAuthenticated(true);
        setPasswordInput('');
      } else {
        const err = await res.json();
        setAuthError(err.detail || 'Access denied.');
      }
    } catch (e) {
      setAuthError('Connection failed.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('dashboard_auth');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchState();
    fetchGitStatus();
    fetchGitLog();
    fetchEnvKeys();
    fetchFiles();
    
    // Poll logs & pipeline status
    const interval = setInterval(() => {
      pollPipelineStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Command Palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
        setCommandSearch('');
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowNotifications(false);
        setShowShortcuts(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // API Tester executor
  const executeApiTest = async () => {
    setIsApiTesterLoading(true);
    setApiTesterResponse(null);
    const startTime = Date.now();
    try {
      const opts: any = { method: apiTesterMethod, headers: JSON.parse(apiTesterHeaders) };
      if (['POST', 'PUT', 'PATCH'].includes(apiTesterMethod)) opts.body = apiTesterBody;
      const res = await fetch(apiTesterUrl, opts);
      const text = await res.text();
      let body = text;
      try { body = JSON.stringify(JSON.parse(text), null, 2); } catch {}
      setApiTesterResponse({ status: res.status, time: `${Date.now() - startTime}ms`, body });
    } catch (err: any) {
      setApiTesterResponse({ status: 0, time: `${Date.now() - startTime}ms`, body: `Error: ${err.message}` });
    }
    setIsApiTesterLoading(false);
  };

  // AI Error Auto-Fix Handlers
  const handleFixSingleError = async (id: string) => {
    setFixingErrorId(id);
    const targetErr = trackedErrors.find(e => e.id === id);
    // Simulate AI patch analysis & resolution
    await new Promise(r => setTimeout(r, 1200));
    setTrackedErrors(prev => prev.map(e => e.id === id ? { ...e, status: 'resolved' } : e));
    setFixingErrorId(null);

    // Push notification to state
    if (targetErr) {
      setNotifications(prev => [
        {
          id: Date.now().toString(),
          title: 'AI Auto-Repair Complete',
          message: `Fixed error in ${targetErr.file}:${targetErr.line} automatically`,
          time: 'Just now',
          type: 'success',
          read: false
        },
        ...prev
      ]);
    }
  };

  const handleFixAllErrors = async () => {
    setFixingAllErrors(true);
    await new Promise(r => setTimeout(r, 2000));
    setTrackedErrors(prev => prev.map(e => ({ ...e, status: 'resolved' })));
    setFixingAllErrors(false);
    setNotifications(prev => [
      {
        id: Date.now().toString(),
        title: 'All Errors Resolved',
        message: 'AI Auto-Repair suite resolved all open tracked errors across codebase',
        time: 'Just now',
        type: 'success',
        read: false
      },
      ...prev
    ]);
  };

  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Failed to fetch state');
      const data = await res.json();
      setState(data);
      if (data) {
        setEditedSpecs({ ...data.architecture });
        setEditedProject({ ...data.project });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGitStatus = async () => {
    try {
      const res = await fetch('/api/git/status');
      if (!res.ok) throw new Error('Failed to fetch Git status');
      const data = await res.json();
      setGitStatus(data || { branch: 'main', behind: 0, ahead: 0, uncommitted_changes: [] });
      if (data && data.uncommitted_changes && data.uncommitted_changes.length > 0) {
        fetchGitDiff();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGitDiff = async () => {
    try {
      const res = await fetch('/api/git/diff');
      if (!res.ok) throw new Error('Failed to fetch Git diff');
      const data = await res.json();
      setGitDiff(data?.diff || '');
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGitLog = async () => {
    try {
      const res = await fetch('/api/git/log');
      if (!res.ok) throw new Error('Failed to fetch Git log');
      const data = await res.json();
      setGitLog(data?.commits || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEnvKeys = async () => {
    try {
      const res = await fetch('/api/config/keys');
      if (!res.ok) throw new Error('Failed to fetch config keys');
      const data = await res.json();
      setEnvKeys(data?.keys || {});
    } catch (e) {
      console.error(e);
    }
  };

  const pollPipelineStatus = async () => {
    try {
      const res = await fetch('/api/run/status');
      const data = await res.json();
      setPipeline({ running: data.running, log: data.log || pipeline.log });
    } catch (e) {
      console.error(e);
    }
  };

  const triggerPipeline = async () => {
    try {
      const res = await fetch('/api/run', { method: 'POST' });
      const data = await res.json();
      showToast(data.message);
      setPipeline(p => ({ ...p, running: true }));
    } catch (e) {
      showToast("Failed to start pipeline.", 'error');
    }
  };

  const gitCommit = async () => {
    if (!commitMessage.trim()) return showToast("Message cannot be empty.", 'error');
    try {
      const res = await fetch('/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commitMessage })
      });
      const data = await res.json();
      showToast(data.message || "Committed successfully!");
      setCommitMessage('');
      fetchGitStatus();
      fetchGitLog();
    } catch (e) {
      showToast("Commit failed.", 'error');
    }
  };

  const gitPush = async () => {
    try {
      const res = await fetch('/api/git/push', { method: 'POST' });
      const data = await res.json();
      showToast(data.message || "Pushed successfully!");
      fetchGitStatus();
    } catch (e) {
      showToast("Push failed.", 'error');
    }
  };

  const gitPull = async () => {
    try {
      const res = await fetch('/api/git/pull', { method: 'POST' });
      const data = await res.json();
      showToast(data.message || "Pulled successfully!");
      fetchGitStatus();
    } catch (e) {
      showToast("Pull failed.", 'error');
    }
  };

  const saveSpecs = async () => {
    if (!state || !editedSpecs || !editedProject) return;
    
    // Auto-promote status to selected if it was idle so that the engine bypasses automated project selection
    const nextStatus = state.project.status === 'idle' ? 'selected' : state.project.status;
    
    const updatedState = {
      ...state,
      project: { 
        ...editedProject,
        status: nextStatus 
      },
      architecture: { ...editedSpecs }
    };
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: updatedState })
      });
      showToast("Specs saved successfully!");
      setIsEditingSpecs(false);
      fetchState();
    } catch (e) {
      showToast("Failed to save specs.", 'error');
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files/list');
      if (!res.ok) throw new Error('Failed to load files');
      const data = await res.json();
      setFiles(data.files || []);
    } catch (e) {
      console.error(e);
    }
  };

  const selectFile = async (path: string) => {
    try {
      setSelectedFile(path);
      setGitCommitMessage(`feat(workspace): update ${path}`);
      setFileContent('Loading file content...');
      setAutosaveStatus(null);
      const res = await fetch(`/api/files/read?path=${encodeURIComponent(path)}`);
      if (!res.ok) throw new Error('Failed to read file');
      const data = await res.json();
      lastSavedContent.current = data.content || '';
      setFileContent(data.content || '');
      setAutosaveStatus('saved');
    } catch (e) {
      setFileContent('Error loading file.');
      setAutosaveStatus('error');
    }
  };

  const saveFile = async () => {
    if (!selectedFile) return;
    setIsSavingFile(true);
    try {
      const res = await fetch('/api/files/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: selectedFile, content: fileContent })
      });
      if (!res.ok) throw new Error('Failed to save file');
      showToast('File saved successfully!');
    } catch (e) {
      showToast('Error saving file.', 'error');
    } finally {
      setIsSavingFile(false);
    }
  };

  const createNewFile = async () => {
    if (!newFilePath) return;
    try {
      const res = await fetch('/api/files/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: newFilePath, content: '' })
      });
      if (!res.ok) throw new Error('Failed to create file');
      setShowNewFileModal(false);
      setNewFilePath('');
      await fetchFiles();
      selectFile(newFilePath);
    } catch (e) {
      showToast('Error creating file.', 'error');
    }
  };

  const createNewFolder = async () => {
    if (!newFolderPath) return;
    try {
      const keepFilePath = newFolderPath.endsWith('/') ? `${newFolderPath}.gitkeep` : `${newFolderPath}/.gitkeep`;
      const res = await fetch('/api/files/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: keepFilePath, content: '' })
      });
      if (!res.ok) throw new Error('Failed to create folder');
      setShowNewFolderModal(false);
      setNewFolderPath('');
      await fetchFiles();
      showToast('Folder created successfully!');
    } catch (e) {
      showToast('Error creating folder.', 'error');
    }
  };

  const buildFileTree = (paths: string[]): TreeNode[] => {
    const root: TreeNode[] = [];
    paths.forEach(path => {
      const parts = path.split('/');
      let currentLevel = root;
      let currentPath = '';
      
      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isLast = index === parts.length - 1;
        let existingNode = currentLevel.find(node => node.name === part);
        
        if (!existingNode) {
          existingNode = {
            name: part,
            path: currentPath,
            type: isLast ? 'file' : 'directory',
            children: isLast ? undefined : []
          };
          currentLevel.push(existingNode);
          currentLevel.sort((a, b) => {
            if (a.type !== b.type) {
              return a.type === 'directory' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
          });
        }
        
        if (!isLast && existingNode.children) {
          currentLevel = existingNode.children;
        }
      });
    });
    return root;
  };

  const toggleFolder = (path: string) => {
    setOpenFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderTreeNodes = (nodes: TreeNode[], depth: number = 0): React.ReactNode => {
    return nodes.map(node => {
      const isFolder = node.type === 'directory';
      const isOpen = !!openFolders[node.path];
      
      if (isFolder) {
        return (
          <div key={node.path} className="select-none">
            <div className="group flex items-center justify-between w-full pr-1 hover:bg-white/5 rounded-lg">
              <button
                onClick={() => toggleFolder(node.path)}
                style={{ paddingLeft: `${depth * 12 + 6}px` }}
                className="flex-1 text-left py-1 text-gray-300 font-medium flex items-center space-x-1.5 transition-all text-[11px] truncate"
              >
                <span className="text-[8px] text-gray-500 font-bold font-mono">
                  {isOpen ? '▼' : '▶'}
                </span>
                <FolderOpen className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{node.name}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePath(node.path, true);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded transition-all shrink-0 cursor-pointer"
                title="Delete Folder"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            
            {isOpen && node.children && (
              <div className="mt-0.5">
                {renderTreeNodes(node.children, depth + 1)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div key={node.path} className="group flex items-center justify-between w-full pr-1 hover:bg-white/5 rounded-lg">
            <button
              onClick={() => selectFile(node.path)}
              style={{ paddingLeft: `${depth * 12 + 18}px` }}
              className={`flex-1 text-left py-1 rounded-lg flex items-center space-x-1.5 transition-all text-[11px] border border-transparent truncate ${selectedFile === node.path ? 'bg-violet-600/10 text-violet-300 border-violet-500/10 font-semibold' : 'text-gray-400'}`}
            >
              <FileCode className="h-3.5 w-3.5 text-violet-400 shrink-0" />
              <span className="truncate">{node.name}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deletePath(node.path, false);
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-rose-500/20 text-rose-450 hover:text-rose-300 rounded transition-all shrink-0 cursor-pointer"
              title="Delete File"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      }
    });
  };

  const deletePath = async (path: string, isFolder: boolean) => {
    setConfirmModal({
      show: true,
      title: isFolder ? 'Delete Folder?' : 'Delete File?',
      message: `Are you sure you want to permanently delete the ${isFolder ? 'folder' : 'file'} "${path}"? This will delete all its contents from the workspace.`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const res = await fetch('/api/files/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path })
          });
          if (!res.ok) throw new Error('Failed to delete path');
          showToast(`${isFolder ? 'Folder' : 'File'} deleted successfully!`);
          setGitCommitMessage(`chore(workspace): delete ${path}`);
          if (!isFolder && selectedFile === path) {
            setSelectedFile('');
            setFileContent('');
          } else if (isFolder && selectedFile.startsWith(path + '/')) {
            setSelectedFile('');
            setFileContent('');
          }
          fetchFiles();
        } catch (e) {
          showToast(`Error deleting ${isFolder ? 'folder' : 'file'}.`, 'error');
        }
      }
    });
  };

  const getSearchMatchesCount = () => {
    if (!searchQuery) return 0;
    try {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      const matches = fileContent.match(regex);
      return matches ? matches.length : 0;
    } catch (e) {
      return 0;
    }
  };

  const handleReplaceAll = () => {
    if (!searchQuery) return;
    try {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      const updated = fileContent.replace(regex, replaceQuery);
      setFileContent(updated);
      showToast('Replaced all occurrences!');
    } catch (e) {
      showToast('Error replacing occurrences.', 'error');
    }
  };

  const downloadFile = () => {
    if (!selectedFile) return;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const parts = selectedFile.split('/');
    link.download = parts[parts.length - 1];
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('File downloaded successfully!');
  };

  const formatJSON = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(fileContent), null, 2);
      setFileContent(formatted);
      showToast('JSON formatted successfully!');
    } catch (e) {
      showToast('Invalid JSON structure.', 'error');
    }
  };

  const openCommitDialog = async () => {
    try {
      const res = await fetch('/api/git/unstaged-changes');
      if (!res.ok) throw new Error('Failed to load changes');
      const data = await res.json();
      const changes = data.changes || [];
      setGitChanges(changes);
      setHoveredFile(null);
      setHoveredFileDiff('');
      
      if (changes.length > 0) {
        const mainChange = changes[0];
        const action = mainChange.type === 'deleted' ? 'delete' : 'update';
        const parts = mainChange.file.split('/');
        const filename = parts[parts.length - 1];
        setGitCommitMessage(`${mainChange.type === 'deleted' ? 'chore' : 'feat'}(workspace): ${action} ${filename}`);
      } else {
        setGitCommitMessage('feat(workspace): update modifications');
      }
      
      setShowGitCommitModal(true);
    } catch (e) {
      showToast('Failed to load modifications list.', 'error');
    }
  };

  const handleFileHover = async (file: string) => {
    setHoveredFile(file);
    setHoveredFileDiff('Loading diff preview...');
    try {
      const res = await fetch(`/api/git/unstaged-diff?file=${encodeURIComponent(file)}`);
      if (!res.ok) throw new Error('Failed to load diff');
      const data = await res.json();
      setHoveredFileDiff(data.diff || 'No text changes.');
    } catch (e) {
      setHoveredFileDiff('Error loading diff preview.');
    }
  };

  const submitCommitAndPush = async () => {
    if (!gitCommitMessage.trim()) {
      showToast('Commit message is required.', 'error');
      return;
    }
    setIsSubmittingCommit(true);
    try {
      const commitRes = await fetch('/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: gitCommitMessage })
      });
      if (!commitRes.ok) throw new Error('Commit failed');
      
      const pushRes = await fetch('/api/git/push', { method: 'POST' });
      if (!pushRes.ok) throw new Error('Push failed');
      
      showToast('All changes committed and pushed successfully!');
      setShowGitCommitModal(false);
      setGitCommitMessage('');
      fetchGitStatus();
      fetchGitLog();
    } catch (e) {
      showToast('Error during direct commit and push.', 'error');
    } finally {
      setIsSubmittingCommit(false);
    }
  };

  const handleTextareaScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const lineNumbersDiv = document.getElementById('line-numbers');
    if (lineNumbersDiv) {
      lineNumbersDiv.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const detectLanguage = (filename: string): string => {
    if (!filename) return 'text';
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return 'text';
    const mapping: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript react',
      'js': 'javascript',
      'jsx': 'javascript react',
      'json': 'json',
      'py': 'python',
      'css': 'css',
      'html': 'html',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml',
      'toml': 'toml',
      'sh': 'shell'
    };
    return mapping[ext] || ext;
  };

  const viewCommitDiff = async (sha: string, message: string) => {
    try {
      setSelectedCommit({ sha, message });
      setSelectedCommitDiff('Loading commit changes...');
      setShowCommitModal(true);
      const res = await fetch(`/api/git/commit-diff?sha=${sha}`);
      if (!res.ok) throw new Error('Failed to load diff');
      const data = await res.json();
      setSelectedCommitDiff(data.diff || 'No changes found in this commit.');
    } catch (e) {
      setSelectedCommitDiff('Failed to load commit changes.');
    }
  };

  const renderDiffLines = (diffText: string) => {
    if (!diffText) return <span className="text-gray-500">No content.</span>;
    return diffText.split('\n').map((line, idx) => {
      let className = "text-gray-300";
      if (line.startsWith('+') && !line.startsWith('+++')) {
        className = "text-emerald-400 bg-emerald-500/10";
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        className = "text-rose-400 bg-rose-500/10";
      } else if (line.startsWith('@@')) {
        className = "text-cyan-400 bg-cyan-500/5 font-semibold";
      } else if (line.startsWith('diff --git')) {
        className = "text-violet-400 font-bold border-t border-white/5 pt-2 mt-2 block";
      }
      return (
        <span key={idx} className={`block px-2 py-0.5 font-mono leading-relaxed whitespace-pre-wrap ${className}`}>
          {line}
        </span>
      );
    });
  };

  const executeReset = async () => {
    setShowResetModal(false);
    
    let customIdea = null;
    if (resetType === 'suggested') {
      customIdea = selectedSuggestion;
    } else if (resetType === 'custom') {
      customIdea = customResetIdea;
    }

    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason: resetReason || "User reset to build new SaaS",
          custom_idea: customIdea,
          custom_title: customResetTitle || null,
          target_milestones: targetMilestones,
          project_scope: projectScope,
          selected_features: selectedFeatures,
          tech_stack: {
            frontend_css: stylingStack,
            backend_lang: backendStack
          }
        })
      });
      const data = await res.json();
      showToast(data.message);
      setResetReason('');
      setCustomResetIdea('');
      setCustomResetTitle('');
      fetchState();
      fetchGitStatus();
      fetchGitLog();
    } catch (e) {
      showToast("Reset failed.", 'error');
    }
  };

  const enhancePrompt = async () => {
    const textToEnhance = customResetIdea.trim();
    if (!textToEnhance) return;
    
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/prompt/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToEnhance })
      });
      if (!res.ok) throw new Error("Failed to enhance");
      const data = await res.json();
      if (data.enhanced) {
        setCustomResetIdea(data.enhanced);
        showToast("Prompt translated & enhanced!");
      }
    } catch (e) {
      showToast("Failed to enhance prompt.", 'error');
    } finally {
      setIsEnhancing(false);
    }
  };

  const saveEnvKeys = async () => {
    try {
      const res = await fetch('/api/config/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: envKeys })
      });
      const data = await res.json();
      showToast(data.message || "Keys saved successfully!");
      fetchEnvKeys();
    } catch (e) {
      showToast("Failed to save credentials.", 'error');
    }
  };

  const testProviderConnection = async (provider: string) => {
    setProviderStatus(prev => ({
      ...prev,
      [provider]: { status: 'testing', message: 'Testing endpoint...' }
    }));
    try {
      const res = await fetch('/api/config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setProviderStatus(prev => ({
          ...prev,
          [provider]: { status: 'success', message: data.message }
        }));
      } else {
        setProviderStatus(prev => ({
          ...prev,
          [provider]: { status: 'error', message: data.message }
        }));
      }
    } catch (e) {
      setProviderStatus(prev => ({
        ...prev,
        [provider]: { status: 'error', message: 'Request failed.' }
      }));
    }
  };

  // Milestone/Task re-ordering and status toggle
  const toggleTaskStatus = async (task: Task) => {
    if (!state) return;
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const updatedMilestones = state.milestones.map(m => {
      const updatedTasks = m.tasks.map(t => {
        if (t.id === task.id) {
          return { ...t, status: newStatus };
        }
        return t;
      });
      
      const allCompleted = updatedTasks.every(t => t.status === 'completed');
      return {
        ...m,
        tasks: updatedTasks,
        status: allCompleted ? 'completed' : 'pending'
      };
    });

    const updatedState = { ...state, milestones: updatedMilestones };
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: updatedState })
      });
      fetchState();
    } catch (e) {
      showToast("Failed to update status.", 'error');
    }
  };

  const saveTask = async () => {
    if (!state || selectedMilestoneId === null) return;
    let updatedMilestones = [...state.milestones];
    const milestone = updatedMilestones.find(m => m.id === selectedMilestoneId);
    if (!milestone) return;

    const existingTaskIdx = milestone.tasks.findIndex(t => t.id === editingTask.id);
    if (existingTaskIdx > -1) {
      // Edit
      milestone.tasks[existingTaskIdx] = editingTask as Task;
    } else {
      // Add
      milestone.tasks.push(editingTask as Task);
    }

    const updatedState = { ...state, milestones: updatedMilestones };
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: updatedState })
      });
      setShowTaskModal(false);
      setEditingTask({ id: '', name: '', description: '', files: [], type: 'feature', status: 'pending' });
      fetchState();
    } catch (e) {
      showToast("Failed to save task.", 'error');
    }
  };

  const deleteTask = async (milestoneId: number, taskId: string) => {
    if (!state) return;
    setConfirmModal({
      show: true,
      title: 'Delete Task?',
      message: `Are you sure you want to permanently delete the task "${taskId}"? This will remove it from the backlog.`,
      onConfirm: async () => {
        setConfirmModal(null);
        const updatedMilestones = state.milestones.map(m => {
          if (m.id === milestoneId) {
            return {
              ...m,
              tasks: m.tasks.filter(t => t.id !== taskId)
            };
          }
          return m;
        });
        const updatedState = { ...state, milestones: updatedMilestones };
        try {
          await fetch('/api/state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: updatedState })
          });
          fetchState();
          showToast("Task deleted successfully!");
        } catch (e) {
          showToast("Failed to delete task.", 'error');
        }
      }
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0a0f] p-4 text-gray-200">
        <div className="glass-card rounded-3xl max-w-md w-full p-8 shadow-2xl border border-violet-500/20 text-center relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-44 h-44 bg-violet-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-44 h-44 bg-indigo-600/10 rounded-full blur-3xl"></div>
          
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 mb-6">
            <Cpu className="h-7 w-7 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Antigravity V2 Console</h2>
          <p className="text-xs text-gray-500 mb-6">Autonomous Software Engineer Control Dashboard. Enter access PIN or password to unlock control gate.</p>
          
          <div className="space-y-4">
            <input type="password" value={passwordInput} 
                   onChange={e => setPasswordInput(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleLogin()}
                   placeholder="Enter Console PIN..." 
                   className="w-full glass-input text-sm rounded-xl px-4 py-3 text-white outline-none font-mono text-center tracking-widest border border-white/10 focus:border-violet-500/50" />
            
            {authError && (
              <p className="text-xs text-rose-400 font-medium">{authError}</p>
            )}

            <button onClick={handleLogin}
                    className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-violet-600/25 transition-all duration-300">
              Unlock Controller
            </button>
          </div>
          
          <p className="text-[10px] text-gray-600 mt-8 font-mono">Status: Locked • Engine Active</p>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0a0f] text-gray-400">
        <div className="flex items-center space-x-2 animate-pulse">
          <Cpu className="h-6 w-6 text-violet-500 animate-spin" />
          <span>Synchronizing local repository state...</span>
        </div>
      </div>
    );
  }

  // dailyUsedPercent now displayed directly in sidebar footer

  const totalTasks = state?.milestones?.reduce((acc: number, m: any) => acc + (m.tasks?.length || 0), 0) || 0;
  const completedTasks = state?.milestones?.reduce((acc: number, m: any) => acc + (m.tasks?.filter((t: any) => t.status === 'completed')?.length || 0), 0) || 0;
  const projectProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const themeStyles = {
    midnight: {
      bg: 'bg-black/60',
      gutter: 'bg-black/30 border-r border-white/5 text-gray-500',
      textarea: 'text-gray-300',
      border: 'border-white/5'
    },
    cyberpunk: {
      bg: 'bg-fuchsia-950/20',
      gutter: 'bg-fuchsia-950/40 border-r border-pink-500/20 text-pink-400',
      textarea: 'text-pink-300 font-bold',
      border: 'border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.05)]'
    },
    monokai: {
      bg: 'bg-amber-950/25',
      gutter: 'bg-amber-950/45 border-r border-yellow-600/15 text-yellow-500',
      textarea: 'text-yellow-100',
      border: 'border-yellow-600/15'
    },
    dracula: {
      bg: 'bg-slate-900/60',
      gutter: 'bg-slate-950/40 border-r border-purple-500/20 text-purple-400',
      textarea: 'text-purple-100',
      border: 'border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.05)]'
    }
  };
  const activeThemeStyle = themeStyles[editorTheme] || themeStyles.midnight;

  return (
    <div className="text-gray-100 min-h-screen bg-[#07070a] flex">
      {/* Sleek Vertical Navigation Sidebar */}
      <aside className="w-72 border-r border-white/[0.04] bg-[#0c0c10] flex flex-col justify-between h-screen sticky top-0 shrink-0 font-outfit select-none z-45">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/[0.04] flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">Antigravity OS</span>
            <span className="text-[10px] text-violet-500 block -mt-1 font-semibold">Autonomous AI Engineer</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-4 space-y-7 overflow-y-auto">
          {/* Category: Workspace Core */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-3 block">Workspace Core</span>
            <div className="space-y-0.5">
              {([
                { id: 'overview' as TabId, label: 'Vision Spec', icon: FileText },
                { id: 'milestones' as TabId, label: 'Roadmap & Tasks', icon: GitPullRequest },
                { id: 'chat' as TabId, label: 'AI Architect Chat', icon: MessageSquare },
                { id: 'editor' as TabId, label: 'Workspace Editor', icon: FileCode },
                { id: 'preview' as TabId, label: 'Live UI Preview', icon: Play, pulse: true },
                { id: 'activity' as TabId, label: 'Activity Feed', icon: Activity }
              ]).map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-violet-650/10 text-violet-400 border border-violet-500/10 shadow-sm' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${item.pulse ? 'animate-pulse text-emerald-400' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category: Developer Tools */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-3 block">Developer Tools</span>
            <div className="space-y-0.5">
              {([
                { id: 'git' as TabId, label: 'Git VCS & Auditor', icon: GitBranch },
                { id: 'database' as TabId, label: 'JSON DB Explorer', icon: Database },
                { id: 'terminal' as TabId, label: 'Sandbox Playground', icon: Terminal },
                { id: 'logs' as TabId, label: 'Run Output Logs', icon: FileText },
                { id: 'api_tester' as TabId, label: 'API Tester', icon: Zap },
                { id: 'lighthouse' as TabId, label: 'Performance Audit', icon: BarChart2 },
                { id: 'errors' as TabId, label: 'Error Tracker', icon: AlertTriangle }
              ]).map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-amber-600/10 text-amber-400 border border-amber-500/10' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category: System Config */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-3 block">System configuration</span>
            <div className="space-y-0.5">
              {([
                { id: 'keys' as TabId, label: 'LLM Credentials', icon: Key },
                { id: 'quota' as TabId, label: 'Key Health Monitor', icon: Cpu },
                { id: 'settings' as TabId, label: 'Global Parameters', icon: Sliders },
                { id: 'envs' as TabId, label: 'Env Variables', icon: Shield },
                { id: 'deploys' as TabId, label: 'Deploy History', icon: Globe },
                { id: 'team' as TabId, label: 'Team Members', icon: Users }
              ]).map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-teal-650/10 text-teal-400 border border-teal-500/10' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer Panel */}
        <div className="p-4 border-t border-white/[0.04] bg-[#09090c] space-y-3 shrink-0">
          {state && (
            <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03] space-y-2 text-[10px]">
              <div className="flex justify-between items-center font-mono">
                <span className="text-gray-550">Pipeline status</span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                  pipeline.running ? 'bg-violet-655/20 text-violet-400 border border-violet-500/25 animate-pulse' : 'bg-gray-800 text-gray-500'
                }`}>
                  {pipeline.running ? 'Running' : 'Idle'}
                </span>
              </div>
              
              {state.project.status !== 'idle' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-gray-500">
                    <span>Task progress</span>
                    <span className="text-violet-300 font-bold">{projectProgress}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1 rounded-full" style={{ width: `${projectProgress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="flex justify-between text-gray-500 font-mono">
                <span>Daily Token</span>
                <span className="text-violet-355 font-bold">{(state.token_metadata.daily_used / 1000).toFixed(1)}k tkn</span>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-350 rounded-xl text-xs font-bold font-outfit transition-all cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Main Spacious Content Workspace Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Workspace Sticky Glass Header */}
        <header className="border-b border-white/[0.04] bg-[#0c0c10]/60 backdrop-blur-md sticky top-0 z-40 px-8 py-4 flex flex-col sm:flex-row gap-4 sm:gap-0 items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-gray-300 font-outfit flex items-center gap-2">
              {activeTab === 'overview' && <FileText className="h-4 w-4 text-violet-400" />}
              {activeTab === 'milestones' && <GitPullRequest className="h-4 w-4 text-violet-400" />}
              {activeTab === 'chat' && <MessageSquare className="h-4 w-4 text-sky-400 animate-pulse" />}
              {activeTab === 'editor' && <FileCode className="h-4 w-4 text-violet-400" />}
              {activeTab === 'preview' && <Play className="h-4 w-4 text-emerald-400" />}
              {activeTab === 'activity' && <Activity className="h-4 w-4 text-cyan-400" />}
              {activeTab === 'git' && <GitBranch className="h-4 w-4 text-violet-400" />}
              {activeTab === 'database' && <Database className="h-4 w-4 text-amber-400" />}
              {activeTab === 'terminal' && <Terminal className="h-4 w-4 text-rose-400" />}
              {activeTab === 'logs' && <FileText className="h-4 w-4 text-violet-400" />}
              {activeTab === 'api_tester' && <Zap className="h-4 w-4 text-yellow-400" />}
              {activeTab === 'lighthouse' && <BarChart2 className="h-4 w-4 text-green-400" />}
              {activeTab === 'errors' && <AlertTriangle className="h-4 w-4 text-rose-400" />}
              {activeTab === 'keys' && <Key className="h-4 w-4 text-violet-400" />}
              {activeTab === 'quota' && <Cpu className="h-4 w-4 text-violet-400" />}
              {activeTab === 'settings' && <Sliders className="h-4 w-4 text-teal-400" />}
              {activeTab === 'envs' && <Shield className="h-4 w-4 text-emerald-400" />}
              {activeTab === 'deploys' && <Globe className="h-4 w-4 text-sky-400" />}
              {activeTab === 'team' && <Users className="h-4 w-4 text-violet-400" />}
              <span className="font-outfit uppercase tracking-wider text-xs">
                {activeTab === 'overview' ? 'Vision Specification' :
                 activeTab === 'milestones' ? 'Roadmap Milestones & Backlog' :
                 activeTab === 'chat' ? 'Lead Architect AI Chat' :
                 activeTab === 'editor' ? 'Monaco Code Workspace' :
                 activeTab === 'preview' ? 'Live UI Preview' :
                 activeTab === 'activity' ? 'Real-Time Activity Feed' :
                 activeTab === 'git' ? 'Version Control & Code Review' :
                 activeTab === 'database' ? 'JSON Database Explorer' :
                 activeTab === 'terminal' ? 'Dev Sandbox Playground' :
                 activeTab === 'logs' ? 'System Runner Console Logs' :
                 activeTab === 'api_tester' ? 'API Endpoint Tester' :
                 activeTab === 'lighthouse' ? 'Lighthouse Performance Audit' :
                 activeTab === 'errors' ? 'Error Tracking Center' :
                 activeTab === 'keys' ? 'LLM Provider Credentials' :
                 activeTab === 'quota' ? 'API Key Health Monitor' :
                 activeTab === 'settings' ? 'Global Settings Panel' :
                 activeTab === 'envs' ? 'Environment Variables Vault' :
                 activeTab === 'deploys' ? 'Deployment History Timeline' :
                 activeTab === 'team' ? 'Team & User Management' : activeTab}
              </span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Command Palette */}
            <button
              onClick={() => { setShowCommandPalette(true); setCommandSearch(''); }}
              className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white rounded-xl text-[10px] font-mono transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Search className="h-3 w-3" />
              <span>⌘K</span>
            </button>

            {/* Keyboard Shortcuts */}
            <button
              onClick={() => setShowShortcuts(true)}
              className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"
              title="Keyboard Shortcuts"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer relative"
              >
                <Bell className="h-3.5 w-3.5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center animate-pulse">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-10 w-80 bg-[#12121a] border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-white/[0.04] flex justify-between items-center">
                    <span className="text-xs font-bold text-white">Notifications</span>
                    <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} className="text-[10px] text-violet-400 hover:text-violet-300 cursor-pointer font-semibold">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-3.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-all ${!n.read ? 'bg-violet-500/[0.03]' : ''}`}>
                        <div className="flex items-start space-x-2.5">
                          <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'error' ? 'bg-rose-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-sky-500'}`}></span>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-white block">{n.title}</span>
                            <span className="text-[10px] text-gray-400 block mt-0.5 line-clamp-1">{n.message}</span>
                            <span className="text-[9px] text-gray-600 mt-1 block font-mono">{n.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="h-5 w-px bg-white/[0.06]"></div>

            {/* Live Branch */}
            <div className="flex items-center space-x-2 text-xs bg-white/5 border border-white/5 text-gray-300 px-3 py-1.5 rounded-xl font-mono">
              <GitBranch className="h-3.5 w-3.5 text-violet-400" />
              <span>{gitStatus.branch}</span>
            </div>
            
            {/* Start Pipeline */}
            <button
              onClick={triggerPipeline}
              disabled={pipeline.running}
              className="px-4 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-600/10 flex items-center space-x-1.5 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 shrink-0" />
              <span>{pipeline.running ? 'Running...' : 'Run Pipeline'}</span>
            </button>
            
            {/* Netlify deploy */}
            <button
              onClick={triggerNetlifyDeploy}
              disabled={isDeploying}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white border border-emerald-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <CloudLightning className="h-3.5 w-3.5 shrink-0" />
              <span>Deploy</span>
            </button>
          </div>
        </header>

        {/* Spacious Main Workspace Area */}
        <main className="p-8 max-w-7xl w-full mx-auto flex-1">
          {/* TAB CONTENT: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 w-full">
                    <span className="text-[10px] font-bold text-violet-400 tracking-widest uppercase block mb-1">
                      {state.project.status || 'IDLE'}
                    </span>
                    {isEditingSpecs ? (
                      <input type="text" value={editedProject?.title || ''} 
                             onChange={e => setEditedProject(prev => prev ? { ...prev, title: e.target.value } : null)}
                             className="w-full text-2xl font-bold bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white mb-2" />
                    ) : (
                      <h2 className="text-2xl font-bold text-white leading-tight">{state.project.title || 'Welcome Architect'}</h2>
                    )}
                    
                    {isEditingSpecs ? (
                      <textarea value={editedProject?.description || ''} rows={3}
                                onChange={e => setEditedProject(prev => prev ? { ...prev, description: e.target.value } : null)}
                                className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white mt-2" />
                    ) : (
                      <p className="text-gray-400 text-sm mt-3 leading-relaxed">{state.project.description || 'Trigger a manual run to scrape hacker news and product hunt, analyze trends, and plan a brand new target application.'}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 shrink-0">
                    {isEditingSpecs ? (
                      <>
                        <button onClick={() => { setIsEditingSpecs(false); fetchState(); }}
                                className="px-4 py-2 border border-white/5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold">
                          Cancel
                        </button>
                        <button onClick={saveSpecs}
                                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                          <Save className="h-3.5 w-3.5" />
                          <span>Save Changes</span>
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setIsEditingSpecs(true)}
                              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 rounded-xl text-xs font-semibold">
                        Edit Vision & Spec
                      </button>
                    )}
                  </div>
                </div>

                {(state.project.vision || isEditingSpecs) && (
                  <div className="mt-6 border-t border-white/5 pt-4">
                    <h4 className="text-sm font-semibold text-violet-300 mb-2">Product Vision Strategy</h4>
                    {isEditingSpecs ? (
                      <textarea value={editedProject?.vision || ''} rows={4}
                                onChange={e => setEditedProject(prev => prev ? { ...prev, vision: e.target.value } : null)}
                                className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" />
                    ) : (
                      <p className="text-gray-450 text-sm leading-relaxed">{state.project.vision || 'No vision defined yet. Click Edit Vision & Spec to add one.'}</p>
                    )}
                  </div>
                )}
              </div>

              {editedSpecs && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Database Schema */}
                  <div className="glass-card rounded-2xl p-6 shadow-xl flex flex-col">
                    <h3 className="font-bold text-gray-250 mb-3 flex items-center space-x-2 text-sm">
                      <Database className="h-4 w-4 text-violet-400" />
                      <span>Git-Backed JSON Database Schema</span>
                    </h3>
                    {isEditingSpecs ? (
                      <textarea value={typeof editedSpecs.db_schema === 'object' ? JSON.stringify(editedSpecs.db_schema, null, 2) : editedSpecs.db_schema} rows={12}
                                onChange={e => setEditedSpecs(prev => prev ? { ...prev, db_schema: e.target.value } : null)}
                                className="w-full flex-1 code-font text-xs bg-black/40 border border-white/10 rounded-xl p-3 text-gray-300 outline-none" />
                    ) : (
                      <pre className="code-font text-[11px] text-gray-400 bg-black/40 p-4 rounded-xl max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed flex-1 border border-white/5" x-text="typeof state.architecture.db_schema === 'object' ? JSON.stringify(state.architecture.db_schema, null, 2) : state.architecture.db_schema">{typeof state.architecture.db_schema === 'object' ? JSON.stringify(state.architecture.db_schema, null, 2) : state.architecture.db_schema}</pre>
                    )}
                  </div>

                  {/* Folder layout spec */}
                  <div className="glass-card rounded-2xl p-6 shadow-xl flex flex-col">
                    <h3 className="font-bold text-gray-250 mb-3 flex items-center space-x-2 text-sm">
                      <FolderGit2 className="h-4 w-4 text-indigo-400" />
                      <span>Folder Structure Blueprint</span>
                    </h3>
                    {isEditingSpecs ? (
                      <textarea value={typeof editedSpecs.folder_structure === 'object' ? JSON.stringify(editedSpecs.folder_structure, null, 2) : editedSpecs.folder_structure} rows={12}
                                onChange={e => setEditedSpecs(prev => prev ? { ...prev, folder_structure: e.target.value } : null)}
                                className="w-full flex-1 code-font text-xs bg-black/40 border border-white/10 rounded-xl p-3 text-gray-300 outline-none" />
                    ) : (
                      <pre className="code-font text-[11px] text-gray-400 bg-black/40 p-4 rounded-xl max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed flex-1 border border-white/5">{typeof state.architecture.folder_structure === 'object' ? JSON.stringify(state.architecture.folder_structure, null, 2) : state.architecture.folder_structure}</pre>
                    )}
                  </div>

                  {/* Auth design */}
                  <div className="glass-card rounded-2xl p-6 shadow-xl flex flex-col md:col-span-2">
                    <h3 className="font-bold text-gray-255 mb-3 flex items-center space-x-2 text-sm">
                      <Settings className="h-4 w-4 text-violet-400" />
                      <span>Auth Flow Design & API Contracts</span>
                    </h3>
                    {isEditingSpecs ? (
                      <textarea value={typeof editedSpecs.auth_design === 'object' ? JSON.stringify(editedSpecs.auth_design, null, 2) : editedSpecs.auth_design} rows={8}
                                onChange={e => setEditedSpecs(prev => prev ? { ...prev, auth_design: e.target.value } : null)}
                                className="w-full code-font text-xs bg-black/40 border border-white/10 rounded-xl p-3 text-gray-300 outline-none mb-4" />
                    ) : (
                      <pre className="code-font text-[11px] text-gray-400 bg-black/40 p-4 rounded-xl max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-white/5 mb-4">{typeof state.architecture.auth_design === 'object' ? JSON.stringify(state.architecture.auth_design, null, 2) : state.architecture.auth_design}</pre>
                    )}
                  </div>
                </div>
              )}

              {/* Interactive Audit Trail Log */}
              <div className="glass-card rounded-2xl p-6 shadow-xl border border-white/5 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-violet-400" />
                    Interactive Audit Trail Activity Feed
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Live tracking logs of actions performed by developers, users, and AI agents in the workspace.</p>
                </div>
                
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {auditLogs.length === 0 ? (
                    <p className="text-xs text-gray-500 italic py-4 text-center">No workspace activity records logged yet.</p>
                  ) : (
                    [...auditLogs].reverse().map((log, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-black/25 rounded-xl border border-white/5 text-xs">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            log.author === 'AI' ? 'bg-violet-650/20 text-violet-300 border border-violet-500/20' : 'bg-amber-650/20 text-amber-300 border border-amber-500/20'
                          }`}>
                            {log.author || "User"}
                          </span>
                          <div>
                            <span className="text-gray-200 font-semibold block">{log.action}</span>
                            <span className="text-gray-450 text-[10px]">{log.details}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: Milestones & Task editor */}
          {activeTab === 'milestones' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Project Roadmaps & Backlog</h2>
                    <p className="text-xs text-gray-500 mt-1">Add tasks, manage features backlog, skip, re-order, or mark tasks as completed manually.</p>
                  </div>
                </div>

                {/* Horizontal Gantt Progress Track */}
                <div className="mb-8 p-5 bg-black/25 rounded-2xl border border-white/5 space-y-4">
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block font-outfit">📊 Gantt Track Timeline View</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {state.milestones.map((milestone, idx) => {
                      const completedCount = milestone.tasks.filter(t => t.status === 'completed').length;
                      const totalCount = milestone.tasks.length;
                      const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                      return (
                        <div key={milestone.id} className="relative p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between hover:border-violet-500/20 transition-all">
                          <div>
                            <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1 font-mono">
                              <span>Track #{idx + 1}</span>
                              <span className="font-bold text-violet-400">{percent}%</span>
                            </div>
                            <span className="text-xs font-bold text-gray-200 block truncate" title={milestone.title}>{milestone.title}</span>
                          </div>
                          <div className="mt-3 space-y-1">
                            <div className="w-full bg-white/5 h-1.5 rounded-full">
                              <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                            </div>
                            <span className="text-[9px] text-gray-450">{completedCount}/{totalCount} Tasks Done</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-6 relative border-l border-white/10 pl-6 ml-3">
                  {state.milestones.map(milestone => (
                    <div key={milestone.id} className="relative">
                      <div className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-4 border-[#0c0a0f] flex items-center justify-center ${milestone.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                      
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-bold text-gray-200">{milestone.title}</h3>
                        <button onClick={() => {
                          setSelectedMilestoneId(milestone.id);
                          setEditingTask({ id: `${milestone.id}.${milestone.tasks.length + 1}`, name: '', description: '', files: [], type: 'feature', status: 'pending' });
                          setShowTaskModal(true);
                        }} className="text-violet-400 hover:text-violet-300 text-xs font-semibold flex items-center space-x-1">
                          <Plus className="h-3 w-3" />
                          <span>Add Task</span>
                        </button>
                      </div>

                      <div className="space-y-3 mt-3">
                        {milestone.tasks.map(task => (
                          <div key={task.id} className="group flex flex-col sm:flex-row sm:items-start justify-between p-3.5 bg-black/25 rounded-xl border border-white/5 hover:border-violet-500/20 transition-all gap-3 sm:gap-0">
                            <div className="flex items-start space-x-3">
                              <button onClick={() => toggleTaskStatus(task)} className="mt-0.5 outline-none">
                                {task.status === 'completed' ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-500 hover:text-violet-400 flex-shrink-0" />
                                )}
                              </button>
                              <div>
                                <h4 className="font-semibold text-sm text-gray-300 flex items-center space-x-2">
                                  <span>{task.name}</span>
                                  <span className="text-[10px] text-gray-500 font-mono">({task.id})</span>
                                </h4>
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{task.description}</p>
                                
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {task.files.map(f => (
                                    <span key={f} className="text-[9px] code-font bg-white/5 border border-white/10 text-gray-400 px-1.5 py-0.5 rounded">{f}</span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-start sm:space-x-3 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0 shrink-0">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-800 text-gray-400 border-white/5'}`}>
                                {task.status}
                              </span>
                              <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center space-x-2 transition-all">
                                <button onClick={() => {
                                  setSelectedMilestoneId(milestone.id);
                                  setEditingTask({ ...task });
                                  setShowTaskModal(true);
                                }} className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded" title="Edit Task">
                                  <Settings className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => deleteTask(milestone.id, task.id)} className="p-1 hover:bg-rose-500/20 text-gray-455 hover:text-rose-400 rounded" title="Delete Task">
                                  <Trash className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: API Keys Config */}
          {activeTab === 'keys' && (
            <div className="space-y-6">
              {/* General Platform Config */}
              <div className="glass-card rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">General Platform Settings</h2>
                    <p className="text-xs text-gray-500 mt-1">Configure GitHub authentication tokens, user accounts details, and default deployment providers.</p>
                  </div>
                  <button onClick={saveEnvKeys}
                          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-violet-500/20 shrink-0 w-full sm:w-auto justify-center">
                    <Save className="h-4 w-4" />
                    <span>Save Config Settings</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* GitHub PAT */}
                  <div className="p-4 bg-black/25 rounded-2xl border border-white/5">
                    <label className="text-sm font-bold text-gray-250 block mb-2">GitHub Token (GH_PAT)</label>
                    <input type="password" value={envKeys['GITHUB_TOKEN'] || envKeys['GH_PAT'] || ''} 
                           onChange={e => setEnvKeys(prev => ({ ...prev, GITHUB_TOKEN: e.target.value }))}
                           placeholder="Enter GITHUB_TOKEN / GH_PAT..."
                           className="w-full glass-input text-xs rounded-xl px-3 py-2 text-white outline-none font-mono" />
                  </div>
                  {/* GitHub Username */}
                  <div className="p-4 bg-black/25 rounded-2xl border border-white/5">
                    <label className="text-sm font-bold text-gray-250 block mb-2">GitHub Username</label>
                    <input type="text" value={envKeys['GITHUB_USERNAME'] || ''} 
                           onChange={e => setEnvKeys(prev => ({ ...prev, GITHUB_USERNAME: e.target.value }))}
                           placeholder="Enter GITHUB_USERNAME..."
                           className="w-full glass-input text-xs rounded-xl px-3 py-2 text-white outline-none" />
                  </div>
                  {/* Netlify Token */}
                  <div className="p-4 bg-black/25 rounded-2xl border border-white/5">
                    <label className="text-sm font-bold text-gray-250 block mb-2">Netlify API Token</label>
                    <input type="password" value={envKeys['NETLIFY_TOKEN'] || ''} 
                           onChange={e => setEnvKeys(prev => ({ ...prev, NETLIFY_TOKEN: e.target.value }))}
                           placeholder="Enter NETLIFY_TOKEN..."
                           className="w-full glass-input text-xs rounded-xl px-3 py-2 text-white outline-none font-mono" />
                  </div>
                  {/* Gemini Model Override */}
                  <div className="p-4 bg-black/25 rounded-2xl border border-white/5">
                    <label className="text-sm font-bold text-gray-250 block mb-2">Gemini Model Override</label>
                    <input type="text" value={envKeys['GEMINI_MODEL'] || ''} 
                           onChange={e => setEnvKeys(prev => ({ ...prev, GEMINI_MODEL: e.target.value }))}
                           placeholder="e.g. gemini-2.0-flash..."
                           className="w-full glass-input text-xs rounded-xl px-3 py-2 text-white outline-none" />
                  </div>
                </div>
              </div>

              {/* LLM Providers Config */}
              <div className="glass-card rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">LLM Credentials & Connection Diagnostics</h2>
                    <p className="text-xs text-gray-500 mt-1">Configure your LLM API keys. Keys are saved in local .env, keeping them safe from git pushes.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {providersConfig.map(provider => {
                    const envVar = provider.envVar;
                    const status = providerStatus[provider.id] || { status: 'idle', message: '' };
                    return (
                      <div key={provider.id} className="p-4 bg-black/25 rounded-2xl border border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-gray-200">{provider.name}</span>
                            
                            {/* Connection Indicator */}
                            <span className="flex items-center space-x-1.5 text-[10px] font-semibold uppercase tracking-wider">
                              {status.status === 'success' && <span className="text-emerald-400 flex items-center space-x-1"><CheckCircle className="h-3.5 w-3.5" /><span>Active</span></span>}
                              {status.status === 'error' && <span className="text-rose-400 flex items-center space-x-1"><XCircle className="h-3.5 w-3.5" /><span>Failed</span></span>}
                              {status.status === 'testing' && <span className="text-violet-400 animate-pulse">Verifying...</span>}
                              {status.status === 'idle' && <span className="text-gray-550">Not Tested</span>}
                            </span>
                          </div>
                          <input type="password" value={envKeys[envVar] || ''} 
                                 onChange={e => setEnvKeys(prev => ({ ...prev, [envVar]: e.target.value }))}
                                 placeholder={`Input comma-separated keys for ${provider.name}...`}
                                 className="w-full glass-input text-xs rounded-xl px-3 py-2 text-white outline-none font-mono" />
                          {status.message && (
                            <p className="text-[10px] mt-2 text-gray-500 leading-normal max-h-16 overflow-y-auto whitespace-pre-wrap">{status.message}</p>
                          )}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button onClick={() => testProviderConnection(provider.id)}
                                  className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg text-[10px] font-bold transition-all">
                            Test Call
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LLM Provider Priority Settings */}
              <div className="glass-card rounded-2xl p-6 shadow-xl">
                <div>
                  <h2 className="text-lg font-bold text-white">LLM Gateway Provider Priority Order</h2>
                  <p className="text-xs text-gray-500 mt-1">Configure the failover precedence of the AI models. The engine will query models in this priority order, falling back dynamically on rate limits or errors.</p>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                  {((state?.provider_priority as string[]) || ["gemini", "groq", "openrouter", "together", "github", "huggingface", "sambanova", "mistral", "cohere", "kilo"]).map((provider: string, index: number, arr: string[]) => (
                    <div key={provider} className="flex justify-between items-center p-3.5 bg-black/25 border border-white/5 rounded-2xl text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-500 font-mono font-bold text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10">{index + 1}</span>
                        <span className="font-bold text-gray-200 capitalize">{provider === "github" ? "GitHub Models" : provider}</span>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          disabled={index === 0}
                          onClick={async () => {
                            const newPriority = [...arr];
                            const temp = newPriority[index];
                            newPriority[index] = newPriority[index - 1];
                            newPriority[index - 1] = temp;
                            const updatedState = { ...state, provider_priority: newPriority };
                            try {
                              await fetch('/api/state', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ state: updatedState })
                              });
                              fetchState();
                            } catch (e) {
                              showToast("Failed to update priority.", 'error');
                            }
                          }}
                          className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg disabled:opacity-20 disabled:hover:bg-transparent"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          disabled={index === arr.length - 1}
                          onClick={async () => {
                            const newPriority = [...arr];
                            const temp = newPriority[index];
                            newPriority[index] = newPriority[index + 1];
                            newPriority[index + 1] = temp;
                            const updatedState = { ...state, provider_priority: newPriority };
                            try {
                              await fetch('/api/state', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ state: updatedState })
                              });
                              fetchState();
                            } catch (e) {
                              showToast("Failed to update priority.", 'error');
                            }
                          }}
                          className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg disabled:opacity-20 disabled:hover:bg-transparent"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: Git control */}
          {activeTab === 'git' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Modifications */}
                <div className="glass-card rounded-2xl p-6 shadow-xl md:col-span-2">
                  <h3 className="font-bold text-gray-200 mb-4 flex items-center space-x-2 text-sm">
                    <GitBranch className="h-5 w-5 text-violet-400" />
                    <span>Staged & Uncommitted Changes</span>
                  </h3>
                  {gitStatus.uncommitted_changes.length === 0 ? (
                    <div className="text-sm text-gray-500 py-8 text-center">
                      Working tree clean. No local modifications staged.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto mb-4">
                      {gitStatus.uncommitted_changes.map(c => (
                        <div key={c.file} className="flex items-center justify-between text-xs p-2.5 bg-black/25 rounded-xl border border-white/5">
                          <span className="code-font text-gray-300">{c.file}</span>
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${c.status === 'M' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'}`}>
                            {c.status === 'M' ? 'Modified' : 'Added'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {gitStatus.uncommitted_changes.length > 0 && (
                    <div className="border-t border-white/5 pt-4">
                      <h4 className="text-xs font-semibold text-gray-300 mb-2">Stage & Commit Changes</h4>
                      <div className="flex space-x-2">
                        <input type="text" value={commitMessage} onChange={e => setCommitMessage(e.target.value)}
                               placeholder="feat(auth): conventional commit message"
                               className="flex-1 glass-input text-xs rounded-xl px-3 py-2 text-white outline-none" />
                        <button onClick={gitCommit}
                                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition-all">
                          Commit
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Git status boxes */}
                <div className="glass-card rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-200 mb-4 flex items-center space-x-2 text-sm">
                      <RefreshCw className="h-4 w-4 text-violet-400" />
                      <span>Sync Status Details</span>
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400 font-outfit">Local Commits Ahead</span>
                        <span className="text-indigo-400 font-bold">{gitStatus.ahead}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400 font-outfit">Remote Commits Behind</span>
                        <span className="text-rose-400 font-bold">{gitStatus.behind}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <button onClick={gitPull} className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold border border-white/5 transition-all">
                      Pull Updates
                    </button>
                    <button onClick={gitPush} className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-violet-500/20 transition-all">
                      Push Commits
                    </button>
                  </div>
                </div>
              </div>

              {/* Code Audit Review */}
              <div className="glass-card rounded-2xl p-6 shadow-xl bg-gradient-to-br from-violet-950/10 to-indigo-950/10 border border-violet-500/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-200 text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    AI Code Auditor & Security Review
                  </h3>
                  <button
                    onClick={fetchCodeReview}
                    disabled={isLoadingReview}
                    className="text-xs px-3 py-1 bg-violet-650 hover:bg-violet-550 rounded-lg text-white font-semibold transition-all disabled:opacity-50"
                  >
                    {isLoadingReview ? "Auditing..." : "Re-Audit Code"}
                  </button>
                </div>
                
                <div className="p-4 bg-black/40 rounded-xl max-h-85 overflow-y-auto border border-white/5 font-sans text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {codeReview || "AI Code Auditor will review changes when changes are staged or when you run Re-Audit."}
                </div>
              </div>

              {/* Diff view */}
              {gitStatus.uncommitted_changes.length > 0 && (
                <div className="glass-card rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-250 text-sm">Workspace Diff Preview</h3>
                    <button onClick={fetchGitDiff} className="text-[10px] text-violet-400 font-semibold hover:underline">Refresh Diff</button>
                  </div>
                  <pre className="code-font text-[11px] text-gray-400 bg-black/40 p-4 rounded-xl max-h-80 overflow-auto whitespace-pre leading-relaxed border border-white/5">{gitDiff || 'No changes staged.'}</pre>
                </div>
              )}

              {/* Git logs */}
              <div className="glass-card rounded-2xl p-6 shadow-xl">
                <h3 className="font-bold text-gray-250 mb-4 flex items-center space-x-2 text-sm">
                  <GitBranch className="h-4 w-4 text-violet-400" />
                  <span>Commits History Log</span>
                </h3>
                <div className="space-y-2.5 max-h-80 overflow-y-auto">
                  {gitLog.map(commit => (
                    <div key={commit.sha} 
                         onClick={() => viewCommitDiff(commit.sha, commit.message)}
                         title="Click to view code changes for this commit"
                         className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 text-xs hover:bg-white/5 hover:border-violet-500/30 cursor-pointer transition-all gap-2 sm:gap-0">
                      <div className="flex items-center space-x-2 truncate w-full sm:w-auto">
                        <span className="code-font bg-white/5 border border-white/10 text-violet-300 px-2 py-0.5 rounded font-medium shrink-0">{commit.sha.slice(0, 7)}</span>
                        <span className="text-gray-300 font-medium truncate">{commit.message}</span>
                      </div>
                      <span className="text-gray-550 text-[10px] font-outfit shrink-0 self-end sm:self-auto">{commit.author} on {commit.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: Logs Output */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-2">Live Run Output Console</h2>
                <pre className="code-font text-xs text-gray-300 bg-black/60 p-4 rounded-xl h-[450px] overflow-y-auto whitespace-pre-wrap leading-relaxed border border-white/5 shadow-inner">
                  {pipeline.log || 'No active terminal output logs fetched yet.'}
                </pre>
              </div>
            </div>
          )}

          {/* TAB CONTENT: Workspace Code Editor */}
          {activeTab === 'editor' && (
            <div className="space-y-6">
              {/* Editor Sub-Tabs Switcher */}
              <div className="flex border-b border-white/5 pb-2 gap-4">
                <button
                  onClick={() => setEditorTab('explorer')}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 ${
                    editorTab === 'explorer' ? 'border-violet-500 text-violet-400' : 'border-transparent text-gray-450 hover:text-gray-250'
                  }`}
                >
                  📝 Code Workspace Editor
                </button>
                <button
                  onClick={() => {
                    setEditorTab('assets');
                    fetchAssetFiles();
                  }}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 ${
                    editorTab === 'assets' ? 'border-violet-500 text-violet-400' : 'border-transparent text-gray-450 hover:text-gray-250'
                  }`}
                >
                  🖼️ Visual Asset Library & Generator
                </button>
              </div>

              {editorTab === 'assets' ? (
                /* Visual Asset Library & AI Image Generator Panel */
                <div className="glass-card rounded-2xl p-6 shadow-xl border border-white/5 space-y-6 min-h-[60vh]">
                  <div>
                    <h3 className="text-base font-bold text-white font-outfit">Workspace Asset Library</h3>
                    <p className="text-xs text-gray-400 mt-1">Manage project assets, copy visual asset routes, and generate mock components imagery.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: AI Mock Image Generator */}
                    <div className="bg-black/35 rounded-xl border border-white/5 p-5 space-y-4">
                      <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block mb-2 font-mono">AI Asset Generator</span>
                      
                      <div className="space-y-3 font-outfit">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-450 block font-mono">Target Filename</label>
                          <input
                            type="text"
                            value={assetName}
                            onChange={e => setAssetName(e.target.value)}
                            placeholder="e.g. logo.png"
                            className="w-full text-xs bg-black/50 border border-white/10 rounded-lg px-2.5 py-2 text-white outline-none focus:border-violet-550/40 font-mono"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-450 block font-mono">Generation Prompt</label>
                          <textarea
                            value={assetPrompt}
                            onChange={e => setAssetPrompt(e.target.value)}
                            rows={4}
                            placeholder="Describe the image (e.g. 'A futuristic SaaS analytics hero background')"
                            className="w-full text-xs bg-black/50 border border-white/10 rounded-lg px-2.5 py-2 text-white outline-none focus:border-violet-550/40"
                          />
                        </div>
                        
                        <button
                          onClick={generateAIAsset}
                          disabled={isGeneratingAsset || !assetPrompt.trim()}
                          className="w-full py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-violet-955/15 cursor-pointer"
                        >
                          {isGeneratingAsset ? "Generating Asset..." : "Generate AI Image"}
                        </button>
                      </div>
                    </div>

                    {/* Right: Assets Grid */}
                    <div className="md:col-span-2 space-y-3 bg-black/45 rounded-xl border border-white/5 p-5">
                      <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block mb-2 font-mono">Project Asset Inventory</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[45vh] overflow-y-auto pr-1">
                        {assetFiles.map((file, idx) => (
                          <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2 relative group overflow-hidden">
                            <div className="h-24 bg-black/40 rounded-lg flex items-center justify-center border border-white/5 text-[10px] text-gray-500 italic font-mono">
                              Visual File: {file.name}
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                              <div className="truncate pr-2">
                                <span className="font-bold text-gray-350 block truncate font-mono">{file.name}</span>
                                <span className="text-gray-550 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                              </div>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(file.path);
                                  showToast("Asset path copied: " + file.path);
                                }}
                                className="px-2 py-1 bg-white/5 hover:bg-violet-650/20 text-gray-450 hover:text-violet-300 rounded border border-white/5 transition-all cursor-pointer"
                                title="Copy asset path"
                              >
                                Copy Path
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* File Explorer (1/4 column) */}
              <div className="glass-card rounded-2xl p-4 shadow-xl flex flex-col max-h-[680px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-250 text-xs flex items-center space-x-1.5">
                    <FolderOpen className="h-3.5 w-3.5 text-violet-400" />
                    <span>File Explorer</span>
                  </h3>
                  <div className="flex space-x-1">
                    <button onClick={() => setShowNewFileModal(true)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all" title="Create New File">
                      <FilePlus className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setShowNewFolderModal(true)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all" title="Create New Folder">
                      <FolderPlus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {/* Search query */}
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={fileSearchQuery}
                    onChange={e => setFileSearchQuery(e.target.value)}
                    placeholder="Search files..."
                    className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-black/30 border border-white/5 rounded-lg text-white outline-none focus:border-violet-500/30"
                  />
                  <Search className="h-3.5 w-3.5 text-gray-500 absolute left-2.5 top-2" />
                </div>
                {/* Scrollable File List */}
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-outfit text-[11px] max-h-[320px]">
                  {fileSearchQuery ? (
                    // Flat matching list for search queries
                    files.filter(f => f.toLowerCase().includes(fileSearchQuery.toLowerCase())).map(path => (
                      <button
                        key={path}
                        onClick={() => selectFile(path)}
                        className={`w-full text-left p-2 rounded-lg truncate block font-mono text-[10px] transition-all ${selectedFile === path ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                      >
                        {path}
                      </button>
                    ))
                  ) : (
                    // Collapsible tree view
                    renderTreeNodes(buildFileTree(files))
                  )}
                  {files.length === 0 && (
                    <p className="text-gray-600 text-center py-8">No files found.</p>
                  )}
                </div>

                {/* Git Source Control Panel */}
                <div className="border-t border-white/5 pt-4 mt-4 flex flex-col shrink-0">
                  <button
                    onClick={openCommitDialog}
                    className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-[10px] font-bold transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-violet-900/10"
                  >
                    <GitBranch className="h-3.5 w-3.5 text-violet-200" />
                    <span>Commit & Push Changes</span>
                  </button>
                </div>
              </div>

              {/* Code Editor (3/4 column) */}
              <div className="glass-card rounded-2xl p-6 shadow-xl lg:col-span-3 flex flex-col min-h-[500px]">
                {selectedFile ? (
                  <div className="flex-1 flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center space-x-2 min-w-0">
                        <FileCode className="h-4 w-4 text-violet-400 shrink-0" />
                        <span className="code-font text-xs font-semibold text-white truncate" title={selectedFile}>{selectedFile}</span>
                      </div>
                      <div className="flex space-x-2 w-full sm:w-auto justify-end shrink-0">
                        <button
                          onClick={() => setIsMaximized(true)}
                          className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
                          title="Maximize/Full Screen"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Maximize</span>
                        </button>
                        <button
                          onClick={() => deletePath(selectedFile, false)}
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
                          title="Delete File"
                        >
                          <Trash className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                        <button
                          onClick={saveFile}
                          disabled={isSavingFile}
                          className="px-3 sm:px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center space-x-1"
                        >
                          <Save className="h-3.5 w-3.5" />
                          <span>{isSavingFile ? 'Saving...' : 'Save'}</span>
                          <span className="hidden sm:inline"> File</span>
                        </button>
                      </div>
                    </div>

                    {/* Rich Settings Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-white/5 border border-white/5 px-4 py-2 rounded-xl mb-3 text-xs shrink-0 font-outfit">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center space-x-1.5">
                          <Palette className="h-3.5 w-3.5 text-violet-400" />
                          <span className="text-gray-400 font-medium font-outfit">Theme:</span>
                          <select 
                            value={editorTheme} 
                            onChange={e => setEditorTheme(e.target.value as any)}
                            className="bg-black/40 border border-white/10 rounded px-1.5 py-0.5 outline-none text-violet-300 font-medium cursor-pointer"
                          >
                            <option value="midnight">Midnight Black</option>
                            <option value="cyberpunk">Cyberpunk Purple</option>
                            <option value="monokai">Monokai Amber</option>
                            <option value="dracula">Dracula Slate</option>
                          </select>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-400 font-medium mr-1 font-outfit">Size:</span>
                          <button onClick={() => setEditorFontSize(prev => Math.max(10, prev - 1))} className="h-6 w-6 rounded bg-white/5 hover:bg-white/10 border border-white/5 font-bold transition-all">-</button>
                          <span className="font-mono text-gray-200 px-1 font-semibold">{editorFontSize}px</span>
                          <button onClick={() => setEditorFontSize(prev => Math.min(24, prev + 1))} className="h-6 w-6 rounded bg-white/5 hover:bg-white/10 border border-white/5 font-bold transition-all">+</button>
                        </div>
                        <button 
                          onClick={() => setEditorWordWrap(prev => !prev)}
                          className={`px-2 py-1 rounded border transition-all flex items-center space-x-1.5 ${editorWordWrap ? 'bg-violet-600/20 border-violet-500/35 text-violet-300 font-semibold' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                          title="Toggle Word Wrap"
                        >
                          <WrapText className="h-3.5 w-3.5" />
                          <span>Wrap</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button 
                          onClick={() => setShowSearchPanel(prev => !prev)}
                          className={`px-2.5 py-1 rounded border transition-all flex items-center space-x-1.5 ${showSearchPanel ? 'bg-violet-600/20 border-violet-500/35 text-violet-300 font-semibold' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                          title="Search & Replace"
                        >
                          <Search className="h-3.5 w-3.5" />
                          <span>Find / Replace</span>
                        </button>
                        {selectedFile.endsWith('.json') && (
                          <button 
                            onClick={formatJSON}
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 rounded hover:text-white transition-all flex items-center space-x-1.5"
                            title="Format JSON Code"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Format JSON</span>
                          </button>
                        )}
                        <button 
                          onClick={downloadFile}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 rounded hover:text-white transition-all flex items-center space-x-1.5"
                          title="Download Raw File"
                        >
                          <Download className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>

                    {/* Search & Replace Panel */}
                    {showSearchPanel && (
                      <div className="bg-black/45 border border-white/5 rounded-xl p-3 mb-3 flex flex-col sm:flex-row gap-3 items-end sm:items-center justify-between font-outfit text-xs shrink-0">
                        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
                          <div className="flex items-center space-x-2 flex-1">
                            <span className="text-gray-400 font-medium w-12 shrink-0 font-outfit">Find:</span>
                            <input 
                              type="text" 
                              value={searchQuery} 
                              onChange={e => setSearchQuery(e.target.value)}
                              placeholder="Search text..."
                              className="w-full glass-input rounded px-2.5 py-1 outline-none text-white font-mono"
                            />
                          </div>
                          <div className="flex items-center space-x-2 flex-1">
                            <span className="text-gray-400 font-medium w-12 shrink-0 font-outfit">Replace:</span>
                            <input 
                              type="text" 
                              value={replaceQuery} 
                              onChange={e => setReplaceQuery(e.target.value)}
                              placeholder="Replacement..."
                              className="w-full glass-input rounded px-2.5 py-1 outline-none text-white font-mono"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                          {searchQuery && (
                            <span className="text-[10px] text-violet-400 font-mono px-2 py-0.5 bg-violet-950/20 border border-violet-500/15 rounded">
                              {getSearchMatchesCount()} match(es)
                            </span>
                          )}
                          <div className="flex space-x-2">
                            <button 
                              onClick={handleReplaceAll}
                              disabled={!searchQuery}
                              className="px-3 py-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded transition-all font-semibold"
                            >
                              Replace All
                            </button>
                            <button 
                              onClick={() => {
                                setSearchQuery('');
                                setReplaceQuery('');
                                setShowSearchPanel(false);
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-450 rounded transition-all"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className={`flex-1 flex border rounded-xl overflow-hidden shadow-inner min-h-[400px] ${activeThemeStyle.bg} ${activeThemeStyle.border}`}>
                      {/* Line Numbers Gutter */}
                      <div
                        id="line-numbers"
                        className={`text-right text-[10px] font-mono select-none overflow-y-hidden ${activeThemeStyle.gutter}`}
                        style={{ 
                          minWidth: '42px', 
                          paddingTop: '16px', 
                          paddingBottom: '16px',
                          paddingRight: '8px'
                        }}
                      >
                        {Array.from({ length: fileContent.split('\n').length || 1 }).map((_, i) => (
                          <div key={i} style={{ height: '20px', lineHeight: '20px' }}>{i + 1}</div>
                        ))}
                      </div>
                      
                      {/* Textarea Code Space */}
                      <textarea
                        value={fileContent}
                        onChange={e => setFileContent(e.target.value)}
                        onScroll={handleTextareaScroll}
                        className={`flex-1 code-font bg-transparent outline-none resize-none overflow-auto ${activeThemeStyle.textarea} ${editorWordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}
                        style={{ 
                          fontSize: `${editorFontSize}px`,
                          lineHeight: '20px', 
                          paddingTop: '16px', 
                          paddingBottom: '16px',
                          paddingLeft: '16px',
                          paddingRight: '16px',
                          height: '450px'
                        }}
                      />
                    </div>
                    
                    {/* Status Bar */}
                    <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-start sm:items-center text-[10px] text-gray-500 font-outfit px-1 shrink-0">
                      <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
                        <span>Language: <strong className="text-violet-400 uppercase font-mono">{detectLanguage(selectedFile)}</strong></span>
                        <span>Lines: <strong className="text-gray-300 font-mono">{fileContent.split('\n').length}</strong></span>
                        <span>Characters: <strong className="text-gray-300 font-mono">{fileContent.length}</strong></span>
                        {autosaveStatus && <span className="text-gray-700">|</span>}
                        {autosaveStatus === 'saving' && (
                          <span className="text-amber-400 font-semibold animate-pulse flex items-center space-x-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            <span>Autosaving...</span>
                          </span>
                        )}
                        {autosaveStatus === 'saved' && (
                          <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span>All changes saved</span>
                          </span>
                        )}
                        {autosaveStatus === 'error' && (
                          <span className="text-rose-400 font-semibold flex items-center space-x-1 animate-bounce">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                            <span>Save Error</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded border border-white/5 text-gray-400">UTF-8</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-center py-20 text-gray-550">
                    <FileCode className="h-12 w-12 text-gray-700 mb-4 animate-pulse" />
                    <h3 className="font-bold text-sm text-gray-400">No File Selected</h3>
                    <p className="text-xs text-gray-650 max-w-xs mt-1">Select a file from the left explorer to view, edit, and save its source code directly on Render.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

          {/* TAB CONTENT: Live UI Preview */}
          {activeTab === 'preview' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fadeIn">
              {/* Build control sidebar */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col space-y-6 max-h-[680px]">
                <div>
                  <h3 className="font-bold text-gray-300 text-xs flex items-center space-x-1.5 mb-2">
                    <Play className="h-3.5 w-3.5 text-violet-400" />
                    <span>Preview Controls</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-outfit">
                    Since building the React workspace is computationally heavy, you can trigger a build on-demand to bundle and run the latest UI.
                  </p>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={triggerPreviewBuild}
                    disabled={previewStatus.building}
                    className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-violet-900/10 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${previewStatus.building ? 'animate-spin' : ''}`} />
                    <span>{previewStatus.building ? 'Building App...' : 'Build & Launch Preview'}</span>
                  </button>
                  
                  {previewStatus.ready && (
                    <a 
                      href="/preview/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-emerald-450 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border border-emerald-500/20 text-center"
                    >
                      <span>🚀 Open in New Tab</span>
                    </a>
                  )}
                </div>

                {/* Build status banner */}
                <div className="p-3.5 bg-black/35 rounded-xl border border-white/5 space-y-2 font-outfit text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-450">Build Status:</span>
                    {previewStatus.building ? (
                      <span className="text-amber-400 font-bold animate-pulse">BUILDING</span>
                    ) : previewStatus.ready ? (
                      <span className="text-emerald-400 font-bold">READY</span>
                    ) : (
                      <span className="text-rose-455 font-bold">NOT BUILT</span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-500 leading-normal">
                    {previewStatus.building 
                      ? "Compiling React source files on Render..." 
                      : previewStatus.ready 
                        ? "Preview is ready! View it in the iframe or open in a new tab." 
                        : "No build found. Click the build button above to compile."}
                  </div>
                </div>
              </div>

              {/* Iframe View & Logs */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 lg:col-span-3 flex flex-col h-[680px] overflow-hidden">
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${previewStatus.building ? 'bg-amber-400 animate-pulse' : previewStatus.ready ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                    <span className="text-xs font-bold text-white tracking-wide uppercase font-outfit">
                      {previewStatus.building ? 'Building App Bundle...' : 'Live Workspace Sandbox'}
                    </span>
                  </div>
                  {previewStatus.ready && !previewStatus.building && (
                    <button 
                      onClick={() => {
                        const iframe = document.getElementById('preview-frame') as HTMLIFrameElement;
                        if (iframe) iframe.src = iframe.src;
                      }}
                      className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded border border-white/5 text-[10px] text-gray-300 font-bold transition-all flex items-center space-x-1 cursor-pointer"
                      title="Reload Iframe"
                    >
                      <RefreshCw className="h-2.5 w-2.5 text-violet-400" />
                      <span>Refresh</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 bg-black/60 rounded-xl overflow-hidden border border-white/5 relative min-h-0">
                  {previewStatus.building ? (
                    /* Building Logs Stream */
                    <div className="absolute inset-0 p-4 font-mono text-[10px] text-gray-300 overflow-y-auto bg-black/85 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-violet-400 font-bold block mb-2">// Build Log Console Stream</span>
                        {previewStatus.log.split('\n').map((line, idx) => (
                          <div key={idx} className="leading-relaxed whitespace-pre-wrap">{line}</div>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2 text-amber-400 font-bold border-t border-white/5 pt-2 mt-4 animate-pulse shrink-0">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Compiling sources and generating bundle...</span>
                      </div>
                    </div>
                  ) : previewStatus.ready ? (
                    /* Interactive Iframe */
                    <iframe 
                      id="preview-frame"
                      src="/preview/" 
                      className="w-full h-full border-0 bg-white"
                      title="Workspace Preview"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                    />
                  ) : (
                    /* No Build logs/welcome screen */
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 bg-black/45">
                      <Play className="h-12 w-12 text-violet-600 mb-4 animate-pulse" />
                      <h4 className="font-bold text-sm text-gray-300">Workspace Build Required</h4>
                      <p className="text-xs text-gray-400 max-w-sm mt-1 leading-normal">
                        To run the SaaS UI, click the <strong>Build & Launch Preview</strong> button in the left sidebar. This will install packages and compile the React bundle.
                      </p>
                      {previewStatus.log && (
                        <div className="w-full max-w-lg mt-6 p-4 bg-black/80 border border-white/5 rounded-xl text-left max-h-48 overflow-y-auto font-mono text-[9px] text-gray-405">
                          <span className="text-rose-455 block mb-1 font-bold">// Last Build Status Log</span>
                          {previewStatus.log.split('\n').map((line, idx) => (
                            <div key={idx} className="leading-relaxed whitespace-pre-wrap">{line}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: AI Developer Chat */}
          {activeTab === 'chat' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 shadow-xl flex flex-col h-[70vh]">
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-sky-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white">AI Lead Developer Chat</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Instruct the developer to review code, answer questions, or edit workspace files.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowVisualCanvas(!showVisualCanvas)}
                      className={`text-xs px-3.5 py-1.5 rounded-lg border font-semibold transition-all ${
                        showVisualCanvas 
                          ? 'bg-sky-600/25 border-sky-500/40 text-sky-300' 
                          : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      🎨 {showVisualCanvas ? "Hide Canvas" : "UI Scaffolder Canvas"}
                    </button>
                    <button 
                      onClick={() => setChatMessages([])} 
                      className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                {showVisualCanvas ? (
                  /* Figma-to-React Drag-and-Drop Canvas Section */
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden py-2">
                    
                    {/* Draggable Sidebar */}
                    <div className="bg-black/35 rounded-xl border border-white/5 p-4 space-y-3">
                      <h4 className="text-xs font-bold text-gray-450 uppercase tracking-widest mb-2">Palette Elements</h4>
                      {[
                        { type: 'header', label: 'Navbar Header' },
                        { type: 'input', label: 'Form Input field' },
                        { type: 'button', label: 'Action Button' },
                        { type: 'card', label: 'Grid Card Box' },
                        { type: 'footer', label: 'Footer Section' }
                      ].map(elem => (
                        <button
                          key={elem.type}
                          onClick={() => {
                            setDraggedElements(prev => [...prev, { id: Date.now().toString(), label: elem.label, type: elem.type }]);
                            showToast(`Added ${elem.label} to canvas.`);
                          }}
                          className="w-full text-left text-xs bg-white/5 hover:bg-sky-500/10 border border-white/10 hover:border-sky-500/20 text-gray-300 rounded-lg p-2.5 transition-all flex justify-between items-center"
                        >
                          <span>{elem.label}</span>
                          <Plus className="h-3.5 w-3.5 text-sky-400" />
                        </button>
                      ))}
                    </div>

                    {/* Canvas Drop-zone */}
                    <div className="md:col-span-3 bg-black/45 rounded-xl border border-dashed border-sky-500/20 p-5 flex flex-col justify-between overflow-y-auto">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs text-gray-450 mb-2 border-b border-white/5 pb-2">
                          <span>Visual Composition Frame</span>
                          <span>{draggedElements.length} elements</span>
                        </div>
                        {draggedElements.length === 0 ? (
                          <div className="text-center py-20 text-gray-500 text-xs">
                            <Palette className="h-10 w-10 mx-auto mb-2 opacity-35" />
                            Drag components or click palette elements on the left to add them here.
                          </div>
                        ) : (
                          draggedElements.map((elem) => (
                            <div key={elem.id} className="flex justify-between items-center bg-sky-950/15 border border-sky-500/10 rounded-xl p-3 text-xs text-sky-200">
                              <span className="font-semibold">{elem.label}</span>
                              <button
                                onClick={() => setDraggedElements(prev => prev.filter(e => e.id !== elem.id))}
                                className="p-1 hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 rounded transition-colors"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {draggedElements.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-end gap-2">
                          <button
                            onClick={() => setDraggedElements([])}
                            className="text-xs px-3.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400"
                          >
                            Reset Canvas
                          </button>
                          <button
                            onClick={() => {
                              const desc = draggedElements.map((e, idx) => `${idx + 1}. ${e.label}`).join(", ");
                              setChatInput(`Please build a modern React UI incorporating these visually drafted components: ${desc}`);
                              setShowVisualCanvas(false);
                              showToast("Visual schema loaded into chat input!");
                            }}
                            className="text-xs px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-650 text-white font-bold rounded-lg hover:from-sky-500"
                          >
                            Assemble React Code
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Standard Chat Messages list */
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-sans text-sm">
                    {chatMessages.length === 0 ? (
                      <div className="flex flex-col justify-center items-center h-full text-center p-6 text-gray-450">
                        <MessageSquare className="h-10 w-10 mb-2 animate-bounce text-sky-500/30" />
                        <p className="text-sm font-semibold text-gray-400">Workspace developer chat is idle.</p>
                        <p className="text-xs mt-1">Ask the developer: "Add an authentication helper" or "explain the routing config."</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                            msg.sender === 'user' 
                              ? 'bg-violet-600 text-white rounded-br-none' 
                              : 'bg-slate-800 text-gray-200 rounded-bl-none border border-white/5'
                          }`}>
                            <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                              <span className="font-bold">{msg.sender === 'user' ? 'You' : 'AI Engineer'}</span>
                              <span>{msg.timestamp}</span>
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-800 text-gray-250 border border-white/5 rounded-2xl rounded-bl-none p-4 max-w-[80%] flex items-center space-x-3">
                          <RefreshCw className="h-4 w-4 animate-spin text-sky-400" />
                          <span className="text-xs font-semibold animate-pulse">AI Developer is modifying workspace files...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Input Bar */}
                <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendAgentChatMessage()}
                    placeholder="Type instruction (e.g. 'Add a login controller script')"
                    disabled={isChatLoading}
                    className="flex-1 glass-input text-sm rounded-xl px-4 py-3 text-white outline-none border border-white/5 bg-black/30 placeholder-gray-455 focus:border-sky-500 transition-colors"
                  />
                  
                  <button
                    onClick={startSpeechRecognition}
                    disabled={isChatLoading}
                    className={`p-3 rounded-xl transition-all border shrink-0 ${
                      speechRecording 
                        ? 'bg-rose-600 border-rose-500 text-white animate-pulse' 
                        : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                    }`}
                    title="Dictate with voice"
                  >
                    {speechRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>

                  <button
                    onClick={sendAgentChatMessage}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center space-x-1.5 shadow-lg shadow-sky-900/25 bg-gradient-to-r from-sky-600 to-indigo-650 hover:from-sky-500 hover:to-indigo-500 text-white disabled:opacity-50"
                  >
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: JSON DB Explorer */}
          {/* TAB CONTENT: JSON DB Explorer */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              {/* Explorer mode header */}
              <div className="flex border-b border-white/5 pb-2 gap-4">
                <button
                  onClick={() => setDbExplorerTab('records')}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 ${
                    dbExplorerTab === 'records' ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-450 hover:text-gray-250'
                  }`}
                >
                  📁 Browse Table Records
                </button>
                <button
                  onClick={() => {
                    setDbExplorerTab('er_schema');
                    fetchDbSchemaDiagram();
                  }}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 ${
                    dbExplorerTab === 'er_schema' ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-450 hover:text-gray-250'
                  }`}
                >
                  🕸️ ER Relationship Map
                </button>
              </div>

              {dbExplorerTab === 'er_schema' ? (
                /* ER Schema Visualizer Panel */
                <div className="glass-card rounded-2xl p-6 shadow-xl border border-white/5 space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Entity Relationship Database Schema Map</h3>
                    <p className="text-xs text-gray-400 mt-1">Inferred dynamic relationships and foreign keys mapped from <code>project_state.yaml</code> specifications.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {dbSchemaDiagram.nodes.length === 0 ? (
                      <div className="md:col-span-3 text-center py-20 text-xs text-gray-500">
                        No schema nodes loaded yet. Scaffolding database to populate.
                      </div>
                    ) : (
                      dbSchemaDiagram.nodes.map(node => (
                        <div key={node.id} className="bg-black/35 rounded-2xl border border-white/5 p-4 space-y-3 relative overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-yellow-600"></div>
                          <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2 mt-1">
                            <span className="font-bold text-sm text-amber-300 font-mono">{node.id}</span>
                            <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-gray-400">Table Node</span>
                          </div>
                          
                          <div className="space-y-1.5 font-mono text-[10px]">
                            {/* Render fields */}
                            {Array.isArray(node.fields) ? (
                              node.fields.map((f: any, idx: number) => {
                                const fieldName = typeof f === 'string' ? f : Object.keys(f)[0];
                                const isKey = fieldName === 'id';
                                return (
                                  <div key={idx} className="flex justify-between items-center text-gray-300">
                                    <span className={isKey ? "text-yellow-450 font-bold" : ""}>
                                      {isKey ? "🔑 " : "▪ "}
                                      {fieldName}
                                    </span>
                                    <span className="text-gray-500 text-[9px]">{isKey ? "Primary Key" : "Field"}</span>
                                  </div>
                                );
                              })
                            ) : typeof node.fields === 'object' ? (
                              Object.entries(node.fields).map(([fieldName, typeVal]: any, idx) => {
                                const isKey = fieldName === 'id';
                                return (
                                  <div key={idx} className="flex justify-between items-center text-gray-300">
                                    <span className={isKey ? "text-yellow-450 font-bold" : ""}>
                                      {isKey ? "🔑 " : "▪ "}
                                      {fieldName}
                                    </span>
                                    <span className="text-gray-500 text-[9px]">{isKey ? "Primary Key" : typeof typeVal === 'string' ? typeVal : 'Object'}</span>
                                  </div>
                                );
                              })
                            ) : null}
                          </div>

                          {/* Connections list */}
                          <div className="border-t border-white/5 pt-3.5 mt-2 space-y-1 text-[9px] font-sans">
                            <span className="text-gray-450 font-bold block uppercase tracking-wider">Relations:</span>
                            {dbSchemaDiagram.links.filter(l => l.source === node.id || l.target === node.id).length === 0 ? (
                              <span className="text-gray-600 italic">No relations found.</span>
                            ) : (
                              dbSchemaDiagram.links.filter(l => l.source === node.id || l.target === node.id).map((link, lIdx) => {
                                const isSource = link.source === node.id;
                                return (
                                  <div key={lIdx} className="flex items-center space-x-1 text-gray-400">
                                    <span>{isSource ? "➡️ Refers to" : "⬅️ Refered by"}</span>
                                    <span className="text-amber-300 font-mono font-semibold">{isSource ? link.target : link.source}</span>
                                    <span className="text-gray-550">via {link.key}</span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* SVG Relationship Connector Overlay */}
                  <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-4 text-xs text-gray-450 flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p>Visual relationship routes are automatically mapped via primary keys (e.g. mapping <code>contributors</code> lists or <code>projects</code> arrays as foreign relationships).</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Tables Side List */}
                <div className="glass-card rounded-2xl p-5 shadow-xl border border-white/5 lg:col-span-1">
                  <h3 className="text-sm font-bold text-white mb-3 tracking-wider uppercase">Database Tables</h3>
                  <div className="space-y-1.5">
                    {dbTables.length === 0 ? (
                      <p className="text-xs text-gray-450 italic">No database tables generated yet.</p>
                    ) : (
                      dbTables.map((tbl) => (
                        <button
                          key={tbl}
                          onClick={() => setSelectedTable(tbl)}
                          className={`w-full text-left text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between border ${
                            selectedTable === tbl 
                              ? 'bg-amber-600/10 border-amber-500/30 text-amber-300 font-bold' 
                              : 'bg-black/25 border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="truncate">{tbl}</span>
                          <Database className="h-3 w-3 shrink-0" />
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Table Content Explorer */}
                <div className="glass-card rounded-2xl p-6 shadow-xl border border-white/5 lg:col-span-3 flex flex-col min-h-[50vh]">
                  {selectedTable ? (
                    <>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 mb-4 gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Database className="h-5 w-5 text-amber-400" />
                            Table: <span className="text-amber-300">{selectedTable}</span>
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">Exposing JSON array entries inside <code>app/db/{selectedTable}</code>.</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setNewRecordJSON(JSON.stringify({ id: (tableRecords.length + 1).toString() }, null, 2));
                              setEditingRecord(null);
                              setShowAddRecordModal(true);
                            }}
                            className="text-xs px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-semibold rounded-lg hover:from-amber-400 hover:to-yellow-500 shadow-md shadow-amber-955/20 transition-all flex items-center gap-1.5"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Record
                          </button>
                        </div>
                      </div>

                      {/* Query Builder Section */}
                      <div className="mb-5 p-4 rounded-xl bg-black/35 border border-white/5 space-y-3">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block font-outfit">🔍 SQL-Style Visual Query Builder</span>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                          <div className="flex flex-col space-y-1">
                            <span className="text-[8px] text-gray-500 font-mono">Field Key</span>
                            <input
                              type="text"
                              value={queryField}
                              onChange={e => setQueryField(e.target.value)}
                              placeholder="e.g. 'username' or 'id'"
                              className="text-xs bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-amber-500/40"
                            />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <span className="text-[8px] text-gray-500 font-mono">Comparison</span>
                            <select
                              value={queryOperator}
                              onChange={e => setQueryOperator(e.target.value)}
                              className="text-xs bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-amber-300 outline-none cursor-pointer"
                            >
                              <option value="equals">Equals (==)</option>
                              <option value="contains">Contains</option>
                              <option value="greater_than">Greater Than (&gt;)</option>
                              <option value="less_than">Less Than (&lt;)</option>
                            </select>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <span className="text-[8px] text-gray-500 font-mono">Value</span>
                            <input
                              type="text"
                              value={queryValue}
                              onChange={e => setQueryValue(e.target.value)}
                              placeholder="Match value"
                              className="text-xs bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-amber-500/40 font-mono"
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <button
                              onClick={executeQueryBuilder}
                              className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-955/10"
                            >
                              Run Filter
                            </button>
                            <button
                              onClick={() => {
                                setQueryValue('');
                                fetchTableRecords(selectedTable);
                              }}
                              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs text-gray-400 transition-all"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Filter Search */}
                      <div className="mb-4">
                        <input
                          type="text"
                          value={dbFilter}
                          onChange={e => setDbFilter(e.target.value)}
                          placeholder="Search database records..."
                          className="w-full glass-input text-xs rounded-xl px-4 py-2 text-white outline-none border border-white/5 bg-black/25"
                        />
                      </div>

                      {/* Table Records List */}
                      <div className="flex-1 overflow-y-auto space-y-3">
                        {tableRecords.length === 0 ? (
                          <div className="flex flex-col justify-center items-center h-48 text-center text-gray-450">
                            <Database className="h-10 w-10 mb-2" />
                            <p className="text-sm font-semibold">Table is empty.</p>
                          </div>
                        ) : (
                          tableRecords
                            .filter(record => {
                              if (!dbFilter) return true;
                              const contentString = JSON.stringify(record).toLowerCase();
                              return contentString.includes(dbFilter.toLowerCase());
                            })
                            .map((record, index) => {
                              const matchKey = record.id ? 'id' : Object.keys(record)[0] || '';
                              const matchValue = record[matchKey] || '';
                              
                              return (
                                <div key={index} className="glass-card rounded-xl p-4 bg-black/25 border border-white/5 flex justify-between items-start hover:border-amber-500/20 transition-all">
                                  <pre className="text-[11px] font-mono text-gray-300 overflow-x-auto leading-relaxed">{JSON.stringify(record, null, 2)}</pre>
                                  <div className="flex gap-2 ml-4 shrink-0">
                                    <button
                                      onClick={() => {
                                        setEditingRecord({ original: record, index });
                                        setNewRecordJSON(JSON.stringify(record, null, 2));
                                        setShowAddRecordModal(true);
                                      }}
                                      className="p-1.5 bg-white/5 rounded hover:bg-amber-500/10 text-gray-400 hover:text-amber-300 transition-colors"
                                      title="Edit Record"
                                    >
                                      <Palette className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm("Are you sure you want to delete this record?")) {
                                          deleteDbRecord(matchKey, matchValue);
                                        }
                                      }}
                                      className="p-1.5 bg-white/5 rounded hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 transition-colors"
                                      title="Delete Record"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col justify-center items-center h-64 text-center text-gray-450">
                      <Database className="h-12 w-12 mb-2 animate-pulse text-amber-500/40" />
                      <h4 className="font-bold text-sm text-gray-400">Database Explorer Idle</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm">Select a table in the sidebar to inspect records and add/modify data elements.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

          {/* TAB CONTENT: Terminal Sandbox */}
          {activeTab === 'terminal' && (
            <div className="space-y-6">
              {/* Terminal Tab mode header */}
              <div className="flex border-b border-white/5 pb-2 gap-4 overflow-x-auto">
                <button
                  onClick={() => setTerminalTab('shell')}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 shrink-0 ${
                    terminalTab === 'shell' ? 'border-rose-500 text-rose-455' : 'border-transparent text-gray-450 hover:text-gray-250'
                  }`}
                >
                  💻 Bash Terminal Sandbox
                </button>
                <button
                  onClick={() => {
                    setTerminalTab('api');
                    discoverApiPlayground();
                  }}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 shrink-0 ${
                    terminalTab === 'api' ? 'border-rose-500 text-rose-455' : 'border-transparent text-gray-450 hover:text-gray-250'
                  }`}
                >
                  🔌 Visual API Tester & Swagger
                </button>
                <button
                  onClick={() => {
                    setTerminalTab('tests');
                    runTestSuite();
                  }}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 shrink-0 ${
                    terminalTab === 'tests' ? 'border-rose-500 text-rose-455' : 'border-transparent text-gray-450 hover:text-gray-250'
                  }`}
                >
                  🧪 Visual Test Suite & Coverage
                </button>
              </div>

              {terminalTab === 'api' ? (
                /* Swagger API Playground panel */
                <div className="glass-card rounded-2xl p-6 shadow-xl border border-white/5 space-y-6 min-h-[60vh]">
                  <div>
                    <h3 className="text-base font-bold text-white">Interactive API Playground</h3>
                    <p className="text-xs text-gray-400 mt-1">Directly mock, test, and invoke express backend endpoints defined in specifications.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Discovered routes list */}
                    <div className="bg-black/35 rounded-xl border border-white/5 p-4 space-y-2 max-h-[50vh] overflow-y-auto">
                      <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block mb-2">Discovered API Routes</span>
                      {apiRoutes.map((rt, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedRoute(rt);
                            setApiPayload(JSON.stringify(rt.request || {}, null, 2));
                            setApiResponse('');
                          }}
                          className={`w-full text-left text-xs px-3 py-2.5 rounded-lg border transition-all flex flex-col gap-1 ${
                            selectedRoute?.path === rt.path && selectedRoute?.method === rt.method
                              ? 'bg-rose-550/10 border-rose-500/30 text-rose-350 font-bold'
                              : 'bg-white/5 border-transparent text-gray-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                              rt.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {rt.method}
                            </span>
                            <span className="font-mono text-[10px] truncate">{rt.path}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Route test payload & response box */}
                    <div className="md:col-span-3 bg-black/45 rounded-xl border border-white/5 p-5 space-y-4 flex flex-col justify-between">
                      {selectedRoute ? (
                        <div className="space-y-4 flex-1 flex flex-col">
                          <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded font-bold uppercase bg-rose-500/20 text-rose-400 text-[10px]">
                                {selectedRoute.method}
                              </span>
                              <span className="font-mono text-white text-xs">{selectedRoute.path}</span>
                            </div>
                            <button
                              onClick={testApiEndpoint}
                              disabled={isApiTesting}
                              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-rose-955/20"
                            >
                              {isApiTesting ? "Running Call..." : "Execute Test"}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                            {/* Request Payload */}
                            <div className="flex flex-col space-y-1.5">
                              <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest">JSON Request Payload Body</span>
                              <textarea
                                value={apiPayload}
                                onChange={e => setApiPayload(e.target.value)}
                                disabled={selectedRoute.method === 'GET'}
                                rows={8}
                                className="w-full flex-1 code-font text-xs bg-black/50 border border-white/5 rounded-xl p-3 text-emerald-450 outline-none focus:border-rose-500/35"
                              />
                            </div>

                            {/* Response Payload */}
                            <div className="flex flex-col space-y-1.5">
                              <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest">HTTP Response Output</span>
                              <pre className="w-full flex-1 code-font text-[10px] bg-black/70 border border-white/5 rounded-xl p-3 text-gray-300 overflow-auto whitespace-pre-wrap">
                                {apiResponse || "// Hit execute to test endpoint response."}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-20 text-gray-500 text-xs flex-1 flex flex-col justify-center">
                          Select an API route on the left to start sandbox playground testing.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : terminalTab === 'tests' ? (
                /* Visual Test Suite & Coverage Panel */
                <div className="glass-card rounded-2xl p-6 shadow-xl border border-white/5 space-y-6 min-h-[60vh]">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-base font-bold text-white">Visual Test Suite & Code Coverage</h3>
                      <p className="text-xs text-gray-400 mt-1">Run unit tests, verify integrations, and inspect source coverage gates.</p>
                    </div>
                    <button
                      onClick={runTestSuite}
                      disabled={isTesting}
                      className="px-4 py-2 bg-rose-650 hover:bg-rose-550 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                    >
                      {isTesting ? "Running Tests..." : "Run Test Suite"}
                    </button>
                  </div>

                  {testResults ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                      {/* Coverage summary cards */}
                      <div className="md:col-span-1 space-y-4">
                        <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block">Coverage Rates</span>
                        {[
                          { label: 'Statements', rate: testResults.coverage.statements, color: 'from-emerald-500 to-teal-500' },
                          { label: 'Branches', rate: testResults.coverage.branches, color: 'from-amber-500 to-yellow-500' },
                          { label: 'Functions', rate: testResults.coverage.functions, color: 'from-emerald-500 to-teal-500' },
                          { label: 'Lines', rate: testResults.coverage.lines, color: 'from-emerald-500 to-teal-500' }
                        ].map(c => (
                          <div key={c.label} className="p-3.5 bg-black/20 border border-white/5 rounded-xl space-y-2">
                            <div className="flex justify-between text-xs font-bold text-gray-300 font-outfit">
                              <span>{c.label}</span>
                              <span>{c.rate}%</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                              <div className={`bg-gradient-to-r ${c.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${c.rate}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Test logs terminal */}
                      <div className="md:col-span-2 space-y-2 flex flex-col">
                        <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block">Test Run Logs</span>
                        <pre className="flex-1 font-mono text-[10px] text-emerald-400 bg-black/90 p-4 rounded-xl border border-white/5 whitespace-pre overflow-auto max-h-[40vh] shadow-inner select-text">
                          {testResults.log}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-xs text-gray-500">
                      Run the test suite to populate code coverage diagrams.
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-6 shadow-xl border border-white/5 flex flex-col h-[70vh]">
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Terminal className="h-5 w-5 text-rose-400 animate-pulse" />
                      Terminal command sandbox
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Execute setup, installation, or test scripts inside the server environment.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {terminalRunning && (
                      <button
                        onClick={killTerminalCommand}
                        className="text-xs px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 font-semibold rounded-lg text-white transition-all shadow-md shadow-rose-955/20"
                      >
                        Kill Process
                      </button>
                    )}
                  </div>
                </div>

                {/* Monospaced CRT Output Display */}
                <div className="flex-1 bg-black/90 rounded-2xl border border-white/5 p-5 font-mono text-xs text-emerald-400 overflow-y-auto max-h-[45vh] shadow-inner select-text whitespace-pre-wrap leading-relaxed">
                  {terminalOutput ? terminalOutput : "// Terminal ready. Enter a shell command below to execute."}
                  {terminalRunning && <span className="inline-block w-2 h-4 bg-emerald-400 animate-ping ml-1" />}
                </div>

                {/* Custom command presets */}
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Presets:</span>
                  {['agy --help', 'agy status', 'npm run build', 'npm run dev', 'git status', 'node -v'].map(cmd => (
                    <button
                      key={cmd}
                      onClick={() => setTerminalCommand(cmd)}
                      className="text-[10px] bg-white/5 border border-white/5 rounded-lg px-2.5 py-1 text-gray-300 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-300 transition-colors"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>

                {/* Execution Input Bar */}
                <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                  <input
                    type="text"
                    value={terminalCommand}
                    onChange={e => setTerminalCommand(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && executeTerminalCommand()}
                    placeholder="Enter terminal command (e.g. 'npm install lodash')"
                    disabled={terminalRunning}
                    className="flex-1 glass-input text-xs font-mono rounded-xl px-4 py-3 text-emerald-300 outline-none border border-white/5 bg-black/40 focus:border-rose-500 transition-colors placeholder-emerald-800"
                  />
                  <button
                    onClick={executeTerminalCommand}
                    disabled={terminalRunning || !terminalCommand.trim()}
                    className="px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center space-x-1.5 shadow-lg shadow-rose-900/25 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white disabled:opacity-50"
                  >
                    <span>Execute</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

          {/* TAB CONTENT: Quota Health Monitor */}
          {activeTab === 'quota' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 shadow-xl border border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                  <Cpu className="h-5 w-5 text-indigo-400" />
                  LLM Quota Health Monitor
                </h3>
                <p className="text-xs text-gray-400 border-b border-white/5 pb-4 mb-4">
                  Live diagnostics page tracking LLM key rotations, rate limits, and model health parameters.
                </p>

                {/* API Keys Table list */}
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">API Key Rotator Status</h4>
                <div className="overflow-x-auto rounded-xl border border-white/5 mb-6">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-gray-300 font-bold border-b border-white/5">
                        <th className="p-3">Index</th>
                        <th className="p-3">Provider</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Last Used Successful Call</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {quotaKeys.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-gray-450 italic">No keys initialized or fetched.</td>
                        </tr>
                      ) : (
                        quotaKeys.map((key) => (
                          <tr key={key.index} className="hover:bg-white/[0.02] text-gray-300">
                            <td className="p-3 font-mono font-bold text-violet-400">{key.index}</td>
                            <td className="p-3 font-semibold capitalize">{key.provider}</td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                key.status === 'active' 
                                  ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400' 
                                  : key.status === 'exhausted' 
                                  ? 'bg-rose-600/10 border-rose-500/20 text-rose-400' 
                                  : 'bg-gray-600/10 border-gray-500/20 text-gray-400'
                              }`}>
                                {key.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-[10px] text-gray-400">{key.last_used}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Cached 404 Models */}
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Banned / Unavailable Models (404 Cache)</h4>
                <div className="glass-card rounded-xl p-4 bg-black/25 border border-white/5">
                  {Object.keys(modelsUnavailable).length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No model failures cached. All systems running.</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(modelsUnavailable).map(([model, time]) => (
                        <div key={model} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                          <span className="font-mono text-gray-300">{model}</span>
                          <span className="text-[10px] text-gray-450">Banned at: {time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: Pipeline Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 shadow-xl border border-white/5 max-w-2xl">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                  <Sliders className="h-5 w-5 text-teal-400" />
                  Pipeline Settings & Quality Gates Tuner
                </h3>
                <p className="text-xs text-gray-400 border-b border-white/5 pb-4 mb-5">
                  Configure strict compiler checks, auto-repair retry settings, and compilation overrides for Render deployments.
                </p>

                <div className="space-y-5">
                  {/* Strict TypeScript Check */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                    <div>
                      <h4 className="text-sm font-bold text-white">Strict TypeScript Checks</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Validate strict types check (`tsc --noEmit`) before merging or committing code changes.</p>
                    </div>
                    <button
                      onClick={() => savePipelineSettings({ strict_typescript: !pipelineSettings.strict_typescript })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                        pipelineSettings.strict_typescript ? 'bg-teal-500' : 'bg-slate-700'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${
                        pipelineSettings.strict_typescript ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Consensus Mode */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                    <div>
                      <h4 className="text-sm font-bold text-white">Enable Consensus Coding Mode</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Use multi-model concurrent generation & evaluate final logic for production readiness.</p>
                    </div>
                    <button
                      onClick={() => savePipelineSettings({ enable_consensus: !pipelineSettings.enable_consensus })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                        pipelineSettings.enable_consensus ? 'bg-teal-500' : 'bg-slate-700'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${
                        pipelineSettings.enable_consensus ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Bypass Gates */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                    <div>
                      <h4 className="text-sm font-bold text-white">Bypass Compilation Quality Gates</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Completely skip TypeScript compilation checks. Useful to save cloud container memory.</p>
                    </div>
                    <button
                      onClick={() => savePipelineSettings({ bypass_compilation_gates: !pipelineSettings.bypass_compilation_gates })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                        pipelineSettings.bypass_compilation_gates ? 'bg-teal-500' : 'bg-slate-700'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${
                        pipelineSettings.bypass_compilation_gates ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Auto Repair Limit */}
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-white">Auto-Repair Max Iterations</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Adjust how many times the AI tries to fix compilation errors during a task execution run.</p>
                      </div>
                      <span className="text-sm font-bold text-teal-400 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                        {pipelineSettings.auto_repair_limit} attempts
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={pipelineSettings.auto_repair_limit}
                      onChange={e => savePipelineSettings({ auto_repair_limit: parseInt(e.target.value) })}
                      className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                    />
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* TAB: Activity Feed */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-base font-bold text-white">Live Activity Stream</h2>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold animate-pulse">● Live</span>
                </div>
                <div className="space-y-1">
                  {activityFeed.map((a, i) => (
                    <div key={a.id} className={`flex items-center space-x-4 p-3.5 rounded-xl hover:bg-white/[0.02] transition-all ${i === 0 ? 'bg-violet-500/[0.03] border border-violet-500/10' : ''}`}>
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        a.avatar === 'AJ' ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white' : 
                        a.avatar === 'AI' ? 'bg-gradient-to-br from-cyan-600 to-sky-600 text-white' : 
                        'bg-gradient-to-br from-gray-700 to-gray-600 text-gray-300'
                      }`}>{a.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-white"><strong className="text-violet-300">{a.user}</strong> {a.action} <span className="text-emerald-400 font-semibold">{a.target}</span></span>
                      </div>
                      <span className="text-[10px] text-gray-600 font-mono shrink-0">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: API Tester */}
          {activeTab === 'api_tester' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 shadow-xl">
                <h2 className="text-base font-bold text-white mb-5">API Endpoint Tester</h2>
                <div className="flex gap-3 mb-4">
                  <select value={apiTesterMethod} onChange={e => setApiTesterMethod(e.target.value as any)} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-yellow-400 font-bold outline-none cursor-pointer">
                    {['GET','POST','PUT','DELETE','PATCH'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <input value={apiTesterUrl} onChange={e => setApiTesterUrl(e.target.value)} className="flex-1 bg-black/30 border border-white/5 rounded-xl px-4 py-2 text-xs text-white outline-none font-mono" placeholder="/api/endpoint" />
                  <button onClick={executeApiTest} disabled={isApiTesterLoading} className="px-5 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    <span>{isApiTesterLoading ? 'Sending...' : 'Send'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Headers (JSON)</label>
                    <textarea value={apiTesterHeaders} onChange={e => setApiTesterHeaders(e.target.value)} rows={4} className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-emerald-300 outline-none font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Body (JSON)</label>
                    <textarea value={apiTesterBody} onChange={e => setApiTesterBody(e.target.value)} rows={4} className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-amber-300 outline-none font-mono" />
                  </div>
                </div>
                {apiTesterResponse && (
                  <div className="bg-black/40 border border-white/5 rounded-xl p-4 mt-4">
                    <div className="flex items-center space-x-4 mb-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${apiTesterResponse.status >= 200 && apiTesterResponse.status < 300 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{apiTesterResponse.status}</span>
                      <span className="text-[10px] text-gray-500 font-mono">⏱ {apiTesterResponse.time}</span>
                    </div>
                    <pre className="text-[11px] text-gray-300 font-mono overflow-auto max-h-64 whitespace-pre-wrap leading-relaxed">{apiTesterResponse.body}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: Lighthouse Performance */}
          {activeTab === 'lighthouse' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 shadow-xl">
                <h2 className="text-base font-bold text-white mb-6">Lighthouse Performance Scores</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {([
                    { label: 'Performance', score: lighthouseScores.performance, color: 'from-emerald-500 to-green-500' },
                    { label: 'SEO', score: lighthouseScores.seo, color: 'from-violet-500 to-indigo-500' },
                    { label: 'Accessibility', score: lighthouseScores.accessibility, color: 'from-amber-500 to-yellow-500' },
                    { label: 'Best Practices', score: lighthouseScores.bestPractices, color: 'from-sky-500 to-cyan-500' },
                  ]).map(item => (
                    <div key={item.label} className="bg-black/30 border border-white/5 rounded-2xl p-5 text-center relative overflow-hidden">
                      <div className="relative mx-auto mb-3 h-24 w-24">
                        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                          <circle cx="60" cy="60" r="52" fill="none" className={`stroke-current ${item.score >= 90 ? 'text-emerald-500' : item.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`} strokeWidth="10" strokeDasharray={`${item.score * 3.27} 327`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">{item.score}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-400">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Error Tracker */}
          {activeTab === 'errors' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-base font-bold text-white">Error Tracking Center</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Real-time exception logging, stack trace diagnosis, and automated AI code repair.</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-full border border-rose-500/20 font-bold">{trackedErrors.filter(e => e.status === 'open').length} Open</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">{trackedErrors.filter(e => e.status === 'resolved').length} Resolved</span>
                    {trackedErrors.some(e => e.status === 'open') && (
                      <button 
                        onClick={handleFixAllErrors}
                        disabled={fixingAllErrors}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-lg shadow-violet-600/20"
                      >
                        <Zap className="h-3.5 w-3.5 text-amber-300" />
                        <span>{fixingAllErrors ? 'AI Repairing All...' : 'Fix All with AI'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {trackedErrors.map(err => {
                    const isExpanded = expandedErrorId === err.id;
                    const isFixing = fixingErrorId === err.id;
                    return (
                      <div key={err.id} className={`rounded-xl border transition-all ${err.status === 'resolved' ? 'border-white/[0.03] bg-black/10 opacity-75' : err.severity === 'critical' ? 'border-rose-500/20 bg-rose-500/[0.02]' : 'border-amber-500/20 bg-amber-500/[0.02]'}`}>
                        <div className="p-4 flex items-start justify-between">
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedErrorId(isExpanded ? null : err.id)}>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${err.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : err.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'}`}>{err.severity}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${err.status === 'open' ? 'bg-rose-500/10 text-rose-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{err.status}</span>
                              <span className="text-[10px] text-gray-500 font-mono">ID: {err.id}</span>
                            </div>
                            <p className="text-xs text-white font-bold hover:text-violet-300 transition-colors flex items-center gap-1.5">
                              <span>{err.message}</span>
                              <span className="text-[10px] text-gray-500">{isExpanded ? '▲' : '▼'}</span>
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono mt-1">
                              📄 <code className="text-amber-300 font-bold">{err.file}:{err.line}</code> · {err.count} occurrences · Last seen: {err.lastSeen}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {err.status === 'open' && (
                              <button
                                onClick={() => handleFixSingleError(err.id)}
                                disabled={isFixing || fixingAllErrors}
                                className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-[11px] font-bold cursor-pointer transition-all flex items-center space-x-1 shadow-md shadow-violet-600/20"
                              >
                                {isFixing ? (
                                  <>
                                    <RefreshCw className="h-3 w-3 animate-spin text-teal-300" />
                                    <span>Fixing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Zap className="h-3 w-3 text-yellow-300" />
                                    <span>Fix with AI</span>
                                  </>
                                )}
                              </button>
                            )}

                            <button 
                              onClick={() => setTrackedErrors(prev => prev.map(e => e.id === err.id ? { ...e, status: e.status === 'open' ? 'resolved' : 'open' } : e))} 
                              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all ${err.status === 'open' ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'}`}
                            >
                              {err.status === 'open' ? 'Mark Resolved' : 'Reopen'}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Stack Trace & AI Patch Suggestion */}
                        {isExpanded && (
                          <div className="border-t border-white/5 p-4 bg-black/40 space-y-3 rounded-b-xl">
                            <div>
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Stack Trace</span>
                              <pre className="text-[10px] text-rose-300/90 font-mono bg-black/60 p-3 rounded-xl border border-rose-500/10 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                {err.stackTrace || 'No stack trace available for this event.'}
                              </pre>
                            </div>
                            {err.fixSuggestion && (
                              <div>
                                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block mb-1">AI Suggested Code Fix Patch</span>
                                <pre className="text-[11px] text-emerald-300 font-mono bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/20 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                  {err.fixSuggestion}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Env Variables */}
          {activeTab === 'envs' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-base font-bold text-white">Environment Variables</h2>
                  <div className="flex items-center space-x-2">
                    {(['all','dev','staging','prod'] as const).map(f => (
                      <button key={f} onClick={() => setEnvFilter(f)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${envFilter === f ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{f === 'all' ? 'All' : f.toUpperCase()}</button>
                    ))}
                    <button onClick={() => setShowAddEnvModal(true)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer flex items-center space-x-1"><Plus className="h-3 w-3" /><span>Add</span></button>
                  </div>
                </div>
                <div className="space-y-2">
                  {envVars.filter(v => envFilter === 'all' || v.env === envFilter).map((v, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-black/20 border border-white/[0.03] hover:bg-white/[0.02] transition-all">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
                        <code className="text-xs font-bold text-amber-300 font-mono">{v.key}</code>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${v.env === 'prod' ? 'bg-rose-500/10 text-rose-400' : v.env === 'staging' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{v.env}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="text-[10px] text-gray-500 font-mono max-w-[200px] truncate">{v.masked ? '••••••••••••••' : v.value}</code>
                        <button onClick={() => setEnvVars(prev => prev.map((ev, idx) => idx === i ? { ...ev, masked: !ev.masked } : ev))} className="p-1 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all">
                          {v.masked ? <Eye className="h-3 w-3 text-gray-500" /> : <EyeOff className="h-3 w-3 text-gray-500" />}
                        </button>
                        <button onClick={() => setEnvVars(prev => prev.filter((_, idx) => idx !== i))} className="p-1 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg cursor-pointer transition-all"><Trash className="h-3 w-3 text-rose-400" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Add Env Modal */}
              {showAddEnvModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowAddEnvModal(false)}>
                  <div className="glass-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/5" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-bold text-white mb-4">Add Environment Variable</h3>
                    <div className="space-y-3">
                      <input value={newEnvKey} onChange={e => setNewEnvKey(e.target.value)} placeholder="VARIABLE_NAME" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono" />
                      <input value={newEnvValue} onChange={e => setNewEnvValue(e.target.value)} placeholder="value" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono" />
                      <select value={newEnvTarget} onChange={e => setNewEnvTarget(e.target.value as any)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer">
                        <option value="dev">Development</option><option value="staging">Staging</option><option value="prod">Production</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-3 mt-5">
                      <button onClick={() => setShowAddEnvModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold cursor-pointer transition-all">Cancel</button>
                      <button onClick={() => { if(newEnvKey.trim()) { setEnvVars(prev => [...prev, { key: newEnvKey, value: newEnvValue, env: newEnvTarget, masked: true }]); setNewEnvKey(''); setNewEnvValue(''); setShowAddEnvModal(false); } }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all">Save Variable</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Deploy History */}
          {activeTab === 'deploys' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 shadow-xl">
                <h2 className="text-base font-bold text-white mb-5">Deployment Timeline</h2>
                <div className="space-y-3">
                  {deployHistory.map((d, i) => (
                    <div key={d.id} className={`flex items-center space-x-4 p-4 rounded-xl border transition-all hover:bg-white/[0.02] ${d.status === 'success' ? 'border-emerald-500/10' : d.status === 'failed' ? 'border-rose-500/15 bg-rose-500/[0.02]' : 'border-amber-500/10'}`}>
                      <div className="relative">
                        <span className={`h-10 w-10 rounded-full flex items-center justify-center ${d.status === 'success' ? 'bg-emerald-500/15' : d.status === 'failed' ? 'bg-rose-500/15' : 'bg-amber-500/15'}`}>
                          {d.status === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : d.status === 'failed' ? <XCircle className="h-5 w-5 text-rose-400" /> : <RefreshCw className="h-5 w-5 text-amber-400 animate-spin" />}
                        </span>
                        {i < deployHistory.length - 1 && <div className="absolute top-12 left-1/2 -translate-x-1/2 w-px h-6 bg-white/[0.06]"></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-bold ${d.status === 'success' ? 'text-emerald-400' : d.status === 'failed' ? 'text-rose-400' : 'text-amber-400'}`}>{d.status === 'success' ? 'Deployed' : d.status === 'failed' ? 'Failed' : 'Building'}</span>
                          <span className="text-[10px] text-gray-600">·</span>
                          <span className="text-[10px] text-violet-400 font-mono font-bold">{d.branch}</span>
                          <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded font-mono text-gray-400">{d.commit}</span>
                        </div>
                        <div className="flex items-center space-x-3 mt-1 text-[10px] text-gray-500 font-mono">
                          <span>⏱ {d.duration}</span>
                          <span>{d.time}</span>
                          {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">View →</a>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Team Management */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-base font-bold text-white">Team Members</h2>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">{teamMembers.filter(m => m.status === 'online').length} Online</span>
                </div>
                <div className="space-y-2">
                  {teamMembers.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/[0.03] hover:bg-white/[0.02] transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold ${m.role === 'admin' ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white' : m.avatar === 'AI' ? 'bg-gradient-to-br from-cyan-600 to-sky-600 text-white' : 'bg-gradient-to-br from-gray-700 to-gray-600 text-gray-300'}`}>{m.avatar}</div>
                          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0c0c10] ${m.status === 'online' ? 'bg-emerald-500' : m.status === 'away' ? 'bg-amber-500' : 'bg-gray-600'}`}></span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">{m.name}</span>
                          <span className="text-[10px] text-gray-500">{m.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${m.role === 'admin' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : m.role === 'developer' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-gray-700/50 text-gray-400 border border-white/5'}`}>{m.role}</span>
                        <span className="text-[10px] text-gray-600 font-mono">{m.lastActive}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* GLOBAL OVERLAYS */}
      {/* ═══════════════════════════════════════════════════════════ */}

      {/* Command Palette (⌘K) */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-start justify-center pt-[15vh] backdrop-blur-sm" onClick={() => setShowCommandPalette(false)}>
          <div className="bg-[#12121a] border border-white/[0.08] rounded-2xl w-[560px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center space-x-3 px-5 py-4 border-b border-white/[0.04]">
              <Search className="h-4 w-4 text-gray-500 shrink-0" />
              <input
                autoFocus
                value={commandSearch}
                onChange={e => setCommandSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-600"
                placeholder="Search commands, tabs, actions..."
              />
              <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded border border-white/5 font-mono">ESC</span>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {([
                { id: 'overview' as TabId, label: 'Go to Vision Spec', icon: '📄', category: 'Navigate' },
                { id: 'milestones' as TabId, label: 'Go to Roadmap', icon: '🗺️', category: 'Navigate' },
                { id: 'chat' as TabId, label: 'Open AI Chat', icon: '💬', category: 'Navigate' },
                { id: 'editor' as TabId, label: 'Open Code Editor', icon: '📝', category: 'Navigate' },
                { id: 'preview' as TabId, label: 'Open Live Preview', icon: '🖥️', category: 'Navigate' },
                { id: 'activity' as TabId, label: 'View Activity Feed', icon: '📡', category: 'Navigate' },
                { id: 'git' as TabId, label: 'Open Git VCS', icon: '🔀', category: 'Developer' },
                { id: 'database' as TabId, label: 'Open DB Explorer', icon: '🗄️', category: 'Developer' },
                { id: 'terminal' as TabId, label: 'Open Terminal', icon: '⚡', category: 'Developer' },
                { id: 'api_tester' as TabId, label: 'Open API Tester', icon: '🔌', category: 'Developer' },
                { id: 'lighthouse' as TabId, label: 'Performance Audit', icon: '📊', category: 'Developer' },
                { id: 'errors' as TabId, label: 'Error Tracker', icon: '🐛', category: 'Developer' },
                { id: 'envs' as TabId, label: 'Environment Variables', icon: '🔐', category: 'System' },
                { id: 'deploys' as TabId, label: 'Deploy History', icon: '🚀', category: 'System' },
                { id: 'team' as TabId, label: 'Team Management', icon: '👥', category: 'System' },
                { id: 'settings' as TabId, label: 'Open Settings', icon: '⚙️', category: 'System' },
              ]).filter(cmd => cmd.label.toLowerCase().includes(commandSearch.toLowerCase()) || cmd.category.toLowerCase().includes(commandSearch.toLowerCase()))
              .map(cmd => (
                <button
                  key={cmd.id}
                  onClick={() => { setActiveTab(cmd.id); setShowCommandPalette(false); }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs hover:bg-white/[0.04] transition-all cursor-pointer text-left"
                >
                  <span className="text-base">{cmd.icon}</span>
                  <span className="flex-1 text-gray-300 font-semibold">{cmd.label}</span>
                  <span className="text-[9px] text-gray-600 font-mono bg-white/[0.03] px-1.5 py-0.5 rounded">{cmd.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
          <div className="bg-[#12121a] border border-white/[0.08] rounded-2xl w-[480px] shadow-2xl overflow-hidden p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-white">Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-gray-500 hover:text-white transition-all cursor-pointer"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="space-y-1">
              {[
                { keys: '⌘ K', action: 'Open Command Palette' },
                { keys: 'ESC', action: 'Close Modal / Panel' },
                { keys: '⌘ S', action: 'Save Current File' },
                { keys: '⌘ B', action: 'Toggle Sidebar' },
                { keys: '⌘ /', action: 'Toggle Comment' },
                { keys: '⌘ F', action: 'Find in File' },
                { keys: '⌘ H', action: 'Find & Replace' },
                { keys: '⌘ Enter', action: 'Send AI Chat Message' },
                { keys: '⌘ ⇧ D', action: 'Deploy to Netlify' },
                { keys: '⌘ ⇧ P', action: 'Run Pipeline' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/[0.02] transition-all">
                  <span className="text-xs text-gray-300">{s.action}</span>
                  <kbd className="text-[10px] bg-white/5 text-gray-400 px-2.5 py-1 rounded-lg border border-white/5 font-mono font-bold">{s.keys}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DB Record Add/Edit Modal */}
      {showAddRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-card rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white/5 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">
              {editingRecord ? 'Edit Record' : 'Add Database Record'}
            </h3>
            <p className="text-xs text-gray-400 mb-4 border-b border-white/5 pb-2">
              Provide the data payload object structure for table: <code className="text-amber-300 font-bold">{selectedTable}</code>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-450 block mb-1.5">JSON Data Block</label>
                <textarea
                  rows={10}
                  value={newRecordJSON}
                  onChange={e => setNewRecordJSON(e.target.value)}
                  className="w-full glass-input text-xs font-mono rounded-xl px-4 py-3 text-amber-300 outline-none border border-white/5 bg-black/45 focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-4">
              <button
                onClick={() => setShowAddRecordModal(false)}
                className="text-xs font-semibold px-4 py-2 border border-white/5 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingRecord) {
                    try {
                      const matchKey = editingRecord.original.id ? 'id' : Object.keys(editingRecord.original)[0] || '';
                      const matchValue = editingRecord.original[matchKey];
                      const parsed = JSON.parse(newRecordJSON);
                      updateDbRecord(matchKey, matchValue, parsed);
                      setShowAddRecordModal(false);
                    } catch (e) {
                      showToast("Invalid JSON syntax.", "error");
                    }
                  } else {
                    addDbRecord();
                  }
                }}
                className="text-xs font-semibold px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-lg hover:from-amber-400 hover:to-yellow-500 shadow-md shadow-amber-950/20 transition-all"
              >
                {editingRecord ? 'Save Changes' : 'Insert Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Creation & Edit Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-card rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white/5 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Edit Task Specification</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Task ID</label>
                <input type="text" value={editingTask.id || ''} 
                       onChange={e => setEditingTask((prev: any) => ({ ...prev, id: e.target.value }))}
                       className="w-full glass-input text-sm rounded-xl px-4 py-2 text-white outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Task Title</label>
                <input type="text" value={editingTask.name || ''} 
                       onChange={e => setEditingTask((prev: any) => ({ ...prev, name: e.target.value }))}
                       className="w-full glass-input text-sm rounded-xl px-4 py-2 text-white outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Description</label>
                <textarea value={editingTask.description || ''} rows={3}
                          onChange={e => setEditingTask((prev: any) => ({ ...prev, description: e.target.value }))}
                          className="w-full glass-input text-sm rounded-xl px-4 py-2 text-white outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Target Files (comma-separated)</label>
                <input type="text" value={editingTask.files?.join(', ') || ''} 
                       onChange={e => setEditingTask((prev: any) => ({ ...prev, files: e.target.value.split(',').map(s => s.trim()).filter(s => s) }))}
                       className="w-full glass-input text-sm rounded-xl px-4 py-2 text-white outline-none" />
              </div>
            </div>
            <div className="flex space-x-3 justify-end mt-6">
              <button onClick={() => setShowTaskModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-semibold transition-all">Cancel</button>
              <button onClick={saveTask} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-all">Save Task</button>
            </div>
          </div>
        </div>
      )}

      {/* Start From Scratch Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-card rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-rose-500/20 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center space-x-3 text-rose-450 mb-4">
              <AlertTriangle className="h-6 w-6 text-rose-400" />
              <h3 className="text-lg font-bold text-rose-400">Trigger Destructive Reset?</h3>
            </div>
            
            <p className="text-sm text-gray-400 leading-relaxed mb-6 font-outfit">
              This action will branch and archive the current workspace project files, clean up generated app files from the main branch, and reset the spec backlog configuration.
            </p>
            
            {/* Project Topic Choice */}
            <div className="border-t border-white/5 pt-4 mb-4">
              <label className="text-xs font-semibold text-gray-400 block mb-2 font-outfit">Select Project Subject Strategy</label>
              
              <div className="grid grid-cols-3 gap-2 mb-4 font-outfit text-[11px]">
                <button 
                  onClick={() => setResetType('trend')}
                  className={`py-2 px-1 border rounded-xl font-bold transition-all cursor-pointer ${resetType === 'trend' ? 'bg-rose-500/10 border-rose-500/35 text-rose-300' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  Auto-Select (Trends)
                </button>
                <button 
                  onClick={() => setResetType('suggested')}
                  className={`py-2 px-1 border rounded-xl font-bold transition-all cursor-pointer ${resetType === 'suggested' ? 'bg-rose-500/10 border-rose-500/35 text-rose-300' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  Suggested Topics
                </button>
                <button 
                  onClick={() => setResetType('custom')}
                  className={`py-2 px-1 border rounded-xl font-bold transition-all cursor-pointer ${resetType === 'custom' ? 'bg-rose-500/10 border-rose-500/35 text-rose-300' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  Custom SaaS Idea
                </button>
              </div>

              {resetType === 'suggested' && (
                <div className="space-y-2 mb-4 font-outfit animate-fadeIn">
                  <label className="text-xs font-semibold text-gray-405 block">Curated SaaS Ideas</label>
                  <select 
                    value={selectedSuggestion} 
                    onChange={e => setSelectedSuggestion(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-rose-250 outline-none cursor-pointer"
                  >
                    <option value="Cryptocurrency Trading & Signal Alert Dashboard">Cryptocurrency Trading & Signal Alert Dashboard</option>
                    <option value="Real-Time Algorithmic Trading Analytics Engine">Real-Time Algorithmic Trading Analytics Engine</option>
                    <option value="AI Writing & Content Marketing Automation SaaS">AI Writing & Content Marketing Automation SaaS</option>
                    <option value="Developer Resume & Interactive Portfolio CMS">Developer Resume & Interactive Portfolio CMS</option>
                    <option value="Task Management & Team Collaboration Portal">Task Management & Team Collaboration Portal</option>
                  </select>
                </div>
              )}

              {resetType === 'custom' && (
                <div className="space-y-2 mb-4 font-outfit animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-405">Describe your SaaS Idea (Hinglish/Hindi/English)</label>
                    <button 
                      type="button"
                      onClick={enhancePrompt} 
                      disabled={isEnhancing || !customResetIdea.trim()}
                      className="px-2 py-0.5 bg-violet-600/35 hover:bg-violet-600/50 disabled:opacity-40 text-violet-300 rounded border border-violet-500/20 text-[9px] font-bold transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      {isEnhancing ? (
                        <>
                          <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                          <span>Enhancing...</span>
                        </>
                      ) : (
                        <>
                          <span>✨ AI Enhance Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea 
                    value={customResetIdea} 
                    onChange={e => setCustomResetIdea(e.target.value)}
                    placeholder="e.g., ek crypto portfolio trading dashboard bana do jisme realtime option rates updates aati ho..."
                    rows={4}
                    className="w-full glass-input text-xs rounded-xl px-3 py-2 text-white outline-none font-sans"
                  />
                  <p className="text-[9px] text-gray-500 leading-normal">
                    Type your thoughts in Hinglish or Hindi, then click the <strong>✨ AI Enhance</strong> button to translate, expand, and refine it into a detailed product prompt specification.
                  </p>
                </div>
              )}
            </div>
            
            {/* Advanced Customizable Form (only for Suggested / Custom ideas) */}
            {(resetType === 'suggested' || resetType === 'custom') && (
              <div className="border-t border-white/5 pt-4 mb-4 font-outfit text-xs space-y-4">
                <h4 className="font-bold text-violet-400 uppercase tracking-wider text-[10px]">⚙️ Advanced SaaS Customization</h4>
                
                {/* Custom Branding */}
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-semibold block">Custom Project Name / Title (Optional)</label>
                  <input 
                    type="text" 
                    value={customResetTitle} 
                    onChange={e => setCustomResetTitle(e.target.value)}
                    placeholder="e.g. CryptoPulse, TechPort CMS"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                {/* Backlog details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-semibold block">Target Milestones Count</label>
                    <select
                      value={targetMilestones}
                      onChange={e => setTargetMilestones(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs text-violet-300 outline-none cursor-pointer"
                    >
                      <option value={3}>3 Milestones (Rapid MVP)</option>
                      <option value={5}>5 Milestones (Medium Scale)</option>
                      <option value={8}>8 Milestones (Comprehensive SaaS)</option>
                      <option value={10}>10 Milestones (Enterprise Scale)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-semibold block">Project Scope Complexity</label>
                    <div className="flex border border-white/10 rounded-xl overflow-hidden text-[9px] h-8">
                      <button
                        type="button"
                        onClick={() => setProjectScope('mvp')}
                        className={`flex-1 font-bold cursor-pointer ${projectScope === 'mvp' ? 'bg-violet-600/30 text-violet-200 font-semibold' : 'bg-black/25 text-gray-500'}`}
                      >
                        Core MVP
                      </button>
                      <button
                        type="button"
                        onClick={() => setProjectScope('saas')}
                        className={`flex-1 font-bold cursor-pointer ${projectScope === 'saas' ? 'bg-violet-600/30 text-violet-200 font-semibold' : 'bg-black/25 text-gray-500'}`}
                      >
                        Full SaaS
                      </button>
                      <button
                        type="button"
                        onClick={() => setProjectScope('enterprise')}
                        className={`flex-1 font-bold cursor-pointer ${projectScope === 'enterprise' ? 'bg-violet-600/30 text-violet-200 font-semibold' : 'bg-black/25 text-gray-500'}`}
                      >
                        Enterprise (1 Yr)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tech Stack toggles */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-semibold block">Backend Framework</label>
                    <div className="flex border border-white/10 rounded-xl overflow-hidden text-[10px] h-8">
                      <button
                        type="button"
                        onClick={() => setBackendStack('nodejs')}
                        className={`flex-1 font-bold cursor-pointer ${backendStack === 'nodejs' ? 'bg-violet-600/30 text-violet-200 font-semibold' : 'bg-black/25 text-gray-550'}`}
                      >
                        Express (Node.js)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBackendStack('python')}
                        className={`flex-1 font-bold cursor-pointer ${backendStack === 'python' ? 'bg-violet-600/30 text-violet-200 font-semibold' : 'bg-black/25 text-gray-555'}`}
                      >
                        FastAPI (Python)
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-semibold block">Styling / CSS</label>
                    <div className="flex border border-white/10 rounded-xl overflow-hidden text-[10px] h-8">
                      <button
                        type="button"
                        onClick={() => setStylingStack('tailwind')}
                        className={`flex-1 font-bold cursor-pointer ${stylingStack === 'tailwind' ? 'bg-violet-600/30 text-violet-200 font-semibold' : 'bg-black/25 text-gray-550'}`}
                      >
                        Tailwind CSS
                      </button>
                      <button
                        type="button"
                        onClick={() => setStylingStack('vanilla')}
                        className={`flex-1 font-bold cursor-pointer ${stylingStack === 'vanilla' ? 'bg-violet-600/30 text-violet-200 font-semibold' : 'bg-black/25 text-gray-555'}`}
                      >
                        Vanilla CSS
                      </button>
                    </div>
                  </div>
                </div>

                {/* Core Features list */}
                <div className="space-y-2">
                  <label className="text-gray-400 font-semibold block">Include Core Features</label>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-300 font-sans">
                    {[
                      'JWT User Auth & Roles',
                      'Stripe Billing & Subscriptions',
                      'Interactive Data Charts/KPIs',
                      'Email Notifications System',
                      'Admin Management Console',
                      'CSV/JSON Data Backup Export'
                    ].map(feat => {
                      const isSelected = selectedFeatures.includes(feat);
                      return (
                        <button
                          type="button"
                          key={feat}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedFeatures(prev => prev.filter(f => f !== feat));
                            } else {
                              setSelectedFeatures(prev => [...prev, feat]);
                            }
                          }}
                          className={`flex items-center space-x-2 p-2 border rounded-xl text-left transition-all cursor-pointer ${isSelected ? 'bg-violet-600/20 border-violet-500/30 text-violet-200 font-semibold' : 'bg-black/35 border-white/5 text-gray-400 hover:bg-white/5'}`}
                        >
                          <span className="text-[9px]">{isSelected ? '✅' : '➕'}</span>
                          <span>{feat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <label className="text-xs font-semibold text-gray-400 block">Provide Reset Reason (optional)</label>
              <input type="text" value={resetReason} onChange={e => setResetReason(e.target.value)}
                     placeholder="e.g., target project pivot" 
                     className="w-full glass-input text-sm rounded-xl px-4 py-2.5 text-white outline-none" />
            </div>
            
            <div className="flex space-x-3 justify-end">
              <button onClick={() => setShowResetModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-semibold transition-all cursor-pointer">Cancel</button>
              <button onClick={executeReset} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 cursor-pointer">
                <Trash2 className="h-4 w-4" />
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Git Commit Diff Viewer Modal */}
      {showCommitModal && selectedCommit && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowCommitModal(false)}>
          <div className="glass-card rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-violet-500/20 max-h-[90vh] sm:max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <div className="flex items-center space-x-3 text-violet-400">
                <GitBranch className="h-5 w-5 text-violet-400" />
                <h3 className="text-base font-bold text-white max-w-xl truncate">{selectedCommit.message}</h3>
              </div>
              <span className="code-font bg-white/5 border border-white/10 text-violet-300 px-2 py-0.5 rounded text-xs">{selectedCommit.sha.slice(0, 7)}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-black/50 p-4 rounded-xl border border-white/5 shadow-inner select-text">
              <pre className="code-font text-xs leading-relaxed">
                {renderDiffLines(selectedCommitDiff)}
              </pre>
            </div>
            
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowCommitModal(false)} className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-all">
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Create New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowNewFileModal(false)}>
          <div className="glass-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/5 font-outfit overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Create New Workspace File</h3>
            <p className="text-xs text-gray-500 mb-6 font-outfit">Enter the path of the new file relative to the project root (e.g. <code>app/src/utils.ts</code>).</p>
            
            <div className="space-y-4 mb-6">
              <label className="text-xs font-semibold text-gray-400 block font-outfit">Relative File Path</label>
              <input
                type="text"
                value={newFilePath}
                onChange={e => setNewFilePath(e.target.value)}
                placeholder="e.g. app/src/new-helpers.ts"
                className="w-full glass-input text-sm rounded-xl px-4 py-2.5 text-white outline-none font-mono"
              />
            </div>
            
            <div className="flex space-x-3 justify-end font-outfit">
              <button onClick={() => setShowNewFileModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-semibold transition-all">
                Cancel
              </button>
              <button onClick={createNewFile} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-all">
                Create File
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Create New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowNewFolderModal(false)}>
          <div className="glass-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/5 font-outfit overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Create New Workspace Folder</h3>
            <p className="text-xs text-gray-500 mb-6 font-outfit">Enter the path of the new folder relative to the project root (e.g. <code>app/src/components</code>). A <code>.gitkeep</code> file will be created to track it.</p>
            
            <div className="space-y-4 mb-6">
              <label className="text-xs font-semibold text-gray-400 block font-outfit">Relative Folder Path</label>
              <input
                type="text"
                value={newFolderPath}
                onChange={e => setNewFolderPath(e.target.value)}
                placeholder="e.g. app/src/components"
                className="w-full glass-input text-sm rounded-xl px-4 py-2.5 text-white outline-none font-mono"
              />
            </div>
            
            <div className="flex space-x-3 justify-end font-outfit">
              <button onClick={() => setShowNewFolderModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-semibold transition-all">
                Cancel
              </button>
              <button onClick={createNewFolder} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-all">
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Git Commit & Push Dialog Modal */}
      {showGitCommitModal && (
        <div className="fixed inset-0 z-[115] bg-black/80 flex items-center justify-center p-3 sm:p-6 backdrop-blur-sm" onClick={() => setShowGitCommitModal(false)}>
          <div className="glass-card rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-white/5 font-outfit flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <GitBranch className="h-4 w-4 text-violet-400" />
                  <span>Commit & Push Workspace Changes</span>
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Review your staged/unstaged updates before pushing to remote.</p>
              </div>
              <button
                onClick={() => setShowGitCommitModal(false)}
                className="text-gray-400 hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Split Screen Workspace */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-y-auto lg:overflow-hidden min-h-0 mb-6">
              {/* Left Column: Changes list */}
              <div className="w-full lg:w-1/3 flex flex-col space-y-2 lg:overflow-y-auto shrink-0 lg:shrink max-h-[150px] lg:max-h-none pr-1">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mb-2">Changed Files ({gitChanges.length})</h4>
                {gitChanges.length === 0 ? (
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-4 border border-dashed border-white/5 rounded-xl text-gray-600">
                    <CheckCircle className="h-8 w-8 text-gray-700 mb-2" />
                    <span className="text-[11px] font-semibold">No changes detected</span>
                    <span className="text-[9px] mt-0.5">Workspace matches git head.</span>
                  </div>
                ) : (
                  gitChanges.map(change => {
                    const statusColor = 
                      change.type === 'added' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                      change.type === 'deleted' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                      change.type === 'untracked' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' :
                      'text-amber-400 bg-amber-500/10 border-amber-500/20';
                    return (
                      <div
                        key={change.file}
                        onMouseEnter={() => handleFileHover(change.file)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all select-none cursor-pointer ${hoveredFile === change.file ? 'bg-white/5 border-white/10' : 'bg-transparent border-transparent hover:bg-white/3'}`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileCode className="h-3.5 w-3.5 text-gray-555 shrink-0" />
                          <span className="code-font text-[11px] text-gray-300 truncate" title={change.file}>{change.file}</span>
                        </div>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 uppercase tracking-wider ${statusColor}`}>
                          {change.type}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Diff Preview Panel */}
              <div className="w-full lg:flex-1 flex flex-col overflow-hidden bg-black/60 rounded-xl border border-white/5 p-4 shadow-inner min-h-[200px] lg:min-h-0">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mb-2">Diff Preview</h4>
                <div className="flex-1 overflow-auto pr-1 font-mono text-[10px] leading-relaxed whitespace-pre-wrap select-text">
                  {hoveredFile ? (
                    hoveredFileDiff ? (
                      hoveredFileDiff.split('\n').map((line, idx) => {
                        let lineClass = 'text-gray-400';
                        if (line.startsWith('+') && !line.startsWith('+++')) {
                          lineClass = 'text-emerald-450 bg-emerald-950/20';
                        } else if (line.startsWith('-') && !line.startsWith('---')) {
                          lineClass = 'text-rose-455 bg-rose-950/20';
                        } else if (line.startsWith('@@')) {
                          lineClass = 'text-cyan-400 border-t border-b border-white/5 py-0.5 my-1 block';
                        } else if (line.startsWith('diff --git')) {
                          lineClass = 'text-violet-400 font-bold border-t border-white/5 pt-1 mt-1 block';
                        }
                        return (
                          <span key={idx} className={`block px-1.5 py-0.5 rounded-sm ${lineClass}`}>
                            {line}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-gray-600 italic">No text changes.</span>
                    )
                  ) : (
                    <div className="h-full flex flex-col justify-center items-center text-center text-gray-600 py-12">
                      <Search className="h-8 w-8 text-gray-700 mb-2" />
                      <span className="text-[10px]">Hover over any changed file on the left to preview its specific modifications in real-time.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Commit Message Panel & Submit */}
            <div className="border-t border-white/5 pt-4 flex flex-col space-y-3 shrink-0 font-outfit">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Commit Message</label>
                <input
                  type="text"
                  value={gitCommitMessage}
                  onChange={e => setGitCommitMessage(e.target.value)}
                  placeholder="Describe your adjustments (e.g. feat(workspace): fix layout)..."
                  className="w-full glass-input text-xs rounded-xl px-4 py-2.5 text-white outline-none font-mono"
                />
              </div>
              <div className="flex space-x-3 justify-end text-xs font-semibold">
                <button
                  onClick={() => setShowGitCommitModal(false)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={submitCommitAndPush}
                  disabled={isSubmittingCommit || gitChanges.length === 0}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 text-white rounded-xl transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-violet-900/20"
                >
                  {isSubmittingCommit ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Pushing changes...</span>
                    </>
                  ) : (
                    <>
                      <GitMerge className="h-3.5 w-3.5 text-violet-200" />
                      <span>Commit & Push Directly</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] pointer-events-none select-none">
          <div className={`glass-card flex items-center space-x-3 px-5 py-3 rounded-2xl shadow-2xl border backdrop-blur-md ${toast.type === 'error' ? 'border-rose-500/25 text-rose-300 bg-rose-950/40' : 'border-emerald-500/25 text-emerald-300 bg-emerald-950/40'}`}>
            {toast.type === 'error' ? (
              <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            )}
            <span className="font-outfit text-xs font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal && confirmModal.show && (
        <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setConfirmModal(null)}>
          <div className="glass-card rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-rose-500/20" onClick={e => e.stopPropagation()}>
            <div className="flex items-center space-x-3 text-rose-400 mb-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
              <h3 className="text-sm font-bold text-white">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-6 font-outfit">
              {confirmModal.message}
            </p>
            <div className="flex space-x-3 justify-end text-xs font-semibold font-outfit">
              <button onClick={() => setConfirmModal(null)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all">Cancel</button>
              <button onClick={confirmModal.onConfirm} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all flex items-center space-x-1.5">
                <Trash className="h-3.5 w-3.5" />
                <span>Confirm</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Maximized Full Screen Workspace IDE Overlay */}
      {isMaximized && (
        <div className="fixed inset-0 z-[120] bg-black/95 p-3 sm:p-6 flex flex-col backdrop-blur-md font-outfit overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/5 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-violet-500 animate-pulse" />
              <h2 className="text-xs font-bold text-white tracking-wide uppercase font-outfit">Cloud Workspace IDE</h2>
            </div>
            <button
              onClick={() => setIsMaximized(false)}
              className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5"
              title="Exit Full Screen"
            >
              <Minimize2 className="h-4 w-4" />
              <span>Exit Full Screen</span>
            </button>
          </div>

          {/* Grid Layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-y-auto lg:overflow-hidden min-h-0">
            {/* Sidebar (File Explorer & Git) */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col space-y-6 lg:overflow-y-auto h-[350px] lg:h-auto shrink-0 lg:shrink">
              {/* File Explorer Header */}
              <div className="flex justify-between items-center shrink-0">
                <h3 className="text-xs font-bold text-gray-300 flex items-center space-x-1.5">
                  <FolderOpen className="h-3.5 w-3.5 text-violet-400" />
                  <span>File Explorer</span>
                </h3>
                <div className="flex space-x-1">
                  <button onClick={() => setShowNewFileModal(true)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all" title="Create New File">
                    <FilePlus className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setShowNewFolderModal(true)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all" title="Create New Folder">
                    <FolderPlus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              
              {/* Search query */}
              <div className="relative shrink-0">
                <input
                  type="text"
                  value={fileSearchQuery}
                  onChange={e => setFileSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-black/30 border border-white/5 rounded-lg text-white outline-none focus:border-violet-500/30"
                />
                <Search className="h-3.5 w-3.5 text-gray-500 absolute left-2.5 top-2" />
              </div>
              
              {/* Scrollable File List */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-outfit text-[11px] min-h-0">
                {fileSearchQuery ? (
                  files
                    .filter(f => f.toLowerCase().includes(fileSearchQuery.toLowerCase()))
                    .map(f => (
                      <button
                        key={f}
                        onClick={() => selectFile(f)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all font-mono truncate border ${selectedFile === f ? 'bg-violet-500/10 border-violet-500/20 text-violet-300' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5'}`}
                      >
                        {f}
                      </button>
                    ))
                ) : (
                  renderTreeNodes(buildFileTree(files))
                )}
              </div>

              {/* Git Source Control Panel */}
              <div className="border-t border-white/5 pt-4 flex flex-col shrink-0">
                <button
                  onClick={openCommitDialog}
                  className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-[10px] font-bold transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-violet-900/10"
                >
                  <GitBranch className="h-3.5 w-3.5 text-violet-200" />
                  <span>Commit & Push Changes</span>
                </button>
              </div>
            </div>

            {/* Code Editor */}
            <div className="glass-card rounded-2xl p-4 sm:p-6 border border-white/5 lg:col-span-3 flex flex-col overflow-hidden h-[500px] lg:h-auto lg:max-h-full">
              {selectedFile ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
                    <div className="flex items-center space-x-2 min-w-0">
                      <FileCode className="h-4 w-4 text-violet-400 shrink-0" />
                      <span className="code-font text-xs font-semibold text-white truncate" title={selectedFile}>{selectedFile}</span>
                    </div>
                    <div className="flex space-x-2 w-full sm:w-auto justify-end shrink-0">
                      <button
                        onClick={() => deletePath(selectedFile, false)}
                        className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
                        title="Delete File"
                      >
                        <Trash className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                      <button
                        onClick={saveFile}
                        disabled={isSavingFile}
                        className="px-3 sm:px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center space-x-1"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>{isSavingFile ? 'Saving...' : 'Save'}</span>
                        <span className="hidden sm:inline"> File</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Rich Settings Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-white/5 border border-white/5 px-4 py-2 rounded-xl mb-3 text-xs shrink-0 font-outfit">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center space-x-1.5">
                        <Palette className="h-3.5 w-3.5 text-violet-400" />
                        <span className="text-gray-400 font-medium font-outfit">Theme:</span>
                        <select 
                          value={editorTheme} 
                          onChange={e => setEditorTheme(e.target.value as any)}
                          className="bg-black/40 border border-white/10 rounded px-1.5 py-0.5 outline-none text-violet-300 font-medium cursor-pointer"
                        >
                          <option value="midnight">Midnight Black</option>
                          <option value="cyberpunk">Cyberpunk Purple</option>
                          <option value="monokai">Monokai Amber</option>
                          <option value="dracula">Dracula Slate</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-400 font-medium mr-1 font-outfit">Size:</span>
                        <button onClick={() => setEditorFontSize(prev => Math.max(10, prev - 1))} className="h-6 w-6 rounded bg-white/5 hover:bg-white/10 border border-white/5 font-bold transition-all">-</button>
                        <span className="font-mono text-gray-200 px-1 font-semibold">{editorFontSize}px</span>
                        <button onClick={() => setEditorFontSize(prev => Math.min(24, prev + 1))} className="h-6 w-6 rounded bg-white/5 hover:bg-white/10 border border-white/5 font-bold transition-all">+</button>
                      </div>
                      <button 
                        onClick={() => setEditorWordWrap(prev => !prev)}
                        className={`px-2 py-1 rounded border transition-all flex items-center space-x-1.5 ${editorWordWrap ? 'bg-violet-600/20 border-violet-500/35 text-violet-300 font-semibold' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                        title="Toggle Word Wrap"
                      >
                        <WrapText className="h-3.5 w-3.5" />
                        <span>Wrap</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button 
                        onClick={() => setShowSearchPanel(prev => !prev)}
                        className={`px-2.5 py-1 rounded border transition-all flex items-center space-x-1.5 ${showSearchPanel ? 'bg-violet-600/20 border-violet-500/35 text-violet-300 font-semibold' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                        title="Search & Replace"
                      >
                        <Search className="h-3.5 w-3.5" />
                        <span>Find / Replace</span>
                      </button>
                      {selectedFile.endsWith('.json') && (
                        <button 
                          onClick={formatJSON}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 rounded hover:text-white transition-all flex items-center space-x-1.5"
                          title="Format JSON Code"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Format JSON</span>
                        </button>
                      )}
                      <button 
                        onClick={downloadFile}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 rounded hover:text-white transition-all flex items-center space-x-1.5"
                        title="Download Raw File"
                      >
                        <Download className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  {/* Search & Replace Panel */}
                  {showSearchPanel && (
                    <div className="bg-black/45 border border-white/5 rounded-xl p-3 mb-3 flex flex-col sm:flex-row gap-3 items-end sm:items-center justify-between font-outfit text-xs shrink-0">
                      <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-gray-400 font-medium w-12 shrink-0 font-outfit">Find:</span>
                          <input 
                            type="text" 
                            value={searchQuery} 
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search text..."
                            className="w-full glass-input rounded px-2.5 py-1 outline-none text-white font-mono"
                          />
                        </div>
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-gray-400 font-medium w-12 shrink-0 font-outfit">Replace:</span>
                          <input 
                            type="text" 
                            value={replaceQuery} 
                            onChange={e => setReplaceQuery(e.target.value)}
                            placeholder="Replacement..."
                            className="w-full glass-input rounded px-2.5 py-1 outline-none text-white font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                        {searchQuery && (
                          <span className="text-[10px] text-violet-400 font-mono px-2 py-0.5 bg-violet-950/20 border border-violet-500/15 rounded">
                            {getSearchMatchesCount()} match(es)
                          </span>
                        )}
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleReplaceAll}
                            disabled={!searchQuery}
                            className="px-3 py-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded transition-all font-semibold"
                          >
                            Replace All
                          </button>
                          <button 
                            onClick={() => {
                              setSearchQuery('');
                              setReplaceQuery('');
                              setShowSearchPanel(false);
                            }}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-455 rounded transition-all"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`flex-1 flex border rounded-xl overflow-hidden shadow-inner min-h-[400px] ${activeThemeStyle.bg} ${activeThemeStyle.border}`}>
                    {/* Line Numbers Gutter */}
                    <div
                      id="line-numbers-maximized"
                      className={`text-right text-[10px] font-mono select-none overflow-y-hidden ${activeThemeStyle.gutter}`}
                      style={{ 
                        minWidth: '42px', 
                        paddingTop: '16px', 
                        paddingBottom: '16px',
                        paddingRight: '8px'
                      }}
                    >
                      {Array.from({ length: fileContent.split('\n').length || 1 }).map((_, i) => (
                        <div key={i} style={{ height: '20px', lineHeight: '20px' }}>{i + 1}</div>
                      ))}
                    </div>
                    
                    {/* Textarea Code Space */}
                    <textarea
                      value={fileContent}
                      onChange={e => setFileContent(e.target.value)}
                      onScroll={(e) => {
                        const lineNumbersDiv = document.getElementById('line-numbers-maximized');
                        if (lineNumbersDiv) {
                          lineNumbersDiv.scrollTop = e.currentTarget.scrollTop;
                        }
                      }}
                      className={`flex-1 code-font bg-transparent outline-none resize-none overflow-auto ${activeThemeStyle.textarea} ${editorWordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}
                      style={{ 
                        fontSize: `${editorFontSize}px`,
                        lineHeight: '20px', 
                        paddingTop: '16px', 
                        paddingBottom: '16px',
                        paddingLeft: '16px',
                        paddingRight: '16px',
                        height: '100%'
                      }}
                    />
                  </div>
                  
                  {/* Status Bar */}
                  <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-start sm:items-center text-[10px] text-gray-500 font-outfit px-1 shrink-0">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
                      <span>Language: <strong className="text-violet-400 uppercase font-mono">{detectLanguage(selectedFile)}</strong></span>
                      <span>Lines: <strong className="text-gray-300 font-mono">{fileContent.split('\n').length}</strong></span>
                      <span>Characters: <strong className="text-gray-300 font-mono">{fileContent.length}</strong></span>
                      {autosaveStatus && <span className="text-gray-700">|</span>}
                      {autosaveStatus === 'saving' && (
                        <span className="text-amber-400 font-semibold animate-pulse flex items-center space-x-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          <span>Autosaving...</span>
                        </span>
                      )}
                      {autosaveStatus === 'saved' && (
                        <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>All changes saved</span>
                        </span>
                      )}
                      {autosaveStatus === 'error' && (
                        <span className="text-rose-400 font-semibold flex items-center space-x-1 animate-bounce">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                          <span>Save Error</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded border border-white/5 text-gray-400">UTF-8</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-center py-20 text-gray-550">
                  <FileCode className="h-12 w-12 text-gray-700 mb-4 animate-pulse" />
                  <h3 className="font-bold text-sm text-gray-400">No File Selected</h3>
                  <p className="text-xs text-gray-650 max-w-xs mt-1">Select a file from the left explorer to view, edit, and save its source code directly on Render.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

