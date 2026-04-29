import { Link } from 'react-router-dom';
import { Clock, Activity, MoreVertical, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import SeverityBadge from './SeverityBadge';
import { formatTimeAgo } from '../utils/formatDate';

export default function IncidentCard({ incident, index }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-slate-800/40 border border-slate-700/50 hover:border-cyan-500/30 rounded-xl p-5 flex items-center justify-between transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:bg-slate-800/60 relative overflow-hidden backdrop-blur-sm"
    >
      {/* Subtle left border highlight based on status */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${incident.status === 'Resolved' ? 'bg-emerald-500/50' : 'bg-orange-500/50'} group-hover:w-1.5 transition-all duration-300`} />
      
      <div className="flex-1 min-w-0 pl-2">
        <div className="flex items-center gap-3 mb-1.5">
          <Link to={`/incidents/${incident.id}`} className="text-base font-semibold text-white hover:text-cyan-400 transition-colors truncate block">
            {incident.title}
          </Link>
          <SeverityBadge severity={incident.severity} />
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="font-mono text-slate-500">{incident.displayId}</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><Activity size={12} /> {incident.service}</span>
        </div>
      </div>

      <div className="flex items-center gap-8 ml-6">
        <div className="hidden md:flex flex-col items-end">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            {incident.status === 'Resolved' ? (
               <span className="flex items-center gap-1.5 text-emerald-400"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Resolved</span>
            ) : incident.status === 'Investigating' ? (
               <span className="flex items-center gap-1.5 text-orange-400"><div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Investigating</span>
            ) : (
               <span className="flex items-center gap-1.5 text-blue-400"><div className="w-1.5 h-1.5 rounded-full border border-blue-500" /> Open</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <Clock size={12} />
            {formatTimeAgo(incident.lastUpdated)}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {incident.status !== 'Resolved' && (
            <Link to={`/warroom/${incident.id}`} className="px-3 py-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-medium hover:bg-cyan-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1.5">
              War Room
            </Link>
          )}
          <button className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
