import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, User, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex text-slate-200">
      {/* Left side */}
      <div className="hidden lg:flex flex-1 relative flex-col items-center justify-center p-12 overflow-hidden border-r border-slate-800 bg-slate-900/50">
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none" />
        
        <div className="z-10 flex flex-col items-center text-center max-w-md">
          <div className="w-16 h-16 bg-cyan-500/20 text-cyan-400 flex items-center justify-center rounded-2xl border border-cyan-500/30 mb-8 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">The incident management platform you've been looking for</h1>
          <p className="text-slate-400 mb-12">Centralize, resolve, and learn from every incident with enterprise-grade security and intuitive workflows.</p>
          
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center gap-4 text-left w-full">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
               <ShieldAlert size={24} />
            </div>
            <div>
              <div className="font-semibold text-white">SOC2 Type II Certified</div>
              <div className="text-sm text-slate-400 mt-1">Your data is encrypted at rest and in transit.</div>
            </div>
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
          <div className="flex justify-end w-full mb-16">
            <span className="text-sm text-slate-400">Already have an account? <Link to="/login" className="font-semibold text-white hover:text-cyan-400 transition-colors">Log In</Link></span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
            <p className="text-slate-400">Secure your perimeter in minutes.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors pl-10"
                  placeholder="John Doe"
                  required
                />
                <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors pl-10"
                  placeholder="john@company.com"
                  required
                />
                <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors pl-10"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
              </div>
              <p className="text-xs text-slate-500 mt-2">Must be at least 12 characters.</p>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] mt-8"
            >
              Register Account
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
