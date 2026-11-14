export interface AiModelConfig {
  id: string;
  name: string;
  provider: string;
  version: string;
  badge: string;
  speed: 'Ultra Fast' | 'Fast' | 'Balanced' | 'Reasoning';
  latencyMs: number;
  description: string;
  recommendedVoiceId: string;
  recommendedVoiceName: string;
  defaultRate: number;
  defaultPitch: number;
  isOnline: boolean;
}

export const AI_MODELS: AiModelConfig[] = [
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash Lite',
    provider: 'Google DeepMind',
    version: '3.5',
    badge: 'Recommended',
    speed: 'Ultra Fast',
    latencyMs: 850,
    description: 'Ultra-fast, gentle, and lightweight conversational intelligence. Best for fast audio reactivity.',
    recommendedVoiceId: 'soft-warm',
    recommendedVoiceName: 'Soft Warm Natural',
    defaultRate: 0.94,
    defaultPitch: 1.06,
    isOnline: true,
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'Google DeepMind',
    version: '3.7',
    badge: 'Expressive',
    speed: 'Fast',
    latencyMs: 1100,
    description: 'Enhanced emotional nuance, natural dialogue rhythm, and expressive companion personality.',
    recommendedVoiceId: 'soft-expressive',
    recommendedVoiceName: 'Warm Expressive Gentle',
    defaultRate: 0.92,
    defaultPitch: 1.04,
    isOnline: true,
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'Google DeepMind',
    version: '3.8',
    badge: 'Deep Reasoning',
    speed: 'Reasoning',
    latencyMs: 1600,
    description: 'Advanced reasoning, deep comprehension, multi-step problem solving, and complex synthesis.',
    recommendedVoiceId: 'soft-calm',
    recommendedVoiceName: 'Calm Intelligent Guide',
    defaultRate: 0.90,
    defaultPitch: 0.98,
    isOnline: true,
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    provider: 'Google DeepMind',
    version: 'Preview',
    badge: 'Experimental',
    speed: 'Fast',
    latencyMs: 950,
    description: 'Continuous rolling preview with cutting-edge multilingual fluency and adaptive capabilities.',
    recommendedVoiceId: 'soft-gentle',
    recommendedVoiceName: 'Velvet Soft Companion',
    defaultRate: 0.95,
    defaultPitch: 1.08,
    isOnline: true,
  },
];

export const DEFAULT_AI_MODEL_ID = 'gemini-3.5-flash-lite';
export const DEFAULT_MODEL_ID = DEFAULT_AI_MODEL_ID;

export const getModelById = (id: string): AiModelConfig => {
  return AI_MODELS.find((m) => m.id === id) || AI_MODELS[0];
};
