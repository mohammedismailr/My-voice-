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
import { formatTimestamp } from '../../utils';

interface MessageBubbleProps {
  message: Message;
  isSpeakingThis?: boolean;
  onSpeak?: (text: string, lang: SupportedLanguage) => void;
  onStopSpeak?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isSpeakingThis = false,
  onSpeak,
  onStopSpeak,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full items-start gap-3 my-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 shadow-glow-primary">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`relative max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-xl backdrop-blur-md transition-all ${
          isUser
            ? 'bg-gradient-to-r from-purple-700/80 to-indigo-700/80 border border-purple-500/30 text-white'
            : 'bg-[#171B2B]/95 border border-white/10 text-slate-100 hover:border-purple-500/30'
        }`}
      >
        {/* Metadata Header */}
        <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            {isUser ? (
              <>
                {message.input_mode === 'voice' ? (
                  <Mic className="h-3 w-3 text-cyan-300" />
                ) : (
                  <MessageSquare className="h-3 w-3 text-slate-300" />
                )}
                <span className="text-purple-200">You</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 text-cyan-400" />
                <span className="text-cyan-300 font-semibold">MyVoice</span>
              </>
            )}
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 uppercase text-[10px] tracking-wider">{message.language}</span>
          </div>

          <span className="text-[10px] text-slate-400">{formatTimestamp(message.created_at)}</span>
        </div>

        {/* Content Body */}
        <div className="text-sm leading-relaxed break-words prose prose-invert max-w-none prose-p:my-1 prose-pre:my-2 prose-pre:bg-slate-900/90 prose-pre:border prose-pre:border-white/10 prose-code:text-cyan-300">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Action Controls for Assistant Message */}
        {!isUser && (
          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-xs">
            <div className="flex items-center gap-2">
              {/* Text-to-speech button */}
              <button
                type="button"
                onClick={handleAudioToggle}
                title={isSpeakingThis ? 'Stop speaking' : 'Listen to this response'}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
                  isSpeakingThis
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-cyan-300'
                }`}
              >
                {isSpeakingThis ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Listen</span>
                  </>
                )}
              </button>

              {/* Copy button */}
              <button
                type="button"
                onClick={handleCopy}
                title="Copy message"
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all"
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
