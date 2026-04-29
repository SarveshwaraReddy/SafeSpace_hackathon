import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { formatTimeAgo } from '../utils/formatDate';

export default function MessageBox({ messages, onSendMessage }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl relative backdrop-blur-md">
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm z-10">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          War Room Comms
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.senderId === 'me' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isBot ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-300'}`}>
              {msg.isBot ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`flex flex-col max-w-[75%] ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-medium text-slate-400">{msg.senderName}</span>
                <span className="text-[10px] text-slate-500">{formatTimeAgo(msg.timestamp)}</span>
              </div>
              <div className={`px-4 py-2 rounded-2xl text-sm ${
                msg.isBot ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-50' : 
                msg.senderId === 'me' ? 'bg-primary text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message or /command..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
        />
        <button 
          type="submit"
          disabled={!input.trim()}
          className="bg-primary hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white w-10 flex items-center justify-center rounded-lg transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
