import { useState, useEffect, useRef, useCallback } from 'react';
import type { SupportedLanguage, VoiceSettings } from '../types';

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  autoSpeak: true,
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

const LOCAL_STORAGE_VOICE_SETTINGS = 'myvoice_tts_settings';

export function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [lastSpokenText, setLastSpokenText] = useState<string>('');
  const [lastSpokenLang, setLastSpokenLang] = useState<SupportedLanguage>('en-US');

  const [settings, setSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_VOICE_SETTINGS);
    if (saved) {
      try {
        return { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(saved) };
      } catch {
        // fallback
      }
    }
    return DEFAULT_VOICE_SETTINGS;
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(LOCAL_STORAGE_VOICE_SETTINGS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    utteranceRef.current = null;
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking]);

  const resumeSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  // Clean Markdown formatting from text before speaking
  const cleanMarkdownForSpeech = (text: string): string => {
    return text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[#*_~>]/g, '')
      .replace(/\n+/g, '. ')
      .trim();
  };

  const getVoiceForLanguage = useCallback((lang: SupportedLanguage): SpeechSynthesisVoice | null => {
    if (availableVoices.length === 0) return null;

    // Search exact match (e.g. 'hi-IN', 'kn-IN', 'en-US')
    let matched = availableVoices.find((v) => v.lang.toLowerCase() === lang.toLowerCase());
    if (matched) return matched;

    // Search prefix match ('hi', 'kn', 'en')
    const langPrefix = lang.split('-')[0].toLowerCase();
    matched = availableVoices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
    if (matched) return matched;

    // Fallback default voice
    return availableVoices.find((v) => v.default) || availableVoices[0] || null;
  }, [availableVoices]);

  const speak = useCallback(
    (
      text: string,
      language: SupportedLanguage = 'en-US',
      onComplete?: () => void,
      customPitch?: number,
      customRate?: number
    ) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setIsSupported(false);
        return;
      }

      if (!text || text.trim().length === 0) return;

      // Cancel any ongoing speech first
      stopSpeaking();

      const cleanedText = cleanMarkdownForSpeech(text);
      if (!cleanedText) return;

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utteranceRef.current = utterance;

      utterance.lang = language;
      utterance.rate = customRate !== undefined ? customRate : settings.rate;
      utterance.pitch = customPitch !== undefined ? customPitch : settings.pitch;
      utterance.volume = settings.volume;

      const voice = getVoiceForLanguage(language);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setLastSpokenText(text);
        setLastSpokenLang(language);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
        onComplete?.();
      };

      utterance.onerror = (event) => {
        // 'interrupted' or 'canceled' are normal when stopSpeaking() is called
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.warn('Speech synthesis error:', event.error);
        }
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };

      // Workaround for Chrome bug where long utterances stall after ~15s
      window.speechSynthesis.speak(utterance);
    },
    [stopSpeaking, settings, getVoiceForLanguage]
  );

  const replay = useCallback(
    (onComplete?: () => void) => {
      if (lastSpokenText) {
        speak(lastSpokenText, lastSpokenLang, onComplete);
      }
    },
    [lastSpokenText, lastSpokenLang, speak]
  );

  return {
    isSupported,
    isSpeaking,
    isPaused,
    availableVoices,
    settings,
    updateSettings,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    replay,
    hasLastSpoken: Boolean(lastSpokenText),
  };
}
