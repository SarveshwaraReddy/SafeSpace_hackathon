import { ShieldAlert, Activity, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  return (
    <div className="p-8 pb-20">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Command Center</h1>
          <p className="text-slate-400">Overview of system health and active incidents.</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Active Incidents', value: '3', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'System Uptime', value: '99.98%', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'On-Call Engineers', value: '12', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Avg MTTR', value: '14m', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon size={16} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm h-[400px] flex flex-col">
           <h3 className="text-lg font-semibold text-white mb-6">Incident Volume</h3>
           <div className="flex-1 flex items-end justify-between gap-2 px-4 pb-4">
              {/* Dummy Chart */}
              {[40, 25, 60, 30, 80, 50, 90, 40, 20, 70, 50, 30].map((h, i) => (
                <div key={i} className="w-full bg-cyan-500/20 rounded-t-sm relative group" style={{ height: `${h}%` }}>
                  <div className="absolute inset-0 bg-cyan-500 opacity-50 rounded-t-sm transition-all group-hover:opacity-80" />
                </div>
              ))}
           </div>
        </div>
        
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Alerts</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 items-start p-3 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-700/50">
                <div className="w-2 h-2 rounded-full mt-2 bg-orange-500 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-slate-200">High CPU Usage</div>
                  <div className="text-xs text-slate-500 mt-1">k8s-cluster-01 • 10m ago</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
