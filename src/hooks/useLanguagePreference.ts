import { useState, useEffect, useCallback } from 'react';
import type { SupportedLanguage } from '../types';
import { detectLanguage } from '../utils';
import { useAuth } from './useAuth';

const LOCAL_STORAGE_LANG_KEY = 'myvoice_preferred_language';
const LOCAL_STORAGE_AUTO_DETECT_KEY = 'myvoice_auto_detect_lang';

export function useLanguagePreference() {
  const { profile, updateLanguagePreference } = useAuth();

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_LANG_KEY) as SupportedLanguage | null;
    if (saved && ['en-US', 'hi-IN', 'kn-IN'].includes(saved)) {
      return saved;
    }
    return profile?.preferred_language || 'en-US';
  });

  const [isAutoDetect, setIsAutoDetect] = useState<boolean>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_AUTO_DETECT_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  // Sync when profile loads
  useEffect(() => {
    if (profile?.preferred_language && profile.preferred_language !== selectedLanguage) {
      setSelectedLanguage(profile.preferred_language);
    }
  }, [profile?.preferred_language]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
    localStorage.setItem(LOCAL_STORAGE_LANG_KEY, lang);
    updateLanguagePreference(lang);
  }, [updateLanguagePreference]);

  const setAutoDetect = useCallback((enabled: boolean) => {
    setIsAutoDetect(enabled);
    localStorage.setItem(LOCAL_STORAGE_AUTO_DETECT_KEY, String(enabled));
  }, []);

  const handleTextLanguageDetection = useCallback((text: string): SupportedLanguage => {
    if (!isAutoDetect) return selectedLanguage;
    const detected = detectLanguage(text, selectedLanguage);
    if (detected !== selectedLanguage) {
      setLanguage(detected);
    }
    return detected;
  }, [isAutoDetect, selectedLanguage, setLanguage]);

  return {
    selectedLanguage,
    setLanguage,
    isAutoDetect,
    setAutoDetect,
    handleTextLanguageDetection,
  };
}
