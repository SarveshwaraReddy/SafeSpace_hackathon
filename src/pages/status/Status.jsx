import { ShieldAlert, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';

export default function Status() {
  const services = [
    { name: 'API Gateway', status: 'operational', uptime: '99.99%' },
    { name: 'Auth Service', status: 'degraded', uptime: '98.50%' },
    { name: 'Database Clusters', status: 'operational', uptime: '99.95%' },
    { name: 'Notification Engine', status: 'operational', uptime: '100%' },
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-cyan-500/20 text-cyan-400 flex items-center justify-center rounded-lg border border-cyan-500/30">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">SafeSpace Status</h1>
            <p className="text-slate-400">Current system status and historical uptime.</p>
          </div>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6 mb-12 flex items-start gap-4">
          <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-orange-500 mb-2">Degraded Performance - Auth Service</h3>
            <p className="text-slate-300 leading-relaxed mb-4">We are currently investigating reports of elevated latency in our US-East-1 authentication service. Users may experience delays during login.</p>
            <div className="text-sm text-slate-500">Last updated: 14 minutes ago</div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-6">System Metrics</h2>
          {services.map((service, i) => (
            <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-4">
                {service.status === 'operational' ? (
                  <CheckCircle2 className="text-emerald-500" size={24} />
                ) : (
                  <Activity className="text-orange-500 animate-pulse" size={24} />
                )}
                <div>
                  <h4 className="font-medium text-white">{service.name}</h4>
                  <div className="text-sm text-slate-400 capitalize mt-1">{service.status}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg text-slate-200">{service.uptime}</div>
                <div className="text-xs text-slate-500">30-day Uptime</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
