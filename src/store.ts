import { create } from 'zustand';
import { StoreState, NPC, PC, Twist, Session, SearchResult } from './types';
import { TwistInput } from './types';

const STORAGE_KEY = 'dm_tracker_store';

// Utility: generate unique ID
const generateId = (): string => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Utility: get current timestamp
const now = (): number => Date.now();

// Initial empty state
const initialState = {
  npcs: [] as NPC[],
  pcs: [] as PC[],
  twists: [] as Twist[],
  sessions: [] as Session[],
};

export const useStore = create<StoreState>((set, get) => {
  // Middleware to persist state to localStorage
  const persistState = (state: Partial<StoreState>) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          npcs: state.npcs,
          pcs: state.pcs,
          twists: state.twists,
          sessions: state.sessions,
        })
      );
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
    }
  };

  return {
    ...initialState,

    // ===== NPC Methods =====
    addNpc: (data) =>
      set((state) => {
        const newNpc: NPC = {
          ...data,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        };
        const newState = { npcs: [...state.npcs, newNpc] };
        persistState(newState);
        return newState;
      }),

    updateNpc: (id, data) =>
      set((state) => {
        const newNpcs = state.npcs.map((npc) =>
          npc.id === id ? { ...npc, ...data, updatedAt: now() } : npc
        );
        const newState = { npcs: newNpcs };
        persistState(newState);
        return newState;
      }),

    deleteNpc: (id) =>
      set((state) => {
        const newNpcs = state.npcs.filter((npc) => npc.id !== id);
        // Remove NPC from all sessions
        const newSessions = state.sessions.map((session) => ({
          ...session,
          npcIds: session.npcIds.filter((npcId) => npcId !== id),
        }));
        const newState = { npcs: newNpcs, sessions: newSessions };
        persistState(newState);
        return newState;
      }),

    getNpcById: (id) => get().npcs.find((npc) => npc.id === id),

    // ===== PC Methods =====
    addPc: (data) =>
      set((state) => {
        const newPc: PC = {
          ...data,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        };
        const newState = { pcs: [...state.pcs, newPc] };
        persistState(newState);
        return newState;
      }),

    updatePc: (id, data) =>
      set((state) => {
        const newPcs = state.pcs.map((pc) =>
          pc.id === id ? { ...pc, ...data, updatedAt: now() } : pc
        );
        const newState = { pcs: newPcs };
        persistState(newState);
        return newState;
      }),

    deletePc: (id) =>
      set((state) => {
        const newPcs = state.pcs.filter((pc) => pc.id !== id);
        // Remove PC from all sessions
        const newSessions = state.sessions.map((session) => ({
          ...session,
          pcIds: session.pcIds.filter((pcId) => pcId !== id),
        }));
        const newState = { pcs: newPcs, sessions: newSessions };
        persistState(newState);
        return newState;
      }),

    getPcById: (id) => get().pcs.find((pc) => pc.id === id),

    // ===== Twist Methods =====
    addTwist: (data: TwistInput) =>
      set((state) => {
        const newTwist: Twist = {
          ...data,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        };
        const newState = { twists: [...state.twists, newTwist] };
        persistState(newState);
        return newState;
      }),

    updateTwist: (id, data) =>
      set((state) => {
        const newTwists = state.twists.map((twist) =>
          twist.id === id ? { ...twist, ...data, updatedAt: now() } : twist
        );
        const newState = { twists: newTwists };
        persistState(newState);
        return newState;
      }),

    deleteTwist: (id) =>
      set((state) => {
        const newTwists = state.twists.filter((twist) => twist.id !== id);
        // Remove Twist from all sessions
        const newSessions = state.sessions.map((session) => ({
          ...session,
          twistIds: session.twistIds.filter((twistId) => twistId !== id),
        }));
        const newState = { twists: newTwists, sessions: newSessions };
        persistState(newState);
        return newState;
      }),

    getTwistById: (id) => get().twists.find((twist) => twist.id === id),

    // ===== Session Methods =====
    addSession: (data) =>
      set((state) => {
        const newSession: Session = {
          ...data,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        };
        const newState = { sessions: [...state.sessions, newSession] };
        persistState(newState);
        return newState;
      }),

    updateSession: (id, data) =>
      set((state) => {
        const newSessions = state.sessions.map((session) =>
          session.id === id ? { ...session, ...data, updatedAt: now() } : session
        );
        const newState = { sessions: newSessions };
        persistState(newState);
        return newState;
      }),

    deleteSession: (id) =>
      set((state) => {
        const newSessions = state.sessions.filter((session) => session.id !== id);
        const newState = { sessions: newSessions };
        persistState(newState);
        return newState;
      }),

    getSessionById: (id) => get().sessions.find((session) => session.id === id),

    // ===== Utility Methods =====
    loadFromStorage: () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          // Ensure twists have npcIds and pcIds fields (for backward compatibility)
          const twistsWithDefaults = (data.twists || []).map((twist: any) => ({
            ...twist,
            npcIds: twist.npcIds || [],
            pcIds: twist.pcIds || [],
          }));
          set({
            npcs: data.npcs || [],
            pcs: data.pcs || [],
            twists: twistsWithDefaults,
            sessions: data.sessions || [],
          });
        }
      } catch (error) {
        console.warn('Failed to load state from localStorage:', error);
      }
    },

    clearAll: () => {
      set(initialState);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    },

    // Global search across all entities
    searchEntities: (query: string): SearchResult[] => {
      const state = get();
      const normalizedQuery = query.toLowerCase().trim();

      if (!normalizedQuery) return [];

      const results: SearchResult[] = [];

      // Search PCs
      state.pcs.forEach((pc) => {
        if (pc.name.toLowerCase().includes(normalizedQuery)) {
          results.push({
            id: pc.id,
            name: pc.name,
            type: 'pc',
            description: `${pc.class || 'Character'}${pc.playerName ? ` (${pc.playerName})` : ''}`,
            matchedField: 'name',
          });
        } else if (
          pc.class?.toLowerCase().includes(normalizedQuery) ||
          pc.race?.toLowerCase().includes(normalizedQuery) ||
          pc.playerName?.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            id: pc.id,
            name: pc.name,
            type: 'pc',
            description: `${pc.class || 'Character'}${pc.playerName ? ` (${pc.playerName})` : ''}`,
            matchedField: 'role',
          });
        }
      });

      // Search NPCs
      state.npcs.forEach((npc) => {
        if (npc.name.toLowerCase().includes(normalizedQuery)) {
          results.push({
            id: npc.id,
            name: npc.name,
            type: 'npc',
            description: npc.description || npc.location || 'NPC',
            matchedField: 'name',
          });
        } else if (
          npc.description?.toLowerCase().includes(normalizedQuery) ||
          npc.location?.toLowerCase().includes(normalizedQuery) ||
          npc.appearance?.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            id: npc.id,
            name: npc.name,
            type: 'npc',
            description: npc.description || npc.location || 'NPC',
            matchedField: 'role',
          });
        }
      });

      // Search Twists
      state.twists.forEach((twist) => {
        if (twist.name.toLowerCase().includes(normalizedQuery)) {
          results.push({
            id: twist.id,
            name: twist.name,
            type: 'twist',
            description: twist.type || twist.description,
            matchedField: 'name',
          });
        } else if (
          twist.type?.toLowerCase().includes(normalizedQuery) ||
          twist.description?.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            id: twist.id,
            name: twist.name,
            type: 'twist',
            description: twist.type || twist.description,
            matchedField: 'type',
          });
        }
      });

      // Search Sessions
      state.sessions.forEach((session) => {
        if (
          session.name.toLowerCase().includes(normalizedQuery) ||
          session.description?.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            id: session.id,
            name: session.name,
            type: 'session',
            description: session.description || 'Session',
            matchedField: 'name',
          });
        }
      });

      return results;
    },
  };
});
