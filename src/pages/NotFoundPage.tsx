import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#090B14] p-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
        <Sparkles className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white">404</h1>
      <p className="mt-2 text-sm text-slate-400 max-w-sm">
        The page you are looking for doesn't exist or has moved.
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-6 flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-glow-primary hover:bg-purple-500 transition-all"
      >
        <Home className="h-4 w-4" />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
};
