import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.18 },
  },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-white relative overflow-hidden">
      {/* 🌌 Background */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[600px] h-[600px] bg-cyan-500/10 blur-[160px] rounded-full -top-40 -left-40"
      />

      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[500px] h-[500px] bg-purple-500/10 blur-[140px] rounded-full -bottom-40 -right-40"
      />

      {/* 🧩 LEFT SIDE */}
      <div className="hidden lg:flex flex-1 items-center justify-center border-r border-white/10 p-12">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="max-w-md text-center"
        >
          <motion.div
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-cyan-500/10 border border-cyan-400/20 shadow-[0_0_40px_rgba(6,182,212,0.4)]"
          >
            <ShieldAlert size={32} />
          </motion.div>

          <h1 className="text-3xl font-semibold mb-4 leading-tight">
            Secure your platform with confidence
          </h1>

          <p className="text-slate-400 mb-10">
            Manage incidents, protect your data, and scale with enterprise-grade
            security.
          </p>

          <motion.div
            whileHover={{ scale: 1.04 }}
            className="p-5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg flex gap-4 text-left"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <ShieldAlert />
            </div>
            <div>
              <p className="font-semibold">SOC2 Certified</p>
              <p className="text-sm text-slate-400">
                End-to-end encrypted infrastructure
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 🧾 RIGHT SIDE FORM */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.6)] hover:shadow-cyan-500/20 transition-all duration-300"
        >
          {/* Logo */}
          <motion.div
            variants={item}
            animate={{
              rotate: [0, 3, -3, 0],
              y: [0, -6, 0],
              scale: [1, 1.04, 1],
              boxShadow: [
                "0 0 25px rgba(6,182,212,0.25)",
                "0 0 45px rgba(6,182,212,0.45)",
                "0 0 25px rgba(6,182,212,0.25)",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{
              scale: 1.1,
              rotate: 5,
              boxShadow: "0 0 60px rgba(6,182,212,0.6)",
            }}
            className="w-14 h-14 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-cyan-500/10 border border-cyan-400/20"
          >
            <ShieldAlert />
          </motion.div>

          {/* Heading */}
          <motion.div variants={item} className="text-center mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Create Account
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Start your secure journey
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <motion.div variants={item} className="relative group">
              <User
                className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-cyan-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Full Name"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </motion.div>

            {/* Email */}
            <motion.div variants={item} className="relative group">
              <Mail
                className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-cyan-400"
                size={18}
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </motion.div>

            {/* Password */}
            <motion.div variants={item} className="relative group">
              <Lock
                className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-cyan-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 cursor-pointer text-slate-500 hover:text-cyan-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </motion.div>

            {/* Strength */}
            <motion.div variants={item}>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "70%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Use strong password</p>
            </motion.div>

            {/* Button */}
            <motion.button
              variants={item}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold shadow-lg hover:shadow-cyan-500/40"
            >
              Create Account
            </motion.button>
          </form>

          {/* Footer */}
          <motion.p
            variants={item}
            className="text-center text-sm text-slate-400 mt-6"
          >
            Already have an account?{" "}
            <Link to="/login" className="text-white hover:text-cyan-400">
              Login
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
 