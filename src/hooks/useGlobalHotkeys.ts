import { useRef, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { HOTKEYS } from '../config/hotkeys';
import { useStore } from '../store';

type Screen = 'dashboard' | 'characters' | 'locations' | 'twists' | 'sessions';

export const useGlobalHotkeys = (setPage: (screen: Screen) => void) => {
  const {
    openCharacterForm,
    openTwistForm,
    openSessionForm,
    openHotkeysHelp,
  } = useStore();

  // 1. Сохраняем setPage в Ref, чтобы он не вызывал ре-рендер хука
  const setPageRef = useRef(setPage);
  
  // 2. Обновляем Ref, если функция все же изменилась
  useEffect(() => {
    setPageRef.current = setPage;
  }, [setPage]);

  const triggerFirstEditAction = () => {
    const candidates = Array.from(document.querySelectorAll<HTMLButtonElement>('button'));
    const editButton = candidates.find((button) => button.innerText.toLowerCase().includes('редактир'));
    if (editButton) {
      editButton.click();
      return true;
    }
    return false;
  };

  const focusSearchInput = () => {
    const element = document.getElementById('global-search-input') as HTMLInputElement | null;
    element?.focus();
  };

  // 3. Используем setPageRef.current и пустой массив зависимостей []
  
  useHotkeys(
    HOTKEYS.navigation.dashboard,
    (event) => {
      event.preventDefault();
      setPageRef.current('dashboard');
    },
    { preventDefault: true },
    [] // <--- ВАЖНО: Пустой массив, так как мы используем Ref
  );

  useHotkeys(
    HOTKEYS.navigation.characters,
    (event) => {
      event.preventDefault();
      setPageRef.current('characters');
    },
    { preventDefault: true },
    []
  );

  useHotkeys(
    HOTKEYS.navigation.twists,
    (event) => {
      event.preventDefault();
      setPageRef.current('twists');
    },
    { preventDefault: true },
    []
  );

  useHotkeys(
    HOTKEYS.navigation.sessions,
    (event) => {
      event.preventDefault();
      setPageRef.current('sessions');
    },
    { preventDefault: true },
    []
  );

  useHotkeys(
    HOTKEYS.navigation.locations,
    (event) => {
      event.preventDefault();
      setPageRef.current('locations');
    },
    { preventDefault: true },
    []
  );

  useHotkeys(
    HOTKEYS.create.pc,
    (event) => {
      event.preventDefault();
      setPageRef.current('characters');
      openCharacterForm('pc');
    },
    { preventDefault: true },
    [openCharacterForm] // Здесь оставляем openCharacterForm, так как он из Store (обычно стабилен)
  );

  useHotkeys(
    HOTKEYS.create.npc,
    (event) => {
      event.preventDefault();
      setPageRef.current('characters');
      openCharacterForm('npc');
    },
    { preventDefault: true },
    [openCharacterForm]
  );

  useHotkeys(
    HOTKEYS.create.twist,
    (event) => {
      event.preventDefault();
      setPageRef.current('twists');
      openTwistForm();
    },
    { preventDefault: true },
    [openTwistForm]
  );

  useHotkeys(
    HOTKEYS.create.session,
    (event) => {
      event.preventDefault();
      setPageRef.current('sessions');
      openSessionForm();
    },
    { preventDefault: true },
    [openSessionForm]
  );

  useHotkeys(
    HOTKEYS.actions.edit,
    (event) => {
      event.preventDefault();
      if (!triggerFirstEditAction()) {
        openHotkeysHelp();
      }
    },
    { preventDefault: true },
    [openHotkeysHelp]
  );

  useHotkeys(
    HOTKEYS.actions.search,
    (event) => {
      event.preventDefault();
      focusSearchInput();
    },
    { preventDefault: true },
    []
  );

  useHotkeys(
    HOTKEYS.help,
    (event) => {
      event.preventDefault();
      openHotkeysHelp();
    },
    { preventDefault: true },
    [openHotkeysHelp]
  );
};