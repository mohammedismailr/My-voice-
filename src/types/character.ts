import type { SupportedLanguage } from './index';

export type CharacterId =
  | 'beige-mascot'
  | 'yellow-triangle'
  | 'blue-cloud'
  | 'pink-bunny'
  | 'purple-heart';

export interface CharacterColors {
  primary: string;
  secondary: string;
  glow: string;
  accent: string;
  shadow: string;
  stitches: string;
  surfaceGrad: [string, string, string];
  cheekColor: string;
  eyeColor: string;
}

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  species: string;
  accessory: string;
  personality: string;
  traits: string[];
  description: string;
  voicePitch: number; // Pitch modifier for SpeechSynthesis
  voiceRate: number;  // Rate modifier
  greetings: Record<SupportedLanguage, string>;
  colors: CharacterColors;
  themeGradient: string;
}
