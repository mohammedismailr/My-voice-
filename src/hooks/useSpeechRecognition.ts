import { useState, useEffect, useRef, useCallback } from 'react';
import type { SupportedLanguage } from '../types';

// SpeechRecognition type declarations for webkit prefix
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseSpeechRecognitionProps {
  language: SupportedLanguage;
  onSpeechStart?: () => void;
  onSpeechResult?: (transcript: string, isFinal: boolean) => void;
  onSpeechEnd?: (finalTranscript: string) => void;
  onError?: (errorMessage: string) => void;
}

export function useSpeechRecognition({
  language,
  onSpeechStart,
  onSpeechResult,
  onSpeechEnd,
  onError,
}: UseSpeechRecognitionProps) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef<boolean>(false);
  const fullTranscriptRef = useRef<string>('');

  // Check support on mount
  useEffect(() => {
    const win = window as unknown as IWindowWithSpeech;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const cancelListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
    setTranscript('');
    fullTranscriptRef.current = '';
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  }, []);

  const startListening = useCallback(async () => {
    const win = window as unknown as IWindowWithSpeech;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      onError?.('Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    // Cancel any previous session
    if (recognitionRef.current) {
      cancelListening();
    }

    try {
      // Test audio permission using getUserMedia if available
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop track immediately to free hardware for SpeechRecognition
          stream.getTracks().forEach((track) => track.stop());
          setPermissionDenied(false);
        } catch (permErr: any) {
          if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
            setPermissionDenied(true);
            onError?.('Microphone permission is required. Please allow microphone access in your browser settings.');
            return;
          }
        }
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      isManuallyStoppedRef.current = false;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      setTranscript('');
      setInterimTranscript('');
      fullTranscriptRef.current = '';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onspeechstart = () => {
        onSpeechStart?.();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0].transcript;
          if (res.isFinal) {
            final += text;
          } else {
            interim += text;
          }
        }

        if (final) {
          fullTranscriptRef.current = (fullTranscriptRef.current + ' ' + final).trim();
          setTranscript(fullTranscriptRef.current);
          onSpeechResult?.(fullTranscriptRef.current, true);
        } else if (interim) {
          setInterimTranscript(interim);
          onSpeechResult?.(interim, false);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        if (isManuallyStoppedRef.current) return;

        let userMsg = 'Speech recognition error. Please try again.';
        if (event.error === 'not-allowed') {
          setPermissionDenied(true);
          userMsg = 'Microphone permission was denied. Please allow microphone access.';
        } else if (event.error === 'no-speech') {
          userMsg = 'No speech was detected. Please try speaking again.';
        } else if (event.error === 'audio-capture') {
          userMsg = 'No microphone was found or microphone is busy.';
        } else if (event.error === 'network') {
          userMsg = 'Network error occurred during speech recognition.';
        }

        onError?.(userMsg);
      };

      recognition.onend = () => {
        setIsListening(false);
        const finalRecorded = fullTranscriptRef.current.trim();
        if (!isManuallyStoppedRef.current && finalRecorded.length > 0) {
          onSpeechEnd?.(finalRecorded);
        }
      };

      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      console.error('Speech recognition start failed:', err);
      onError?.(err.message || 'Unable to start microphone.');
    }
  }, [language, cancelListening, onSpeechStart, onSpeechResult, onSpeechEnd, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelListening();
    };
  }, [cancelListening]);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    permissionDenied,
    startListening,
    stopListening,
    cancelListening,
  };
}
