import { create } from 'zustand';
import { StoreState, NPC, PC, Twist, Session } from './types';

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
    addTwist: (data) =>
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
  };
});
