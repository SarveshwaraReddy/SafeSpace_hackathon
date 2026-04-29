import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Activity, Users, Settings } from 'lucide-react';
import MessageBox from '../../components/MessageBox';

export default function WarRoom() {
  const { id } = useParams();
  
  const [messages, setMessages] = useState([
    { senderId: 'bot', senderName: 'SafeSpace AI', isBot: true, content: 'War room initialized. Incident: Database Connection Timeout. I have pulled the relevant logs and metrics.', timestamp: new Date(Date.now() - 1000000).toISOString() },
    { senderId: 'user1', senderName: 'Alex Chen (SRE)', isBot: false, content: 'Looking at Datadog now. Spike in active connections to the primary DB.', timestamp: new Date(Date.now() - 500000).toISOString() },
    { senderId: 'me', senderName: 'You', isBot: false, content: 'Should we scale the read replicas to offload?', timestamp: new Date(Date.now() - 200000).toISOString() },
  ]);

  const handleSendMessage = (content) => {
    setMessages([...messages, {
      senderId: 'me',
      senderName: 'You',
      isBot: false,
      content,
      timestamp: new Date().toISOString()
    }]);

    // Simulate bot response if command
    if (content.startsWith('/analyze')) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          senderId: 'bot',
          senderName: 'SafeSpace AI',
          isBot: true,
          content: 'Analyzing recent deployments... Found a PR merged 20 mins ago affecting Auth Service query patterns. Reverting is recommended.',
          timestamp: new Date().toISOString()
        }]);
      }, 1000);
    }
  };

  return (
    <div className="h-screen flex flex-col pt-16">
      {/* Header overrides main app layout padding for full height */}
      <div className="absolute top-0 left-64 right-0 h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <span className="font-bold text-white tracking-tight">WAR ROOM: INC-2024-0812</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-400 font-mono">01:24:05 Elapsed</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex -space-x-2 mr-2">
             <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-cyan-500 flex items-center justify-center text-xs text-white">AC</div>
             <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-emerald-500 flex items-center justify-center text-xs text-white">JD</div>
             <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs text-white">+3</div>
           </div>
           <button className="p-2 text-slate-400 hover:text-white transition-colors"><Settings size={20}/></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Panel (Metrics/Logs) */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-6 h-64">
             <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex flex-col relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
               <h3 className="text-sm font-semibold text-slate-300 mb-2 z-10 flex justify-between">
                 <span>DB Connections</span>
                 <span className="text-red-400">98% capacity</span>
               </h3>
               {/* Dummy Graph */}
               <div className="flex-1 flex items-end gap-1 px-2 z-10">
                 {[20, 30, 25, 40, 50, 45, 60, 80, 95, 98, 97, 99].map((v, i) => (
                   <div key={i} className={`flex-1 rounded-t-sm transition-all duration-500 ${v > 90 ? 'bg-red-500/80' : v > 70 ? 'bg-orange-500/80' : 'bg-cyan-500/80'}`} style={{ height: `${v}%` }} />
                 ))}
               </div>
             </div>
             <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex flex-col">
               <h3 className="text-sm font-semibold text-slate-300 mb-2 flex justify-between">
                 <span>API Latency (p99)</span>
                 <span className="text-orange-400">4.2s</span>
               </h3>
               <div className="flex-1 flex items-end gap-1 px-2">
                 {[10, 12, 15, 14, 20, 25, 40, 60, 85, 70, 80, 95].map((v, i) => (
                   <div key={i} className={`flex-1 rounded-t-sm ${v > 80 ? 'bg-orange-500/80' : 'bg-cyan-500/80'}`} style={{ height: `${v}%` }} />
                 ))}
               </div>
             </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden h-96 flex flex-col font-mono text-sm">
            <div className="bg-slate-800 p-2 border-b border-slate-700 text-slate-400 text-xs flex justify-between">
              <span>tail -f /var/log/auth-service/error.log</span>
              <span className="text-green-500 animate-pulse flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> LIVE</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-2 text-slate-300">
              <div>[14:32:01] <span className="text-blue-400">INFO</span> - Connection pool initialized</div>
              <div>[14:32:05] <span className="text-yellow-400">WARN</span> - Connection time exceeding 1000ms</div>
              <div className="text-red-400">[14:32:10] ERROR - HikariPool-1 - Connection is not available, request timed out after 30005ms.</div>
              <div className="text-red-400">[14:32:11] ERROR - Request failed: java.sql.SQLTransientConnectionException</div>
              <div className="text-red-400">[14:32:15] ERROR - HikariPool-1 - Connection is not available, request timed out after 30005ms.</div>
              <div className="animate-pulse">_</div>
            </div>
          </div>
        </div>

        {/* Right Panel (Chat/Actions) */}
        <div className="w-[400px] border-l border-slate-800 bg-slate-900/30 flex flex-col p-4 z-10">
           <div className="flex-1">
             <MessageBox messages={messages} onSendMessage={handleSendMessage} />
           </div>
        </div>
      </div>
    </div>
  );
}
