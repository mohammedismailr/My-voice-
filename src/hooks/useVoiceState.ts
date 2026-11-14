import { useState, useCallback } from 'react';
import type { VoiceState } from '../types';

export function useVoiceState() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const transitionTo = useCallback((nextState: VoiceState, err: string | null = null) => {
    setVoiceState(nextState);
    if (err) {
      setErrorMessage(err);
    } else if (nextState !== 'error') {
      setErrorMessage(null);
    }
  }, []);

  const resetVoiceState = useCallback(() => {
    setVoiceState('idle');
    setErrorMessage(null);
  }, []);

  const isListening = voiceState === 'listening' || voiceState === 'speech_detected';
  const isSpeaking = voiceState === 'speaking';
  const isBusy = ['requesting', 'listening', 'speech_detected', 'processing', 'generating', 'speaking'].includes(voiceState);

  return {
    voiceState,
    errorMessage,
    transitionTo,
    resetVoiceState,
    isListening,
    isSpeaking,
    isBusy,
  };
}
