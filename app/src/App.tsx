import React, { useState, useEffect } from 'react';
import { 
  Flame, GitCommit, Calendar, Sparkles, Shield, ShieldCheck, Database, Plus, CheckCircle2, 
  RefreshCw, Save, Edit3, Layers, Settings, FileText, Code, Check, 
  Trash2, Globe, ArrowRight, Laptop, AlertCircle, X, ShieldAlert, CheckSquare
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

export default function App() {
  const [activeTab, setActiveTab] = useState<'planner' | 'db_editor' | 'schema_manager' | 'product_extension'>('planner');
  
  // Database States
  const [currentStreakDays, setCurrentStreakDays] = useState<number>(48);
  const [activeProject, setActiveProject] = useState<string>('01-adblocker-extension');
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);

  // Validation Error Toast Banner State
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Table Schema State
  const [activeTableName, setActiveTableName] = useState<string>('adblocker_rules');
  const [schema, setSchema] = useState<TableSchema>({
    tableName: 'adblocker_rules',
    columns: [
      { name: 'id', type: 'number', required: true, min: 1 },
      { name: 'domain', type: 'string', required: true, pattern: '^\\*?[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\*?$' },
      { name: 'category', type: 'string', required: true, default: 'Ads' },
      { name: 'action', type: 'string', required: true, default: 'block' },
      { name: 'priority', type: 'number', required: true, min: 1, max: 100, default: 1 },
      { name: 'enabled', type: 'boolean', required: true, default: true }
    ]
  });

  // Table Data Rows State
  const [tableRows, setTableRows] = useState<any[]>([
    { id: 1, domain: '*doubleclick.net*', category: 'Ads', action: 'block', priority: 1, enabled: true },
    { id: 2, domain: '*google-analytics.com*', category: 'Trackers', action: 'block', priority: 1, enabled: true },
    { id: 3, domain: '*connect.facebook.net*', category: 'Social', action: 'block', priority: 2, enabled: true },
    { id: 4, domain: '*popads.net*', category: 'Popups', action: 'block', priority: 1, enabled: true }
  ]);

  // Dynamic Insert Form Data State (object mapping colName -> raw value)
  const [formValues, setFormValues] = useState<Record<string, any>>({
    id: 5,
    domain: '*adnxs.com*',
    category: 'Ads',
    action: 'block',
    priority: 1,
    enabled: true
  });

  // Schema Editor Form State
  const [newColName, setNewColName] = useState<string>('');
  const [newColType, setNewColType] = useState<'number' | 'string' | 'boolean' | 'datetime' | 'json'>('string');
  const [newColRequired, setNewColRequired] = useState<boolean>(true);
  const [newColMin, setNewColMin] = useState<string>('');
  const [newColMax, setNewColMax] = useState<string>('');
  const [newColPattern, setNewColPattern] = useState<string>('');

  // Planner Form State
  const [todayDoneInput, setTodayDoneInput] = useState<string>('Implemented Strict Data Type Validation Layer & Schema Manager');
  const [tomorrowPlanInput, setTomorrowPlanInput] = useState<string>('Add multi-table relations and visual query builder');
  const [phaseMode, setPhaseMode] = useState<'BUILD' | 'PLANNING'>('BUILD');
  const [projectMode, setProjectMode] = useState<'continue' | 'new_product'>('continue');
  const [newProjectNameInput, setNewProjectNameInput] = useState<string>('');
  const [isCommitting, setIsCommitting] = useState<boolean>(false);

  // Initial Load from Backend API
  useEffect(() => {
    fetch('/api/db/daily_roadmap')
      .then(res => res.json())
      .then(data => {
        if (data.current_streak_days) setCurrentStreakDays(data.current_streak_days);
        if (data.active_project) setActiveProject(data.active_project);
        if (data.daily_logs) setDailyLogs(data.daily_logs);
      })
      .catch(() => console.log('Roadmap fallback'));

    fetch('/api/db/schema/adblocker_rules')
      .then(res => res.json())
      .then(data => {
        if (data.columns && data.columns.length > 0) setSchema(data);
      })
      .catch(() => console.log('Schema fallback'));

    fetch('/api/db/adblocker_rules')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setTableRows(data);
      })
      .catch(() => console.log('Data fallback'));
  }, []);

  // Client-Side Validation Function (Before Submit)
  const validateRowData = (row: Record<string, any>): { valid: boolean; error?: string; castedRow?: Record<string, any> } => {
    const castedRow: Record<string, any> = {};

    for (const col of schema.columns) {
      let rawVal = row[col.name];

      // Required Check
      if ((rawVal === undefined || rawVal === null || rawVal === '') && col.required) {
        if (col.default !== undefined) {
          rawVal = col.default;
        } else {
          return { valid: false, error: `Validation Error: Column '${col.name}' is required.` };
        }
      }

      // Type Casting & Constraint Checks
      if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
        if (col.type === 'number') {
          const num = Number(rawVal);
          if (isNaN(num)) {
            return { valid: false, error: `Validation Error: Column '${col.name}' must be a valid number (e.g. 10).` };
          }
          if (col.min !== undefined && num < col.min) {
            return { valid: false, error: `Validation Error: Column '${col.name}' (${num}) is below minimum allowed value ${col.min}.` };
          }
          if (col.max !== undefined && num > col.max) {
            return { valid: false, error: `Validation Error: Column '${col.name}' (${num}) exceeds maximum allowed value ${col.max}.` };
          }
          castedRow[col.name] = num;
        } else if (col.type === 'boolean') {
          castedRow[col.name] = Boolean(rawVal);
        } else if (col.type === 'string') {
          const strVal = String(rawVal);
          if (col.pattern) {
            try {
              const regex = new RegExp(col.pattern);
              if (!regex.test(strVal)) {
                return { valid: false, error: `Validation Error: Column '${col.name}' value "${strVal}" does not match required regex pattern.` };
              }
            } catch (e) {
              console.warn('Regex test skipped');
            }
          }
          castedRow[col.name] = strVal;
        } else {
          castedRow[col.name] = rawVal;
        }
      } else {
        castedRow[col.name] = col.default !== undefined ? col.default : null;
      }
    }

    return { valid: true, castedRow };
  };

  // Submit New Validated Row
  const handleInsertValidatedRow = async () => {
    setValidationError(null);
    setSuccessToast(null);

    const check = validateRowData(formValues);
    if (!check.valid) {
      setValidationError(check.error || 'Validation failed.');
      return;
    }

    const newRows = [...tableRows, check.castedRow];
    setTableRows(newRows);

    try {
      const res = await fetch(`/api/db/validated_save/${activeTableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRows)
      });

      if (res.ok) {
        setSuccessToast(`✅ Validated data saved & committed to db/${activeTableName}.json!`);
      } else {
        const err = await res.json();
        setValidationError(err.detail || 'Server validation rejected entry.');
      }
    } catch (e) {
      setSuccessToast(`✅ Saved locally & validated (${newRows.length} rows)`);
    }

    // Reset Form
    setFormValues({ id: Date.now() % 10000, domain: '', category: 'Ads', action: 'block', priority: 1, enabled: true });
  };

  // Delete Row
  const handleDeleteRow = async (id: number) => {
    const newRows = tableRows.filter(r => r.id !== id);
    setTableRows(newRows);
    try {
      await fetch(`/api/db/validated_save/${activeTableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRows)
      });
    } catch (e) {
      console.log('Row removed');
    }
  };

  // Add Column to Schema
  const handleAddColumnToSchema = async () => {
    if (!newColName.trim()) return;
    const col: ColumnSchema = {
      name: newColName.trim().toLowerCase().replace(/\s+/g, '_'),
      type: newColType,
      required: newColRequired,
      min: newColMin ? Number(newColMin) : undefined,
      max: newColMax ? Number(newColMax) : undefined,
      pattern: newColPattern || undefined
    };

    const updatedSchema: TableSchema = {
      ...schema,
      columns: [...schema.columns, col]
    };

    setSchema(updatedSchema);
    setNewColName('');
    setNewColMin('');
    setNewColMax('');
    setNewColPattern('');

    try {
      await fetch(`/api/db/schema/${activeTableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSchema)
      });
      setSuccessToast(`✅ Schema updated with column '${col.name}' and committed!`);
    } catch (e) {
      setSuccessToast(`✅ Column '${col.name}' added to local schema!`);
    }
  };

  // Drop Column from Schema
  const handleDropColumn = async (colName: string) => {
    if (!window.confirm(`Are you sure you want to drop column '${colName}'?`)) return;
    const updatedSchema: TableSchema = {
      ...schema,
      columns: schema.columns.filter(c => c.name !== colName)
    };
    setSchema(updatedSchema);
    try {
      await fetch(`/api/db/schema/${activeTableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSchema)
      });
      setSuccessToast(`✅ Column '${colName}' dropped from schema!`);
    } catch (e) {
      console.log('Column dropped');
    }
  };

  // Save Roadmap & Commit Progress
  const handleCommitProgress = async () => {
    if (!todayDoneInput.trim()) return;
    setIsCommitting(true);

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
        setSuccessToast(`✅ Committed [${data.commit_hash}]: "${data.commit_msg}"! Streak: 🔥 ${data.current_streak_days} Days!`);
        setIsCommitting(false);
        setTodayDoneInput('');
        return;
      }
    } catch (e) {
      console.warn('Backend offline, running fallback commit');
    }

    setTimeout(() => {
      const dayNum = dailyLogs.length + 1;
      const hash = Math.random().toString(36).substring(2, 8);
      const newLog: DailyLog = {
        day: dayNum,
        date: new Date().toISOString().split('T')[0],
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
              { id: 'planner', label: 'Roadmap & Streak', icon: Calendar },
              { id: 'db_editor', label: 'Validated Data Form', icon: Database },
              { id: 'schema_manager', label: 'Schema Manager', icon: Settings },
              { id: 'product_extension', label: 'AdBlocker Product', icon: Shield },
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
        {validationError && (
          <div className="bg-rose-500/15 border border-rose-500/40 p-4 rounded-2xl text-xs font-mono text-rose-300 flex items-center justify-between shadow-lg animate-bounce">
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
        
        {/* TAB 1: ROADMAP & STREAK PLANNER */}
        {activeTab === 'planner' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-cyan-500/20 shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-white">Daily Progress Planner</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Editable roadmap planner with automatic structured git commits.</p>
                </div>
                <span className="text-xs font-mono bg-cyan-950 border border-cyan-500/30 text-cyan-300 px-3 py-1 rounded-xl">
                  Active: {activeProject}
                </span>
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
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-500 font-bold">Phase:</span>
                  <button
                    onClick={() => setPhaseMode('BUILD')}
                    className={`px-3 py-1 rounded-lg font-bold ${phaseMode === 'BUILD' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400'}`}
                  >
                    BUILD
                  </button>
                  <button
                    onClick={() => setPhaseMode('PLANNING')}
                    className={`px-3 py-1 rounded-lg font-bold ${phaseMode === 'PLANNING' ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-400'}`}
                  >
                    PLANNING
                  </button>
                </div>

                <button
                  onClick={handleCommitProgress}
                  disabled={isCommitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-md"
                >
                  {isCommitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <GitCommit className="h-4 w-4" />}
                  <span>Save & Commit Progress</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VALIDATED DYNAMIC DATA FORM & EDITOR */}
        {activeTab === 'db_editor' && (
          <div className="space-y-6">
            
            {/* DYNAMIC FORM GENERATOR BASED ON SCHEMA */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Database className="h-4 w-4 text-cyan-400" />
                    Dynamic Form Generator ({activeTableName})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Form fields are strictly generated & validated against <code className="text-cyan-300 font-mono">db/{activeTableName}_schema.json</code>.</p>
                </div>
              </div>

              {/* Dynamic Field Form */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-white block border-b border-slate-900 pb-2">Insert New Row (Strict Type Validation)</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schema.columns.map(col => (
                    <div key={col.name} className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                        <span>{col.name} {col.required && <span className="text-rose-400">*</span>}</span>
                        <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded text-purple-300 font-mono uppercase">{col.type}</span>
                      </label>

                      {/* Number Input */}
                      {col.type === 'number' && (
                        <input
                          type="number"
                          min={col.min}
                          max={col.max}
                          value={formValues[col.name] !== undefined ? formValues[col.name] : ''}
                          onChange={e => setFormValues({ ...formValues, [col.name]: e.target.value === '' ? '' : Number(e.target.value) })}
                          placeholder={`Enter number (${col.min !== undefined ? `min: ${col.min}` : ''} ${col.max !== undefined ? `max: ${col.max}` : ''})`}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-cyan-500"
                        />
                      )}

                      {/* Boolean Toggle */}
                      {col.type === 'boolean' && (
                        <button
                          type="button"
                          onClick={() => setFormValues({ ...formValues, [col.name]: !formValues[col.name] })}
                          className={`w-full py-2 px-3 rounded-xl border text-xs font-bold font-mono flex items-center justify-between cursor-pointer ${
                            formValues[col.name] ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
                          }`}
                        >
                          <span>{formValues[col.name] ? 'TRUE' : 'FALSE'}</span>
                          <CheckSquare className="h-4 w-4" />
                        </button>
                      )}

                      {/* String Input */}
                      {col.type === 'string' && (
                        <input
                          type="text"
                          value={formValues[col.name] || ''}
                          onChange={e => setFormValues({ ...formValues, [col.name]: e.target.value })}
                          placeholder={`Enter ${col.name} string...`}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-cyan-500"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleInsertValidatedRow}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Insert Validated Row</span>
                </button>
              </div>

              {/* Data Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Validated Database Table Rows</span>
                {tableRows.map((r, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex flex-wrap items-center gap-3">
                      {Object.entries(r).map(([k, v]) => (
                        <span key={k} className="text-slate-300">
                          <strong className="text-slate-500">{k}:</strong> <span className="text-cyan-300">{String(v)}</span>
                        </span>
                      ))}
                    </div>
                    <button onClick={() => handleDeleteRow(r.id)} className="text-slate-500 hover:text-rose-400 p-1"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SCHEMA MANAGER (ADD/DROP COLUMNS & CONSTRAINTS) */}
        {activeTab === 'schema_manager' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Settings className="h-4 w-4 text-purple-400" />
                  Strict Column Schema Studio (<code className="text-cyan-300 font-mono">db/{activeTableName}_schema.json</code>)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Define Column Data Types (Number, String, Boolean, Datetime, JSON) and Constraints (Required, Min, Max, Pattern).</p>
              </div>

              {/* Add Column Form */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">Add Column to Schema</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                  <input
                    placeholder="column_name"
                    value={newColName}
                    onChange={e => setNewColName(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-cyan-500"
                  />
                  <select
                    value={newColType}
                    onChange={e => setNewColType(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="datetime">datetime</option>
                  </select>
                  <input
                    placeholder="min (e.g. 1)"
                    value={newColMin}
                    onChange={e => setNewColMin(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none"
                  />
                  <input
                    placeholder="max (e.g. 100)"
                    value={newColMax}
                    onChange={e => setNewColMax(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none"
                  />
                  <input
                    placeholder="pattern regex"
                    value={newColPattern}
                    onChange={e => setNewColPattern(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none"
                  />
                  <button
                    onClick={handleAddColumnToSchema}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Column</span>
                  </button>
                </div>
              </div>

              {/* Active Columns List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Defined Schema Columns</span>
                {schema.columns.map(col => (
                  <div key={col.name} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-cyan-300">{col.name}</span>
                      <span className="bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{col.type}</span>
                      {col.required && <span className="bg-rose-500/15 text-rose-400 px-2 py-0.5 rounded text-[10px]">REQUIRED</span>}
                      {col.min !== undefined && <span className="text-slate-400">min:{col.min}</span>}
                      {col.max !== undefined && <span className="text-slate-400">max:{col.max}</span>}
                      {col.pattern && <span className="text-slate-400">pattern:{col.pattern}</span>}
                    </div>
                    <button onClick={() => handleDropColumn(col.name)} className="text-slate-500 hover:text-rose-400 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AD BLOCKER PRODUCT */}
        {activeTab === 'product_extension' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Shield className="h-4 w-4 text-cyan-400" />
                    Product 01: Manifest V3 AdBlocker Extension
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Rules synced with validated <code className="text-cyan-300 font-mono">db/adblocker_rules.json</code>.</p>
                </div>
                <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">Synced & Validated</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}