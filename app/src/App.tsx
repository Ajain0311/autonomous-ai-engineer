import React, { useState } from 'react';
import { 
  Rocket, Search, Star, GitFork, ExternalLink, Filter, Plus, 
  Sparkles, Code2, Cpu, Globe, BookOpen, MessageSquare, Flame, 
  ThumbsUp, User, ShieldCheck, CheckCircle2, ChevronRight, X, ArrowUpRight,
  TrendingUp, Layers, Terminal, Compass
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: 'ai' | 'web3' | 'fullstack' | 'devops' | 'mobile' | 'design';
  tags: string[];
  stars: number;
  forks: number;
  upvotes: number;
  author: { name: string; avatar: string; handle: string };
  demoUrl?: string;
  repoUrl?: string;
  featured?: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'explore' | 'trending' | 'roadmaps' | 'community'>('explore');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'stars' | 'upvotes' | 'recent'>('stars');
  
  // Modals & User Session
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // New Project Form
  const [newTitle, setNewTitle] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newCategory, setNewCategory] = useState<'ai' | 'web3' | 'fullstack' | 'devops' | 'mobile' | 'design'>('ai');
  const [newTags, setNewTags] = useState('');
  const [newRepoUrl, setNewRepoUrl] = useState('');

  // Sample TechHub Projects Database
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'p1',
      title: 'NeuralFlow AI',
      tagline: 'Autonomous multi-agent LLM workflow orchestrator with real-time streaming DAG visualization.',
      description: 'NeuralFlow AI allows developers to connect LLM agents in dynamic graphs. Built with React 18, TypeScript, FastAPI, and WebSockets. Supports local Ollama models and cloud APIs.',
      category: 'ai',
      tags: ['AI/ML', 'React', 'Python', 'LLM', 'TypeScript'],
      stars: 4820,
      forks: 512,
      upvotes: 894,
      author: { name: 'Aditya Jain', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', handle: '@aditya_jain' },
      demoUrl: 'https://demo.neuralflow.ai',
      repoUrl: 'https://github.com/example/neuralflow',
      featured: true
    },
    {
      id: 'p2',
      title: 'KubeVault Ops',
      tagline: 'Zero-trust Kubernetes secret rotation engine with automated cloud backup.',
      description: 'KubeVault seamlessly manages ephemeral secrets across AWS EKS and GCP GKE clusters with automated SSL renewal and audit logging.',
      category: 'devops',
      tags: ['Kubernetes', 'Go', 'DevOps', 'Docker', 'Security'],
      stars: 2140,
      forks: 188,
      upvotes: 432,
      author: { name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', handle: '@elena_dev' },
      demoUrl: 'https://kubevault.io',
      repoUrl: 'https://github.com/example/kubevault',
      featured: true
    },
    {
      id: 'p3',
      title: 'EtherPulse DEX',
      tagline: 'Next-gen decentralized liquidity protocol featuring gasless swaps and instant finality.',
      description: 'EtherPulse leverages Layer-2 ZK-rollups to provide sub-second crypto trading with near-zero gas fees.',
      category: 'web3',
      tags: ['Solidity', 'Web3', 'Ethereum', 'Next.js', 'Tailwind'],
      stars: 3290,
      forks: 410,
      upvotes: 621,
      author: { name: 'Marcus Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', handle: '@marcus_eth' },
      demoUrl: 'https://etherpulse.app',
      repoUrl: 'https://github.com/example/etherpulse'
    },
    {
      id: 'p4',
      title: 'OmniUI Design System',
      tagline: 'Accessible component suite with glassmorphism presets and automatic dark mode tokens.',
      description: 'OmniUI offers over 60 pre-built React components designed for maximum performance, compliance with WCAG 2.1 AAA standards, and seamless customization.',
      category: 'design',
      tags: ['UI/UX', 'React', 'TailwindCSS', 'Figma', 'TypeScript'],
      stars: 1850,
      forks: 142,
      upvotes: 310,
      author: { name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', handle: '@sarah_design' },
      demoUrl: 'https://omniui.dev',
      repoUrl: 'https://github.com/example/omniui'
    },
    {
      id: 'p5',
      title: 'DevNexus Fullstack',
      tagline: 'Production-ready boilerplate powered by Next.js 15, Prisma ORM, and Stripe billing.',
      description: 'Everything you need to launch a SaaS startup in hours: Auth0 authentication, subscription management, transactional emails, and admin metrics dashboard.',
      category: 'fullstack',
      tags: ['Fullstack', 'Next.js', 'PostgreSQL', 'Stripe', 'Node.js'],
      stars: 5410,
      forks: 730,
      upvotes: 1120,
      author: { name: 'David Kim', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', handle: '@dkim_builds' },
      demoUrl: 'https://devnexus.saas',
      repoUrl: 'https://github.com/example/devnexus'
    },
    {
      id: 'p6',
      title: 'SwiftNative AI Mobile',
      tagline: 'Cross-platform React Native app with built-in device ML vision processing.',
      description: 'Capture and process object recognition models on iOS and Android with zero cloud server latency.',
      category: 'mobile',
      tags: ['Mobile', 'React Native', 'CoreML', 'iOS', 'Android'],
      stars: 1290,
      forks: 98,
      upvotes: 275,
      author: { name: 'Maya Patel', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', handle: '@maya_mobile' },
      repoUrl: 'https://github.com/example/swiftnative'
    }
  ]);

  // Handle Upvotes
  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects(prev => prev.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
  };

  // Submit New Project
  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const createdProject: Project = {
      id: Date.now().toString(),
      title: newTitle,
      tagline: newTagline || 'Modern tech application built for high performance.',
      description: newTagline + ' Powered by modern frameworks and clean architecture.',
      category: newCategory,
      tags: newTags ? newTags.split(',').map(t => t.trim()) : ['React', 'TypeScript', 'TechHub'],
      stars: 1,
      forks: 0,
      upvotes: 1,
      author: { name: 'Aditya Jain', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', handle: '@aditya_jain' },
      repoUrl: newRepoUrl || 'https://github.com/example/new-project'
    };

    setProjects([createdProject, ...projects]);
    setNewTitle('');
    setNewTagline('');
    setNewTags('');
    setNewRepoUrl('');
    setShowSubmitModal(false);
  };

  // Filtered & Sorted Projects
  const filteredProjects = projects
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => searchQuery === '' || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'upvotes') return b.upvotes - a.upvotes;
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-100 selection:bg-purple-500 selection:text-white">
      
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* NAVIGATION HEADER */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('explore')}>
            <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center glow-purple">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-wide flex items-center gap-1.5">
                Tech<span className="gradient-text">Hub</span>
                <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded-full font-mono font-semibold">v2.4</span>
              </span>
              <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">Developer Knowledge & Project Hub</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {[
              { id: 'explore', label: 'Explore Projects', icon: Compass },
              { id: 'trending', label: 'Trending Tech', icon: Flame },
              { id: 'roadmaps', label: 'Roadmaps', icon: Layers },
              { id: 'community', label: 'Q&A Community', icon: MessageSquare },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center space-x-3">
            <div className="relative hidden lg:block w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search AI, Web3, React..."
                className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 transition-all font-outfit"
              />
            </div>

            <button 
              onClick={() => setShowSubmitModal(true)}
              className="px-3.5 py-1.5 gradient-bg text-white rounded-xl text-xs font-bold transition-all hover:opacity-90 glow-purple flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Submit Project</span>
            </button>

            {isLoggedIn ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full border border-purple-500/50 object-cover cursor-pointer hover:ring-2 ring-purple-500 transition-all"
                />
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)} 
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT AREA */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: EXPLORE PROJECTS */}
        {activeTab === 'explore' && (
          <div className="space-y-8">
            
            {/* HERO BANNER */}
            <div className="relative rounded-3xl overflow-hidden glass-card p-8 md:p-12 border border-purple-500/20 glow-purple">
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
                  <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                  <span>Discover Next-Gen Open Source Innovations</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Where Tech Pioneers <span className="gradient-text">Showcase & Scale</span>
                </h1>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  Explore thousands of cutting-edge AI tools, Web3 protocols, cloud frameworks, and developer utilities built by top engineers globally.
                </p>

                {/* Quick Stats Ticker */}
                <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono">
                  <div className="flex items-center space-x-2">
                    <Code2 className="h-4 w-4 text-purple-400" />
                    <span><strong className="text-white">1,420+</strong> Active Projects</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-pink-400" />
                    <span><strong className="text-white">35,000+</strong> Developers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span><strong className="text-white">99.9%</strong> Verified Code</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FILTER & CATEGORY BAR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
              
              {/* Category Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                {[
                  { id: 'all', label: 'All Stack', icon: Layers },
                  { id: 'ai', label: 'AI & Machine Learning', icon: Cpu },
                  { id: 'web3', label: 'Web3 & Blockchain', icon: Globe },
                  { id: 'fullstack', label: 'Fullstack Apps', icon: Code2 },
                  { id: 'devops', label: 'Cloud & DevOps', icon: Terminal },
                  { id: 'mobile', label: 'Mobile Apps', icon: Rocket },
                  { id: 'design', label: 'UI/UX Systems', icon: Sparkles },
                ].map(cat => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm' 
                          : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/80'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sorting Controls */}
              <div className="flex items-center space-x-3 text-xs text-slate-400 self-end md:self-auto">
                <span className="flex items-center gap-1 font-semibold text-slate-500"><Filter className="h-3.5 w-3.5" /> Sort:</span>
                {(['stars', 'upvotes', 'recent'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`capitalize font-semibold transition-all cursor-pointer ${
                      sortBy === s ? 'text-purple-400 underline underline-offset-4' : 'hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* PROJECTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(p => (
                <div 
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className="glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/40 hover:glow-purple cursor-pointer flex flex-col justify-between group relative"
                >
                  {p.featured && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                      Featured
                    </div>
                  )}

                  <div>
                    {/* Author & Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <img src={p.author.avatar} alt={p.author.name} className="h-9 w-9 rounded-full object-cover border border-purple-500/30" />
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">{p.author.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">{p.author.handle}</span>
                      </div>
                    </div>

                    {/* Title & Tagline */}
                    <h3 className="text-lg font-bold text-white mb-2 tracking-tight group-hover:text-purple-400 transition-colors flex items-center justify-between">
                      <span>{p.title}</span>
                      <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {p.tagline}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {p.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-slate-800/80 text-slate-300 border border-slate-700/50 px-2 py-0.5 rounded-md font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Metrics & Actions */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1 text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span>{p.stars}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-slate-400">
                        <GitFork className="h-3.5 w-3.5" />
                        <span>{p.forks}</span>
                      </span>
                    </div>

                    <button 
                      onClick={(e) => handleUpvote(p.id, e)}
                      className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-all"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span className="font-bold">{p.upvotes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-20 glass-card rounded-2xl border border-slate-800">
                <Compass className="h-12 w-12 text-slate-600 mx-auto mb-3 animate-pulse" />
                <h3 className="text-base font-bold text-slate-300">No Projects Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Try adjusting your search filters or submit a new project to the TechHub repository.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRENDING TECH */}
        {activeTab === 'trending' && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-8 border border-purple-500/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Trending Technologies & Repositories</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Top-gaining frameworks, packages, and AI architectures across Github this week.</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'DeepSeek-V3 LLM', growth: '+340% stars', desc: 'Open-weights 671B parameter Mixture-of-Experts AI language model.', category: 'AI Architecture', stars: '42.5k' },
                  { name: 'Vite 6.0 Engine', growth: '+180% downloads', desc: 'Next generation frontend tooling featuring Environment API and faster HMR.', category: 'Frontend', stars: '68.2k' },
                  { name: 'Supabase Vector 2', growth: '+120% projects', desc: 'Open source Firebase alternative with pgvector embedding search support.', category: 'Database', stars: '74.1k' },
                  { name: 'Tailwind CSS v4.0', growth: '+210% adoption', desc: 'All-new CSS-first configuration engine built for maximum speed.', category: 'Styling', stars: '81.9k' },
                  { name: 'Ollama Desktop', growth: '+290% downloads', desc: 'Get up and running with Llama 3, Mistral, and Qwen models locally.', category: 'Dev Tools', stars: '92.4k' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 transition-all">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-extrabold text-slate-600 font-mono">0{idx + 1}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-white">{item.name}</h4>
                          <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-bold">{item.growth}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0">
                      <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400" /> {item.stars}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-mono">{item.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LEARNING ROADMAPS */}
        {activeTab === 'roadmaps' && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-8 border border-purple-500/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Interactive Developer Roadmaps</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Step-by-step career path guides curated by industry staff engineers.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'AI & LLM Architect', steps: '12 Milestones', level: 'Advanced', color: 'from-purple-600 to-indigo-600', topics: ['Python & PyTorch', 'LangChain & LlamaIndex', 'Vector DBs (Chroma/Qdrant)', 'Fine-tuning & LoRA'] },
                  { title: 'Fullstack Web Engineer', steps: '15 Milestones', level: 'Intermediate', color: 'from-pink-600 to-rose-600', topics: ['TypeScript Core', 'React 18 & Next.js', 'Prisma ORM & PostgreSQL', 'Docker & CI/CD'] },
                  { title: 'Cloud & DevOps Master', steps: '10 Milestones', level: 'Advanced', color: 'from-cyan-600 to-blue-600', topics: ['Linux Administration', 'Kubernetes Orchestration', 'Terraform IaC', 'AWS & GCP Security'] },
                ].map((rm, idx) => (
                  <div key={idx} className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className={`h-2 w-full rounded-full bg-gradient-to-r ${rm.color} mb-4`}></div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">{rm.level} Path</span>
                      <h3 className="text-base font-bold text-white mt-1 mb-3">{rm.title}</h3>
                      <div className="space-y-2 mb-6">
                        {rm.topics.map(t => (
                          <div key={t} className="flex items-center space-x-2 text-xs text-slate-300">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className="w-full py-2 bg-slate-800 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer">
                      <span>View Roadmap</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMMUNITY Q&A */}
        {activeTab === 'community' && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-8 border border-purple-500/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Developer Q&A Community</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Ask questions, share code snippets, and solve complex architecture challenges.</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'How to optimize vector similarity search with 10M+ embeddings in pgvector?', answers: 14, votes: 45, author: '@tech_guy', tag: 'PostgreSQL' },
                  { title: 'Best practices for handling WebSockets reconnection state in React 18 strict mode?', answers: 8, votes: 29, author: '@react_dev', tag: 'React' },
                  { title: 'Migrating from Tailwind v3 to v4: CSS-first config performance metrics', answers: 22, votes: 61, author: '@css_wizard', tag: 'Tailwind' },
                ].map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full font-mono font-bold">{item.tag}</span>
                      <h4 className="text-sm font-bold text-white mt-1.5 hover:text-purple-300 cursor-pointer transition-colors">{item.title}</h4>
                      <span className="text-[10px] text-slate-500 font-mono mt-1 block">Asked by {item.author} · {item.answers} answers</span>
                    </div>

                    <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-xl text-xs text-purple-300 font-bold shrink-0">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{item.votes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* SUBMIT PROJECT MODAL */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowSubmitModal(false)}>
          <div className="glass-card rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-purple-500/30" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Rocket className="h-5 w-5 text-purple-400" />
                Submit New Project
              </h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-500 hover:text-white transition-all"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmitProject} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Project Title</label>
                <input 
                  required
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  placeholder="e.g. NeuralFlow AI" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-purple-500" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Tagline / Short Pitch</label>
                <input 
                  required
                  value={newTagline} 
                  onChange={e => setNewTagline(e.target.value)} 
                  placeholder="e.g. Autonomous multi-agent workflow engine" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-purple-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
                  <select 
                    value={newCategory} 
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                  >
                    <option value="ai">AI & Machine Learning</option>
                    <option value="web3">Web3 & Blockchain</option>
                    <option value="fullstack">Fullstack Apps</option>
                    <option value="devops">Cloud & DevOps</option>
                    <option value="mobile">Mobile Apps</option>
                    <option value="design">UI/UX Systems</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Tags (comma separated)</label>
                  <input 
                    value={newTags} 
                    onChange={e => setNewTags(e.target.value)} 
                    placeholder="React, AI, Python" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-purple-500" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">GitHub Repo URL</label>
                <input 
                  value={newRepoUrl} 
                  onChange={e => setNewRepoUrl(e.target.value)} 
                  placeholder="https://github.com/username/repo" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-purple-500 font-mono" 
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowSubmitModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-5 py-2 gradient-bg text-white rounded-xl text-xs font-bold glow-purple">Publish to TechHub</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* PROJECT DETAIL MODAL */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedProject(null)}>
          <div className="glass-card rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-purple-500/30" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 font-mono">{selectedProject.category}</span>
                <h2 className="text-2xl font-bold text-white mt-0.5">{selectedProject.title}</h2>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-slate-500 hover:text-white transition-all"><X className="h-5 w-5" /></button>
            </div>

            <p className="text-sm text-purple-300 font-semibold mb-4">{selectedProject.tagline}</p>
            <p className="text-xs text-slate-300 leading-relaxed mb-6 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              {selectedProject.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {selectedProject.tags.map(t => (
                <span key={t} className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-lg font-mono">#{t}</span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="flex items-center space-x-3">
                <img src={selectedProject.author.avatar} alt={selectedProject.author.name} className="h-8 w-8 rounded-full" />
                <div>
                  <span className="text-xs font-bold text-white block">{selectedProject.author.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{selectedProject.author.handle}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {selectedProject.repoUrl && (
                  <a href={selectedProject.repoUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                    <Code2 className="h-3.5 w-3.5" />
                    <span>View Repository</span>
                  </a>
                )}
                {selectedProject.demoUrl && (
                  <a href={selectedProject.demoUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 gradient-bg text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 glow-purple">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Live Launch</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 mt-20 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Rocket className="h-4 w-4 text-purple-400" />
            <span className="font-bold text-slate-300">TechHub Platform</span>
            <span>© 2026. Built with React & Tailwind.</span>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-purple-400">Documentation</a>
            <a href="#" className="hover:text-purple-400">API Status</a>
            <a href="#" className="hover:text-purple-400">Github</a>
          </div>
        </div>
      </footer>
    </div>
  );
}