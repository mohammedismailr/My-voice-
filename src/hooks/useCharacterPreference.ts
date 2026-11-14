import { useState, useCallback, useEffect } from 'react';
import type { CharacterId, CharacterConfig } from '../types/character';
import { CHARACTERS } from '../data/characters';

const STORAGE_KEY = 'myvoice_active_character';

export function useCharacterPreference(initialId: CharacterId = 'beige-mascot') {
  const [characterId, setCharacterId] = useState<CharacterId>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as CharacterId | null;
    if (saved && CHARACTERS[saved]) {
      return saved;
    }
    return initialId;
  });

  const setCharacter = useCallback((id: CharacterId) => {
    if (CHARACTERS[id]) {
      setCharacterId(id);
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  const activeCharacter: CharacterConfig = CHARACTERS[characterId] || CHARACTERS['beige-mascot'];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, characterId);
  }, [characterId]);

  return {
    characterId,
    activeCharacter,
    setCharacter,
  };
}
