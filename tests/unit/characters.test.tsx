import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CHARACTERS, CHARACTER_LIST } from '../../src/data/characters';
import { PlushCharacter } from '../../src/components/character/PlushCharacter';
import { CharacterSelector } from '../../src/components/character/CharacterSelector';
import { VoiceVisualizer } from '../../src/components/voice/VoiceVisualizer';

describe('Data: 3D Plush Characters', () => {
  it('defines all 5 required characters', () => {
    expect(CHARACTER_LIST).toHaveLength(5);
    expect(CHARACTERS['beige-mascot']).toBeDefined();
    expect(CHARACTERS['yellow-triangle']).toBeDefined();
    expect(CHARACTERS['blue-cloud']).toBeDefined();
    expect(CHARACTERS['pink-bunny']).toBeDefined();
    expect(CHARACTERS['purple-heart']).toBeDefined();
  });

  it('configures Beige Hooded Mascot (Mochi) with correct traits and accessories', () => {
    const mochi = CHARACTERS['beige-mascot'];
    expect(mochi.name).toBe('Mochi');
    expect(mochi.personality).toMatch(/calm/i);
    expect(mochi.accessory).toMatch(/headphones/i);
  });

  it('configures Yellow Triangular Character (Pip) with glasses and bow tie', () => {
    const pip = CHARACTERS['yellow-triangle'];
    expect(pip.name).toBe('Pip');
    expect(pip.personality).toMatch(/energetic|intelligent/i);
    expect(pip.accessory).toMatch(/spectacles|glasses/i);
    expect(pip.accessory).toMatch(/bow tie/i);
  });

  it('configures Blue Fluffy Cloud (Cirrus) with black beret', () => {
    const cirrus = CHARACTERS['blue-cloud'];
    expect(cirrus.name).toBe('Cirrus');
    expect(cirrus.personality).toMatch(/peaceful|thoughtful/i);
    expect(cirrus.accessory).toMatch(/beret/i);
  });

  it('configures Pink Bunny (Lola) with cute headphones', () => {
    const lola = CHARACTERS['pink-bunny'];
    expect(lola.name).toBe('Lola');
    expect(lola.personality).toMatch(/cheerful|encouraging/i);
    expect(lola.accessory).toMatch(/headphones/i);
  });

  it('configures Purple Heart (Nova) with heart-shaped sunglasses', () => {
    const nova = CHARACTERS['purple-heart'];
    expect(nova.name).toBe('Nova');
    expect(nova.personality).toMatch(/creative|expressive/i);
    expect(nova.accessory).toMatch(/sunglasses/i);
  });

  it('provides multilingual greetings in English, Hindi, and Kannada for all characters', () => {
    for (const char of CHARACTER_LIST) {
      expect(char.greetings['en-US']).toBeTruthy();
      expect(char.greetings['hi-IN']).toBeTruthy();
      expect(char.greetings['kn-IN']).toBeTruthy();
    }
  });
});

describe('Component: PlushCharacter', () => {
  it('renders all 5 character models in idle state', () => {
    const { container: c1 } = render(<PlushCharacter characterId="beige-mascot" state="idle" />);
    expect(c1.querySelector('svg')).toBeInTheDocument();

    const { container: c2 } = render(<PlushCharacter characterId="yellow-triangle" state="idle" />);
    expect(c2.querySelector('svg')).toBeInTheDocument();

    const { container: c3 } = render(<PlushCharacter characterId="blue-cloud" state="idle" />);
    expect(c3.querySelector('svg')).toBeInTheDocument();

    const { container: c4 } = render(<PlushCharacter characterId="pink-bunny" state="idle" />);
    expect(c4.querySelector('svg')).toBeInTheDocument();

    const { container: c5 } = render(<PlushCharacter characterId="purple-heart" state="idle" />);
    expect(c5.querySelector('svg')).toBeInTheDocument();
  });

  it('handles clicking the plush character', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <PlushCharacter characterId="beige-mascot" state="idle" onCharacterClick={handleClick} />
    );
    const charElement = container.querySelector('.cursor-pointer');
    if (charElement) {
      fireEvent.click(charElement);
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });

  it('renders in listening, speaking, thinking and error states without crashing', () => {
    const { rerender } = render(<PlushCharacter characterId="pink-bunny" state="listening" audioLevel={0.8} />);
    rerender(<PlushCharacter characterId="pink-bunny" state="speaking" audioLevel={0.9} />);
    rerender(<PlushCharacter characterId="pink-bunny" state="processing" />);
    rerender(<PlushCharacter characterId="pink-bunny" state="error" />);
  });
});

describe('Component: CharacterSelector', () => {
  it('renders all 5 characters with names and personality labels', () => {
    render(<CharacterSelector selectedId="beige-mascot" onSelect={() => {}} />);
    expect(screen.getByText('Mochi')).toBeInTheDocument();
    expect(screen.getByText('Pip')).toBeInTheDocument();
    expect(screen.getByText('Cirrus')).toBeInTheDocument();
    expect(screen.getByText('Lola')).toBeInTheDocument();
    expect(screen.getByText('Nova')).toBeInTheDocument();
  });

  it('triggers onSelect when a character card is clicked', () => {
    const handleSelect = vi.fn();
    render(<CharacterSelector selectedId="beige-mascot" onSelect={handleSelect} />);
    const pipButton = screen.getByText('Pip').closest('button');
    expect(pipButton).toBeInTheDocument();
    if (pipButton) {
      fireEvent.click(pipButton);
      expect(handleSelect).toHaveBeenCalledWith('yellow-triangle');
    }
  });
});

describe('Component: VoiceVisualizer', () => {
  it('renders frequency wave bars', () => {
    const frequencies = [0.2, 0.4, 0.6, 0.8, 0.5, 0.3, 0.7, 0.9];
    const { container } = render(<VoiceVisualizer frequencies={frequencies} isActive={true} mode="mic" />);
    expect(screen.getByText('Live Mic')).toBeInTheDocument();
    const bars = container.querySelectorAll('.rounded-full');
    expect(bars.length).toBeGreaterThanOrEqual(8);
  });
});
