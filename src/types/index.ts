export type SupportedLanguage = 'en-US' | 'hi-IN' | 'kn-IN';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  sampleGreeting: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en-US',
    name: 'English',
    nativeName: 'English (US)',
    flag: '🇺🇸',
    sampleGreeting: 'Hello! How can I help you today?',
  },
  {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    sampleGreeting: 'नमस्ते! मैं आपकी कैसे सहायता कर सकता हूँ?',
  },
  {
    code: 'kn-IN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    sampleGreeting: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
  },
];

export type VoiceState =
  | 'idle'
  | 'requesting'
  | 'listening'
  | 'speech_detected'
  | 'processing'
  | 'generating'
  | 'speaking'
  | 'paused'
  | 'error';

export type InputMode = 'text' | 'voice';

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  input_mode: InputMode;
  language: SupportedLanguage;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  language: SupportedLanguage;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface UserProfile {
  id: string;
  display_name: string;
  preferred_language: SupportedLanguage;
  created_at: string;
  updated_at: string;
}

export interface ChatApiRequest {
  conversationId?: string;
  message: string;
  language: SupportedLanguage;
  inputMode: InputMode;
  model?: string;
  companionId?: string;
}

export interface ChatApiResponse {
  success: boolean;
  conversationId?: string;
  userMessage?: Message;
  assistantMessage?: Message;
  error?: string;
  canRetry?: boolean;
}

export interface VoiceSettings {
  autoSpeak: boolean;
  rate: number;
  pitch: number;
  volume: number;
  adaptiveVoice: boolean; // Auto-switches voice when AI model changes
  selectedVoiceProfileId: string; // Profile ID: 'soft-warm', 'soft-expressive', 'soft-calm', etc.
  manualVoiceName?: string; // Optional manual specific voice name
}
