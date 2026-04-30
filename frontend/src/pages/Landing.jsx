import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Activity, Users, Zap, CheckCircle2 } from 'lucide-react';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 selection:bg-cyan-500/30">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-500/20 text-cyan-400 flex items-center justify-center rounded-lg border border-cyan-500/30">
            <ShieldAlert size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">SafeSpace</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Platform</a>
            <a href="#" className="hover:text-white transition-colors">Solutions</a>
            <a href="#" className="hover:text-white transition-colors">Integrations</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="px-5 py-2 rounded-full bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative flex flex-col items-center justify-center pt-24 pb-32 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-8 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          v2.4 Now Live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-center text-white max-w-4xl tracking-tight leading-[1.1] mb-6">
          Resolve incidents before they <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">escalate</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 text-center max-w-2xl mb-12 leading-relaxed">
          SafeSpace provides the intelligence and automation needed to detect, route, and resolve critical incidents in seconds.
        </p>
        
        <div className="flex items-center gap-4 mb-20 z-10">
          <Link to="/register" className="px-8 py-3.5 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)] text-lg">
            Get Started
          </Link>
          <a href="#" className="px-8 py-3.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors border border-slate-700 text-lg">
            View Demo
          </a>
        </div>

        {/* Dashboard Mockup Image/Graphic */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full max-w-5xl aspect-video rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
          <div className="w-full h-10 border-b border-slate-800 bg-slate-900/80 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            <div className="mx-auto text-[10px] font-mono text-slate-500 tracking-widest">INCIDENT_DASHBOARD_LIVE</div>
          </div>
          <div className="p-8 h-full flex flex-col gap-6">
            <div className="flex gap-6">
              <div className="w-1/3 h-32 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-center p-6">
                <div className="text-slate-400 text-sm mb-2">Active Incidents</div>
                <div className="text-4xl font-bold text-white">12</div>
              </div>
              <div className="w-2/3 h-32 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-center p-6">
                 <div className="text-slate-400 text-sm mb-4">System Health Over Time</div>
                 <div className="flex items-end gap-2 h-12">
                   {[40, 60, 30, 80, 50, 90, 40, 20, 70, 50, 80, 100].map((h, i) => (
                     <div key={i} className="flex-1 bg-cyan-500/20 rounded-t-sm" style={{ height: `${h}%` }}>
                       <div className="w-full h-full bg-cyan-500 opacity-50 rounded-t-sm" />
                     </div>
                   ))}
                 </div>
              </div>
            </div>
            <div className="flex-1 rounded-xl bg-slate-800/50 border border-slate-700/50" />
          </div>
        </motion.div>
      </main>

      {/* Features */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: 'Real-time Detection', desc: 'Identify anomalies across your entire stack the moment they occur with sub-second latency.' },
              { icon: Zap, title: 'Smart Routing', desc: 'Intelligently direct alerts to the right SRE teams based on historical performance and expertise.' },
              { icon: ShieldAlert, title: 'AI Insights', desc: 'Automated root-cause analysis and remediation suggestions generated by fine-tuned models.' },
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
                  <feat.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-24 px-4 relative z-10 border-t border-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start managing incidents smarter
          </h2>
          <p className="text-lg text-slate-400 mb-12">
            Join the world's most resilient engineering teams in building a safer digital space.
          </p>
          <Link to="/register" className="inline-block px-8 py-4 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)] text-lg">
            Get Started
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
