import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900/80 border-t border-slate-800 py-12 px-8 z-20 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={18} className="text-cyan-500" />
              <span className="font-semibold text-white text-lg">SafeSpace</span>
            </div>
            <p className="text-sm text-slate-400">
              The intelligence platform for incident resolution.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Platform</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} SafeSpace. Precision in resolution.
          </p>
        </div>
      </div>
    </footer>
  );
}
