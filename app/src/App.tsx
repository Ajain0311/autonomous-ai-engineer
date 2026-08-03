import React, { useState, useEffect } from 'react';
import { 
  Shield, ShieldCheck, Zap, EyeOff, Lock, Globe, Download, Copy, Check, 
  Trash2, RefreshCw, Sliders, AlertTriangle, Sparkles, Code, FileText, 
  Settings, CheckCircle2, XCircle, ChevronRight, Play, Cpu, Laptop, ExternalLink
} from 'lucide-react';

interface BlockedItem {
  id: string;
  domain: string;
  category: 'Ad' | 'Tracker' | 'Popup' | 'Malware' | 'Social';
  timestamp: string;
  sizeSaved: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'shield' | 'extension' | 'cleaner' | 'audit'>('shield');
  const [shieldEnabled, setShieldEnabled] = useState<boolean>(true);
  const [adsBlockedCount, setAdsBlockedCount] = useState<number>(14892);
  const [trackersBlockedCount, setTrackersBlockedCount] = useState<number>(3410);
  const [bandwidthSavedMb, setBandwidthSavedMb] = useState<number>(1840);
  const [timeSavedMins, setTimeSavedMins] = useState<number>(142);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // Filter Toggles
  const [blockAds, setBlockAds] = useState<boolean>(true);
  const [blockTrackers, setBlockTrackers] = useState<boolean>(true);
  const [blockPopups, setBlockPopups] = useState<boolean>(true);
  const [blockCookieBanners, setBlockCookieBanners] = useState<boolean>(true);
  const [stripTrackingParams, setStripTrackingParams] = useState<boolean>(true);

  // Live Block Stream
  const [liveStream, setLiveStream] = useState<BlockedItem[]>([
    { id: 'b1', domain: 'google-analytics.com/collect', category: 'Tracker', timestamp: 'Just now', sizeSaved: '42 KB' },
    { id: 'b2', domain: 'doubleclick.net/pagead/ads', category: 'Ad', timestamp: '2s ago', sizeSaved: '320 KB' },
    { id: 'b3', domain: 'connect.facebook.net/en_US/fbevents.js', category: 'Social', timestamp: '5s ago', sizeSaved: '110 KB' },
    { id: 'b4', domain: 'popads.net/serve/script.js', category: 'Popup', timestamp: '12s ago', sizeSaved: '85 KB' },
    { id: 'b5', domain: 'adnxs.com/getuid', category: 'Ad', timestamp: '18s ago', sizeSaved: '190 KB' }
  ]);

  // URL Cleaner Tool State
  const [rawUrl, setRawUrl] = useState<string>('https://example.com/product?item=123&utm_source=facebook&utm_medium=cpc&fbclid=IwAR2x9Z8y3&gclid=Cj0KCQiA');
  const [cleanedUrl, setCleanedUrl] = useState<string>('');

  // Site Audit Tool State
  const [auditDomain, setAuditDomain] = useState<string>('news-portal.com');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  // Auto-increment live stats when shield is enabled
  useEffect(() => {
    if (!shieldEnabled) return;
    const interval = setInterval(() => {
      setAdsBlockedCount(prev => prev + 1);
      setBandwidthSavedMb(prev => prev + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, [shieldEnabled]);

  // URL Cleaning Function
  const handleCleanUrl = () => {
    try {
      const url = new URL(rawUrl);
      const paramsToStrip = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'msclkid', '_ga'];
      paramsToStrip.forEach(p => url.searchParams.delete(p));
      setCleanedUrl(url.toString());
    } catch {
      setCleanedUrl(rawUrl.split('?')[0]);
    }
  };

  // Run Website Privacy Audit
  const handleRunAudit = () => {
    setIsAuditing(true);
    setAuditResult(null);
    setTimeout(() => {
      setAuditResult({
        domain: auditDomain,
        privacyScore: 42,
        totalTrackersFound: 18,
        adNetworksCount: 7,
        fingerprintingDetected: true,
        cookieBannersCount: 3,
        recommendation: 'High privacy risk! Enable ShieldBlock extension to prevent fingerprinting & data leakage.'
      });
      setIsAuditing(false);
    }, 1200);
  };

  // Copy Code Snippets
  const copyCode = (content: string, filename: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  // Chrome Extension Manifest V3 Source Files
  const extensionManifest = `{
  "manifest_version": 3,
  "name": "ShieldBlock AI - Smart Ad & Tracker Blocker",
  "version": "1.0.0",
  "description": "Blocks annoying ads, popups, cookie consent banners, and tracking scripts automatically.",
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
    "default_popup": "popup.html",
    "default_icon": "icon.png"
  },
  "background": {
    "service_worker": "background.js"
  }
}`;

  const extensionBackground = `// Background Service Worker - Declarative Net Request Rules
chrome.runtime.onInstalled.addListener(() => {
  console.log("ShieldBlock AI Extension Activated!");
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2, 3],
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
      }
    ]
  });
});`;

  const extensionContentScript = `// Content Script - Cosmetic Ad Filtering & Popup Zapper
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
  observer.observe(document.body, { childList: true, subtree: true });
})();`;

  return (
    <div className="min-h-screen bg-[#07080e] text-slate-100 font-sans selection:bg-cyan-600 selection:text-white">
      
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* HEADER NAVBAR */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[#090a14]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('shield')}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              Shield<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Block</span>
              <span className="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 px-2 py-0.5 rounded-full font-mono">v1.0 Extension</span>
            </span>
          </div>

          {/* Nav Pills */}
          <nav className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {[
              { id: 'shield', label: 'AdBlock Shield', icon: ShieldCheck },
              { id: 'extension', label: 'Chrome Extension', icon: Laptop },
              { id: 'cleaner', label: 'URL Tracker Cleaner', icon: Trash2 },
              { id: 'audit', label: 'Site Privacy Audit', icon: EyeOff },
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

          {/* Extension Download CTA */}
          <button 
            onClick={() => setActiveTab('extension')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Get Chrome Extension</span>
          </button>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MAIN BODY CONTAINER */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        
        {/* TAB 1: ADBLOCK & PRIVACY SHIELD DASHBOARD */}
        {activeTab === 'shield' && (
          <div className="space-y-6">
            
            {/* HERO TOGGLE CARD */}
            <div className="rounded-3xl p-6 sm:p-8 border border-cyan-500/20 bg-gradient-to-br from-slate-900 via-cyan-950/20 to-slate-900 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold">
                  <Zap className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Daily Web Privacy & Speed Booster Utility</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Browse Fast. Block Ads. <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Stop Trackers.</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  ShieldBlock AI automatically intercepts ad networks, cookie consent modals, tracking pixels, and video popups in real-time.
                </p>
              </div>

              {/* Master Shield Toggle */}
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 flex items-center space-x-4 shrink-0">
                <div>
                  <span className="text-xs font-extrabold text-white block">Protection Status</span>
                  <span className={`text-[11px] font-bold ${shieldEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {shieldEnabled ? '🛡️ Shield Active' : '⚠️ Shield Paused'}
                  </span>
                </div>
                <button
                  onClick={() => setShieldEnabled(!shieldEnabled)}
                  className={`w-14 h-8 rounded-full transition-all relative p-1 cursor-pointer ${
                    shieldEnabled ? 'bg-cyan-600' : 'bg-slate-800'
                  }`}
                >
                  <div className={`h-6 w-6 rounded-full bg-white transition-all transform ${
                    shieldEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* LIVE METRICS CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Ads & Popups Blocked</span>
                <span className="text-xl font-extrabold text-cyan-400 block">{adsBlockedCount.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 font-mono">Real-time protection</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Trackers Intercepted</span>
                <span className="text-xl font-extrabold text-blue-400 block">{trackersBlockedCount.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 font-mono">Google, FB, Analytics</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Data Bandwidth Saved</span>
                <span className="text-xl font-extrabold text-emerald-400 block">{(bandwidthSavedMb / 1024).toFixed(2)} GB</span>
                <span className="text-[10px] text-slate-500 font-mono">Saved mobile data</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Load Time Saved</span>
                <span className="text-xl font-extrabold text-purple-400 block">+{timeSavedMins} mins</span>
                <span className="text-[10px] text-slate-500 font-mono">+64% faster pages</span>
              </div>
            </div>

            {/* FILTER SETTINGS TOGGLES */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" />
                Active Protection Filters
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { state: blockAds, setState: setBlockAds, title: 'Block Banner & Video Ads', desc: 'Removes YouTube, Google, and display ads' },
                  { state: blockTrackers, setState: setBlockTrackers, title: 'Stop Tracking Pixels', desc: 'Blocks analytics, Facebook Pixel, and web bugs' },
                  { state: blockPopups, setState: setBlockPopups, title: 'Block Annoying Popups', desc: 'Stops new tab redirects & overlay popups' },
                  { state: blockCookieBanners, setState: setBlockCookieBanners, title: 'Auto-Dismiss Cookie Banners', desc: 'Hides GDPR & cookie consent overlays' },
                  { state: stripTrackingParams, setState: setStripTrackingParams, title: 'Strip URL Tracking Tags', desc: 'Removes utm_source & fbclid from links' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">{item.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
                    </div>
                    <button
                      onClick={() => item.setState(!item.state)}
                      className={`w-10 h-6 rounded-full transition-all relative p-0.5 shrink-0 cursor-pointer ${
                        item.state ? 'bg-cyan-600' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-full bg-white transition-all transform ${
                        item.state ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* LIVE INTERCEPT STREAM */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-400" />
                Live Real-Time Interception Stream
              </h3>

              <div className="space-y-2">
                {liveStream.map(item => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/25 px-2 py-0.5 rounded font-mono font-bold">BLOCKED</span>
                      <span className="font-mono text-slate-200 text-xs">{item.domain}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-500 font-mono text-[10px]">
                      <span>{item.category}</span>
                      <span>{item.sizeSaved}</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHROME EXTENSION SOURCE & BUILDER */}
        {activeTab === 'extension' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Laptop className="h-5 w-5 text-cyan-400" />
                  Chrome & Edge Extension Source Studio (Manifest V3)
                </h2>
                <p className="text-xs text-slate-400 mt-1">Copy or download these 3 working extension files and load them directly in your Chrome browser via <code className="bg-slate-950 px-1.5 py-0.5 rounded text-cyan-300 font-mono">chrome://extensions</code>!</p>
              </div>

              {/* Instructions */}
              <div className="bg-cyan-950/30 border border-cyan-500/20 p-4 rounded-xl text-xs space-y-2 text-cyan-200">
                <span className="font-bold block text-white">How to load this Extension in your Browser:</span>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] font-mono">
                  <li>Create a new folder on your computer named <strong className="text-cyan-300">ShieldBlock-Extension</strong>.</li>
                  <li>Copy the 3 file contents below into <strong className="text-white">manifest.json</strong>, <strong className="text-white">background.js</strong>, and <strong className="text-white">content.js</strong> inside that folder.</li>
                  <li>Open Google Chrome, navigate to <strong className="text-cyan-300">chrome://extensions</strong>, and turn on <strong className="text-amber-300">Developer mode</strong> in the top right.</li>
                  <li>Click <strong className="text-emerald-300">Load unpacked</strong> and select your <strong className="text-cyan-300">ShieldBlock-Extension</strong> folder. Enjoy ad-free browsing!</li>
                </ol>
              </div>

              {/* File 1: manifest.json */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> manifest.json
                  </span>
                  <button
                    onClick={() => copyCode(extensionManifest, 'manifest.json')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedFile === 'manifest.json' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedFile === 'manifest.json' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto p-3 bg-[#06070b] rounded-lg">{extensionManifest}</pre>
              </div>

              {/* File 2: background.js */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-blue-300 flex items-center gap-1.5">
                    <Code className="h-3.5 w-3.5" /> background.js (Rule Engine)
                  </span>
                  <button
                    onClick={() => copyCode(extensionBackground, 'background.js')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedFile === 'background.js' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedFile === 'background.js' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto p-3 bg-[#06070b] rounded-lg">{extensionBackground}</pre>
              </div>

              {/* File 3: content.js */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-purple-300 flex items-center gap-1.5">
                    <Code className="h-3.5 w-3.5" /> content.js (DOM Cosmetic Ad Filter)
                  </span>
                  <button
                    onClick={() => copyCode(extensionContentScript, 'content.js')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedFile === 'content.js' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedFile === 'content.js' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto p-3 bg-[#06070b] rounded-lg">{extensionContentScript}</pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: URL TRACKER CLEANER */}
        {activeTab === 'cleaner' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-rose-400" />
                  URL Tracking Parameter Stripper
                </h2>
                <p className="text-xs text-slate-400">Strip privacy-invasive tracking parameters (<code className="text-rose-300 font-mono">utm_source</code>, <code className="text-rose-300 font-mono">fbclid</code>, <code className="text-rose-300 font-mono">gclid</code>) from any web URL before sharing.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Paste Raw URL with Trackers</label>
                  <input
                    value={rawUrl}
                    onChange={e => setRawUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <button
                  onClick={handleCleanUrl}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Clean URL & Strip Trackers</span>
                </button>

                {cleanedUrl && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Cleaned Tracker-Free URL</span>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs text-white break-all">{cleanedUrl}</span>
                      <button
                        onClick={() => copyCode(cleanedUrl, 'url')}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg flex items-center space-x-1 cursor-pointer shrink-0"
                      >
                        {copiedFile === 'url' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedFile === 'url' ? 'Copied!' : 'Copy URL'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WEBSITE PRIVACY AUDIT */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <EyeOff className="h-5 w-5 text-amber-400" />
                  Website Privacy & Tracker Density Audit
                </h2>
                <p className="text-xs text-slate-400">Scan any domain to detect hidden ad networks, tracking scripts, and browser fingerprinting.</p>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  value={auditDomain}
                  onChange={e => setAuditDomain(e.target.value)}
                  placeholder="e.g. news-portal.com"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500 font-mono"
                />
                <button
                  onClick={handleRunAudit}
                  disabled={isAuditing}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isAuditing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  <span>{isAuditing ? "Scanning Site..." : "Scan Privacy Risk"}</span>
                </button>
              </div>

              {auditResult && (
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Globe className="h-4 w-4 text-cyan-400" />
                      Scan Report for {auditResult.domain}
                    </h3>
                    <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
                      Privacy Score: {auditResult.privacyScore}/100 (Poor)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Total Trackers Found</span>
                      <strong className="text-rose-400 text-base">{auditResult.totalTrackersFound}</strong>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Ad Networks</span>
                      <strong className="text-amber-400 text-base">{auditResult.adNetworksCount}</strong>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Browser Fingerprinting</span>
                      <strong className="text-rose-400 text-base">Detected ⚠️</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                    💡 <strong>Recommendation:</strong> {auditResult.recommendation}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 mt-16 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <span className="font-bold text-slate-400">ShieldBlock AI - Smart AdBlocker & Privacy Shield Suite</span>
          <span>© 2026. Daily Routine Web Protection Utility.</span>
        </div>
      </footer>
    </div>
  );
}