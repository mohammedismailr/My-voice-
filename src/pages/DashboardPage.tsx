import React, { useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Sidebar } from '../components/sidebar/Sidebar';
import { ChatHeader } from '../components/chat/ChatHeader';
import { ChatWindow } from '../components/chat/ChatWindow';
import { MessageInput } from '../components/chat/MessageInput';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

import { useAuth } from '../hooks/useAuth';
import { useLanguagePreference } from '../hooks/useLanguagePreference';
import { useVoiceState } from '../hooks/useVoiceState';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useConversations } from '../hooks/useConversations';
import { useChat } from '../hooks/useChat';

export const DashboardPage: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();

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

  // Speech Synthesis (TTS)
  const {
    isSupported: isTtsSupported,
    settings: voiceSettings,
    updateSettings: updateVoiceSettings,
    speak,
    stopSpeaking,
    replay,
    hasLastSpoken,
  } = useSpeechSynthesis();

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
        speak(aiText, lang, () => {
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

        sendMessage(finalTranscript, langToSend, 'voice')
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
      const success = await sendMessage(text, langToSend, 'text');
      if (!success) {
        transitionTo('idle');
      }
    },
    [stopSpeaking, isAutoDetect, handleTextLanguageDetection, selectedLanguage, transitionTo, sendMessage]
  );

  // Active conversation title
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const headerTitle = activeConversation ? activeConversation.title : 'New Conversation';

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
          onSelectConversation={selectConversation}
          onNewConversation={() => {
            stopSpeaking();
            startNewConversation();
          }}
          onDeleteRequest={(id, e) => {
            e.stopPropagation();
            setDeleteTargetId(id);
          }}
          isLoading={isLoadingConversations}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      }
      header={
        <ChatHeader
          title={headerTitle}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNewConversation={() => {
            stopSpeaking();
            startNewConversation();
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setLanguage}
          isAutoDetect={isAutoDetect}
          onToggleAutoDetect={setAutoDetect}
        />
      }
      inputArea={
        <MessageInput
          input={inputText}
          setInput={setInputText}
          onSend={handleSendText}
          isSending={isSending}
          isListening={isListening}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
          isSpeechSupported={isSttSupported}
        />
      }
      modals={
        <>
          <SettingsPanel
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setLanguage}
            voiceSettings={voiceSettings}
            onUpdateVoiceSettings={updateVoiceSettings}
            onTestVoice={(text, lang) => speak(text, lang)}
            isSpeechRecognitionSupported={isSttSupported}
            isSpeechSynthesisSupported={isTtsSupported}
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
          speak(text, lang, () => transitionTo('idle'));
        }}
      />
    </AppLayout>
  );
};
