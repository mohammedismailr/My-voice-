import React, { useRef, useEffect } from 'react';
import { Send, Mic, Square } from 'lucide-react';

interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (text: string) => void;
  isSending: boolean;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  isSpeechSupported: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  input,
  setInput,
  onSend,
  isSending,
  isListening,
  onStartListening,
  onStopListening,
  isSpeechSupported,
  placeholder = 'Type a message or click the microphone to speak...',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height as content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSending && input.trim()) {
        onSend(input);
      }
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  const isOverLimit = input.length > 4000;
  const isNearLimit = input.length > 3500;

  return (
    <div className="relative w-full max-w-4xl mx-auto px-3 sm:px-4 pb-3 sm:pb-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="relative flex items-end gap-2 rounded-2xl border border-white/10 bg-[#171B2B]/95 p-1.5 sm:p-2 shadow-2xl backdrop-blur-xl focus-within:border-purple-500/50 focus-within:shadow-glow-primary transition-all">
        {/* Microphone Button */}
        {isSpeechSupported && (
          <button
            type="button"
            onClick={handleMicToggle}
            title={isListening ? 'Stop listening' : 'Start speaking'}
            className={`flex h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
              isListening
                ? 'bg-cyan-500 text-slate-950 shadow-glow-secondary animate-pulse'
                : 'text-slate-400 hover:bg-white/5 hover:text-cyan-400'
            }`}
          >
            {isListening ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-5 w-5" />}
          </button>
        )}

        {/* Text Area (16px on mobile prevents iOS Safari unwanted auto-zoom) */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Listening... Speak now' : placeholder}
          rows={1}
          disabled={isSending}
          className="flex-1 max-h-40 resize-none bg-transparent px-2 py-2 text-base sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={() => {
            if (!isSending && input.trim()) {
              onSend(input);
            }
          }}
          disabled={isSending || !input.trim() || isOverLimit}
          title="Send message (Enter)"
          className={`flex h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
            input.trim() && !isSending && !isOverLimit
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow-primary hover:from-purple-500 hover:to-indigo-500'
              : 'bg-white/5 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      {/* Footer hint and character counter */}
      <div className="mt-1.5 flex items-center justify-between px-2 text-[11px] text-slate-500">
        <span>Press <kbd className="rounded bg-slate-800 px-1 py-0.5 text-slate-400">Enter</kbd> to send, <kbd className="rounded bg-slate-800 px-1 py-0.5 text-slate-400">Shift + Enter</kbd> for newline</span>
        {isNearLimit && (
          <span className={isOverLimit ? 'text-red-400 font-semibold' : 'text-amber-400'}>
            {input.length}/4000
          </span>
        )}
      </div>
    </div>
  );
};
