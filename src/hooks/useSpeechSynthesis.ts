import { useState, useEffect, useRef, useCallback } from 'react';
import type { SupportedLanguage, VoiceSettings } from '../types';
import {
  SOFT_VOICE_PROFILES,
  MODEL_TO_VOICE_MAP,
  findBestVoiceForProfile,
  type SoftVoiceProfile,
} from '../data/voiceProfiles';

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  autoSpeak: true,
  rate: 0.94,
  pitch: 1.05,
  volume: 0.96,
  adaptiveVoice: true,
  selectedVoiceProfileId: 'soft-warm',
  manualVoiceName: undefined,
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

  // Load voices on mount
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

  /**
   * Adaptive Voice Switching:
   * When an AI model changes, automatically select its recommended soft voice profile.
   */
  const handleModelChange = useCallback(
    (modelId: string): SoftVoiceProfile | null => {
      if (!settings.adaptiveVoice) {
        return null;
      }

      const voiceProfileId = MODEL_TO_VOICE_MAP[modelId] || 'soft-warm';
      const profile = SOFT_VOICE_PROFILES[voiceProfileId];

      if (profile) {
        updateSettings({
          selectedVoiceProfileId: voiceProfileId,
          rate: profile.rate,
          pitch: profile.pitch,
          volume: profile.volume,
        });
        return profile;
      }

      return null;
    },
    [settings.adaptiveVoice, updateSettings]
  );

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

  // Strip Markdown formatting so speech sounds fluent and natural
  const cleanMarkdownForSpeech = (text: string): string => {
    return text
      .replace(/```[\s\S]*?```/g, 'Code snippet omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[#*_~>]/g, '')
      .replace(/\n+/g, '. ')
      .trim();
  };

  /**
   * Resolves the optimal natural voice for the target language,
   * taking into account soft voice profiles or manual override.
   */
  const resolveVoice = useCallback(
    (lang: SupportedLanguage): SpeechSynthesisVoice | null => {
      if (availableVoices.length === 0) return null;

      // 1. If manual voice override is set
      if (settings.manualVoiceName) {
        const manual = availableVoices.find(
          (v) => v.name.toLowerCase() === settings.manualVoiceName?.toLowerCase()
        );
        if (manual) return manual;
      }

      // 2. Adaptive Soft Voice Profile match
      const matched = findBestVoiceForProfile(
        availableVoices,
        settings.selectedVoiceProfileId,
        lang
      );
      if (matched) return matched;

      // 3. Fallback to first available matching language
      const langPrefix = lang.split('-')[0].toLowerCase();
      const langFallback = availableVoices.find((v) =>
        v.lang.toLowerCase().startsWith(langPrefix)
      );
      if (langFallback) return langFallback;

      return availableVoices.find((v) => v.default) || availableVoices[0] || null;
    },
    [availableVoices, settings.manualVoiceName, settings.selectedVoiceProfileId]
  );

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

      stopSpeaking();

      const cleanedText = cleanMarkdownForSpeech(text);
      if (!cleanedText) return;

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utteranceRef.current = utterance;

      utterance.lang = language;
      utterance.rate = customRate !== undefined ? customRate : settings.rate;
      utterance.pitch = customPitch !== undefined ? customPitch : settings.pitch;
      utterance.volume = settings.volume;

      const voice = resolveVoice(language);
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
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.warn('Speech synthesis error:', event.error);
        }
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };

      window.speechSynthesis.speak(utterance);
    },
    [stopSpeaking, settings, resolveVoice]
  );

  const replay = useCallback(
    (onComplete?: () => void) => {
      if (lastSpokenText) {
        speak(lastSpokenText, lastSpokenLang, onComplete);
      }
    },
    [lastSpokenText, lastSpokenLang, speak]
  );

  const testVoice = useCallback(
    (profileId?: string, lang: SupportedLanguage = 'en-US') => {
      const pid = profileId || settings.selectedVoiceProfileId;
      const profile = SOFT_VOICE_PROFILES[pid] || SOFT_VOICE_PROFILES['soft-warm'];
      const phrase = profile.samplePhrase[lang] || profile.samplePhrase['en-US'];
      speak(phrase, lang, undefined, profile.pitch, profile.rate);
    },
    [settings.selectedVoiceProfileId, speak]
  );

  return {
    isSupported,
    isSpeaking,
    isPaused,
    availableVoices,
    settings,
    updateSettings,
    handleModelChange,
    resolveVoice,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    replay,
    testVoice,
    hasLastSpoken: Boolean(lastSpokenText),
  };
}
