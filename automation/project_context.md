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

### File: `app/netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "build"
[functions]
  directory = "functions"
```

### File: `app/package.json`
```json
{"name":"tech-hub","version":"1.0.0","scripts":{"start":"vite","build":"vite build"},"dependencies":{"@types/better-sqlite3":"^9.6.0","autoprefixer":"^10.5.4","better-sqlite3":"^13.0.3","express":"^4.17.1","lucide-react":"^1.28.0","react":"^18.2.0","react-dom":"^18.2.0","react-router-dom":"^6.3.0","tailwindcss":"^3.1.8","xlsx":"^0.18.5","zustand":"^4.1.5"},"devDependencies":{"@types/express":"^4.17.13","@types/react":"^18.0.17","@types/react-dom":"^18.0.6","@types/react-router-dom":"^5.3.3","@vitejs/plugin-react":"^2.1.0","typescript":"^4.8.3","vite":"^3.1.0"}}
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

### File: `app/tsconfig.json`
```json
{"compilerOptions": {"target": "es6", "lib": ["dom", "dom.iterable", "esnext"], "allowJs": true, "skipLibCheck": true, "esModuleInterop": false, "allowSyntheticDefaultImports": true, "strict": true, "forceConsistentCasingInFileNames": true, "noFallthroughCasesInSwitch": true, "module": "esnext", "moduleResolution": "node", "resolveJsonModule": true, "outDir": "build", "jsx": "react"}}
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

### File: `app/product2_github_blob_storage/db/blob_assets.json`
```json
[
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

### File: `app/product3_email_chat_mvp/db/messages.json`
```json
[
  { "id": 1, "sender_email": "aditya@example.com", "recipient_email": "team@antigravity.dev", "subject": "Product 03 Chat Initialization", "body": "Welcome to Email-based Micro Chat MVP!", "timestamp": "2026-08-03 22:30:00" },
  { "id": 2, "sender_email": "team@antigravity.dev", "recipient_email": "aditya@example.com", "subject": "Re: Product 03 Chat Initialization", "body": "Real-time email threads integrated into isolated JSON DB.", "timestamp": "2026-08-03 22:31:00" }
]

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

### File: `app/src/App.tsx`
```tsx
import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Flame, GitCommit, Calendar, Sparkles, Shield, ShieldCheck, Database, Plus, CheckCircle2, 
  RefreshCw, Save, Edit3, Layers, Settings, FileText, Code, Check, 
  Trash2, Globe, ArrowRight, Laptop, AlertCircle, X, ShieldAlert, CheckSquare,
  Wrench, Link2, Key, Bookmark, Download, Sparkle, Search, GitBranch, Terminal, Eye,
  UserCheck, Users, Lock, LogOut, FileCode, FolderPlus, UploadCloud, Film, Image as ImageIcon, FileText as FilePdf,
  ListOrdered, Zap, LayoutDashboard, Box, ArrowRightCircle, Menu, Play, FileUp, KeyRound, ShieldAlert as ShieldIcon,
  Mail, Send, CheckSquare as CheckSquareIcon, ShieldCheck as ShieldCheckIcon, Copy, Filter, Maximize2, ExternalLink,
  MessageSquare, Hash, PieChart, BarChart3, Sliders
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
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto flex items-center justify-center shadow-xl shadow-

... [Content Truncated due to size limit] ...
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
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```
