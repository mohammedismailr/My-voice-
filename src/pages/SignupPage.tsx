import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { SignupForm } from '../components/auth/SignupForm';
import { useAuth } from '../hooks/useAuth';

export const SignupPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (!isLoading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#090B14] p-4 overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full flex justify-center">
        <SignupForm onSwitchToLogin={() => navigate('/login')} />
      </div>
    </div>
  );
};
