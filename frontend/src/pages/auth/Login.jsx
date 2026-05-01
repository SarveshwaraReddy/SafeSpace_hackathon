// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { ShieldAlert, Mail, Lock, CheckCircle2 } from "lucide-react";
// import { motion } from "framer-motion";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = (e) => {
//     e.preventDefault();
//     navigate("/dashboard");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#020617] flex text-slate-200 relative overflow-hidden">
//       {/* Animated Background Glow */}
//       <motion.div
//         animate={{ opacity: [0.3, 0.6, 0.3] }}
//         transition={{ duration: 6, repeat: Infinity }}
//         className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-[140px] rounded-full top-[-100px] left-[-100px]"
//       />

//       {/* Left Section */}
//       <div className="hidden lg:flex flex-1 relative flex-col items-center justify-center p-12 border-r border-white/10">
//         <div className="z-10 flex flex-col items-center text-center">
//           <div className="w-16 h-16 bg-cyan-500/10 backdrop-blur-md text-cyan-400 flex items-center justify-center rounded-2xl border border-cyan-400/20 mb-8 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
//             <ShieldAlert size={32} />
//           </div>

//           <h1 className="text-4xl font-semibold tracking-tight text-white mb-4">
//             SafeSpace
//           </h1>
//           <p className="text-lg text-slate-400 max-w-sm mb-12">
//             Resolve incidents before they escalate.
//           </p>

//           <div className="flex gap-8 text-sm text-slate-500">
//             <div className="flex items-center gap-2">
//               <CheckCircle2 size={16} className="text-cyan-500" /> ENCRYPTED
//             </div>
//             <div className="flex items-center gap-2">
//               <CheckCircle2 size={16} className="text-cyan-500" /> REAL-TIME
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Right Section */}
//       <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 md:p-24 lg:p-32">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.98 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5 }}
//           className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl"
//         >
//           <div className="mb-8">
//             <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">
//               Welcome back
//             </h2>
//             <p className="text-slate-400">
//               Access your dashboard to monitor activity.
//             </p>
//           </div>

//           <form onSubmit={handleLogin} className="space-y-5">
//             {/* Email */}
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//             >
//               <label className="block text-sm text-slate-300 mb-2">
//                 Email address
//               </label>
//               <div className="relative">
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="name@company.com"
//                   required
//                   className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 transition-all"
//                 />
//                 <Mail
//                   className="absolute right-3 top-3.5 text-slate-500"
//                   size={18}
//                 />
//               </div>
//             </motion.div>

//             {/* Password */}
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//             >
//               <div className="flex justify-between mb-2">
//                 <label className="text-sm text-slate-300">Password</label>
//                 <a
//                   href="#"
//                   className="text-sm text-cyan-400 hover:text-cyan-300"
//                 >
//                   Forgot?
//                 </a>
//               </div>
//               <div className="relative">
//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="••••••••"
//                   required
//                   className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 transition-all"
//                 />
//                 <Lock
//                   className="absolute right-3 top-3.5 text-slate-500"
//                   size={18}
//                 />
//               </div>
//             </motion.div>

//             {/* Button */}
//             <motion.button
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               type="submit"
//               className="w-full py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg hover:shadow-cyan-500/30 transition-all mt-4"
//             >
//               Sign In
//             </motion.button>
//           </form>

//           <p className="text-xs text-center text-slate-500 mt-4">
//             Secured with end-to-end encryption
//           </p>

//           <p className="mt-6 text-center text-sm text-slate-400">
//             Don't have an account?{" "}
//             <Link
//               to="/register"
//               className="font-semibold text-white hover:text-cyan-400"
//             >
//               Contact Admin
//             </Link>
//           </p>
//         </motion.div>
//       </div>
//     </div>
//   );
// }

// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { ShieldAlert, Mail, Lock, CheckCircle2 } from "lucide-react";
// import { motion } from "framer-motion";

// const container = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: { staggerChildren: 0.15 },
//   },
// };

// const item = {
//   hidden: { opacity: 0, y: 15 },
//   show: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.5 },
//   },
// };

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [success, setSuccess] = useState(false);

//   const navigate = useNavigate();

//   const handleLogin = (e) => {
//     e.preventDefault();

//     setSuccess(true);

//     setTimeout(() => {
//       navigate("/dashboard");
//     }, 1200);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#020617] flex text-slate-200 relative overflow-hidden">
//       {/* 🌌 Background */}
//       <motion.div
//         animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
//         transition={{ duration: 10, repeat: Infinity }}
//         className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-[140px] rounded-full top-[-100px] left-[-100px]"
//       />

//       {/* 🧩 LEFT */}
//       <div className="hidden lg:flex flex-1 items-center justify-center border-r border-white/10 p-12">
//         <motion.div
//           initial={{ opacity: 0, x: -40 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-center"
//         >
//           <motion.div
//             animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
//             transition={{ duration: 8, repeat: Infinity }}
//             className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-cyan-500/10 border border-cyan-400/20 shadow-[0_0_40px_rgba(6,182,212,0.3)]"
//           >
//             <ShieldAlert size={32} />
//           </motion.div>

//           <h1 className="text-4xl font-semibold text-white mb-4">SafeSpace</h1>

//           <p className="text-slate-400 mb-10">
//             Resolve incidents before they escalate.
//           </p>

//           <div className="flex gap-6 justify-center text-sm text-slate-500">
//             <div className="flex items-center gap-2">
//               <CheckCircle2 size={16} className="text-cyan-500" />
//               ENCRYPTED
//             </div>
//             <div className="flex items-center gap-2">
//               <CheckCircle2 size={16} className="text-cyan-500" />
//               REAL-TIME
//             </div>
//           </div>
//         </motion.div>
//       </div>

//       {/* 🧾 RIGHT */}
//       <div className="flex-1 flex items-center justify-center p-6">
//         <motion.div
//           variants={container}
//           initial="hidden"
//           animate="show"
//           className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl"
//         >
//           {/* 🔥 LOGO SUCCESS ANIMATION */}
//           <motion.div
//             variants={item}
//             animate={
//               success
//                 ? {
//                     scale: [1, 1.3, 1],
//                     boxShadow: [
//                       "0 0 20px rgba(34,197,94,0.3)",
//                       "0 0 60px rgba(34,197,94,0.8)",
//                       "0 0 30px rgba(34,197,94,0.4)",
//                     ],
//                   }
//                 : {
//                     y: [0, -6, 0],
//                     scale: [1, 1.04, 1],
//                     boxShadow: [
//                       "0 0 25px rgba(6,182,212,0.25)",
//                       "0 0 45px rgba(6,182,212,0.45)",
//                       "0 0 25px rgba(6,182,212,0.25)",
//                     ],
//                   }
//             }
//             transition={{
//               duration: success ? 0.8 : 6,
//               repeat: success ? 0 : Infinity,
//               ease: "easeInOut",
//             }}
//             className={`w-14 h-14 mx-auto mb-6 rounded-2xl flex items-center justify-center border ${
//               success
//                 ? "bg-green-500/20 border-green-400"
//                 : "bg-cyan-500/10 border-cyan-400/20"
//             }`}
//           >
//             {success ? "✔" : <ShieldAlert />}
//           </motion.div>

//           {/* Heading */}
//           <motion.div variants={item} className="mb-6 text-center">
//             <h2 className="text-3xl font-semibold text-white">Welcome back</h2>
//             <p className="text-slate-400 text-sm">Access your dashboard</p>
//           </motion.div>

//           {/* Form */}
//           <form onSubmit={handleLogin} className="space-y-5">
//             <motion.div variants={item}>
//               <label className="text-sm text-slate-300 mb-2 block">Email</label>
//               <div className="relative">
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400/40"
//                 />
//                 <Mail className="absolute right-3 top-3.5 text-slate-500" />
//               </div>
//             </motion.div>

//             <motion.div variants={item}>
//               <div className="flex justify-between mb-2">
//                 <label className="text-sm text-slate-300">Password</label>
//                 <span className="text-sm text-cyan-400 cursor-pointer">
//                   Forgot?
//                 </span>
//               </div>
//               <div className="relative">
//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400/40"
//                 />
//                 <Lock className="absolute right-3 top-3.5 text-slate-500" />
//               </div>
//             </motion.div>

//             <motion.button
//               variants={item}
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold shadow-lg hover:shadow-cyan-500/40"
//             >
//               Sign In
//             </motion.button>
//           </form>

//           <motion.p variants={item} className="text-center text-sm mt-6">
//             Don't have an account?{" "}
//             <Link to="/register" className="text-white hover:text-cyan-400">
//               Register
//             </Link>
//           </motion.p>
//         </motion.div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, Mail, Lock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
 const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25, // ⬅ slower stagger
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,         
      ease: "easeInOut",     
    },
  },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    setSuccess(true);

    setTimeout(() => {
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-white relative overflow-hidden">
      {/* 🌌 MULTI LAYER BACKGROUND */}
      <motion.div
  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
  transition={{
    duration: 20,          // ⬅ slower (was 12)
    repeat: Infinity,
    ease: "easeInOut",
  }}
/>
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="absolute w-[500px] h-[500px] bg-blue-500/10 blur-[140px] rounded-full -bottom-40 -right-40"
      />

      {/* 🧩 LEFT SIDE */}
      <div className="hidden lg:flex flex-1 items-center justify-center border-r border-white/10 p-12">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-md"
        >
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 4, -4, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-cyan-500/10 border border-cyan-400/20 shadow-[0_0_50px_rgba(6,182,212,0.4)]"
          >
            <ShieldAlert size={32} />
          </motion.div>

          <h1 className="text-4xl font-semibold mb-4">SafeSpace</h1>
          <p className="text-slate-400 mb-10">
            Resolve incidents before they escalate.
          </p>

          <div className="flex gap-6 justify-center text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-cyan-400" />
              ENCRYPTED
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-cyan-400" />
              REAL-TIME
            </div>
          </div>
        </motion.div>
      </div>

      {/* 🧾 RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative w-full max-w-md p-[1px] rounded-3xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20"
        >
          {/* GLASS CARD */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.7)]">
            {/* LOGO */}
            <motion.div
              variants={item}
              animate={
                success
                  ? {
                      scale: [1, 1.3, 1],
                      boxShadow: [
                        "0 0 20px rgba(34,197,94,0.3)",
                        "0 0 60px rgba(34,197,94,0.8)",
                        "0 0 30px rgba(34,197,94,0.4)",
                      ],
                    }
                  : {
                      y: [0, -6, 0],
                      scale: [1, 1.05, 1],
                    }
              }
              transition={{
                duration: success ? 0.8 : 6,
                repeat: success ? 0 : Infinity,
              }}
              className={`w-14 h-14 mx-auto mb-6 rounded-2xl flex items-center justify-center border ${
                success
                  ? "bg-green-500/20 border-green-400"
                  : "bg-cyan-500/10 border-cyan-400/20"
              }`}
            >
              {success ? "✔" : <ShieldAlert />}
            </motion.div>

            {/* HEADING */}
            <motion.div variants={item} className="text-center mb-6">
              <h2 className="text-3xl font-semibold">Welcome back</h2>
              <p className="text-slate-400 text-sm">Login to continue</p>
            </motion.div>

            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* EMAIL */}
              <motion.div variants={item} className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all"
                />
                <Mail className="absolute right-3 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition" />
              </motion.div>

              {/* PASSWORD */}
              <motion.div variants={item} className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all"
                />
                <Lock className="absolute right-3 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition" />
              </motion.div>

              {/* BUTTON */}
              <motion.button
                variants={item}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="relative w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold overflow-hidden"
              >
                <span className="relative z-10">Sign In</span>

                {/* SHINE EFFECT */}
                <motion.div
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              </motion.button>
            </form>

            {/* FOOTER */}
            <motion.p
              variants={item}
              className="text-center text-sm mt-6 text-slate-400"
            >
              Don't have an account?{" "}
              <Link to="/register" className="text-white hover:text-cyan-400">
                Register
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
