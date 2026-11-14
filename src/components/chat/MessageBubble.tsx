import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import {
  Mic,
  MessageSquare,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import type { Message, SupportedLanguage } from '../../types';
import type { CharacterConfig } from '../../types/character';
import { formatTimestamp } from '../../utils';

interface MessageBubbleProps {
  message: Message;
  isSpeakingThis?: boolean;
  onSpeak?: (text: string, lang: SupportedLanguage) => void;
  onStopSpeak?: () => void;
  companion?: CharacterConfig;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isSpeakingThis = false,
  onSpeak,
  onStopSpeak,
  companion,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleAudioToggle = () => {
    if (isSpeakingThis) {
      onStopSpeak?.();
    } else {
      onSpeak?.(message.content, message.language);
    }
  };

  const companionColor = companion?.colors?.primary || '#8B5CF6';
  const companionAccent = companion?.colors?.accent || '#67E8F9';
  const companionName = companion?.name || 'MyVoice';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full items-start gap-3 my-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* AI Plush Companion Avatar */}
      {!isUser && (
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl p-[1.5px] shadow-lg transition-transform hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${companionColor}, ${companionAccent})`,
            boxShadow: `0 4px 16px ${companionColor}40`,
          }}
        >
          <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0E1122]">
            <Sparkles className="h-4 w-4" style={{ color: companionAccent }} />
          </div>
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`relative max-w-[85%] md:max-w-[75%] rounded-3xl p-4.5 shadow-xl backdrop-blur-md transition-all ${
          isUser
            ? 'bg-gradient-to-r from-purple-700/85 to-indigo-700/85 border border-purple-500/30 text-white rounded-tr-sm'
            : 'bg-[#14182E]/95 border border-white/10 text-slate-100 hover:border-purple-500/30 rounded-tl-sm'
        }`}
      >
        {/* Metadata Header */}
        <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            {isUser ? (
              <>
                {message.input_mode === 'voice' ? (
                  <Mic className="h-3 w-3 text-cyan-300" />
                ) : (
                  <MessageSquare className="h-3 w-3 text-slate-300" />
                )}
                <span className="text-purple-200 font-semibold">You</span>
              </>
            ) : (
              <>
                <span
                  className="font-bold text-xs tracking-tight"
                  style={{ color: companionAccent }}
                >
                  {companionName}
                </span>
                {companion?.species && (
                  <span className="text-[10px] text-slate-400 font-normal">
                    the {companion.species}
                  </span>
                )}
              </>
            )}
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 uppercase text-[10px] tracking-wider font-mono">
              {message.language}
            </span>
          </div>

          <span className="text-[10px] text-slate-400">{formatTimestamp(message.created_at)}</span>
        </div>

        {/* Content Body */}
        <div className="text-sm leading-relaxed break-words prose prose-invert max-w-none prose-p:my-1.5 prose-pre:my-2.5 prose-pre:bg-slate-950/80 prose-pre:border prose-pre:border-white/10 prose-code:text-cyan-300">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Action Controls for Assistant Message */}
        {!isUser && (
          <div className="mt-3.5 flex items-center justify-between border-t border-white/5 pt-2.5 text-xs">
            <div className="flex items-center gap-2">
              {/* Text-to-speech button */}
              <button
                type="button"
                onClick={handleAudioToggle}
                title={isSpeakingThis ? 'Stop speaking' : 'Listen to this response'}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                  isSpeakingThis
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isSpeakingThis ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-red-400" />
                    <span>Stop</span>
                    <span className="flex items-center gap-0.5 ml-1">
                      <span className="h-2 w-0.5 animate-pulse bg-red-400 rounded-full" />
                      <span className="h-3 w-0.5 animate-pulse delay-75 bg-red-400 rounded-full" />
                      <span className="h-1.5 w-0.5 animate-pulse delay-150 bg-red-400 rounded-full" />
                    </span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" style={{ color: companionAccent }} />
                    <span>Listen</span>
                  </>
                )}
              </button>

              {/* Copy button */}
              <button
                type="button"
                onClick={handleCopy}
                title="Copy message"
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
