import type { SupportedLanguage } from '../types';

export interface SoftVoiceProfile {
  id: string;
  name: string;
  tone: string;
  description: string;
  preferredKeywords: string[];
  pitch: number;
  rate: number;
  volume: number;
  samplePhrase: Record<SupportedLanguage, string>;
}

export const SOFT_VOICE_PROFILES: Record<string, SoftVoiceProfile> = {
  'soft-warm': {
    id: 'soft-warm',
    name: 'Soft Warm Natural',
    tone: 'Soothing & Gentle',
    description: 'A cozy, comforting tone with smooth cadence and gentle warmth. Perfect for daily companion chats.',
    preferredKeywords: ['natural', 'google us english', 'samantha', 'serena', 'karen', 'victoria', 'female'],
    pitch: 1.06,
    rate: 0.94,
    volume: 0.96,
    samplePhrase: {
      'en-US': "Hello there! I'm speaking in my soft warm voice. How does this sound to you?",
      'hi-IN': 'नमस्ते! मैं अपनी सौम्य और शांत आवाज़ में बोल रहा हूँ। यह आपको कैसा लगा?',
      'kn-IN': 'ನಮಸ್ಕಾರ! ನಾನು ನನ್ನ ಮೃದುವಾದ ಧ್ವನಿಯಲ್ಲಿ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ. ಇದು ನಿಮಗೆ ಹೇಗನಿಸುತ್ತದೆ?',
    },
  },
  'soft-expressive': {
    id: 'soft-expressive',
    name: 'Warm Expressive Gentle',
    tone: 'Cheerful & Empathetic',
    description: 'A friendly and bright voice with natural emotional cadence and gentle transitions.',
    preferredKeywords: ['jenny', 'samantha', 'zira', 'google', 'english', 'female'],
    pitch: 1.04,
    rate: 0.92,
    volume: 0.96,
    samplePhrase: {
      'en-US': "Hi friend! This is my warm expressive voice. I'm excited to explore ideas with you!",
      'hi-IN': 'नमस्ते दोस्त! यह मेरी उत्साहवर्धक और मधुर आवाज़ है। आइए नई बातें सीखें!',
      'kn-IN': 'ನಮಸ್ಕಾರ ಸ್ನೇಹಿತರೆ! ಇದು ನನ್ನ ಉತ್ಸಾಹಭರಿತ ಮತ್ತು ಮೃದು ಧ್ವನಿ. ಹೊಸ ವಿಚಾರಗಳನ್ನು ಕಲಿಯೋಣ!',
    },
  },
  'soft-calm': {
    id: 'soft-calm',
    name: 'Calm Intelligent Guide',
    tone: 'Poised & Steady',
    description: 'A grounded, reassuring tone designed for deep explanations and thoughtful reasoning.',
    preferredKeywords: ['david', 'george', 'alex', 'natural', 'google', 'male'],
    pitch: 0.98,
    rate: 0.90,
    volume: 0.95,
    samplePhrase: {
      'en-US': 'Good day. This is my calm analytical voice, ideal for deep focus and structured thinking.',
      'hi-IN': 'नमस्कार। यह मेरी शांत और विचारशील आवाज़ है, जो गहरे चिंतन के लिए उपयुक्त है।',
      'kn-IN': 'ನಮಸ್ಕಾರ. ಇದು ನನ್ನ ಶಾಂತ ಮತ್ತು ಆಳವಾದ ಧ್ವನಿ, ಸ್ಪಷ್ಟ ಚಿಂತನೆಗೆ ಸೂಕ್ತವಾಗಿದೆ.',
    },
  },
  'soft-gentle': {
    id: 'soft-gentle',
    name: 'Velvet Soft Companion',
    tone: 'Sweet & Playful',
    description: 'A light, plush-like voice with a slight uplifting pitch, reminiscent of an adorable physical plush toy.',
    preferredKeywords: ['moira', 'tessa', 'fiona', 'google', 'natural'],
    pitch: 1.08,
    rate: 0.95,
    volume: 0.96,
    samplePhrase: {
      'en-US': "Tee-hee! Here is my velvet soft companion voice. Isn't this super cute and cuddly?",
      'hi-IN': 'अरे वाह! यह मेरी प्यारी और मीठी आवाज़ है। क्या यह बहुत प्यारी नहीं लग रही?',
      'kn-IN': 'ಓಹೋ! ಇದು ನನ್ನ ಮುದ್ದಾದ ಮತ್ತು ಮೃದುವಾದ ಧ್ವನಿ. ಚೆನ್ನಾಗಿದೆಯಲ್ಲವೇ?',
    },
  },
};

/**
 * Model ID to Soft Voice ID Mapping
 */
export const MODEL_TO_VOICE_MAP: Record<string, string> = {
  'gemini-3.5-flash-lite': 'soft-warm',
  'gemini-3.7-flash': 'soft-expressive',
  'gemini-3.8-flash': 'soft-calm',
  'gemini-flash-latest': 'soft-gentle',
};

/**
 * Finds the optimal browser voice matching the requested profile and target language.
 */
export function findBestVoiceForProfile(
  availableVoices: SpeechSynthesisVoice[],
  profileId: string,
  targetLang: SupportedLanguage
): SpeechSynthesisVoice | null {
  if (!availableVoices || availableVoices.length === 0) return null;

  const profile = SOFT_VOICE_PROFILES[profileId] || SOFT_VOICE_PROFILES['soft-warm'];
  const langPrefix = targetLang.split('-')[0].toLowerCase();

  // Filter voices matching the target language
  const langVoices = availableVoices.filter(
    (v) =>
      v.lang.toLowerCase() === targetLang.toLowerCase() ||
      v.lang.toLowerCase().startsWith(langPrefix)
  );

  const candidatePool = langVoices.length > 0 ? langVoices : availableVoices;

  // 1. Try matching preferred keywords in priority order
  for (const keyword of profile.preferredKeywords) {
    const match = candidatePool.find((v) =>
      v.name.toLowerCase().includes(keyword.toLowerCase())
    );
    if (match) return match;
  }

  // 2. Default language voice
  const defaultVoice = candidatePool.find((v) => v.default);
  if (defaultVoice) return defaultVoice;

  return candidatePool[0] || null;
}
