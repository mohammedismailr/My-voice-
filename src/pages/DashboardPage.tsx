import React, { useState, useCallback, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  MessageSquare,
  Bot,
  Volume2,
  Mic,
  Cpu,
} from 'lucide-react';

import { AppLayout } from '../components/layout/AppLayout';
import { Sidebar } from '../components/sidebar/Sidebar';
import { ChatHeader } from '../components/chat/ChatHeader';
import { ChatWindow } from '../components/chat/ChatWindow';
import { MessageInput } from '../components/chat/MessageInput';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { PlushCharacter } from '../components/character/PlushCharacter';
import { CharacterSelector } from '../components/character/CharacterSelector';
import { VoiceControls } from '../components/voice/VoiceControls';
import { ModelSelectorModal } from '../components/models/ModelSelectorModal';
import { CompanionDrawer } from '../components/character/CompanionDrawer';
import { CompanionInspector } from '../components/dashboard/CompanionInspector';
import { CHARACTERS } from '../data/characters';
import { getModelById, DEFAULT_MODEL_ID } from '../data/models';
import type { CharacterConfig, CharacterId } from '../types/character';
import { SOFT_VOICE_PROFILES } from '../data/voiceProfiles';

import { useAuth } from '../hooks/useAuth';
import { useLanguagePreference } from '../hooks/useLanguagePreference';
import { useVoiceState } from '../hooks/useVoiceState';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useConversations } from '../hooks/useConversations';
import { useChat } from '../hooks/useChat';
import { useCharacterPreference } from '../hooks/useCharacterPreference';
import { useAudioVisualizer } from '../hooks/useAudioVisualizer';
import type { SupportedLanguage } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();

  // Character preferences (5 Selectable 3D Plush Characters)
  const { characterId, activeCharacter, setCharacter } = useCharacterPreference('beige-mascot');

  // AI Model Selection & Adaptive Voice Sync
  const [activeModelId, setActiveModelId] = useState<string>(() => {
    return localStorage.getItem('myvoice_active_model') || DEFAULT_MODEL_ID;
  });
  const activeModel = useMemo(() => getModelById(activeModelId), [activeModelId]);

  // View mode: 'companion' (large interactive 3D stage) vs 'chat' (full message transcript)
  const [viewMode, setViewMode] = useState<'companion' | 'chat'>('companion');

  // Language preferences
  const {
    selectedLanguage,
    setLanguage,
    isAutoDetect,
    setAutoDetect,
    handleTextLanguageDetection,
  } = useLanguagePreference();

  // UI state
  const [inputText, setInputText] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isCompanionDrawerOpen, setIsCompanionDrawerOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Voice state machine
  const {
    voiceState,
    errorMessage: voiceErrorMessage,
    transitionTo,
    resetVoiceState,
    isListening,
    isSpeaking,
  } = useVoiceState();

  // Real-time audio visualizer & amplitude measurement
  const { audioLevel, frequencies } = useAudioVisualizer({
    isListening,
    isSpeaking,
    barCount: 8,
  });

  // Speech Synthesis (TTS with Adaptive Soft Voice profiles)
  const {
    isSupported: isTtsSupported,
    settings: voiceSettings,
    updateSettings: updateVoiceSettings,
    speak,
    stopSpeaking,
    replay,
    hasLastSpoken,
    handleModelChange,
  } = useSpeechSynthesis();

  // Handle model change and adapt voice
  const handleSelectModel = useCallback(
    (newModelId: string) => {
      setActiveModelId(newModelId);
      localStorage.setItem('myvoice_active_model', newModelId);
      handleModelChange(newModelId);
    },
    [handleModelChange]
  );

  // Conversations management
  const {
    conversations,
    activeConversationId,
    isLoading: isLoadingConversations,
    selectConversation,
    startNewConversation,
    removeConversation,
    addOrUpdateConversation,
  } = useConversations();

  // Helper to speak with character's personality pitch and adaptive soft voice
  const speakWithCharacter = useCallback(
    (text: string, lang: SupportedLanguage, onDone?: () => void) => {
      speak(
        text,
        lang,
        onDone,
        activeCharacter.voicePitch,
        activeCharacter.voiceRate
      );
    },
    [speak, activeCharacter]
  );

  // Chat management
  const {
    messages,
    isLoadingMessages,
    isSending,
    error: chatError,
    sendMessage,
    messagesEndRef,
  } = useChat({
    activeConversationId,
    onConversationCreated: (newConv) => {
      addOrUpdateConversation(newConv);
    },
    onAssistantSpoke: (aiText, lang) => {
      if (voiceSettings.autoSpeak) {
        transitionTo('speaking');
        speakWithCharacter(aiText, lang, () => {
          transitionTo('idle');
        });
      } else {
        transitionTo('idle');
      }
    },
  });

  // Speech Recognition (STT)
  const {
    isSupported: isSttSupported,
    startListening: startStt,
    stopListening: stopStt,
    cancelListening: cancelStt,
  } = useSpeechRecognition({
    language: selectedLanguage,
    onSpeechStart: () => {
      transitionTo('speech_detected');
    },
    onSpeechResult: (transcript) => {
      setInputText(transcript);
      if (isAutoDetect) {
        handleTextLanguageDetection(transcript);
      }
    },
    onSpeechEnd: (finalTranscript) => {
      if (finalTranscript.trim()) {
        transitionTo('generating');
        const langToSend = isAutoDetect
          ? handleTextLanguageDetection(finalTranscript)
          : selectedLanguage;

        sendMessage(finalTranscript, langToSend, 'voice', activeModel.id)
          .then((success) => {
            if (!success) {
              transitionTo('error', 'Failed to generate response.');
            }
          })
          .catch(() => {
            transitionTo('error', 'Error generating response.');
          });
        setInputText('');
      } else {
        transitionTo('idle');
      }
    },
    onError: (err) => {
      transitionTo('error', err);
    },
  });

  // Handle voice start
  const handleStartListening = useCallback(() => {
    stopSpeaking();
    transitionTo('listening');
    startStt();
  }, [stopSpeaking, transitionTo, startStt]);

  // Handle voice stop
  const handleStopListening = useCallback(() => {
    stopStt();
  }, [stopStt]);

  // Handle voice cancel
  const handleCancelListening = useCallback(() => {
    cancelStt();
    setInputText('');
    resetVoiceState();
  }, [cancelStt, resetVoiceState]);

  // Handle text message submission
  const handleSendText = useCallback(
    async (text: string) => {
      stopSpeaking();
      const langToSend = isAutoDetect
        ? handleTextLanguageDetection(text)
        : selectedLanguage;

      transitionTo('generating');
      setInputText('');
      const success = await sendMessage(text, langToSend, 'text', activeModel.id);
      if (!success) {
        transitionTo('idle');
      }
    },
    [stopSpeaking, isAutoDetect, handleTextLanguageDetection, selectedLanguage, transitionTo, sendMessage, activeModel.id]
  );

  // Play personalized greeting when clicking character or switching
  const handleCharacterGreeting = useCallback(() => {
    const greeting =
      activeCharacter.greetings[selectedLanguage] ||
      activeCharacter.greetings['en-US'];
    transitionTo('speaking');
    speakWithCharacter(greeting, selectedLanguage, () => {
      transitionTo('idle');
    });
  }, [activeCharacter, selectedLanguage, speakWithCharacter, transitionTo]);

  // Active conversation title
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const headerTitle = activeConversation ? activeConversation.title : 'MyVoice Companion';

  // Latest message from assistant or user for speech bubble preview
  const latestMessage = useMemo(() => {
    if (messages.length === 0) return null;
    return messages[messages.length - 1];
  }, [messages]);

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      await removeConversation(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  // If not logged in and not loading auth, redirect
  if (!isAuthLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout
      sidebar={
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => {
            selectConversation(id);
            setViewMode('chat');
          }}
          onNewConversation={() => {
            stopSpeaking();
            startNewConversation();
            setViewMode('companion');
          }}
          onDeleteRequest={(id, e) => {
            e.stopPropagation();
            setDeleteTargetId(id);
          }}
          isLoading={isLoadingConversations}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCompanions={() => setIsCompanionDrawerOpen(true)}
          onOpenModels={() => setIsModelModalOpen(true)}
          activeModelName={activeModel.name}
          activeCompanionName={activeCharacter.name}
        />
      }
      header={
        <div className="flex flex-col w-full">
          <ChatHeader
            title={headerTitle}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onNewConversation={() => {
              stopSpeaking();
              startNewConversation();
              setViewMode('companion');
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setLanguage}
            isAutoDetect={isAutoDetect}
            onToggleAutoDetect={setAutoDetect}
            activeModel={activeModel}
            onOpenModels={() => setIsModelModalOpen(true)}
            onToggleInspector={() => setIsInspectorOpen((prev) => !prev)}
            isInspectorOpen={isInspectorOpen}
          />

          {/* Subheader: Mode Switcher (Plush Companion Stage vs Chat History) */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#0E111E] border-b border-white/5 text-xs">
            {/* View Mode Toggle Pill */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/5">
              <button
                type="button"
                onClick={() => setViewMode('companion')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                  viewMode === 'companion'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow-primary'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="h-3.5 w-3.5" />
                <span>3D Companion</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('chat')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                  viewMode === 'chat'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow-primary'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Chat History {messages.length > 0 && `(${messages.length})`}</span>
              </button>
            </div>

            {/* Current Character Active Pill & Explore Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCompanionDrawerOpen(true)}
                className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold text-white border transition-transform hover:scale-105 cursor-pointer"
                style={{
                  backgroundColor: `${activeCharacter.colors.primary}20`,
                  borderColor: `${activeCharacter.colors.primary}50`,
                }}
              >
                <span className="h-2 w-2 rounded-full animate-ping" style={{ backgroundColor: activeCharacter.colors.primary }} />
                <span>{activeCharacter.name}</span>
                <span className="text-[10px] text-slate-400">({activeCharacter.personality})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModelModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
              >
                <Cpu className="h-3 w-3" />
                <span>{activeModel.name}</span>
              </button>
            </div>
          </div>
        </div>
      }
      inspector={
        isInspectorOpen ? (
          <div className="hidden xl:block h-full">
            <CompanionInspector
              companion={activeCharacter}
              activeModel={activeModel}
              voiceSettings={voiceSettings}
              onUpdateVoiceSettings={updateVoiceSettings}
              onOpenCompanions={() => setIsCompanionDrawerOpen(true)}
              onOpenModels={() => setIsModelModalOpen(true)}
              onTestVoice={() => {
                const sample =
                  selectedLanguage === 'hi-IN'
                    ? `नमस्ते! मैं ${activeCharacter.name} हूँ, आपका सॉफ्ट वॉयस एआई साथी।`
                    : selectedLanguage === 'kn-IN'
                    ? `ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ${activeCharacter.name} ಎಐ ಒಡನಾಡಿ.`
                    : `Hello! I am ${activeCharacter.name}, your ultra-soft voice AI plush companion.`;
                speakWithCharacter(sample, selectedLanguage);
              }}
              onTriggerGreeting={handleCharacterGreeting}
              messagesCount={messages.length}
              selectedLanguage={selectedLanguage}
            />
          </div>
        ) : null
      }
      inputArea={
        <MessageInput
          input={inputText}
          setInput={setInputText}
          onSend={(text) => {
            handleSendText(text);
            setViewMode('chat');
          }}
          isSending={isSending}
          isListening={isListening}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
          isSpeechSupported={isSttSupported}
        />
      }
      modals={
        <>
          <ModelSelectorModal
            isOpen={isModelModalOpen}
            onClose={() => setIsModelModalOpen(false)}
            activeModelId={activeModelId}
            onSelectModel={(model) => handleSelectModel(model.id)}
            onTestVoice={(profileId: string) => {
              const profile = SOFT_VOICE_PROFILES[profileId];
              if (profile) {
                const previewText = `Hello! Previewing the ${profile.name} adaptive soft voice profile.`;
                speak(previewText, 'en-US', undefined, profile.pitch, profile.rate);
              }
            }}
          />

          <CompanionDrawer
            isOpen={isCompanionDrawerOpen}
            onClose={() => setIsCompanionDrawerOpen(false)}
            activeCharacterId={characterId}
            onSelectCharacter={(newId: CharacterId) => {
              setCharacter(newId);
              const char = CHARACTERS[newId];
              if (char && voiceSettings.autoSpeak) {
                const greeting = char.greetings[selectedLanguage] || char.greetings['en-US'];
                transitionTo('speaking');
                speak(greeting, selectedLanguage, () => transitionTo('idle'), char.voicePitch, char.voiceRate);
              }
            }}
            onGreetingPreview={(char: CharacterConfig) => {
              const greeting = char.greetings[selectedLanguage] || char.greetings['en-US'];
              transitionTo('speaking');
              speak(greeting, selectedLanguage, () => transitionTo('idle'), char.voicePitch, char.voiceRate);
            }}
          />

          <SettingsPanel
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setLanguage}
            voiceSettings={voiceSettings}
            onUpdateVoiceSettings={updateVoiceSettings}
            onTestVoice={(text, lang) => speakWithCharacter(text, lang)}
            isSpeechRecognitionSupported={isSttSupported}
            isSpeechSynthesisSupported={isTtsSupported}
            activeModelName={activeModel.name}
            activeCompanionName={activeCharacter.name}
            onOpenCompanions={() => setIsCompanionDrawerOpen(true)}
            onOpenModels={() => setIsModelModalOpen(true)}
          />

          <ConfirmDialog
            isOpen={Boolean(deleteTargetId)}
            title="Delete Conversation"
            message="Are you sure you want to delete this conversation? All associated messages will be permanently removed."
            confirmLabel="Delete"
            isDestructive={true}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeleteTargetId(null)}
          />
        </>
      }
    >
      {viewMode === 'companion' ? (
        /* ========================================================================= */
        /* COMPANION STAGE VIEW: Large Animated 3D Plush Companion with Controls     */
        /* ========================================================================= */
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 flex flex-col items-center justify-between max-w-5xl mx-auto w-full">
          {/* Top Personality Badge & Greeting */}
          <div className="flex flex-col items-center text-center mt-1">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold backdrop-blur-md border shadow-lg cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setIsCompanionDrawerOpen(true)}
              style={{
                backgroundColor: `${activeCharacter.colors.primary}18`,
                borderColor: `${activeCharacter.colors.primary}40`,
                color: activeCharacter.colors.primary,
              }}
              title="Click to explore all companions"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{activeCharacter.name} the {activeCharacter.species}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/90">{activeCharacter.personality}</span>
            </motion.div>
          </div>

          {/* Center Stage: Interactive Speech Bubble & Large 3D Plush Character */}
          <div className="relative my-4 flex flex-col items-center justify-center">
            {/* Interactive Speech Bubble */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={`${activeCharacter.id}-${voiceState}-${inputText}`}
              className="relative mb-4 max-w-md sm:max-w-lg rounded-3xl border border-white/10 bg-[#171B2B]/95 p-4 text-center shadow-2xl backdrop-blur-xl z-20"
            >
              {isListening ? (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                    <Mic className="h-3.5 w-3.5 animate-pulse" />
                    <span>Listening to you...</span>
                  </div>
                  <p className="text-sm font-medium text-white italic">
                    "{inputText || 'Speak now...'}"
                  </p>
                </div>
              ) : voiceState === 'generating' || voiceState === 'processing' ? (
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-purple-300 py-1">
                  <Sparkles className="h-4 w-4 animate-spin text-purple-400" />
                  <span>{activeCharacter.name} is thinking carefully with {activeModel.name}...</span>
                </div>
              ) : isSpeaking ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-300">
                    <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                    <span>{activeCharacter.name} is speaking:</span>
                  </div>
                  <p className="text-sm font-medium text-slate-100 line-clamp-3">
                    "{latestMessage?.content || activeCharacter.greetings[selectedLanguage]}"
                  </p>
                </div>
              ) : voiceState === 'error' ? (
                <p className="text-xs text-red-300 font-medium">
                  {voiceErrorMessage || 'Oops, I had a little trouble hearing you. Try again!'}
                </p>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-100 leading-relaxed">
                    "{activeCharacter.greetings[selectedLanguage] || activeCharacter.greetings['en-US']}"
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Tap me to say hello, or press <strong className="text-slate-300">Talk</strong> to start.
                  </p>
                </div>
              )}

              {/* Speech bubble pointer arrow */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#171B2B] border-r border-b border-white/10 rotate-45" />
            </motion.div>

            {/* Central 3D Plush Character */}
            <div className="relative cursor-pointer">
              <PlushCharacter
                characterId={characterId}
                state={voiceState}
                audioLevel={audioLevel}
                onCharacterClick={handleCharacterGreeting}
                size="xl"
                interactive={true}
              />
            </div>
          </div>

          {/* Prominent Voice Controls & Audio Wave Visualizer */}
          <div className="w-full my-2">
            <VoiceControls
              voiceState={voiceState}
              isListening={isListening}
              isSpeaking={isSpeaking}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              onCancelListening={handleCancelListening}
              onStopSpeaking={stopSpeaking}
              onReplay={replay}
              hasLastSpoken={hasLastSpoken}
              errorMessage={voiceErrorMessage}
              activeCharacter={activeCharacter}
              frequencies={frequencies}
              size="large"
            />
          </div>

          {/* Quick Starter Conversation Prompts */}
          <div className="w-full max-w-2xl my-3 flex flex-wrap items-center justify-center gap-2">
            {[
              { label: 'Explain Quantum AI', prompt: 'Can you explain quantum computing and AI simply?' },
              { label: 'ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ', prompt: 'ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?' },
              { label: 'हिन्दी में चर्चा करें', prompt: 'मुझे भारतीय संस्कृति के बारे में बताइए।' },
              { label: 'Inspire Me Today', prompt: 'Share a creative and inspiring thought for today!' },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  handleSendText(item.prompt);
                  setViewMode('chat');
                }}
                className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-slate-300 hover:border-purple-500/40 hover:bg-white/10 hover:text-white transition-all shadow-sm cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* 5 Selectable Plush Characters Carousel Dock */}
          <div className="w-full max-w-3xl mt-4 pt-3 border-t border-white/5">
            <CharacterSelector
              selectedId={characterId}
              onSelect={(newId) => {
                setCharacter(newId);
                // Trigger celebratory audio greeting
                const char = CHARACTERS[newId];
                if (char && voiceSettings.autoSpeak) {
                  const greeting = char.greetings[selectedLanguage] || char.greetings['en-US'];
                  transitionTo('speaking');
                  speak(greeting, selectedLanguage, () => transitionTo('idle'), char.voicePitch, char.voiceRate);
                }
              }}
              compact={false}
            />
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* CHAT STREAM VIEW: Full Message History with Mini Plush Companion Header   */
        /* ========================================================================= */
        <ChatWindow
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          isSending={isSending}
          error={chatError}
          messagesEndRef={messagesEndRef}
          onSendPrompt={handleSendText}
          voiceState={voiceState}
          isListening={isListening}
          isSpeaking={isSpeaking}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
          onCancelListening={handleCancelListening}
          onStopSpeaking={stopSpeaking}
          onReplay={replay}
          hasLastSpoken={hasLastSpoken}
          voiceErrorMessage={voiceErrorMessage}
          onSpeakMessage={(text, lang) => {
            transitionTo('speaking');
            speakWithCharacter(text, lang, () => transitionTo('idle'));
          }}
          characterId={characterId}
          activeCharacter={activeCharacter}
          audioLevel={audioLevel}
          frequencies={frequencies}
        />
      )}
    </AppLayout>
  );
};
