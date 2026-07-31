import { useState, useEffect } from 'react';
import { 
  Cpu, Database, FolderGit2, GitBranch, GitPullRequest, GitMerge, Trash2, 
  Play, Terminal, BarChart2, ChevronRight, CheckCircle2, Circle, AlertTriangle, 
  RefreshCw, FileText, Settings, Key, Save, Plus, Trash,
  CheckCircle, XCircle
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

interface ProjectState {
  project: {
    name: string;
    title: string;
    description: string;
    status: string;
    vision: string;
    repository_url?: string;
    deployment_url?: string;
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
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(sessionStorage.getItem('dashboard_auth') === 'true');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'git' | 'logs' | 'keys'>('overview');
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
    
    // Poll logs & pipeline status
    const interval = setInterval(() => {
      pollPipelineStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
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
      const data = await res.json();
      setGitStatus(data);
      if (data.uncommitted_changes.length > 0) {
        fetchGitDiff();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGitDiff = async () => {
    try {
      const res = await fetch('/api/git/diff');
      const data = await res.json();
      setGitDiff(data.diff);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGitLog = async () => {
    try {
      const res = await fetch('/api/git/log');
      const data = await res.json();
      setGitLog(data.commits);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEnvKeys = async () => {
    try {
      const res = await fetch('/api/config/keys');
      const data = await res.json();
      setEnvKeys(data.keys);
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
      alert(data.message);
      setPipeline(p => ({ ...p, running: true }));
    } catch (e) {
      alert("Failed to start pipeline.");
    }
  };

  const gitCommit = async () => {
    if (!commitMessage.trim()) return alert("Message cannot be empty.");
    try {
      const res = await fetch('/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commitMessage })
      });
      const data = await res.json();
      alert(data.message || "Committed successfully!");
      setCommitMessage('');
      fetchGitStatus();
      fetchGitLog();
    } catch (e) {
      alert("Commit failed.");
    }
  };

  const gitPush = async () => {
    try {
      const res = await fetch('/api/git/push', { method: 'POST' });
      const data = await res.json();
      alert(data.message || "Pushed successfully!");
      fetchGitStatus();
    } catch (e) {
      alert("Push failed.");
    }
  };

  const gitPull = async () => {
    try {
      const res = await fetch('/api/git/pull', { method: 'POST' });
      const data = await res.json();
      alert(data.message || "Pulled successfully!");
      fetchGitStatus();
    } catch (e) {
      alert("Pull failed.");
    }
  };

  const saveSpecs = async () => {
    if (!state || !editedSpecs || !editedProject) return;
    const updatedState = {
      ...state,
      project: { ...editedProject },
      architecture: { ...editedSpecs }
    };
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: updatedState })
      });
      alert("Specs saved successfully!");
      setIsEditingSpecs(false);
      fetchState();
    } catch (e) {
      alert("Failed to save specs.");
    }
  };

  const executeReset = async () => {
    setShowResetModal(false);
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: resetReason })
      });
      const data = await res.json();
      alert(data.message);
      setResetReason('');
      fetchState();
      fetchGitStatus();
      fetchGitLog();
    } catch (e) {
      alert("Reset failed.");
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
      alert(data.message || "Keys saved successfully!");
      fetchEnvKeys();
    } catch (e) {
      alert("Failed to save credentials.");
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
      alert("Failed to update status.");
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
      alert("Failed to save task.");
    }
  };

  const deleteTask = async (milestoneId: number, taskId: string) => {
    if (!state || !confirm("Are you sure you want to delete this task?")) return;
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
    } catch (e) {
      console.error(e);
    }
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

  const dailyUsedPercent = Math.min(100, Math.round((state.token_metadata.daily_used / state.token_metadata.daily_budget) * 100));

  return (
    <div className="text-gray-100 min-h-screen pb-12">
      {/* Top Nav */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">Antigravity V2</span>
            <span className="text-xs text-violet-400 block -mt-1 font-medium font-outfit">Autonomous Software Engineer</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 font-outfit">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Local Node API Running</span>
          </div>
          <div className="flex items-center space-x-2 text-xs bg-violet-500/10 px-3 py-1.5 rounded-lg border border-violet-500/20 text-violet-300 font-semibold font-outfit">
            <GitBranch className="h-3.5 w-3.5" />
            <span>{gitStatus.branch}</span>
          </div>
          <button onClick={handleLogout}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-350 rounded-lg text-xs font-bold font-outfit transition-all cursor-pointer">
            Logout
          </button>
        </div>
      </nav>

      {/* Main Grid */}
      <div className="max-w-[1400px] mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          {/* Status Box */}
          <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-28 h-28 bg-violet-600/10 rounded-full blur-2xl"></div>
            <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Engine Status</span>
              <span className={`h-2.5 w-2.5 rounded-full ${pipeline.running ? 'bg-violet-500 animate-ping' : 'bg-gray-600'}`}></span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300 font-medium">Pipeline Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${pipeline.running ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-gray-800 text-gray-450 border border-white/5'}`}>
                  {pipeline.running ? 'Running' : 'Idle'}
                </span>
              </div>
              <button onClick={triggerPipeline} disabled={pipeline.running}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium shadow-lg shadow-violet-600/25 transition-all duration-300 flex items-center justify-center space-x-2 text-sm">
                <Play className="h-4 w-4" />
                <span>Start Daily Run</span>
              </button>
              <button onClick={() => setActiveTab('logs')}
                      className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2">
                <Terminal className="h-4 w-4 text-violet-400" />
                <span>View Output Terminal</span>
              </button>
            </div>
          </div>

          {/* Sync & Git controls */}
          <div className="glass-card rounded-2xl p-6 shadow-xl">
            <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-4">Pipeline Sync Control</h3>
            <div className="space-y-3">
              <button onClick={gitPull}
                      className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <GitPullRequest className="h-4 w-4 text-violet-400" />
                  <span>Pull Remote Spec</span>
                </span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>
              <button onClick={gitPush}
                      className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <GitMerge className="h-4 w-4 text-indigo-400" />
                  <span>Push Local Commits</span>
                </span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>
              <button onClick={() => setShowResetModal(true)}
                      className="w-full py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 justify-center">
                <Trash2 className="h-4 w-4" />
                <span>Start From Scratch</span>
              </button>
            </div>
          </div>

          {/* Token Analytics */}
          <div className="glass-card rounded-2xl p-6 shadow-xl">
            <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Token Budget usage</span>
              <BarChart2 className="h-4 w-4 text-violet-400" />
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[11px] text-gray-450 mb-1 font-outfit">
                  <span>Daily quota consumed</span>
                  <span>{dailyUsedPercent}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full"
                       style={{ width: `${dailyUsedPercent}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                  <span>{state.token_metadata.daily_used.toLocaleString()} tkn</span>
                  <span>Limit: {state.token_metadata.daily_budget.toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t border-white/5 pt-3 flex justify-between items-center text-xs font-outfit">
                <span className="text-gray-400">Total Pipeline Used</span>
                <span className="text-violet-300 font-bold">{state.token_metadata.total_used.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace panel */}
        <div className="space-y-6 lg:col-span-3">
          {/* Tabs Navigation */}
          <div className="flex border-b border-white/5 space-x-6 text-sm font-semibold mb-6">
            <button onClick={() => setActiveTab('overview')} className={`pb-3 border-b-2 transition-all flex items-center space-x-1.5 ${activeTab === 'overview' ? 'border-violet-500 text-violet-400' : 'border-transparent text-gray-450 hover:text-gray-200'}`}>
              <FileText className="h-4 w-4" />
              <span>Project Vision</span>
            </button>
            <button onClick={() => setActiveTab('milestones')} className={`pb-3 border-b-2 transition-all flex items-center space-x-1.5 ${activeTab === 'milestones' ? 'border-violet-500 text-violet-400' : 'border-transparent text-gray-450 hover:text-gray-200'}`}>
              <ChevronRight className="h-4 w-4" />
              <span>Roadmap Editor</span>
            </button>
            <button onClick={() => setActiveTab('keys')} className={`pb-3 border-b-2 transition-all flex items-center space-x-1.5 ${activeTab === 'keys' ? 'border-violet-500 text-violet-400' : 'border-transparent text-gray-450 hover:text-gray-200'}`}>
              <Key className="h-4 w-4" />
              <span>API Credentials</span>
            </button>
            <button onClick={() => setActiveTab('git')} className={`pb-3 border-b-2 transition-all flex items-center space-x-1.5 ${activeTab === 'git' ? 'border-violet-500 text-violet-400' : 'border-transparent text-gray-450 hover:text-gray-200'}`}>
              <GitBranch className="h-4 w-4" />
              <span>Git Workspace</span>
            </button>
            <button onClick={() => setActiveTab('logs')} className={`pb-3 border-b-2 transition-all flex items-center space-x-1.5 ${activeTab === 'logs' ? 'border-violet-500 text-violet-400' : 'border-transparent text-gray-450 hover:text-gray-200'}`}>
              <Terminal className="h-4 w-4" />
              <span>Terminal output</span>
            </button>
          </div>

          {/* TAB CONTENT: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-4">
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
                  
                  <div className="flex space-x-2">
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

                {state.project.vision && (
                  <div className="mt-6 border-t border-white/5 pt-4">
                    <h4 className="text-sm font-semibold text-violet-300 mb-2">Product Vision Strategy</h4>
                    {isEditingSpecs ? (
                      <textarea value={editedProject?.vision || ''} rows={4}
                                onChange={e => setEditedProject(prev => prev ? { ...prev, vision: e.target.value } : null)}
                                className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" />
                    ) : (
                      <p className="text-gray-450 text-sm leading-relaxed">{state.project.vision}</p>
                    )}
                  </div>
                )}
              </div>

              {state.project.status !== 'idle' && editedSpecs && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Database Schema */}
                  <div className="glass-card rounded-2xl p-6 shadow-xl flex flex-col">
                    <h3 className="font-bold text-gray-250 mb-3 flex items-center space-x-2 text-sm">
                      <Database className="h-4 w-4 text-violet-400" />
                      <span>PostgreSQL Supabase Schema Spec</span>
                    </h3>
                    {isEditingSpecs ? (
                      <textarea value={editedSpecs.db_schema} rows={12}
                                onChange={e => setEditedSpecs(prev => prev ? { ...prev, db_schema: e.target.value } : null)}
                                className="w-full flex-1 code-font text-xs bg-black/40 border border-white/10 rounded-xl p-3 text-gray-300 outline-none" />
                    ) : (
                      <pre className="code-font text-[11px] text-gray-400 bg-black/40 p-4 rounded-xl max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed flex-1 border border-white/5" x-text="state.architecture.db_schema">{state.architecture.db_schema}</pre>
                    )}
                  </div>

                  {/* Folder layout spec */}
                  <div className="glass-card rounded-2xl p-6 shadow-xl flex flex-col">
                    <h3 className="font-bold text-gray-250 mb-3 flex items-center space-x-2 text-sm">
                      <FolderGit2 className="h-4 w-4 text-indigo-400" />
                      <span>Folder Structure Blueprint</span>
                    </h3>
                    {isEditingSpecs ? (
                      <textarea value={editedSpecs.folder_structure} rows={12}
                                onChange={e => setEditedSpecs(prev => prev ? { ...prev, folder_structure: e.target.value } : null)}
                                className="w-full flex-1 code-font text-xs bg-black/40 border border-white/10 rounded-xl p-3 text-gray-300 outline-none" />
                    ) : (
                      <pre className="code-font text-[11px] text-gray-400 bg-black/40 p-4 rounded-xl max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed flex-1 border border-white/5">{state.architecture.folder_structure}</pre>
                    )}
                  </div>

                  {/* Auth design */}
                  <div className="glass-card rounded-2xl p-6 shadow-xl flex flex-col md:col-span-2">
                    <h3 className="font-bold text-gray-255 mb-3 flex items-center space-x-2 text-sm">
                      <Settings className="h-4 w-4 text-violet-400" />
                      <span>Auth Flow Design & API Contracts</span>
                    </h3>
                    {isEditingSpecs ? (
                      <textarea value={editedSpecs.auth_design} rows={8}
                                onChange={e => setEditedSpecs(prev => prev ? { ...prev, auth_design: e.target.value } : null)}
                                className="w-full code-font text-xs bg-black/40 border border-white/10 rounded-xl p-3 text-gray-300 outline-none mb-4" />
                    ) : (
                      <pre className="code-font text-[11px] text-gray-400 bg-black/40 p-4 rounded-xl max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-white/5 mb-4">{state.architecture.auth_design}</pre>
                    )}
                  </div>
                </div>
              )}
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
                          <div key={task.id} className="group flex items-start justify-between p-3.5 bg-black/25 rounded-xl border border-white/5 hover:border-violet-500/20 transition-all">
                            <div className="flex items-start space-x-3">
                              <button onClick={() => toggleTaskStatus(task)} className="mt-0.5 outline-none">
                                {task.status === 'completed' ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-500 hover:text-violet-400" />
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

                            <div className="flex items-center space-x-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-800 text-gray-400 border-white/5'}`}>
                                {task.status}
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-2 transition-all">
                                <button onClick={() => {
                                  setSelectedMilestoneId(milestone.id);
                                  setEditingTask({ ...task });
                                  setShowTaskModal(true);
                                }} className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded">
                                  <Settings className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => deleteTask(milestone.id, task.id)} className="p-1 hover:bg-rose-500/20 text-gray-450 hover:text-rose-400 rounded">
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
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">General Platform Settings</h2>
                    <p className="text-xs text-gray-500 mt-1">Configure GitHub authentication tokens, user accounts details, and default deployment providers.</p>
                  </div>
                  <button onClick={saveEnvKeys}
                          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-violet-500/20">
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

              {/* Diff view */}
              {gitStatus.uncommitted_changes.length > 0 && (
                <div className="glass-card rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-250 text-sm">Workspace Diff Preview</h3>
                    <button onClick={fetchGitDiff} className="text-[10px] text-violet-400 font-semibold hover:underline">Refresh Diff</button>
                  </div>
                  <pre className="code-font text-[11px] text-gray-400 bg-black/40 p-4 rounded-xl max-h-80 overflow-y-auto whitespace-pre leading-relaxed border border-white/5">{gitDiff || 'No changes staged.'}</pre>
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
                    <div key={commit.sha} className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5 text-xs">
                      <div>
                        <span className="code-font bg-white/5 border border-white/10 text-violet-300 px-2 py-0.5 rounded font-medium">{commit.sha}</span>
                        <span className="text-gray-300 font-medium ml-2">{commit.message}</span>
                      </div>
                      <span className="text-gray-500 text-[10px] font-outfit">{commit.author} on {commit.date}</span>
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
        </div>
      </div>

      {/* Task Creation & Edit Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-card rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white/5" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Edit Task Specification</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Task ID</label>
                <input type="text" value={editingTask.id || ''} 
                       onChange={e => setEditingTask(prev => ({ ...prev, id: e.target.value }))}
                       className="w-full glass-input text-sm rounded-xl px-4 py-2 text-white outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Task Title</label>
                <input type="text" value={editingTask.name || ''} 
                       onChange={e => setEditingTask(prev => ({ ...prev, name: e.target.value }))}
                       className="w-full glass-input text-sm rounded-xl px-4 py-2 text-white outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Description</label>
                <textarea value={editingTask.description || ''} rows={3}
                          onChange={e => setEditingTask(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full glass-input text-sm rounded-xl px-4 py-2 text-white outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Target Files (comma-separated)</label>
                <input type="text" value={editingTask.files?.join(', ') || ''} 
                       onChange={e => setEditingTask(prev => ({ ...prev, files: e.target.value.split(',').map(s => s.trim()).filter(s => s) }))}
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
          <div className="glass-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-500/20" onClick={e => e.stopPropagation()}>
            <div className="flex items-center space-x-3 text-rose-450 mb-4">
              <AlertTriangle className="h-6 w-6 text-rose-400" />
              <h3 className="text-lg font-bold text-rose-400">Trigger Destructive Reset?</h3>
            </div>
            <p className="text-sm text-gray-405 leading-relaxed mb-6 font-outfit">
              This action will branch and archive the current workspace project files, clean up generated app files from main branch, and reset the spec backlog configuration. Agle execution run par naya candidate scoring aur design selection trigger ho jayega.
            </p>
            <div className="space-y-4 mb-6">
              <label className="text-xs font-semibold text-gray-400 block">Provide Reset Reason (optional)</label>
              <input type="text" value={resetReason} onChange={e => setResetReason(e.target.value)}
                     placeholder="e.g., target project pivot" 
                     className="w-full glass-input text-sm rounded-xl px-4 py-2.5 text-white outline-none" />
            </div>
            <div className="flex space-x-3 justify-end">
              <button onClick={() => setShowResetModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-semibold transition-all">Cancel</button>
              <button onClick={executeReset} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

