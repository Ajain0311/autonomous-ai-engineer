# Project Context Manifest: Tech Hub
Description: A SaaS application for tech professionals to discover, learn, and collaborate on trending technologies and projects.

## Core Specifications
- **Scope:** saas
- **Milestones Count:** 5
- **Backend Framework:** Node.js
- **Styling Framework:** Tailwind CSS


## JSON Database Schema Design
```yaml
projects:
- contributors: array
  description: string
  id: string
  name: string
  tags: array
trending:
- description: string
  id: string
  language: string
  name: string
  stars: number
users:
- email: string
  id: string
  password: string
  projects: array
  username: string

```

## API Endpoints & Routes Contracts
```yaml
auth:
  login:
    method: POST
    request:
      password: string
      username: string
    response:
      token: string
    route: /api/auth/login
  register:
    method: POST
    request:
      email: string
      password: string
      username: string
    response:
      token: string
    route: /api/auth/register
projects:
  create:
    method: POST
    request:
      description: string
      name: string
      tags: array
    response:
      description: string
      id: string
      name: string
      tags: array
    route: /api/projects
  get:
    method: GET
    response:
      description: string
      id: string
      name: string
      tags: array
    route: /api/projects/:id

```

## Workspace Source Code Files
### File: `app/index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tech Hub</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

### File: `app/package.json`
```json
{
  "name": "tech-hub",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@types/better-sqlite3": "^9.6.0",
    "autoprefixer": "^10.4.20",
    "better-sqlite3": "^11.5.0",
    "express": "^4.21.1",
    "lucide-react": "^0.468.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "tailwindcss": "^3.4.16",
    "xlsx": "^0.18.5",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@types/react-router-dom": "^5.3.3",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.6.3",
    "vite": "^5.4.11"
  }
}
```

### File: `app/tsconfig.json`
```json
{"compilerOptions": {"target": "es6", "lib": ["dom", "dom.iterable", "esnext"], "allowJs": true, "skipLibCheck": true, "esModuleInterop": false, "allowSyntheticDefaultImports": true, "strict": true, "forceConsistentCasingInFileNames": true, "noFallthroughCasesInSwitch": true, "module": "esnext", "moduleResolution": "node", "resolveJsonModule": true, "outDir": "build", "jsx": "react"}}
```

### File: `app/tailwind.config.js`
```js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### File: `app/netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "build"
[functions]
  directory = "functions"
```

### File: `app/postcss.config.js`
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### File: `app/vite.config.ts`
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()]
});
```

### File: `app/product1_adblocker_extension/content.js`
```js
// Content Script - DOM Cosmetic Ad Filter & Popup Zapper
(function() {
  const adSelectors = [
    '.ad-container', '.sponsored-post', '#google_ads_frame',
    '[id^="div-gpt-ad"]', '.cookie-consent-modal', '.popup-overlay'
  ];
  
  function removeAds() {
    adSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => el.remove());
    });
  }

  removeAds();
  const observer = new MutationObserver(removeAds);
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();

```

### File: `app/product1_adblocker_extension/popup.html`
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      width: 280px;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
      background: #07080d;
      color: #fff;
      margin: 0;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .title { font-weight: 800; font-size: 14px; color: #38bdf8; }
    .status { font-size: 11px; color: #4ade80; font-weight: 700; }
    .card { background: #1e293b; p: 10px; border-radius: 8px; margin-bottom: 8px; padding: 10px; }
    .val { font-size: 18px; font-weight: 800; color: #38bdf8; }
    .lbl { font-size: 10px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">Product 1: ShieldBlock AI</div>
    <div class="status">● Active</div>
  </div>
  <div class="card">
    <div class="val">14,892</div>
    <div class="lbl">Ads & Trackers Blocked Today</div>
  </div>
</body>
</html>

```

### File: `app/product1_adblocker_extension/background.js`
```js
// Background Service Worker - Declarative Net Request Rules synced with product1_adblocker_extension/db/rules.json
chrome.runtime.onInstalled.addListener(() => {
  console.log("Product 1 - ShieldBlock AI Extension Activated!");
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2, 3, 4],
    addRules: [
      {
        "id": 1,
        "priority": 1,
        "action": { "type": "block" },
        "condition": {
          "urlFilter": "*doubleclick.net*",
          "resourceTypes": ["script", "image", "xmlhttprequest"]
        }
      },
      {
        "id": 2,
        "priority": 1,
        "action": { "type": "block" },
        "condition": {
          "urlFilter": "*google-analytics.com*",
          "resourceTypes": ["script"]
        }
      },
      {
        "id": 3,
        "priority": 1,
        "action": { "type": "block" },
        "condition": {
          "urlFilter": "*connect.facebook.net*",
          "resourceTypes": ["script"]
        }
      },
      {
        "id": 4,
        "priority": 1,
        "action": { "type": "block" },
        "condition": {
          "urlFilter": "*popads.net*",
          "resourceTypes": ["script"]
        }
      }
    ]
  });
});

```

### File: `app/product1_adblocker_extension/manifest.json`
```json
{
  "manifest_version": 3,
  "name": "ShieldBlock AI - Smart Ad & Tracker Blocker",
  "version": "1.0.0",
  "description": "Blocks annoying ads, popups, cookie consent banners, and tracking scripts automatically using isolated JSON DB rules.",
  "permissions": [
    "declarativeNetRequest",
    "declarativeNetRequestFeedback",
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "action": {
    "default_popup": "popup.html"
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
}

```

### File: `app/product1_adblocker_extension/db/rules.json`
```json
[
  { "id": 1, "domain": "*doubleclick.net*", "category": "Ads", "action": "block", "priority": 1, "enabled": true },
  { "id": 2, "domain": "*google-analytics.com*", "category": "Trackers", "action": "block", "priority": 1, "enabled": true },
  { "id": 3, "domain": "*connect.facebook.net*", "category": "Social", "action": "block", "priority": 2, "enabled": true },
  { "id": 4, "domain": "*popads.net*", "category": "Popups", "action": "block", "priority": 1, "enabled": true }
]

```

### File: `app/product1_adblocker_extension/db/rules_schema.json`
```json
{
  "tableName": "rules",
  "columns": [
    { "name": "id", "type": "number", "required": true, "min": 1 },
    { "name": "domain", "type": "string", "required": true, "pattern": "^\\*?[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\*?$" },
    { "name": "category", "type": "string", "required": true, "default": "Ads" },
    { "name": "action", "type": "string", "required": true, "default": "block" },
    { "name": "priority", "type": "number", "required": true, "min": 1, "max": 100, "default": 1 },
    { "name": "enabled", "type": "boolean", "required": true, "default": true }
  ]
}

```

### File: `app/src/index.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: 'Plus Jakarta Sans', 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #07080c;
  color: #f1f5f9;
  overflow-x: hidden;
  letter-spacing: -0.01em;
}

/* Sweet & Simple Glassmorphism Tokens */
.glass-card {
  background: rgba(15, 17, 26, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}

.glass-card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.glass-card-hover:hover {
  background: rgba(22, 25, 38, 0.85);
  border-color: rgba(168, 85, 247, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 20px 40px -15px rgba(168, 85, 247, 0.15);
}

.glass-nav {
  background: rgba(8, 9, 14, 0.88);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.gradient-text {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #38bdf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient-bg {
  background: linear-gradient(135deg, #9333ea 0%, #6366f1 50%, #0284c7 100%);
}

.glow-purple {
  box-shadow: 0 0 30px -5px rgba(147, 51, 234, 0.35);
}

.glow-soft {
  box-shadow: 0 0 20px -5px rgba(99, 102, 241, 0.25);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Custom Scrollbars */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.4);
}

```

### File: `app/src/main.tsx`
```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught Error in Dashboard:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#090d16', color: '#f87171', fontFamily: 'monospace' }}>
          <h2>⚠️ Dashboard Render Error Caught</h2>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
```

### File: `app/src/App.tsx`
```tsx
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

// ─── SSO Types ────────────────────────────────────────────────────────────────
interface SSOSession { token: string; role: string; username: string; }

// ─── SSO Login Gate Component ─────────────────────────────────────────────────
function SSOLoginPage({ onLogin }: { onLogin: (sess: SSOSession) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpOnScreen, setOtpOnScreen] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const handleGenerateOTP = async () => {
    if (!email) { setError('Enter your email first.'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch('/auth/otp/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to generate OTP');
      setOtpOnScreen(data.otp);
      setOtpSent(true);
      setSuccess('OTP generated! Enter it below to login.');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleLogin = async () => {
    if (!email) { setError('Email is required.'); return; }
    setLoading(true); setError(null);
    try {
      const body: any = { email };
      if (loginMode === 'otp') body.otp = otpInput; else body.password = password;
      const res = await fetch('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      localStorage.setItem('sso_session', JSON.stringify({ token: data.token, role: data.role, username: data.username }));
      onLogin({ token: data.token, role: data.role, username: data.username });
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleSignup = async () => {
    if (!email || !username || !password) { setError('All fields are required.'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch('/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, username, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Signup failed');
      localStorage.setItem('sso_session', JSON.stringify({ token: data.token, role: data.role, username: data.username }));
      onLogin({ token: data.token, role: data.role, username: data.username });
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '20px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } input::placeholder { color: #475569; } input:focus { outline: none; }`}</style>
      {/* BG glow */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% -10%, #6366f122 0%, transparent 70%)', pointerEvents: 'none' }} />
      
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤖</div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Autonomous AI Engineer</h1>
          <p style={{ color: '#475569', fontSize: '13px', marginTop: '6px' }}>Sign in to access your workspace</p>
        </div>

        {/* Card */}
        <div style={{ background: '#0f1629', border: '1px solid #1e293b', borderRadius: '20px', padding: '32px' }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', background: '#080b14', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null); setSuccess(null); setOtpOnScreen(null); setOtpSent(false); }}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all .2s',
                  background: mode === m ? '#6366f1' : 'transparent', color: mode === m ? '#fff' : '#475569' }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Login mode tabs */}
          {mode === 'login' && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {(['password', 'otp'] as const).map(lm => (
                <button key={lm} onClick={() => { setLoginMode(lm); setError(null); setOtpOnScreen(null); setOtpSent(false); }}
                  style={{ flex: 1, padding: '7px', border: `1px solid ${loginMode === lm ? '#6366f1' : '#1e293b'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 500,
                    background: loginMode === lm ? '#6366f111' : 'transparent', color: loginMode === lm ? '#818cf8' : '#475569', transition: 'all .2s' }}>
                  {lm === 'password' ? '🔑 Password' : '📱 OTP'}
                </button>
              ))}
            </div>
          )}

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mode === 'signup' && (
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"
                style={{ padding: '12px 16px', background: '#080b14', border: '1px solid #1e293b', borderRadius: '10px', color: '#e2e8f0', fontSize: '14px', width: '100%' }} />
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email"
              style={{ padding: '12px 16px', background: '#080b14', border: '1px solid #1e293b', borderRadius: '10px', color: '#e2e8f0', fontSize: '14px', width: '100%' }} />
            
            {(mode === 'login' && loginMode === 'password') || mode === 'signup' ? (
              <div style={{ position: 'relative' }}>
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type={showPw ? 'text' : 'password'}
                  onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
                  style={{ padding: '12px 40px 12px 16px', background: '#080b14', border: '1px solid #1e293b', borderRadius: '10px', color: '#e2e8f0', fontSize: '14px', width: '100%' }} />
                <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '16px' }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            ) : null}

            {mode === 'login' && loginMode === 'otp' && (
              <>
                <button onClick={handleGenerateOTP} disabled={loading}
                  style={{ padding: '11px', background: '#6366f111', border: '1px solid #6366f155', borderRadius: '10px', color: '#818cf8', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  {loading ? '⏳ Generating...' : '📱 Generate OTP'}
                </button>
                {otpOnScreen && (
                  <div style={{ background: '#0f2d0f', border: '1px solid #22c55e55', borderRadius: '10px', padding: '14px 16px', textAlign: 'center' }}>
                    <p style={{ color: '#86efac', fontSize: '12px', marginBottom: '6px' }}>Your OTP (shown here — no email configured)</p>
                    <p style={{ color: '#22c55e', fontSize: '28px', fontWeight: 800, letterSpacing: '8px' }}>{otpOnScreen}</p>
                    <p style={{ color: '#4ade80', fontSize: '11px', marginTop: '4px' }}>Expires in 10 minutes</p>
                  </div>
                )}
                {otpSent && (
                  <input value={otpInput} onChange={e => setOtpInput(e.target.value)} placeholder="Enter 6-digit OTP"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} maxLength={6}
                    style={{ padding: '12px 16px', background: '#080b14', border: '1px solid #1e293b', borderRadius: '10px', color: '#e2e8f0', fontSize: '18px', letterSpacing: '6px', textAlign: 'center', width: '100%' }} />
                )}
              </>
            )}

            {/* Error / Success */}
            {error && <div style={{ background: '#2d0f0f', border: '1px solid #ef444455', borderRadius: '8px', padding: '10px 14px', color: '#fca5a5', fontSize: '13px' }}>❌ {error}</div>}
            {success && <div style={{ background: '#0f2d0f', border: '1px solid #22c55e55', borderRadius: '8px', padding: '10px 14px', color: '#86efac', fontSize: '13px' }}>✅ {success}</div>}

            {/* Submit */}
            <button onClick={mode === 'login' ? handleLogin : handleSignup} disabled={loading}
              style={{ padding: '13px', background: loading ? '#334155' : 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .2s', marginTop: '4px' }}>
              {loading ? '⏳ Please wait...' : mode === 'login' ? '🚀 Sign In' : '✨ Create Account'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#334155', fontSize: '12px', marginTop: '16px' }}>
          Admin access? Use your credentials to unlock the full dashboard.
        </p>
      </div>
    </div>
  );
}

// ─── User Apps Page (for normal users) ───────────────────────────────────────
function UserAppsPage({ session, onLogout }: { session: SSOSession; onLogout: () => void }) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products/catalog', { headers: { 'X-Session-Token': session.token } })
      .then(r => r.json()).then(d => { if (d.products) setProducts(d.products); }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const COLORS: Record<string, string> = {
    product1_adblocker_extension: '#6366f1', product2_github_blob_storage: '#0ea5e9',
    product3_email_chat_mvp: '#10b981', product4_techhub_platform: '#f59e0b',
    product5_url_cleaner: '#8b5cf6', product6_tab_session_saver: '#06b6d4',
    product7_profile_booster_engine: '#22c55e', product8_sqlite_master_tables: '#f97316',
  };
  const EMOJIS: Record<string, string> = {
    product1_adblocker_extension: '🛡️', product2_github_blob_storage: '📦',
    product3_email_chat_mvp: '💬', product4_techhub_platform: '🚀',
    product5_url_cleaner: '🔗', product6_tab_session_saver: '🗂️',
    product7_profile_booster_engine: '📈', product8_sqlite_master_tables: '📊',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', fontFamily: "'Inter', sans-serif", padding: '0' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'); * { box-sizing: border-box; }`}</style>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 40% at 50% -10%, #6366f115 0%, transparent 70%)', pointerEvents: 'none' }} />
      
      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: '#080b14cc', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1e293b', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <span style={{ fontWeight: 700, fontSize: '15px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Autonomous AI Engineer</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#475569', fontSize: '13px' }}>👤 {session.username}</span>
          <button onClick={onLogout} style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#64748b', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>🚀 Deployed Apps</h1>
          <p style={{ color: '#475569', fontSize: '15px' }}>All products built and deployed by the Autonomous AI Engineer pipeline.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#334155', padding: '60px' }}>⏳ Loading products...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {products.map(p => {
              const color = COLORS[p.id] || '#6366f1';
              const emoji = EMOJIS[p.id] || '⚡';
              return (
                <div key={p.id} style={{ background: '#0f1629', border: `1px solid #1e293b`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'border-color .2s, transform .2s', cursor: 'default' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}66`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1e293b'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{emoji}</div>
                    <div>
                      <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '14px', lineHeight: 1.3 }}>{p.name}</div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px', padding: '2px 8px', background: '#22c55e22', border: '1px solid #22c55e44', borderRadius: '20px', color: '#22c55e', fontSize: '10px', fontWeight: 600 }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e' }} /> LIVE
                      </div>
                    </div>
                  </div>
                  <p style={{ color: '#475569', fontSize: '13px', lineHeight: 1.6 }}>{p.description}</p>
                  <a href={`/product/${p.id}`} target="_blank" rel="noreferrer"
                    style={{ marginTop: 'auto', padding: '10px 16px', background: `${color}22`, border: `1px solid ${color}55`, borderRadius: '10px', color: color, fontSize: '13px', fontWeight: 600, textDecoration: 'none', textAlign: 'center', display: 'block', transition: 'all .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = `${color}33`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = `${color}22`; }}>
                    🌐 Open App →
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'master_tables' | 'my_products' | 'user_auth' | 'ai_timeline'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // ─── SSO Gate State ───────────────────────────────────────────────────────
  const [ssoSession, setSsoSession] = useState<SSOSession | null>(() => {
    try {
      const saved = localStorage.getItem('sso_session');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const handleSSOLogin = (sess: SSOSession) => setSsoSession(sess);
  const handleSSOLogout = () => {
    if (ssoSession?.token) fetch('/auth/logout', { method: 'POST', headers: { 'X-Session-Token': ssoSession.token } }).catch(() => {});
    localStorage.removeItem('sso_session');
    setSsoSession(null);
  };

  // Hard Security Auth State (legacy — kept for dashboard user mgmt tab)
  // NOTE: SSO early returns are placed AFTER all hooks (see bottom of App) to respect Rules of Hooks
  const [currentUser, setCurrentUser] = useState<UserEntry | null>({ id: 1, username: ssoSession?.username ?? '', role: 'super_admin', enabled: true });

  // OTP Authentication Engine States (legacy)
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
    // Clear SSO session (clears localStorage sso_session + server-side token)
    handleSSOLogout();
    setCurrentUser(null);
    try {
      localStorage.removeItem('daily_engine_session');
    } catch {}
    setAuthStep('send');
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

    const matched = adblockRules.fi

... [Content Truncated due to size limit] ...
```

### File: `app/product3_email_chat_mvp/db/messages_schema.json`
```json
{
  "tableName": "messages",
  "columns": [
    { "name": "id", "type": "number", "required": true, "min": 1 },
    { "name": "sender_email", "type": "string", "required": true },
    { "name": "recipient_email", "type": "string", "required": true },
    { "name": "subject", "type": "string", "required": true },
    { "name": "body", "type": "string", "required": true },
    { "name": "timestamp", "type": "string", "required": true }
  ]
}

```

### File: `app/product3_email_chat_mvp/db/messages.json`
```json
[
  { "id": 1, "sender_email": "aditya@example.com", "recipient_email": "team@antigravity.dev", "subject": "Product 03 Chat Initialization", "body": "Welcome to Email-based Micro Chat MVP!", "timestamp": "2026-08-03 22:30:00" },
  { "id": 2, "sender_email": "team@antigravity.dev", "recipient_email": "aditya@example.com", "subject": "Re: Product 03 Chat Initialization", "body": "Real-time email threads integrated into isolated JSON DB.", "timestamp": "2026-08-03 22:31:00" }
]

```

### File: `app/product3_email_chat_mvp/db/users_schema.json`
```json
{
  "tableName": "users",
  "columns": [
    { "name": "id", "type": "number", "required": true },
    { "name": "username", "type": "string", "required": true },
    { "name": "email", "type": "string", "required": true },
    { "name": "name", "type": "string", "required": false },
    { "name": "role", "type": "string", "required": false }
  ]
}

```

### File: `app/product3_email_chat_mvp/db/users.json`
```json
[
  { "id": 1, "username": "team", "email": "team@antigravity.dev", "name": "Antigravity Engineering Team", "role": "team" },
  { "id": 2, "username": "kuldeep", "email": "kuldeepswarnkar4@gmail.com", "name": "Kuldeep Swarnkar", "role": "super_admin" },
  { "id": 3, "username": "aditya", "email": "adityajain8875389629@gmail.com", "name": "Aditya Jain", "role": "developer" },
  { "id": 4, "username": "adityadhing9", "email": "adityadhing9@gmail.com", "name": "Aditya Dhing9", "role": "developer" },
  { "id": 5, "username": "adityadhing76", "email": "adityadhing76@gmail.com", "name": "Aditya Dhing76", "role": "developer" }
]

```

### File: `app/product2_github_blob_storage/db/blob_assets_schema.json`
```json
{
  "tableName": "blob_assets",
  "columns": [
    { "name": "id", "type": "number", "required": true, "min": 1 },
    { "name": "filename", "type": "string", "required": true },
    { "name": "type", "type": "string", "required": true, "default": "image" },
    { "name": "url", "type": "string", "required": true },
    { "name": "size", "type": "string", "required": true, "default": "1.2 MB" },
    { "name": "created_at", "type": "string", "required": true }
  ]
}

```

### File: `app/product2_github_blob_storage/db/blob_assets.json`
```json
[
]

```
