import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Star } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { PlushCharacter } from '../components/character/PlushCharacter';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (!isLoading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between bg-[#080914] px-4 py-8 overflow-hidden">
      {/* Background Ambient Cosmic Lights */}
      <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-purple-600/15 blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-[520px] w-[520px] rounded-full bg-sky-500/15 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[180px] pointer-events-none" />

      {/* Floating Micro-Star Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: '15%', left: '12%', delay: 0 },
          { top: '25%', left: '88%', delay: 1.2 },
          { top: '75%', left: '18%', delay: 2.1 },
          { top: '82%', left: '82%', delay: 0.6 },
          { top: '48%', left: '6%', delay: 1.8 },
          { top: '55%', left: '92%', delay: 2.7 },
        ].map((star, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0.2, scale: 0.8 }}
            animate={{
              opacity: [0.2, 0.9, 0.2],
              scale: [0.8, 1.3, 0.8],
              y: [0, -12, 0],
            }}
            transition={{
              duration: 3 + idx * 0.8,
              repeat: Infinity,
              delay: star.delay,
              ease: 'easeInOut',
            }}
            style={{ top: star.top, left: star.left }}
            className="absolute text-purple-300/40"
          >
            <Star className="h-3.5 w-3.5 fill-current" />
          </motion.div>
        ))}
      </div>

      {/* TOP: Brand Header */}
      <header className="relative z-10 flex flex-col items-center text-center pt-2">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 backdrop-blur-md shadow-sm"
        >
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold tracking-wide text-purple-200">
            MyVoice AI • Next-Gen Conversational Companion
          </span>
        </motion.div>
      </header>

      {/* CENTER: Main Stage with Floating Characters and Glass Login Card */}
      <main className="relative z-10 w-full max-w-6xl flex items-center justify-center my-auto py-6">
        {/* Left Floating Plush Companion (Mochi) on desktop */}
        <div className="hidden lg:flex flex-col items-center mr-8 xl:mr-16 pointer-events-none select-none">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative pointer-events-auto"
          >
            <PlushCharacter
              characterId="beige-mascot"
              state="idle"
              size="lg"
              interactive={true}
            />
            {/* Friendly Mascot Tag Pill */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mt-2 text-center rounded-2xl bg-[#101225]/80 border border-white/10 px-3.5 py-1 backdrop-blur-md shadow-lg"
            >
              <p className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                <span>Mochi</span>
                <span className="text-[10px] text-amber-300">🧸</span>
              </p>
              <p className="text-[10px] text-[#A1A1B5]">"I'm ready to listen!"</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Center: Glassmorphic Login Card */}
        <div className="w-full flex justify-center">
          <LoginForm onSwitchToSignup={() => navigate('/signup')} />
        </div>

        {/* Right Floating Plush Companion (Berry) on desktop */}
        <div className="hidden lg:flex flex-col items-center ml-8 xl:ml-16 pointer-events-none select-none">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative pointer-events-auto"
          >
            <PlushCharacter
              characterId="pink-bunny"
              state="idle"
              size="lg"
              interactive={true}
            />
            {/* Friendly Mascot Tag Pill */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="mt-2 text-center rounded-2xl bg-[#101225]/80 border border-white/10 px-3.5 py-1 backdrop-blur-md shadow-lg"
            >
              <p className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                <span>Berry</span>
                <span className="text-[10px] text-pink-300">🐰</span>
              </p>
              <p className="text-[10px] text-[#A1A1B5]">"Let's chat together!"</p>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* BOTTOM: Supported Auth and Policy Footer */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between w-full max-w-5xl border-t border-white/5 pt-4 text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span>Powered by Google Gemini 3.5</span>
          <span>•</span>
          <span>Adaptive Soft Voice Synthesis</span>
        </div>

        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          <span>•</span>
          <span className="flex items-center gap-1 text-purple-400">
            <Heart className="h-3 w-3 fill-current" /> MyVoice AI
          </span>
        </div>
      </footer>
    </div>
  );
};
