import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const chatRequestSchema = z.object({
  conversationId: z.string().uuid().optional().nullable(),
  message: z.string().min(1, 'Message cannot be empty').max(4000, 'Message cannot exceed 4000 characters'),
  language: z.enum(['en-US', 'hi-IN', 'kn-IN']).default('en-US'),
  inputMode: z.enum(['text', 'voice']).default('text'),
});

describe('Validation: Chat Request Schema (Zod)', () => {
  it('accepts valid text chat payload', () => {
    const payload = {
      conversationId: '550e8400-e29b-41d4-a716-446655440000',
      message: 'Explain machine learning algorithms',
      language: 'en-US',
      inputMode: 'text',
    };
    const result = chatRequestSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBe('Explain machine learning algorithms');
      expect(result.data.language).toBe('en-US');
    }
  });

  it('accepts payload without conversationId (for new conversations)', () => {
    const payload = {
      message: 'नमस्ते',
      language: 'hi-IN',
      inputMode: 'voice',
    };
    const result = chatRequestSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.conversationId).toBeUndefined();
      expect(result.data.language).toBe('hi-IN');
      expect(result.data.inputMode).toBe('voice');
    }
  });

  it('rejects empty message', () => {
    const payload = {
      message: '',
      language: 'en-US',
    };
    const result = chatRequestSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('rejects message exceeding 4000 characters', () => {
    const payload = {
      message: 'x'.repeat(4001),
      language: 'en-US',
    };
    const result = chatRequestSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('rejects unsupported language codes', () => {
    const payload = {
      message: 'Bonjour',
      language: 'fr-FR',
    };
    const result = chatRequestSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('supports Kannada language code kn-IN', () => {
    const payload = {
      message: 'ನಮಸ್ಕಾರ',
      language: 'kn-IN',
    };
    const result = chatRequestSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('rejects invalid input modes', () => {
    const payload = {
      message: 'Hello',
      inputMode: 'telepathy',
    };
    const result = chatRequestSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
