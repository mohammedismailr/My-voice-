import React from 'react';
import { Mic, MicOff, Square, RotateCcw, VolumeX, Sparkles, AlertCircle } from 'lucide-react';
import type { VoiceState } from '../../types';

interface VoiceControlsProps {
  voiceState: VoiceState;
  isListening: boolean;
  isSpeaking: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onCancelListening: () => void;
  onStopSpeaking: () => void;
  onReplay: () => void;
  hasLastSpoken: boolean;
  errorMessage?: string | null;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  voiceState,
  isListening,
  isSpeaking,
  onStartListening,
  onStopListening,
  onCancelListening,
  onStopSpeaking,
  onReplay,
  hasLastSpoken,
  errorMessage,
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Voice State Badge */}
      <div className="flex items-center gap-2">
        {isListening && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-medium text-cyan-300 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            {voiceState === 'speech_detected' ? 'Speech detected...' : 'Listening... Speak now'}
          </span>
        )}

        {(voiceState === 'processing' || voiceState === 'generating') && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-xs font-medium text-purple-300">
            <Sparkles className="h-3 w-3 animate-spin text-purple-400" />
            Generating response...
          </span>
        )}

        {isSpeaking && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-xs font-medium text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
            Speaking response...
          </span>
        )}

        {voiceState === 'error' && errorMessage && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs font-medium text-red-300">
            <AlertCircle className="h-3 w-3 text-red-400" />
            {errorMessage}
          </span>
        )}
      </div>

      {/* Action Buttons Bar */}
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#171B2B]/90 p-1.5 shadow-xl backdrop-blur-xl">
        {/* Main Mic Toggle */}
        {isListening ? (
          <>
            <button
              type="button"
              onClick={onStopListening}
              title="Finish speaking and send"
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 shadow-glow-secondary transition-all"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              Done
            </button>
            <button
              type="button"
              onClick={onCancelListening}
              title="Cancel voice input"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <MicOff className="h-3.5 w-3.5" />
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onStartListening}
            title="Start voice input"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-glow-primary hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            <Mic className="h-4 w-4" />
            Start Voice
          </button>
        )}

        {/* TTS Stop Speaking Button */}
        {isSpeaking && (
          <button
            type="button"
            onClick={onStopSpeaking}
            title="Stop AI speech"
            className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20 transition-all"
          >
            <VolumeX className="h-3.5 w-3.5" />
            Mute
          </button>
        )}

        {/* Replay Button */}
        {!isSpeaking && hasLastSpoken && (
          <button
            type="button"
            onClick={onReplay}
            title="Replay last AI response"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Replay
          </button>
        )}
      </div>
    </div>
  );
};
