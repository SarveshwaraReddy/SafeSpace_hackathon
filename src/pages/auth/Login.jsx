import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login for hackathon
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex text-slate-200">
      {/* Left side - Graphic/Brand */}
      <div className="hidden lg:flex flex-1 relative flex-col items-center justify-center p-12 overflow-hidden border-r border-slate-800 bg-slate-900/50">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />
        
        <div className="z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-cyan-500/20 text-cyan-400 flex items-center justify-center rounded-2xl border border-cyan-500/30 mb-8 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">SafeSpace</h1>
          <p className="text-lg text-slate-400 max-w-sm mb-12">Resolve incidents before they escalate.</p>
          
          <div className="flex gap-8 text-sm font-medium text-slate-500">
             <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-500" /> ENCRYPTED</div>
             <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-500" /> REAL-TIME</div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 md:p-24 lg:p-32 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-slate-400">Access your dashboard to monitor activity.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="name@company.com"
                  required
                />
                <Mail className="absolute right-3 top-3.5 text-slate-500" size={18} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <a href="#" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute right-3 top-3.5 text-slate-500" size={18} />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] mt-8"
            >
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Don't have an account? <Link to="/register" className="font-semibold text-white hover:text-cyan-400 transition-colors">Contact Administrator</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
