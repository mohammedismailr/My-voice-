import React, { useState } from 'react';
import { Mail, Lock, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const { signIn, enterDemoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#171B2B]/90 p-8 shadow-2xl backdrop-blur-2xl">
      {/* Brand Icon & Heading */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 shadow-glow-primary">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Welcome back</h2>
        <p className="mt-1 text-xs text-slate-400">
          Sign in to access your MyVoice conversations
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 h-4 w-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-white/10 bg-[#101321] py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 h-4 w-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-white/10 bg-[#101321] py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-glow-primary hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 transition-all"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo / Guest Access Button */}
      <div className="mt-5 border-t border-white/5 pt-5">
        <button
          type="button"
          onClick={enterDemoMode}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Quick Demo / Guest Mode</span>
        </button>
      </div>

      {/* Switch to Signup */}
      <div className="mt-6 text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-semibold text-purple-400 hover:text-purple-300 underline underline-offset-2"
        >
          Create one now
        </button>
      </div>
    </div>
  );
};
