import { useState, useRef, useEffect } from "react";
import { Search, Info, ShieldCheck, AlertCircle, Trash2, Send, GraduationCap, MapPin, Calendar, CreditCard, Calculator, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AssistantLogic, AssistantResponse } from "./lib/assistant_logic";
import { SyncService, DataUpdate } from "./lib/sync_service";

interface ChatMessage {
  id: string;
  query: string;
  response: AssistantResponse;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  "What is minimum percentage for CS?",
  "Can A-level students apply?",
  "What is NET?",
  "I have 58%, am I eligible?",
  "When is last date?",
  "Merit for: NET1 140, NET2 155, HSSC 950, SSC 1000"
];

export default function App() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedData, setSyncedData] = useState<DataUpdate | null>(SyncService.getStoredUpdates());
  const [lastSync, setLastSync] = useState<string | null>(syncedData?.timestamp || null);
  const [calcNet, setCalcNet] = useState<number>(0);
  const [calcFsc, setCalcFsc] = useState<number>(0);
  const [calcMatric, setCalcMatric] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    const update = await SyncService.fetchLatestUpdates();
    if (update) {
      setSyncedData(update);
      setLastSync(update.timestamp);
    }
    setIsSyncing(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSearch = (text: string = query) => {
    if (!text.trim()) return;

    setIsTyping(true);
    setQuery("");

    // Simulate fast processing (under 1 sec)
    setTimeout(() => {
      const response = AssistantLogic.processQuery(text);
      const newMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        query: text,
        response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    }, 600);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "High": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Medium": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Low": return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink font-sans selection:bg-nust-blue/10">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-line px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-nust-blue rounded-none flex items-center justify-center text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="text-lg font-bold uppercase tracking-tighter text-nust-blue leading-none">NUST Admissions</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Data Terminal v1.2</p>
                <div className="h-1 w-1 bg-line rounded-full"></div>
                {isOnline ? (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                    <Wifi size={10} /> Sync: Online
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <WifiOff size={10} /> Sync: Offline
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isOnline && (
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className={`p-2 border border-line hover:bg-slate-50 transition-all ${isSyncing ? 'animate-spin' : ''}`}
                title="Sync Latest Data"
              >
                <RefreshCw size={16} />
              </button>
            )}
            {messages.length > 0 && (
              <button 
                onClick={clearChat}
                className="p-2 border border-line text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Clear Chat"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 pb-32 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-8">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 border border-dashed border-line rounded-none bg-white/50"
            >
              <div className="text-center max-w-md mx-auto px-6">
                <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-nust-blue text-nust-blue mb-6">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-ink mb-2">System Initialized</h2>
                <p className="text-sm text-slate-500 mb-8 font-medium">
                  Query the NUST Undergraduate Admissions Database. All responses are derived from verified 2025-26 policy data.
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(q)}
                      className="text-left p-3 bg-white border border-line hover:border-nust-blue hover:bg-nust-blue/5 transition-all group flex items-center justify-between"
                    >
                      <p className="text-xs font-bold text-slate-600 group-hover:text-nust-blue uppercase tracking-wide">{q}</p>
                      <Send size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-nust-blue" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* User Query */}
                  <div className="flex justify-end">
                    <div className="bg-ink text-white px-4 py-2 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] max-w-[80%]">
                      <p className="text-xs font-mono uppercase tracking-wide opacity-50 mb-1">User Query</p>
                      <p className="text-sm font-medium">{msg.query}</p>
                    </div>
                  </div>

                  {/* Assistant Response */}
                  <div className="flex justify-start">
                    <div className="bg-white border border-line rounded-none p-5 max-w-[95%] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-nust-blue"></div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-nust-blue animate-pulse"></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Response Data</span>
                          </div>
                          <p className="text-sm font-bold text-ink leading-relaxed">
                            {msg.response.directAnswer}
                          </p>
                          <p className="text-sm text-slate-600 leading-relaxed border-l-2 border-slate-100 pl-4 italic">
                            {msg.response.supportingDetail}
                          </p>
                        </div>
                        <div className={`shrink-0 px-2 py-1 border font-mono text-[9px] font-bold uppercase tracking-widest ${getConfidenceColor(msg.response.confidence)}`}>
                          CONF: {msg.response.confidence}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-line flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          <Info size={12} className="text-nust-blue" />
                          <span>SRC: {msg.response.source}</span>
                        </div>
                        <span className="font-mono">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </motion.div>
            )}
          </div>
        )}
        </div>

        {/* Sidebar/Quick Info */}
        <aside className="hidden lg:block space-y-6">
          <div className="terminal-card p-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <MapPin size={14} className="text-nust-blue" /> Campus Nodes
            </h3>
            <ul className="space-y-3 text-xs font-bold text-ink uppercase tracking-tight">
              <li className="flex items-center gap-2 border-b border-slate-50 pb-2">
                <span className="w-1 h-1 bg-nust-blue"></span> H-12, Islamabad
              </li>
              <li className="flex items-center gap-2 border-b border-slate-50 pb-2">
                <span className="w-1 h-1 bg-nust-blue"></span> Risalpur
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-nust-blue"></span> Quetta
              </li>
            </ul>
          </div>

          <div className="terminal-card p-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <GraduationCap size={14} className="text-nust-blue" /> Financial Aid
            </h3>
            <div className="space-y-4">
              {syncedData?.scholarships ? (
                syncedData.scholarships.slice(0, 3).map((s, i) => (
                  <div key={i} className="space-y-1 border-l-2 border-nust-blue/20 pl-3">
                    <p className="text-[10px] font-bold text-ink uppercase">{s.name}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{s.details}</p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 italic font-mono uppercase">NO_DATA: SYNC_REQUIRED</p>
              )}
            </div>
          </div>

          <div className="terminal-card p-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Calculator size={14} className="text-nust-blue" /> Merit Processor
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">NET_SCORE (MAX 200)</label>
                <input 
                  type="number" 
                  placeholder="000"
                  className="w-full bg-slate-50 border border-line rounded-none py-2 px-3 text-xs font-mono focus:outline-none focus:border-nust-blue"
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) setCalcNet(val);
                  }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">HSSC_MARKS (MAX 1100)</label>
                <input 
                  type="number" 
                  placeholder="0000"
                  className="w-full bg-slate-50 border border-line rounded-none py-2 px-3 text-xs font-mono focus:outline-none focus:border-nust-blue"
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) setCalcFsc(val);
                  }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SSC_MARKS (MAX 1100)</label>
                <input 
                  type="number" 
                  placeholder="0000"
                  className="w-full bg-slate-50 border border-line rounded-none py-2 px-3 text-xs font-mono focus:outline-none focus:border-nust-blue"
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) setCalcMatric(val);
                  }}
                />
              </div>
              {calcNet > 0 && calcFsc > 0 && calcMatric > 0 && (
                <div className="pt-3 mt-2 border-t border-line bg-nust-blue/5 p-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">AGGREGATE:</span>
                    <span className="text-lg font-bold text-nust-blue font-mono">
                      {(((calcNet / 200) * 75) + ((calcFsc / 1100) * 15) + ((calcMatric / 1100) * 10)).toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="terminal-card p-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <CreditCard size={14} className="text-nust-blue" /> Weightage Matrix
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="text-slate-500">NET (Entry Test)</span>
                  <span className="text-nust-blue">75%</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-none overflow-hidden">
                  <div className="bg-nust-blue h-full w-[75%]"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="text-slate-500">HSSC (Inter)</span>
                  <span className="text-nust-blue">15%</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-none overflow-hidden">
                  <div className="bg-nust-blue/60 h-full w-[15%]"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="text-slate-500">SSC (Matric)</span>
                  <span className="text-nust-blue">10%</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-none overflow-hidden">
                  <div className="bg-nust-blue/30 h-full w-[10%]"></div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-line p-4 z-20">
        <div className="max-w-5xl mx-auto">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="relative flex items-center gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ENTER QUERY (E.G. ELIGIBILITY, FEES, MERIT)..."
                className="w-full bg-slate-50 border border-line rounded-none py-4 pl-4 pr-12 text-xs font-mono uppercase tracking-wider focus:outline-none focus:ring-0 focus:border-nust-blue transition-all placeholder:text-slate-300"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                <Search size={18} />
              </div>
            </div>
            <button
              type="submit"
              disabled={!query.trim() || isTyping}
              className="bg-nust-blue text-white px-6 py-4 rounded-none hover:bg-ink disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] font-bold uppercase tracking-widest text-xs"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="flex items-center justify-between mt-3">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">
              {isOnline ? "CONNECTION: ESTABLISHED // SOURCE: NUST.EDU.PK" : "CONNECTION: LOCAL // SOURCE: ENCRYPTED_CACHE"}
            </p>
            {lastSync && (
              <p className="text-[9px] text-slate-400 font-mono uppercase">
                LAST_SYNC: {new Date(lastSync).toISOString()}
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
