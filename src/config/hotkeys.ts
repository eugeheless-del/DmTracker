export const HOTKEYS = {
  navigation: {
    dashboard: 'ctrl+1',
    characters: 'ctrl+2',
    twists: 'ctrl+3',
    sessions: 'ctrl+4',
    locations: 'ctrl+5',
  },
  create: {
    pc: 'alt+n',
    npc: 'alt+shift+n',
    twist: 'alt+t',
    session: 'alt+shift+s',
  },
  actions: {
    edit: 'ctrl+e',
    search: 'ctrl+f',
  },
  help: 'alt+f1',
};

export type HotkeysConfig = typeof HOTKEYS;
