import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../redux/slices/authSlice";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) return;

    try {
      await dispatch(loginUser({ email: trimmedEmail, password })).unwrap();
      navigate("/dashboard");
    } catch (error) {
      // Error is handled by Redux
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#020617] flex text-slate-200 relative overflow-hidden">
      {/* Animated Background Glow */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-[140px] rounded-full top-[-100px] left-[-100px]"
      />

      {/* Left Section */}
      <div className="hidden lg:flex flex-1 relative flex-col items-center justify-center p-12 border-r border-white/10">
        <div className="z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-cyan-500/10 backdrop-blur-md text-cyan-400 flex items-center justify-center rounded-2xl border border-cyan-400/20 mb-8 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
            <ShieldAlert size={32} />
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-white mb-4">
            SafeSpace
          </h1>
          <p className="text-lg text-slate-400 max-w-sm mb-12">
            Resolve incidents before they escalate.
          </p>

          <div className="flex gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-cyan-500" /> ENCRYPTED
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-cyan-500" /> REAL-TIME
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 md:p-24 lg:p-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">
              Welcome back
            </h2>
            <p className="text-slate-400">
              Access your dashboard to monitor activity.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400"
            >
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm text-slate-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  disabled={loading}
                  className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 transition-all disabled:opacity-50"
                />
                <Mail
                  className="absolute right-3 top-3.5 text-slate-500"
                  size={18}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-300">Password</label>
                <a
                  href="#"
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 transition-all disabled:opacity-50"
                />
                <Lock
                  className="absolute right-3 top-3.5 text-slate-500"
                  size={18}
                />
              </div>
            </motion.div>

            {/* Button */}
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.03 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg hover:shadow-cyan-500/30 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </motion.button>
          </form>

          <p className="text-xs text-center text-slate-500 mt-4">
            Secured with end-to-end encryption
          </p>
          <p className="text-xs text-center text-slate-600 mt-3 max-w-sm mx-auto leading-relaxed">
            If the backend uses demo mode (<code className="text-slate-500">SKIP_DATABASE=true</code>
            ), sign in as{" "}
            <span className="text-slate-500">admin@safespace.com</span> /{" "}
            <span className="text-slate-500">password</span>.
          </p>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-white hover:text-cyan-400"
            >
              Contact Admin
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
