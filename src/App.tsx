import { useState, useRef, useEffect } from "react";
import { Search, Info, Trash2, Send, GraduationCap, Wifi, WifiOff, RefreshCw, ShieldCheck } from "lucide-react";
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">NUST Admissions</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Offline Assistant v1.1</p>
                <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                {isOnline ? (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                    <Wifi size={10} /> Live Sync Active
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    <WifiOff size={10} /> Offline Mode
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOnline && (
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className={`p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all ${isSyncing ? 'animate-spin' : ''}`}
                title="Sync Latest Data"
              >
                <RefreshCw size={18} />
              </button>
            )}
            {messages.length > 0 && (
              <button 
                onClick={clearChat}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                title="Clear Chat"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 pb-32">
        {messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-6">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">How can I assist you today?</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              I am a reliable, offline-first admissions officer for NUST Islamabad. I provide factual data without guessing.
            </p>

            {lastSync && (
              <div className="mb-10 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <RefreshCw size={10} /> Last Synced: {new Date(lastSync).toLocaleString()}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(q)}
                  className="text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                >
                  <p className="text-sm font-medium text-slate-700 group-hover:text-blue-700">{q}</p>
                </button>
              ))}
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
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%] shadow-md">
                      <p className="text-sm">{msg.query}</p>
                    </div>
                  </div>

                  {/* Assistant Response */}
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-5 max-w-[90%] shadow-sm space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900 leading-relaxed">
                            {msg.response.directAnswer}
                          </p>
                          {msg.response.supportingDetail && (
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {msg.response.supportingDetail}
                            </p>
                          )}
                        </div>
                        <div className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getConfidenceColor(msg.response.confidence)}`}>
                          {msg.response.confidence}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Info size={12} />
                          <span>Source: {msg.response.source}</span>
                        </div>
                        <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 p-4">
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="relative flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about eligibility, fees, deadlines..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={18} />
              </div>
            </div>
            <button
              type="submit"
              disabled={!query.trim() || isTyping}
              className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-3 font-medium uppercase tracking-widest">
            {isOnline ? "Live Sync Active • Updates from nust.edu.pk" : "100% Offline • No Data Leaves This Device"}
          </p>
        </div>
      </div>
    </div>
  );
}
