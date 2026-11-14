import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';
import { SignupForm } from '../components/auth/SignupForm';
import { PlushCharacter } from '../components/character/PlushCharacter';
import { useAuth } from '../hooks/useAuth';

export const SignupPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (!isLoading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between bg-[#080914] px-4 py-8 overflow-hidden">
      {/* Background Ambient Cosmic Lights */}
      <div className="absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full bg-purple-600/15 blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 h-[520px] w-[520px] rounded-full bg-sky-500/15 blur-[150px] pointer-events-none" />

      {/* Header Badge */}
      <header className="relative z-10 flex flex-col items-center text-center pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 backdrop-blur-md shadow-sm">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold tracking-wide text-purple-200">
            Join MyVoice AI • Choose Your 3D Plush Companion
          </span>
        </div>
      </header>

      {/* Center Stage */}
      <main className="relative z-10 w-full max-w-6xl flex items-center justify-center my-auto py-6">
        {/* Left Floating Mascot (Bubbles) */}
        <div className="hidden lg:flex flex-col items-center mr-8 xl:mr-16 pointer-events-none select-none">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative pointer-events-auto"
          >
            <PlushCharacter
              characterId="blue-cloud"
              state="idle"
              size="lg"
              interactive={true}
            />
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mt-2 text-center rounded-2xl bg-[#101225]/80 border border-white/10 px-3.5 py-1 backdrop-blur-md shadow-lg"
            >
              <p className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                <span>Bubbles</span>
                <span className="text-[10px]">☁️</span>
              </p>
              <p className="text-[10px] text-[#A1A1B5]">"Peaceful & thoughtful"</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Signup Card */}
        <div className="w-full flex justify-center">
          <SignupForm onSwitchToLogin={() => navigate('/login')} />
        </div>

        {/* Right Floating Mascot (Pixel) */}
        <div className="hidden lg:flex flex-col items-center ml-8 xl:mr-16 pointer-events-none select-none">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative pointer-events-auto"
          >
            <PlushCharacter
              characterId="yellow-triangle"
              state="idle"
              size="lg"
              interactive={true}
            />
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              className="mt-2 text-center rounded-2xl bg-[#101225]/80 border border-white/10 px-3.5 py-1 backdrop-blur-md shadow-lg"
            >
              <p className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                <span>Pixel</span>
                <span className="text-[10px]">👓</span>
              </p>
              <p className="text-[10px] text-[#A1A1B5]">"Smart & analytical"</p>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-center border-t border-white/5 pt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1 text-purple-400">
          <Heart className="h-3 w-3 fill-current" /> MyVoice AI • Conversational Intelligence
        </span>
      </footer>
    </div>
  );
};
