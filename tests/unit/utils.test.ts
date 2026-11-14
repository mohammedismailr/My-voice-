import { describe, it, expect } from 'vitest';
import {
  detectLanguage,
  generateConversationTitle,
  formatTimestamp,
  sanitizeInput,
} from '../../src/utils';

describe('Utils: detectLanguage', () => {
  it('correctly detects English text', () => {
    expect(detectLanguage('Hello, how can I help you today?')).toBe('en-US');
    expect(detectLanguage('What is the weather in Bangalore?')).toBe('en-US');
  });

  it('correctly detects Hindi (Devanagari script) text', () => {
    expect(detectLanguage('नमस्ते! आप कैसे हैं?')).toBe('hi-IN');
    expect(detectLanguage('मुझे भारतीय इतिहास के बारे में बताएं')).toBe('hi-IN');
  });

  it('correctly detects Kannada script text', () => {
    expect(detectLanguage('ನಮಸ್ಕಾರ! ನೀವು ಹೇಗಿದ್ದೀರಿ?')).toBe('kn-IN');
    expect(detectLanguage('ಬೆಂಗಳೂರಿನ ಹವಾಮಾನ ಹೇಗಿದೆ?')).toBe('kn-IN');
  });

  it('falls back to provided fallback language for empty or symbol-only input', () => {
    expect(detectLanguage('', 'hi-IN')).toBe('hi-IN');
    expect(detectLanguage('   ', 'kn-IN')).toBe('kn-IN');
    expect(detectLanguage('12345!@#$', 'en-US')).toBe('en-US');
  });
});

describe('Utils: generateConversationTitle', () => {
  it('preserves short message as title without truncation', () => {
    expect(generateConversationTitle('What is AI?')).toBe('What is AI?');
  });

  it('cleans newlines and excess whitespace', () => {
    expect(generateConversationTitle('Line one\nLine two\r\nLine three')).toBe('Line one Line two Line three');
  });

  it('truncates long messages at word boundaries with ellipsis', () => {
    const longPrompt = 'Can you please explain quantum mechanics and general relativity in very simple terms for beginners?';
    const title = generateConversationTitle(longPrompt);
    expect(title.length).toBeLessThanOrEqual(44);
    expect(title.endsWith('...')).toBe(true);
  });

  it('returns default title for empty input', () => {
    expect(generateConversationTitle('')).toBe('New Conversation');
  });
});

describe('Utils: formatTimestamp', () => {
  it('returns friendly format for recent date', () => {
    const now = new Date().toISOString();
    expect(formatTimestamp(now)).toBe('Just now');
  });

  it('returns empty string for invalid date', () => {
    expect(formatTimestamp('invalid-date')).toBe('');
  });
});

describe('Utils: sanitizeInput', () => {
  it('trims leading and trailing whitespace', () => {
    expect(sanitizeInput('   hello world   ')).toBe('hello world');
  });

  it('clamps text at 4000 characters max', () => {
    const huge = 'a'.repeat(5000);
    expect(sanitizeInput(huge).length).toBe(4000);
  });
});
