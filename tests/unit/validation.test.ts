import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { isValidUUID, generateUUID, DEMO_USER_UUID } from '../../src/utils/uuid';

// Chat request schema matching api/chat.ts
const chatRequestSchema = z.object({
  conversationId: z
    .unknown()
    .transform((val) => {
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === 'pending') {
          return undefined;
        }
        return trimmed;
      }
      return undefined;
    })
    .optional(),
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message cannot exceed 4000 characters'),
  language: z.enum(['en-US', 'hi-IN', 'kn-IN']).default('en-US'),
  inputMode: z.enum(['text', 'voice']).default('text'),
});

describe('UUID Utilities (RFC 4122 v4)', () => {
  it('validates standard UUID v4 strings', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUUID(DEMO_USER_UUID)).toBe(true);
    expect(isValidUUID('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d')).toBe(true);
  });

  it('rejects invalid or non-UUID strings safely', () => {
    expect(isValidUUID('')).toBe(false);
    expect(isValidUUID('   ')).toBe(false);
    expect(isValidUUID('demo-conv-1')).toBe(false);
    expect(isValidUUID('pending')).toBe(false);
    expect(isValidUUID('null')).toBe(false);
    expect(isValidUUID('undefined')).toBe(false);
    expect(isValidUUID('12345')).toBe(false);
    expect(isValidUUID(null)).toBe(false);
    expect(isValidUUID(undefined)).toBe(false);
    expect(isValidUUID({})).toBe(false);
  });

  it('generates valid RFC 4122 UUID v4', () => {
    const id1 = generateUUID();
    const id2 = generateUUID();
    expect(isValidUUID(id1)).toBe(true);
    expect(isValidUUID(id2)).toBe(true);
    expect(id1).not.toBe(id2);
    // UUID v4 format: 8-4-4-4-12 hex chars
    expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});

describe('Validation: Chat Request Schema (Zod)', () => {
  it('accepts valid text chat payload with valid UUID', () => {
    const payload = {
      conversationId: '550e8400-e29b-41d4-a716-446655440000',
      message: 'Explain machine learning algorithms',
      language: 'en-US',
      inputMode: 'text',
    };
    const result = chatRequestSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.conversationId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.data.message).toBe('Explain machine learning algorithms');
      expect(result.data.language).toBe('en-US');
    }
  });

  it('safely handles empty string or placeholder conversationId without throwing "Invalid uuid"', () => {
    // These previously caused "Error: Invalid uuid"
    const placeholders = ['', '   ', 'null', 'undefined', 'pending', null, undefined];
    for (const placeholder of placeholders) {
      const payload = {
        conversationId: placeholder,
        message: 'Hi',
        language: 'en-US',
        inputMode: 'text',
      };
      const result = chatRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.conversationId).toBeUndefined();
        expect(result.data.message).toBe('Hi');
      }
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

  it('rejects empty message or whitespace-only message', () => {
    expect(chatRequestSchema.safeParse({ message: '', language: 'en-US' }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ message: '   ', language: 'en-US' }).success).toBe(false);
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

  it('supports Kannada language code kn-IN and Hindi hi-IN', () => {
    const payloadKn = {
      message: 'ನಮಸ್ಕಾರ',
      language: 'kn-IN',
    };
    expect(chatRequestSchema.safeParse(payloadKn).success).toBe(true);

    const payloadHi = {
      message: 'नमस्ते',
      language: 'hi-IN',
    };
    expect(chatRequestSchema.safeParse(payloadHi).success).toBe(true);
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
