import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Shield,
  FileText,
  AlertTriangle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { FIRDocument } from '../../types';

interface FIRAIChatModalProps {
  document: FIRDocument;
  onClose: () => void;
  officerName?: string;
}

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  timestamp: string;
  source?: string;
}

const QUICK_PROMPTS = [
  'Summarize this FIR.',
  'What are the main allegations?',
  'What persons are mentioned?',
  'What offences are mentioned?',
  'What evidence is referenced?',
  'What information requires verification?',
  'Give me a timeline of the incident.'
];

export const FIRAIChatModal: React.FC<FIRAIChatModalProps> = ({
  document,
  onClose,
  officerName = 'Officer'
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'AI',
      text: `Hello ${officerName}. I am the DCJMN Document Intelligence Assistant for FIR #${document.extractedFields.firNumber || document.id.slice(0, 8)}. I can analyze the verified facts from the original preserved document. All responses strictly distinguish verified facts from analytical synthesis. How may I assist your inquiry?`,
      timestamp: new Date().toLocaleTimeString(),
      source: 'DCJMN Document Intelligence'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await api.queryFIRAIChat(document.id, textToSend, officerName);
      if (res.success && res.answer) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'AI',
            text: res.answer,
            timestamp: new Date().toLocaleTimeString(),
            source: res.source
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            sender: 'AI',
            text: `Unable to query document intelligence: ${res.error || 'Unknown server error'}`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'AI',
          text: `Connection error with intelligence service: ${err?.message || 'Timeout'}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-xl border border-sky-500/40 bg-[#090D18] shadow-2xl flex flex-col h-[700px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#060A13]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 font-sans tracking-wide">
                  FIR DOCUMENT INTELLIGENCE
                </h3>
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-mono border border-sky-500/30">
                  FIR #{document.extractedFields.firNumber || document.id.slice(0, 8)}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 truncate max-w-md">
                Grounded strictly in SHA-256 anchored original document
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-5 py-2.5 bg-[#080C16] border-b border-slate-800 overflow-x-auto flex gap-2 no-scrollbar">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => sendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-sky-600/30 hover:border-sky-500/50 border border-slate-700 text-[11px] font-mono text-slate-300 hover:text-white shrink-0 transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'AI' && (
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3.5 space-y-1.5 leading-relaxed ${
                  m.sender === 'USER'
                    ? 'bg-sky-600 text-white font-sans'
                    : 'bg-[#0E1524] border border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-70 pb-1 border-b border-white/10">
                  <span>{m.sender === 'USER' ? officerName : 'DCJMN Document Intelligence'}</span>
                  <span>{m.timestamp}</span>
                </div>
                <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                  {m.text}
                </div>
                {m.source && (
                  <div className="text-[10px] text-slate-400 font-mono pt-1">
                    Source: {m.source}
                  </div>
                )}
              </div>

              {m.sender === 'USER' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center text-sky-400 text-xs font-mono">
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span>Querying verified document facts...</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-[#060A13]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything regarding the allegations, persons, or verified facts in this FIR..."
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-700 bg-[#04060B] px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ASK</span>
            </button>
          </form>
          <p className="text-[10px] font-mono text-slate-500 mt-2 text-center">
            Grounded strictly in original FIR. AI will not fabricate unrecorded information.
          </p>
        </div>
      </div>
    </div>
  );
};
