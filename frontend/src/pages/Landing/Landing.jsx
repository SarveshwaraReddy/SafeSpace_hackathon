import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ShieldAlert, Activity, Users, Zap, CheckCircle2 } from "lucide-react";
import Footer from "../../components/Footer";
import ScrambleTextPro from "./Matrix";
import Tilt from "react-parallax-tilt";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function LandingPage() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState(0);

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

  return (
    <div className="bg-[#050507] text-white relative overflow-hidden">
      {/* 🌌 PARTICLES BACKGROUND */}
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
          className="text-5xl md:text-7xl font-bold leading-tight text-center"
        >
          <span className="text-white font-[cyr]">Stop Chaos.</span>
          <br />

          <ScrambleTextPro />
        </motion.h1>

        <p className="text-gray-400 mt-6 max-w-xl font-[aeo-bold]">
          AI-powered incident response platform that reacts before damage
          happens.
        </p>

        {/* 🧲 Magnetic Buttons */}
        <div className="flex gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="px-6 py-3 bg-gradient-to-r font-bold font-[cyr]   from-cyan-500 to-blue-500 rounded-xl shadow-lg hover:scale-110 transition text-lg"
          >
            Start Free Trial
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-6 py-3 border font-bold font-[cyr] text-lg border-cyan-500/40 text-cyan-400 rounded-xl hover:bg-cyan-500/10 transition"
          >
            Live Demo
          </motion.button>
        </div>

        {/* 📊 TRUST */}
        <div className="flex gap-10 mt-12 text-gray-400 text-sm">
          <div className="text-lg">
            <b className="text-white">99.99%</b> uptime
          </div>
          <div className="text-lg">
            <b className="text-white">&lt;3s</b> response
          </div>
          <div className="text-lg">
            <b className="text-white">500+</b> teams
          </div>
        </div>
      </section>

      {/* ⚡ FEATURES WITH 3D TILT */}
      <section className="py-20 px-10 text-center">
        <h2 className="text-3xl mb-12">Powerful Features</h2>

        <div className="grid md:grid-cols-4 gap-6">
          {["⚡ Alerts", "🤖 AI Routing", "📊 Dashboard", "🚀 Speed"].map(
            (f, i) => (
              <Tilt glareEnable glareMaxOpacity={0.2} key={i}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl"
                >
                  {f}
                </motion.div>
              </Tilt>
            ),
          )}
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
          whileHover={{ scale: 1.1 }}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-xl hover:scale-110 transition"
        >
          Get Started Now
        </motion.button>
      </section>

      <Footer />
    </div>
  );
}
