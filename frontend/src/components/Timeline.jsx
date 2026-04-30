import { CheckCircle2, AlertTriangle, Info, Clock } from 'lucide-react';
import { formatTimeAgo } from '../utils/formatDate';

export default function Timeline({ events }) {
  return (
    <div className="relative border-l border-slate-700/50 ml-3 space-y-6 pb-4">
      {events.map((event, index) => (
        <div key={index} className="relative pl-6">
          <div className="absolute -left-2 top-1 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center z-10">
            {event.type === 'critical' && <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
            {event.type === 'warning' && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />}
            {event.type === 'info' && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
            {event.type === 'success' && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200">{event.title}</span>
              <span className="text-xs font-mono text-slate-500 flex items-center gap-1"><Clock size={10} /> {formatTimeAgo(event.timestamp)}</span>
            </div>
            <p className="text-sm text-slate-400">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
