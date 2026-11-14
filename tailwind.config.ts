import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090B14',
        sidebar: '#101321',
        card: '#171B2B',
        'card-hover': '#1F2438',
        border: 'rgba(255, 255, 255, 0.08)',
        primary: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          light: '#A78BFA',
          glow: 'rgba(139, 92, 246, 0.35)',
        },
        secondary: {
          DEFAULT: '#22D3EE',
          hover: '#06B6D4',
          light: '#67E8F9',
          glow: 'rgba(34, 211, 238, 0.35)',
        },
        text: {
          DEFAULT: '#F8FAFC',
          muted: '#94A3B8',
          subtle: '#64748B',
        },
        status: {
          success: '#34D399',
          error: '#F87171',
          warning: '#FBBF24',
          info: '#60A5FA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.08)', opacity: '0.9' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'wave-bar': 'wave 1.2s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
      },
      boxShadow: {
        'glow-primary': '0 0 25px -3px rgba(139, 92, 246, 0.45)',
        'glow-secondary': '0 0 25px -3px rgba(34, 211, 238, 0.45)',
        'glow-cyan-violet': '0 0 35px -5px rgba(139, 92, 246, 0.35), 0 0 35px -5px rgba(34, 211, 238, 0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config;
