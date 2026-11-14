import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { SupportedLanguage } from '../types';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Heuristic language detection for English, Hindi, and Kannada.
 * Checks Unicode blocks:
 * - Kannada: \u0C80-\u0CFF
 * - Devanagari (Hindi): \u0900-\u097F
 */
export function detectLanguage(text: string, fallback: SupportedLanguage = 'en-US'): SupportedLanguage {
  if (!text || text.trim().length === 0) return fallback;

  const trimmed = text.trim();
  const kannadaRegex = /[\u0C80-\u0CFF]/;
  const hindiRegex = /[\u0900-\u097F]/;

  let kannadaCount = 0;
  let hindiCount = 0;
  let latinCount = 0;

  for (const char of trimmed) {
    if (kannadaRegex.test(char)) {
      kannadaCount++;
    } else if (hindiRegex.test(char)) {
      hindiCount++;
    } else if (/[a-zA-Z]/.test(char)) {
      latinCount++;
    }
  }

  if (kannadaCount > 0 && kannadaCount >= hindiCount && kannadaCount >= latinCount) {
    return 'kn-IN';
  }

  if (hindiCount > 0 && hindiCount >= kannadaCount && hindiCount >= latinCount) {
    return 'hi-IN';
  }

  if (latinCount > 0) {
    return 'en-US';
  }

  return fallback;
}

/**
 * Generate a short concise title from the user's first message
 * without needing an extra Gemini API call.
 */
export function generateConversationTitle(firstMessage: string): string {
  if (!firstMessage) return 'New Conversation';
  
  // Clean newlines and excess whitespace
  const clean = firstMessage.replace(/[\r\n]+/g, ' ').trim();
  
  // If short, return as is
  if (clean.length <= 40) {
    return clean;
  }

  // Find a word boundary around 35-40 chars
  const truncated = clean.slice(0, 40);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 20) {
    return `${truncated.slice(0, lastSpace)}...`;
  }

  return `${truncated}...`;
}

/**
 * Format timestamp into human-readable format
 */
export function formatTimestamp(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

/**
 * Sanitize user input to reasonable bounds
 */
export function sanitizeInput(input: string): string {
  return input.trim().slice(0, 4000);
}
