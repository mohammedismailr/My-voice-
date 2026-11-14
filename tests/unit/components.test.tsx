import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MessageBubble } from '../../src/components/chat/MessageBubble';
import { VoiceOrb } from '../../src/components/voice/VoiceOrb';
import { LanguageSelector } from '../../src/components/common/LanguageSelector';
import type { Message } from '../../src/types';

describe('Component: MessageBubble', () => {
  const mockUserMsg: Message = {
    id: 'msg-1',
    conversation_id: 'conv-1',
    role: 'user',
    content: 'What is voice AI?',
    input_mode: 'voice',
    language: 'en-US',
    created_at: new Date().toISOString(),
  };

  const mockAssistantMsg: Message = {
    id: 'msg-2',
    conversation_id: 'conv-1',
    role: 'assistant',
    content: 'Voice AI combines speech recognition and language models.',
    input_mode: 'text',
    language: 'en-US',
    created_at: new Date().toISOString(),
  };

  it('renders user message correctly with voice indicator', () => {
    render(<MessageBubble message={mockUserMsg} />);
    expect(screen.getByText('What is voice AI?')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('renders assistant message with MyVoice brand and Listen button', () => {
    const handleSpeak = vi.fn();
    render(<MessageBubble message={mockAssistantMsg} onSpeak={handleSpeak} />);
    expect(screen.getByText('MyVoice')).toBeInTheDocument();
    expect(screen.getByText(/Voice AI combines/)).toBeInTheDocument();

    const listenBtn = screen.getByTitle('Listen to this response');
    fireEvent.click(listenBtn);
    expect(handleSpeak).toHaveBeenCalledWith(mockAssistantMsg.content, 'en-US');
  });
});

describe('Component: VoiceOrb', () => {
  it('renders in idle state with Tap to talk invitation', () => {
    render(<VoiceOrb state="idle" />);
    expect(screen.getByText('Tap to talk')).toBeInTheDocument();
  });

  it('calls onOrbClick when clicked', () => {
    const handleClick = vi.fn();
    render(<VoiceOrb state="idle" onOrbClick={handleClick} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('Component: LanguageSelector', () => {
  it('renders selected language native name', () => {
    const handleSelect = vi.fn();
    render(
      <LanguageSelector
        selectedLanguage="en-US"
        onSelectLanguage={handleSelect}
        isAutoDetect={true}
      />
    );
    expect(screen.getByText('English (US)')).toBeInTheDocument();
    expect(screen.getByText('Auto')).toBeInTheDocument();
  });

  it('opens menu and selects Hindi', () => {
    const handleSelect = vi.fn();
    render(
      <LanguageSelector
        selectedLanguage="en-US"
        onSelectLanguage={handleSelect}
      />
    );
    const button = screen.getByLabelText('Select language');
    fireEvent.click(button);

    const hindiOption = screen.getByText('हिन्दी');
    expect(hindiOption).toBeInTheDocument();
    fireEvent.click(hindiOption);
    expect(handleSelect).toHaveBeenCalledWith('hi-IN');
  });

  it('opens menu and selects Kannada', () => {
    const handleSelect = vi.fn();
    render(
      <LanguageSelector
        selectedLanguage="en-US"
        onSelectLanguage={handleSelect}
      />
    );
    const button = screen.getByLabelText('Select language');
    fireEvent.click(button);

    const kannadaOption = screen.getByText('ಕನ್ನಡ');
    expect(kannadaOption).toBeInTheDocument();
    fireEvent.click(kannadaOption);
    expect(handleSelect).toHaveBeenCalledWith('kn-IN');
  });
});
