import React from 'react';
import { Sparkles, AlertCircle, RotateCcw } from 'lucide-react';
import type { Message, SupportedLanguage, VoiceState } from '../../types';
import type { CharacterConfig, CharacterId } from '../../types/character';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from '../common/TypingIndicator';
import { VoiceOrb } from '../voice/VoiceOrb';
import { VoiceControls } from '../voice/VoiceControls';

interface ChatWindowProps {
  messages: Message[];
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
  onRetry?: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onSendPrompt: (promptText: string) => void;
  // Voice integration props
  voiceState: VoiceState;
  isListening: boolean;
  isSpeaking: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onCancelListening: () => void;
  onStopSpeaking: () => void;
  onReplay: () => void;
  hasLastSpoken: boolean;
  voiceErrorMessage?: string | null;
  onSpeakMessage?: (text: string, lang: SupportedLanguage) => void;
  characterId?: CharacterId;
  activeCharacter?: CharacterConfig;
  audioLevel?: number;
  frequencies?: number[];
}

const SUGGESTED_PROMPTS = [
  {
    title: 'Explain a complex concept',
    desc: 'Explain quantum computing in simple terms',
    lang: 'en-US' as SupportedLanguage,
    flag: '🇺🇸',
  },
  {
    title: 'हिन्दी में चर्चा करें',
    desc: 'मुझे भारतीय अंतरिक्ष अनुसंधान (ISRO) की उपलब्धियों के बारे में बताएं',
    lang: 'hi-IN' as SupportedLanguage,
    flag: '🇮🇳',
  },
  {
    title: 'ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ',
    desc: 'ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI) ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ ಎಂದು ಸರಳವಾಗಿ ವಿವರಿಸಿ',
    lang: 'kn-IN' as SupportedLanguage,
    flag: '🇮🇳',
  },
  {
    title: 'Conversational English',
    desc: 'Help me practice natural daily conversation with tips',
    lang: 'en-US' as SupportedLanguage,
    flag: '🇺🇸',
  },
];

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoadingMessages,
  isSending,
  error,
  onRetry,
  messagesEndRef,
  onSendPrompt,
  voiceState,
  isListening,
  isSpeaking,
  onStartListening,
  onStopListening,
  onCancelListening,
  onStopSpeaking,
  onReplay,
  hasLastSpoken,
  voiceErrorMessage,
  onSpeakMessage,
  characterId = 'beige-mascot',
  activeCharacter,
  audioLevel = 0,
  frequencies = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
}) => {
  const isEmpty = messages.length === 0;

  if (isLoadingMessages) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading conversation history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
      {/* Empty State Welcome */}
      {isEmpty ? (
        <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
          {/* Central Animated 3D Plush Character */}
          <div className="my-4">
            <VoiceOrb
              state={voiceState}
              onOrbClick={isListening ? onStopListening : onStartListening}
              size="lg"
              characterId={characterId}
              audioLevel={audioLevel}
            />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-xs font-semibold text-purple-300 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>{activeCharacter ? `${activeCharacter.name} • ${activeCharacter.personality}` : 'AI Companion'}</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Hello! Meet <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-400 bg-clip-text text-transparent">{activeCharacter?.name || 'MyVoice'}</span>
          </h2>

          <p className="mt-2 text-sm text-slate-400 max-w-md">
            {activeCharacter?.description || 'Speak or type naturally in English, हिन्दी, or ಕನ್ನಡ. Powered by Google Gemini.'}
          </p>

          {/* Voice Controls Bar */}
          <div className="mt-4 mb-6 w-full">
            <VoiceControls
              voiceState={voiceState}
              isListening={isListening}
              isSpeaking={isSpeaking}
              onStartListening={onStartListening}
              onStopListening={onStopListening}
              onCancelListening={onCancelListening}
              onStopSpeaking={onStopSpeaking}
              onReplay={onReplay}
              hasLastSpoken={hasLastSpoken}
              errorMessage={voiceErrorMessage}
              activeCharacter={activeCharacter}
              frequencies={frequencies}
            />
          </div>

          {/* Suggested Starter Prompts */}
          <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSendPrompt(prompt.desc)}
                className="group flex flex-col justify-between rounded-2xl border border-white/5 bg-[#171B2B]/70 p-4 transition-all hover:border-purple-500/40 hover:bg-[#1F2438] hover:shadow-glow-primary"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-purple-300 group-hover:text-cyan-300 transition-colors">
                    {prompt.title}
                  </span>
                  <span className="text-xs">{prompt.flag}</span>
                </div>
                <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  "{prompt.desc}"
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Conversation Message Stream */
        <div className="mx-auto max-w-4xl">
          {/* Top persistent mini voice control if listening or speaking */}
          {(isListening || isSpeaking || voiceState === 'processing') && (
            <div className="sticky top-2 z-10 my-2 flex justify-center">
              <VoiceControls
                voiceState={voiceState}
                isListening={isListening}
                isSpeaking={isSpeaking}
                onStartListening={onStartListening}
                onStopListening={onStopListening}
                onCancelListening={onCancelListening}
                onStopSpeaking={onStopSpeaking}
                onReplay={onReplay}
                hasLastSpoken={hasLastSpoken}
                errorMessage={voiceErrorMessage}
                activeCharacter={activeCharacter}
                frequencies={frequencies}
              />
            </div>
          )}

          {/* Message List */}
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isSpeakingThis={isSpeaking}
              onSpeak={onSpeakMessage}
              onStopSpeak={onStopSpeaking}
              companion={activeCharacter}
            />
          ))}

          {/* Typing Indicator */}
          {isSending && (
            <div className="my-4">
              <TypingIndicator />
            </div>
          )}

          {/* Error Banner with Retry */}
          {error && (
            <div className="my-4 flex items-center justify-between gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-200 shadow-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                <div className="flex-1">
                  <span className="font-semibold">Error:</span> {error}
                </div>
              </div>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/25 border border-red-500/40 text-xs font-semibold text-white hover:bg-red-500/40 transition-all cursor-pointer shadow-sm flex-shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};
