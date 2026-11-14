import { generateUUID } from './uuid.ts';

export interface DemoMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  input_mode: 'text' | 'voice';
  language: string;
  created_at: string;
}

export interface DemoConversation {
  id: string;
  user_id: string;
  title: string;
  language: string;
  created_at: string;
  updated_at: string;
}

// In-memory persistent store for development & demo environments
class DemoDataStore {
  private conversations: Map<string, DemoConversation> = new Map();
  private messages: Map<string, DemoMessage[]> = new Map();

  constructor() {
    this.seedDefaultConversation();
  }

  private seedDefaultConversation() {
    const defaultConvId = '00000000-0000-4000-8000-000000000010';
    const defaultUserId = '00000000-0000-4000-8000-000000000001';

    const conv: DemoConversation = {
      id: defaultConvId,
      user_id: defaultUserId,
      title: 'Welcome to MyVoice',
      language: 'en-US',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    const initialMsgs: DemoMessage[] = [
      {
        id: '00000000-0000-4000-8000-000000000011',
        conversation_id: defaultConvId,
        role: 'assistant',
        content: 'Hello! I am your MyVoice AI companion. Speak or type to start chatting!',
        input_mode: 'text',
        language: 'en-US',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    this.conversations.set(defaultConvId, conv);
    this.messages.set(defaultConvId, initialMsgs);
  }

  public getConversations(userId: string): DemoConversation[] {
    const list: DemoConversation[] = [];
    this.conversations.forEach((conv) => {
      // In demo mode allow user's conversations or default
      if (conv.user_id === userId || conv.user_id === '00000000-0000-4000-8000-000000000001') {
        list.push(conv);
      }
    });
    return list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  public getConversation(id: string): DemoConversation | null {
    return this.conversations.get(id) || null;
  }

  public getMessages(conversationId: string): DemoMessage[] {
    return this.messages.get(conversationId) || [];
  }

  public createConversation(
    userId: string,
    title: string,
    language: string = 'en-US',
    id?: string
  ): DemoConversation {
    const convId = id || generateUUID();
    const now = new Date().toISOString();
    const conv: DemoConversation = {
      id: convId,
      user_id: userId,
      title,
      language,
      created_at: now,
      updated_at: now,
    };
    this.conversations.set(convId, conv);
    if (!this.messages.has(convId)) {
      this.messages.set(convId, []);
    }
    return conv;
  }

  public addMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    inputMode: 'text' | 'voice' = 'text',
    language: string = 'en-US',
    id?: string
  ): DemoMessage {
    const msgId = id || generateUUID();
    const now = new Date().toISOString();
    const msg: DemoMessage = {
      id: msgId,
      conversation_id: conversationId,
      role,
      content,
      input_mode: inputMode,
      language,
      created_at: now,
    };

    const currentMsgs = this.messages.get(conversationId) || [];
    currentMsgs.push(msg);
    this.messages.set(conversationId, currentMsgs);

    const conv = this.conversations.get(conversationId);
    if (conv) {
      conv.updated_at = now;
      this.conversations.set(conversationId, conv);
    }

    return msg;
  }

  public deleteConversation(id: string): boolean {
    const existed = this.conversations.delete(id);
    this.messages.delete(id);
    return existed;
  }
}

// Global singleton instance
export const demoStore = new DemoDataStore();
