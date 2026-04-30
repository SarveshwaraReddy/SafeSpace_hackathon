import { useParams, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Users, Clock, Server, CheckSquare } from 'lucide-react';
import SeverityBadge from '../../components/SeverityBadge';
import Timeline from '../../components/Timeline';

export default function Incident() {
  const { id } = useParams();

  const dummyTimeline = [
    { type: 'critical', title: 'Severity upgraded to Critical', description: 'Automatic escalation by PagerDuty based on 25% global auth failure rate.', timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
    { type: 'info', title: 'War Room Initialized', description: 'Slack channel #inc-db-timeout created and SRE on-call joined.', timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
    { type: 'warning', title: 'First detection', description: 'Anomaly detected in RDS Connection Latency metric for auth-db-01.', timestamp: new Date(Date.now() - 25 * 60000).toISOString() },
  ];

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto flex gap-8">
      {/* Sidebar Info */}
      <div className="w-80 shrink-0 space-y-6">
        <Link to="/incidents" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4">
          <ArrowLeft size={16} /> Back to Incidents
        </Link>
        
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6">Incident Details</h3>
          <div className="space-y-6 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Service</span>
              <span className="px-2.5 py-1 bg-slate-700/50 rounded-md text-slate-200">Auth Service</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Detected Time</span>
              <span className="text-slate-200">14:32 UTC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Owner Team</span>
              <span className="font-semibold text-slate-200">SRE Core</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Commander</span>
              <div className="flex items-center gap-2 text-slate-200">
                <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] text-white">AC</div>
                Alex Chen
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Affected Infrastructure</h3>
          <div className="flex flex-wrap gap-2">
            {['us-east-1a', 'rds-prod-master', 'k8s-cluster-01'].map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-lg bg-slate-700/30 border border-slate-600/50 text-xs text-slate-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <SeverityBadge severity="Critical" />
              <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">OPEN</span>
              <span className="text-sm font-mono text-slate-500">#INC-2024-0812</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Database Connection Timeout in US-East-1</h1>
          </div>
          <Link to={`/warroom/${id}`} className="flex flex-col items-center justify-center w-32 h-24 rounded-xl bg-cyan-500 text-white hover:bg-cyan-400 transition-colors shadow-[0_0_30px_rgba(6,182,212,0.4)] group">
             <Users size={24} className="mb-2 group-hover:scale-110 transition-transform" />
             <span className="font-semibold text-sm">Open War Room</span>
          </Link>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><CheckSquare size={14} /> Incident Summary</h3>
          <p className="text-slate-300 leading-relaxed text-lg mb-6">
            Ongoing elevated error rates for the <strong className="text-white">Auth Service</strong> across US-East-1. Initial telemetry indicates a spike in database connection latency, resulting in exhaustion of the service connection pool. Users are experiencing HTTP 504 timeouts when attempting to sign in.
          </p>
          <div className="p-4 rounded-lg bg-[#050B14] border border-red-500/20 font-mono text-sm text-red-400">
            Error: "Failed to obtain JDBC Connection; nested exception is java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30005ms."
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Clock size={14} /> Recent Activity</h3>
             <button className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">View Full Timeline</button>
           </div>
           <Timeline events={dummyTimeline} />
        </div>
      </div>
    </div>
  );
}
