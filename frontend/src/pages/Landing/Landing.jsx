import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import ScrambleTextPro from "./Matrix";
import Tilt from "react-parallax-tilt";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function LandingPage() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState(0);
  const navigate = useNavigate();

  // Cursor glow
  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Live dashboard simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const alerts = ["🚨 Server Down", "⚠️ High CPU", "✅ Resolved"];

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  // ✅ FEATURES ARRAY
  const features = [
    { name: "⚡ Alerts" },
    { name: "🤖 AI Routing" },
    { name: "📊 Dashboard", path: "/dashboard" }, // 👈 redirect
    { name: "🚀 Speed" },
  ];

  return (
    <div className="bg-[#050507] text-white relative overflow-hidden">
      {/* 🌌 PARTICLES */}
      <Particles
        init={particlesInit}
        options={{
          background: { color: "transparent" },
          particles: {
            number: { value: 40 },
            size: { value: 2 },
            move: { speed: 0.5 },
            opacity: { value: 0.3 },
          },
        }}
        className="absolute inset-0 -z-10"
      />

      {/* 🔥 Cursor Glow */}
      <div
        className="fixed w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none z-50"
        style={{ left: pos.x - 80, top: pos.y - 80 }}
      />

      {/* 🚀 HERO */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-bold"
        >
          <span className="text-white">Stop Chaos.</span>
          <br />
          <ScrambleTextPro />
        </motion.h1>

        <p className="text-gray-400 mt-6 max-w-xl">
          AI-powered incident response platform that reacts before damage
          happens.
        </p>

        {/* 🔘 BUTTONS */}
        <div className="flex gap-4 mt-8">
          <motion.button
            onClick={() => navigate("/dashboard")}
            whileHover={{ scale: 1.1 }}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-lg"
          >
            Start Free Trial
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-6 py-3 border border-cyan-500/40 text-cyan-400 rounded-xl"
          >
            Live Demo
          </motion.button>
        </div>
      </section>

      {/* ⚡ FEATURES */}
      <section className="py-20 px-10 text-center">
        <h2 className="text-3xl mb-12">Powerful Features</h2>

        <div className="grid md:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <Tilt glareEnable glareMaxOpacity={0.2} key={i}>
              <motion.div
                whileHover={{ y: -10, scale: f.path ? 1.05 : 1 }}
                onClick={() => f.path && navigate(f.path)}
                className={`p-6 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl 
                ${f.path ? "cursor-pointer hover:border-cyan-400" : ""}`}
              >
                {f.name}
              </motion.div>
            </Tilt>
          ))}
        </div>
      </section>

      {/* 📊 LIVE DASHBOARD */}
      <section className="py-20 px-10 text-center">
        <h2 className="text-3xl mb-10">Live Incident Dashboard</h2>

        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
          <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
            <motion.div
              key={status}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-purple-500/20 rounded-lg mb-4"
            >
              {alerts[status]}
            </motion.div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-500/20 p-4 rounded">Server</div>
              <div className="bg-yellow-500/20 p-4 rounded">CPU</div>
              <div className="bg-green-500/20 p-4 rounded">Healthy</div>
            </div>
          </div>
        </Tilt>
      </section>

      {/* 💎 CTA */}
      <section className="py-24 text-center">
        <h2 className="text-4xl mb-6">Ready Before the Next Incident 🚀</h2>

        <motion.button
          onClick={() => navigate("/dashboard")}
          whileHover={{ scale: 1.1 }}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-xl"
        >
          Get Started Now
        </motion.button>
      </section>

      <Footer />
    </div>
  );
}
