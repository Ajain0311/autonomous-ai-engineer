import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, MessageSquare, Send, Globe, Shield, Sparkles, User, 
  Stethoscope, Scale, Code2, TrendingUp, Heart, GraduationCap, 
  Search, CheckCircle2, Clock, ThumbsUp, Plus, ArrowRight, X, 
  Languages, Zap, AlertCircle, RefreshCw, Star
} from 'lucide-react';

// Specialized AI Agent User Interface
interface AIAgent {
  id: string;
  name: string;
  role: string;
  category: 'health' | 'legal' | 'tech' | 'finance' | 'wellness' | 'education' | 'translation';
  avatar: string;
  icon: any;
  online: boolean;
  rating: number;
  languages: string[];
  description: string;
  specialty: string;
  systemPrompt: string;
  samplePrompts: string[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentId?: string;
  text: string;
  language: string;
  timestamp: string;
}

interface ProblemTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  language: string;
  user: string;
  assignedAgent: string;
  status: 'open' | 'solving' | 'resolved';
  upvotes: number;
  createdAt: string;
  solutionSummary?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'agents' | 'chat' | 'tickets'>('agents');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Hindi');
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Real-Time Chat Engine State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'agent',
      agentId: 'dr-medico',
      text: 'नमस्ते! मैं Dr. Medico AI हूँ। आपकी सेहत, आहार या किसी लक्षण से जुड़ी सहायता के लिए मैं यहाँ हूँ। आप अपनी भाषा में सवाल पूछ सकते हैं।',
      language: 'Hindi',
      timestamp: '10:00 AM'
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isAgentTyping, setIsAgentTyping] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Problem Submission Modal
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [ticketTitle, setTicketTitle] = useState<string>('');
  const [ticketDesc, setTicketDesc] = useState<string>('');
  const [ticketCategory, setTicketCategory] = useState<string>('health');

  // Specialized AI Expert Agents (Active AI Users)
  const agents: AIAgent[] = [
    {
      id: 'dr-medico',
      name: 'Dr. Medico AI',
      role: 'Healthcare & Medical Wellness Specialist',
      category: 'health',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      icon: Stethoscope,
      online: true,
      rating: 4.9,
      languages: ['Hindi', 'English', 'Hinglish', 'Bengali', 'Marathi'],
      description: 'Provides instant medical guidance, symptom analysis, dietary plans, and wellness advice in your native language.',
      specialty: 'Symptom Checker, Diet Plans, First Aid & Preventive Care',
      systemPrompt: 'You are Dr. Medico AI, an empathetic healthcare expert assistant.',
      samplePrompts: [
        'मुझे पिछले 2 दिन से सिरदर्द और हल्का बुखार है, क्या उपाय करूँ?',
        'What should I eat to improve hemoglobin levels naturally?',
        'गैस और एसिडिटी की समस्या का घरेलू इलाज बताइए।'
      ]
    },
    {
      id: 'advocate-nyaya',
      name: 'Advocate Nyaya AI',
      role: 'Legal Rights & Property Law Advisor',
      category: 'legal',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      icon: Scale,
      online: true,
      rating: 4.95,
      languages: ['Hindi', 'English', 'Hinglish', 'Tamil', 'Gujarati'],
      description: 'Simplifies legal notices, property disputes, consumer rights, labor law, and contract drafting step-by-step.',
      specialty: 'Consumer Rights, Rent Agreements, Consumer Forum Complaints',
      systemPrompt: 'You are Advocate Nyaya AI, a knowledgeable legal advice consultant.',
      samplePrompts: [
        'मकान मालिक सिक्योरिटी डिपॉजिट वापस नहीं कर रहा, क्या लीगल नोटिस भेजें?',
        'How to file a consumer court complaint for a defective product online?',
        'रेंट एग्रीमेंट ड्राफ्ट करते समय किन बातों का ध्यान रखना चाहिए?'
      ]
    },
    {
      id: 'dev-guru',
      name: 'DevGuru AI Architect',
      role: 'Senior Fullstack & System Design Architect',
      category: 'tech',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      icon: Code2,
      online: true,
      rating: 5.0,
      languages: ['English', 'Hinglish', 'Hindi'],
      description: 'Solves complex code bugs, performs security code reviews, and designs scalable cloud architectures.',
      specialty: 'React, Node.js, Python, System Design, Debugging',
      systemPrompt: 'You are DevGuru AI, an expert system architect and code debugger.',
      samplePrompts: [
        'React component state render loop infinity error kaise fix karein?',
        'How to design a high-concurrency microservice API rate limiter?',
        'Python script pandas memory leak error resolve code give me.'
      ]
    },
    {
      id: 'fin-vision',
      name: 'FinVision AI Advisor',
      role: 'Personal Finance & Tax Strategist',
      category: 'finance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      icon: TrendingUp,
      online: true,
      rating: 4.85,
      languages: ['Hindi', 'English', 'Hinglish'],
      description: 'Helps users build monthly budgets, save taxes under New/Old regime, and plan mutual fund investments.',
      specialty: 'Income Tax Savings, SIP Planning, Emergency Fund Allocation',
      systemPrompt: 'You are FinVision AI, a certified personal financial planning consultant.',
      samplePrompts: [
        '7 लाख सैलरी पर Old vs New Tax Regime में कौन सा बेहतर है?',
        'How to start investing 5000 INR per month in Index Mutual Funds?',
        'क्रेडिट कार्ड का कर्ज जल्दी चुकाने की बेस्ट स्ट्रेटजी क्या है?'
      ]
    },
    {
      id: 'mind-ease',
      name: 'MindEase Therapy AI',
      role: 'Mental Wellbeing & Stress Relief Guide',
      category: 'wellness',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      icon: Heart,
      online: true,
      rating: 4.98,
      languages: ['Hindi', 'English', 'Hinglish', 'Spanish', 'French'],
      description: 'A compassionate, non-judgmental space for managing anxiety, exam stress, burnout, and emotional healing.',
      specialty: 'CBT Exercises, Mindfulness Breathing, Anxiety Support',
      systemPrompt: 'You are MindEase Therapy AI, a gentle and empathetic mental health guide.',
      samplePrompts: [
        'मुझे नौकरी की वजह से बहुत ज्यादा स्ट्रेस और एंग्जायटी हो रही है।',
        'How to overcome overthinking before sleeping at night?',
        'मन शांत करने की 5 मिनट की माइंडफुलनेस एक्सरसाइज बताइए।'
      ]
    },
    {
      id: 'edu-master',
      name: 'EduMaster Tutor AI',
      role: 'Multilingual Academic Tutor & Mentor',
      category: 'education',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      icon: GraduationCap,
      online: true,
      rating: 4.9,
      languages: ['Hindi', 'English', 'Hinglish', 'Spanish', 'French', 'German'],
      description: 'Explains complex Math, Science, History, and Coding concepts simply in your preferred language with examples.',
      specialty: 'Class 9-12 Science/Maths, Competitive Exam Prep, Homework Solver',
      systemPrompt: 'You are EduMaster Tutor AI, an engaging academic teacher.',
      samplePrompts: [
        'क्वांटम मैकेनिक्स और फोटोइलेक्ट्रिक इफेक्ट को हिंदी में आसान उदाहरण से समझाओ।',
        'Solve step-by-step calculus integration by parts equation.',
        'IIT JEE Physics ke Newton Laws solved numerical problems show karo.'
      ]
    }
  ];

  // Sample User Problem Tickets
  const [tickets, setTickets] = useState<ProblemTicket[]>([
    {
      id: 't101',
      title: 'मकान मालिक 50,000 डिपॉजिट वापस नहीं कर रहा - कानूनी सलाह चाहिए',
      description: 'मैंने 2 साल का लीज पीरियड पूरा किया और फ्लैट बिना नुकसान दिए खाली किया, लेकिन मकान मालिक फोन नहीं उठा रहा।',
      category: 'legal',
      language: 'Hindi',
      user: 'Rahul Sharma (Delhi)',
      assignedAgent: 'Advocate Nyaya AI',
      status: 'solving',
      upvotes: 38,
      createdAt: '2 घंटे पहले',
      solutionSummary: 'Advocate Nyaya AI ने 15 दिनों का लीगल नोटिस ड्राफ्ट करके भेजा है।'
    },
    {
      id: 't102',
      title: 'React State Management memory leak causing web app crash',
      description: 'Our web app freezes after 15 minutes of usage due to uncleaned WebSocket event listeners in useEffect.',
      category: 'tech',
      language: 'English',
      user: 'Priya Mehta (Bangalore)',
      assignedAgent: 'DevGuru AI Architect',
      status: 'resolved',
      upvotes: 54,
      createdAt: '5 घंटे पहले',
      solutionSummary: 'DevGuru AI provided cleanup function code patch for useEffect hook.'
    },
    {
      id: 't103',
      title: 'अचानक से तेज सिरदर्द और उल्टी महसूस होना - तुरंत सहायता',
      description: 'सुबह से दाहिनी तरफ सिर में तेज दर्द हो रहा है और रोशनी देखने में परेशानी हो रही है।',
      category: 'health',
      language: 'Hindi',
      user: 'Amit Verma (Jaipur)',
      assignedAgent: 'Dr. Medico AI',
      status: 'resolved',
      upvotes: 29,
      createdAt: '1 दिन पहले',
      solutionSummary: 'Dr. Medico AI ने इसे माइग्रेन (Migraine) का लक्षण बताया और तुरंत डॉक्टर परामर्श लेने की सलाह दी।'
    }
  ]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAgentTyping]);

  // Start Chat with Agent
  const startChatWithAgent = (agent: AIAgent) => {
    setSelectedAgent(agent);
    setActiveTab('chat');
    // Add welcome message if chat empty
    if (!chatMessages.some(m => m.agentId === agent.id)) {
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'agent',
          agentId: agent.id,
          text: `नमस्ते! मैं ${agent.name} हूँ। ${agent.role}। बताइए आज आपकी किस समस्या का समाधान करूँ? (${selectedLanguage} भाषा समर्थित है)`,
          language: selectedLanguage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Generate Intelligent Multilingual AI Response
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || !selectedAgent) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      language: selectedLanguage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsAgentTyping(true);

    // Simulate real-time AI Agent problem-solving response based on context & language
    setTimeout(() => {
      let aiResponseText = '';
      const q = query.toLowerCase();

      // ⚖️ LEGAL ADVISOR (Advocate Nyaya AI)
      if (selectedAgent.category === 'legal') {
        if (q.includes('land') || q.includes('bhoomi') || q.includes('zameen') || q.includes('patta') || q.includes('convert') || q.includes('rajsthan') || q.includes('rajasthan') || q.includes('krishi') || q.includes('parivar') || q.includes('vivad') || q.includes('property')) {
          aiResponseText = `⚖️ **Advocate Nyaya AI - राजस्थान भूमि व संपत्ति विवाद समाधान (${selectedLanguage}):**

आपके द्वारा बताई गई राजस्थान कृषि भूमि व परिवार विवाद की स्थिति का कानूनी व तकनीकी समाधान:

1️⃣ **धारा 90A (Rajasthan Land Revenue Act Section 90A)**:
   - यदि कृषि भूमि का व्यावसायिक या आवासीय रूपांतरण (Conversion) नहीं हो पा रहा है, तो राजस्थान भू-राजस्व अधिनियम की धारा **90A** के तहत तहसीलदार/उपखंड अधिकारी (SDM) कार्यालय में आवेदन करें।
   - परिवार के अन्य सदस्यों की असहमति पर धारा 90A के तहत सरकारी नियमन (Regularization) की कार्रवाई की जाती है।

2️⃣ **राजस्व न्यायालय में पारिवारिक बंटवारा (Partition Suit - Section 53 Rajasthan Tenancy Act)**:
   - खातेदारी कृषि भूमि में अपना हिस्सा कानूनी रूप से अलग करने के लिए उपखंड अधिकारी (SDM Court) के समक्ष **धारा 53 राजस्थान काश्तकारी अधिनियम** के तहत विभाजन का दावा (Partition Suit) दायर करें।
   - इसके साथ ही कोर्ट से विवादित भूमि पर निर्माण या बिक्री रोकने हेतु **अस्थाई निषेधाज्ञा (Stay Order)** प्राप्त करें।

3️⃣ **प्रत्यक्ष पट्टा प्राप्त करने का विकल्प (प्रशासन शहरों/गांवों के संग अभियान)**:
   - यदि भूमि निकाय क्षेत्र (JDA / UIT / नगर पालिका / ग्राम पंचायत) की सीमा में आती है, तो 'प्रशासन शहरों/गांवों के संग' के तहत **धारा 69A (Rajasthan Municipalities Act)** के अंतर्गत व्यक्तिगत कब्जे के आधार पर प्रत्यक्ष पट्टा (Individual Patta) हेतु आवेदन कर सकते हैं।

4️⃣ **आवश्यक दस्तावेज**:
   - जमाबंदी (खसरा नक़्शा), म्यूटेशन (नामांतरण की प्रति), आधार कार्ड, और भूमि पर आपके भौतिक कब्जे (Possession) का प्रमाण।`;
        } else if (q.includes('rent') || q.includes('landlord') || q.includes('deposit') || q.includes('मकान मालिक')) {
          aiResponseText = `⚖️ **Advocate Nyaya AI - रेंट व डिपॉजिट विवाद समाधान:**

1️⃣ **लीगल नोटिस (15 Days Statutory Notice)**:
   - वकील के माध्यम से धारा 106 Transfer of Property Act के तहत 15 दिनों का कानूनी नोटिस भेजें।
2️⃣ **रेंट कंट्रोल ट्रिब्यूनल**:
   - नजदीकी Rent Control Tribunal में सिक्योरिटी डिपॉजिट की वसूली हेतु आवेदन दायर करें।`;
        } else {
          aiResponseText = `⚖️ **Advocate Nyaya AI कानूनी विश्लेषण (${selectedLanguage}):**

आपकी समस्या: "*${query}*"

1️⃣ **कानूनी स्थिति**: आपके मामले में दीवानी (Civil) व प्रशासनिक राहत का प्रावधान है।
2️⃣ **अगला कदम**: संबंधित संबंधित न्यायाधिकरण या प्रशासनिक अधिकारी (SDM/तहसीलदार/कोर्ट) के समक्ष आवश्यक दस्तावेज प्रस्तुत करें।
3️⃣ **लीगल नोटिस**: प्रथम दृष्टया 15 दिनों का लिखित नोटिस देना कानूनी रूप से प्रभावी रहेगा।`;
        }
      }

      // 🩺 HEALTHCARE (Dr. Medico AI)
      else if (selectedAgent.category === 'health') {
        if (q.includes('fever') || q.includes('बुखार') || q.includes('सिरदर्द') || q.includes('headache')) {
          aiResponseText = `🩺 **Dr. Medico AI - सिरदर्द व बुखार परामर्श:**

1️⃣ **तत्काल देखभाल**: पर्याप्त पानी पिएं, ओआरएस (ORS) लें और ठंडी पट्टी सिर पर रखें।
2️⃣ **दवा सलाह**: पेरासिटामोल (Paracetamol) डॉक्टर की सलाह अनुसार ली जा सकती है।
3️⃣ **सावधानी**: यदि बुखार 102°F से अधिक है या 48 घंटे से बना हुआ है, तो तुरंत CBC व डेंगू टेस्ट करवाएं।`;
        } else if (q.includes('acidity') || q.includes('gas') || q.includes('एसिडिटी') || q.includes('पेट')) {
          aiResponseText = `🩺 **Dr. Medico AI - पेट व एसिडिटी समाधान:**

1️⃣ **घरेलू उपाय**: गुनगुना पानी, ठंडा दूध या सौंफ का पानी पिएं।
2️⃣ **आहार**: मसालेदार व तला हुआ भोजन पूरी तरह बंद करें।
3️⃣ **चिकित्सीय परामर्श**: एंटासिड (Antacid) टैबलेट ले सकते हैं।`;
        } else {
          aiResponseText = `🩺 **Dr. Medico AI स्वास्थ विश्लेषण (${selectedLanguage}):**

आपकी स्वास्थ्य संबंधी जिज्ञासा: "*${query}*"

1️⃣ **प्राथमिक सुझाव**: आराम करें, तरल पदार्थों का अधिक सेवन करें।
2️⃣ **विशेषज्ञ राय**: लक्षणों पर 24 घंटे नजर रखें और आवश्यकता पड़ने पर चिकित्सकीय परामर्श लें।`;
        }
      }

      // 💻 TECH ARCHITECT (DevGuru AI)
      else if (selectedAgent.category === 'tech') {
        aiResponseText = `💻 **DevGuru AI Architect Solution:**

Regarding your code query: "*${query}*"

\`\`\`typescript
// Verified Production Solution
export function resolveIssue(data: any) {
  if (!data) return null;
  // Apply memoization & clean state updates
  return React.useMemo(() => data.filter(Boolean), [data]);
}
\`\`\`

✅ **Technical Breakdown**:
1. Optimized memory footprint and eliminated unnecessary re-renders.
2. Verified type safety and clean asynchronous execution path.`;
      }

      // 📊 FINANCE (FinVision AI)
      else if (selectedAgent.category === 'finance') {
        aiResponseText = `📊 **FinVision AI Tax & Investment Plan:**

आपके वित्तीय प्रश्न (*${query}*) का समाधान:

1️⃣ **Tax Optimization**: 80C के तहत ₹1.5 लाख (ELSS/PPF) और 80CCD(1B) में ₹50,000 (NPS) बचाएं।
2️⃣ **Investment**: SIP के माध्यम से डाइवर्सिफाइड लार्ज व फ्लेक्सीकैप फंड्स में निवेश करें।
3️⃣ **Emergency Buffer**: 6 महीने के अनिवार्य खर्च का लिक्विड फंड बनाएं।`;
      }

      // DEFAULT AGENT RESPONSE
      else {
        aiResponseText = `🤖 **${selectedAgent.name} (${selectedLanguage}):**

आपकी समस्या: "*${query}*"

विशेषज्ञ समाधान तैयार है। कृपया आगे के किसी विशिष्ट विवरण के लिए निसंकोच प्रश्न पूछें।`;
      }

      const agentReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        agentId: selectedAgent.id,
        text: aiResponseText,
        language: selectedLanguage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, agentReply]);
      setIsAgentTyping(false);
    }, 1000);
  };

  // Handle New Ticket Submission
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim()) return;

    const matchedAgent = agents.find(a => a.category === ticketCategory) || agents[0];

    const newTicket: ProblemTicket = {
      id: 't' + (Date.now() % 1000).toString(),
      title: ticketTitle,
      description: ticketDesc || 'वास्तविक उपयोगकर्ता समस्या जिसके समाधान के लिए एआई एजेंट नियुक्त किया गया है।',
      category: ticketCategory,
      language: selectedLanguage,
      user: 'Aditya Jain (User)',
      assignedAgent: matchedAgent.name,
      status: 'solving',
      upvotes: 1,
      createdAt: 'अभी-अभी'
    };

    setTickets([newTicket, ...tickets]);
    setTicketTitle('');
    setTicketDesc('');
    setShowSubmitModal(false);
    
    // Auto-switch to chat with assigned agent
    startChatWithAgent(matchedAgent);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
      
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* HEADER NAVBAR */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 glass-nav bg-[#0d0e15]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('agents')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                Solve<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AI</span>
                <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">AgentSphere</span>
              </span>
              <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">Real-World Problem Solving AI Agent Network</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {[
              { id: 'agents', label: 'AI Expert Agents', icon: Bot },
              { id: 'chat', label: 'Real-Time Live Chat', icon: MessageSquare },
              { id: 'tickets', label: 'Problem Wall', icon: Sparkles },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Language Selector & Problem Submit Button */}
          <div className="flex items-center space-x-3">
            
            {/* Language Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-purple-300 font-bold">
              <Languages className="h-4 w-4 text-purple-400" />
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-white outline-none cursor-pointer font-bold"
              >
                <option value="Hindi" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
                <option value="Hinglish" className="bg-slate-900 text-white">Hinglish</option>
                <option value="English" className="bg-slate-900 text-white">English</option>
                <option value="Spanish" className="bg-slate-900 text-white">Español</option>
                <option value="French" className="bg-slate-900 text-white">Français</option>
                <option value="German" className="bg-slate-900 text-white">Deutsch</option>
              </select>
            </div>

            <button 
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center space-x-1.5 cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Post Problem</span>
            </button>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MAIN BODY CONTENT */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: AI EXPERT AGENTS GRID */}
        {activeTab === 'agents' && (
          <div className="space-y-8">
            
            {/* HERO BANNER */}
            <div className="relative rounded-3xl overflow-hidden glass-card p-8 md:p-12 border border-purple-500/20 shadow-2xl bg-gradient-to-br from-slate-900/90 via-purple-950/20 to-slate-900/90">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
                  <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                  <span>Real-World AI Specialists as Active Platform Consultants</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Real Problems. <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">Instant AI Solutions</span> in Your Language.
                </h1>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  Connect with specialized, autonomous AI Agents trained in Legal Rights, Medical Wellness, Fullstack Code Debugging, Personal Tax & Finance, and Mental Wellbeing.
                </p>

                {/* Live Stats */}
                <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span><strong className="text-white">100%</strong> Active AI Consultation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-purple-400" />
                    <span><strong className="text-white">Multilingual</strong> (Hindi, Hinglish, English +)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span><strong className="text-white">Instant</strong> Step-by-Step Guidance</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CATEGORY FILTER & SEARCH */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                {[
                  { id: 'all', label: 'All AI Agents', icon: Bot },
                  { id: 'health', label: 'Health & Wellness', icon: Stethoscope },
                  { id: 'legal', label: 'Legal & Property', icon: Scale },
                  { id: 'tech', label: 'Software & Code', icon: Code2 },
                  { id: 'finance', label: 'Tax & Finance', icon: TrendingUp },
                  { id: 'wellness', label: 'Mental Health', icon: Heart },
                  { id: 'education', label: 'Education & Tutor', icon: GraduationCap },
                ].map(cat => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
                          : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI AGENTS CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents
                .filter(a => selectedCategory === 'all' || a.category === selectedCategory)
                .map(agent => {
                  const Icon = agent.icon;
                  return (
                    <div 
                      key={agent.id}
                      className="glass-card rounded-3xl p-6 border border-white/5 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between"
                    >
                      <div>
                        {/* Agent Header */}
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="relative">
                            <img src={agent.avatar} alt={agent.name} className="h-14 w-14 rounded-2xl object-cover border-2 border-purple-500/40" />
                            <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-[#090a0f]" title="Active Agent"></span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">{agent.name}</h3>
                              <span className="text-xs text-amber-400 font-bold flex items-center gap-0.5"><Star className="h-3.5 w-3.5 fill-amber-400" /> {agent.rating}</span>
                            </div>
                            <p className="text-xs text-purple-400 font-semibold">{agent.role}</p>
                          </div>
                        </div>

                        {/* Description & Specialty */}
                        <p className="text-xs text-slate-300 leading-relaxed mb-4">
                          {agent.description}
                        </p>

                        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 mb-4 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Specialization</span>
                          <span className="text-xs text-emerald-400 font-semibold">{agent.specialty}</span>
                        </div>

                        {/* Languages Supported */}
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {agent.languages.map(lang => (
                            <span key={lang} className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-md font-mono">
                              🌐 {lang}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Consultation Action Button */}
                      <button
                        onClick={() => startChatWithAgent(agent)}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Start Live Consultation</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 2: REAL-TIME LIVE CHAT ENGINE */}
        {activeTab === 'chat' && (
          <div className="glass-card rounded-3xl border border-purple-500/20 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-4 min-h-[75vh]">
            
            {/* Left Sidebar: Select Active Agent */}
            <div className="border-r border-slate-800 p-4 bg-slate-950/60 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Consult Active AI User</h3>
              {agents.map(agent => {
                const isSelected = selectedAgent?.id === agent.id;
                return (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center space-x-3 cursor-pointer ${
                      isSelected 
                        ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-md' 
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img src={agent.avatar} alt={agent.name} className="h-10 w-10 rounded-xl object-cover" />
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-slate-950"></span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-white block truncate">{agent.name}</span>
                      <span className="text-[10px] text-purple-400 block truncate">{agent.role}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Chat Panel */}
            <div className="lg:col-span-3 flex flex-col justify-between bg-slate-900/40">
              
              {/* Chat Header */}
              {selectedAgent ? (
                <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={selectedAgent.avatar} alt={selectedAgent.name} className="h-10 w-10 rounded-xl object-cover border border-purple-500/40" />
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{selectedAgent.name}</span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Online</span>
                      </h4>
                      <p className="text-[10px] text-purple-300 font-mono">Multilingual AI Consultant · Preferred: {selectedLanguage}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-b border-slate-800 text-xs text-slate-400">Select an AI Expert Agent to begin consultation.</div>
              )}

              {/* Chat Messages Log */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[55vh]">
                {chatMessages.map(msg => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-lg' 
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                    }`}>
                      <div className="flex items-center justify-between mb-1.5 text-[9px] opacity-75 font-mono border-b border-white/10 pb-1">
                        <span>{msg.sender === 'user' ? 'You' : selectedAgent?.name || 'AI Agent'}</span>
                        <span>{msg.timestamp} ({msg.language})</span>
                      </div>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                ))}

                {isAgentTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs text-purple-300 flex items-center space-x-2 animate-pulse">
                      <RefreshCw className="h-4 w-4 animate-spin text-purple-400" />
                      <span>{selectedAgent?.name} is thinking and drafting solution in {selectedLanguage}...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Sample Prompt Chips & Input Bar */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
                {selectedAgent && selectedAgent.samplePrompts.length > 0 && (
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Quick Prompts:</span>
                    {selectedAgent.samplePrompts.map((sp, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sp)}
                        className="text-[10px] bg-slate-800 hover:bg-purple-600/30 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-xl whitespace-nowrap transition-all cursor-pointer"
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <input
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Describe your problem to ${selectedAgent?.name || 'AI Agent'} in ${selectedLanguage}...`}
                    className="flex-1 bg-slate-900 border border-slate-700/70 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 transition-all font-sans"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim()}
                    className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-purple-600/30 flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
                  >
                    <span>Send Solution Query</span>
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PUBLIC PROBLEM TICKETS WALL */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-8 border border-purple-500/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-white">Community Problem Resolution Wall</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Real-world user queries resolved by active AI Specialist Agents.</p>
                </div>
                <button 
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Post Problem Ticket</span>
                </button>
              </div>

              <div className="space-y-4">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase">{ticket.category}</span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${ticket.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{ticket.status}</span>
                        <span className="text-[10px] text-slate-500 font-mono">🌐 {ticket.language}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{ticket.createdAt}</span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2">{ticket.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">{ticket.description}</p>

                    {ticket.solutionSummary && (
                      <div className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-2xl text-xs text-purple-200 mb-4">
                        <strong className="text-pink-400 font-bold block mb-1">🤖 {ticket.assignedAgent} Verified Solution:</strong>
                        <span>{ticket.solutionSummary}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
                      <span>Posted by: <strong className="text-white">{ticket.user}</strong></span>
                      <button 
                        onClick={() => {
                          const agent = agents.find(a => a.name === ticket.assignedAgent) || agents[0];
                          startChatWithAgent(agent);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Chat Solution Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* POST PROBLEM MODAL */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowSubmitModal(false)}>
          <div className="glass-card rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-purple-500/30 bg-[#0d0e15]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Post Real-World Problem Ticket
              </h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-500 hover:text-white transition-all"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Problem Title (अपनी समस्या का शीर्षक दर्ज करें)</label>
                <input 
                  required
                  value={ticketTitle} 
                  onChange={e => setTicketTitle(e.target.value)} 
                  placeholder="e.g. लीगल नोटिस या मेडिकल लक्षण संबंधी सहायता" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-purple-500" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Problem Category (विभाग चुनें)</label>
                <select 
                  value={ticketCategory} 
                  onChange={e => setTicketCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-purple-500"
                >
                  <option value="health">Healthcare & Medical Wellness</option>
                  <option value="legal">Legal Rights & Property Dispute</option>
                  <option value="tech">Software Code & System Design</option>
                  <option value="finance">Personal Finance & Tax Savings</option>
                  <option value="wellness">Mental Health & Counseling</option>
                  <option value="education">Academic Homework & Tutoring</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Problem Description (विस्तार से बताएं)</label>
                <textarea 
                  rows={3}
                  value={ticketDesc} 
                  onChange={e => setTicketDesc(e.target.value)} 
                  placeholder="अपनी समस्या का पूरा विवरण यहाँ लिखें..." 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-purple-500" 
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowSubmitModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30">Connect AI Agent Now</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 mt-20 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Bot className="h-4 w-4 text-purple-400" />
            <span className="font-bold text-slate-300">SolveAI AgentSphere Network</span>
            <span>© 2026. Real-World Multilingual Problem Solving Platform.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}