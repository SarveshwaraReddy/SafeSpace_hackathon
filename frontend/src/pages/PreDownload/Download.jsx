 import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let value = 0;

    const interval = setInterval(() => {
      value += Math.random() * 12; // smooth random speed
      if (value >= 100) {
        value = 100;
        clearInterval(interval);

        // small delay for smooth feel
        setTimeout(() => {
          navigate("/home"); // landing route
        }, 500);
      }

      setProgress(value);
    }, 200);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white relative overflow-hidden">

      {/* 🌌 Glow */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600/20 blur-[140px] top-0 left-0"></div>
      <div className="absolute w-[400px] h-[400px] bg-blue-600/20 blur-[140px] bottom-0 right-0"></div>

      <div className="text-center z-10 w-full max-w-md">

        {/* 🔄 Loader Circle */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"
        />

        <h1 className="text-2xl font-semibold mb-2">
          Loading Platform...
        </h1>

        <p className="text-gray-400 mb-6">
          Preparing your experience 🚀
        </p>

        {/* 📊 Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-gray-400">
          {Math.floor(progress)}%
        </p>
      </div>
    </div>
  );
}