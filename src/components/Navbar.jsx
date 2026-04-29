import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, AlertTriangle, Activity, Settings, Bell, LogOut } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Incidents', path: '/incidents', icon: AlertTriangle },
    { name: 'Status', path: '/status', icon: Activity },
  ];

  return (
    <div className="w-64 bg-surface border-r border-slate-800 flex flex-col z-20 shadow-xl">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2 text-white no-underline">
          <div className="w-8 h-8 bg-cyan-500/20 text-cyan-400 flex items-center justify-center rounded-lg border border-cyan-500/30">
            <ShieldAlert size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight">SafeSpace</span>
        </Link>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1">
        <div className="text-xs font-semibold text-slate-500 mb-4 px-2 tracking-wider">COMMAND CENTER</div>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              <Icon size={18} className={isActive ? "text-cyan-400" : "text-slate-500"} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors w-full text-left">
          <Settings size={18} className="text-slate-500" />
          Settings
        </button>
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full text-left">
          <LogOut size={18} className="text-red-500/70" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
