import { create } from 'zustand';
import { StoreState, NPC, PC, Twist, Session, SearchResult } from './types';
import { TwistInput } from './types';
import { supabase } from './supabaseClient';

// Utility: get current timestamp
const now = (): string => new Date().toISOString();

// Initial empty state
const initialState = {
  npcs: [] as NPC[],
  pcs: [] as PC[],
  twists: [] as Twist[],
  sessions: [] as Session[],
};

export const useStore = create<StoreState>((set, get) => {
  return {
    ...initialState,

    // ===== NPC Methods =====
    addNpc: async (data) => {
      try {
        const { error } = await supabase
          .from('npcs')
          .insert([{ ...data, created_at: now(), updated_at: now() }]);

        if (error) throw error;

        // Refresh data after insert
        const { data: npcs, error: fetchError } = await supabase.from('npcs').select('*');
        if (fetchError) throw fetchError;

        set({ npcs: npcs as NPC[] });
      } catch (error) {
        console.warn('Failed to add NPC:', error);
        throw error;
      }
    },

    updateNpc: async (id, data) => {
      try {
        const { error } = await supabase
          .from('npcs')
          .update({ ...data, updated_at: now() })
          .eq('id', id);

        if (error) throw error;

        // Refresh data after update
        const { data: npcs, error: fetchError } = await supabase.from('npcs').select('*');
        if (fetchError) throw fetchError;

        set({ npcs: npcs as NPC[] });
      } catch (error) {
        console.warn('Failed to update NPC:', error);
        throw error;
      }
    },

    deleteNpc: async (id) => {
      try {
        const { error } = await supabase
          .from('npcs')
          .delete()
          .eq('id', id);

        if (error) throw error;

        set((state) => {
          const newNpcs = state.npcs.filter((npc) => npc.id !== id);
          const newSessions = state.sessions.map((session) => ({
            ...session,
            npcIds: session.npcIds.filter((npcId) => npcId !== id),
          }));
          return { npcs: newNpcs, sessions: newSessions };
        });
      } catch (error) {
        console.warn('Failed to delete NPC:', error);
        throw error;
      }
    },

    getNpcById: (id) => get().npcs.find((npc) => npc.id === id),

    // ===== PC Methods =====
    addPc: async (data) => {
      try {
        const { error } = await supabase
          .from('pcs')
          .insert([{ ...data, created_at: now(), updated_at: now() }]);

        if (error) throw error;

        // Refresh data after insert
        const { data: pcs, error: fetchError } = await supabase.from('pcs').select('*');
        if (fetchError) throw fetchError;

        set({ pcs: pcs as PC[] });
      } catch (error) {
        console.warn('Failed to add PC:', error);
        throw error;
      }
    },

    updatePc: async (id, data) => {
      try {
        const { error } = await supabase
          .from('pcs')
          .update({ ...data, updated_at: now() })
          .eq('id', id);

        if (error) throw error;

        // Refresh data after update
        const { data: pcs, error: fetchError } = await supabase.from('pcs').select('*');
        if (fetchError) throw fetchError;

        set({ pcs: pcs as PC[] });
      } catch (error) {
        console.warn('Failed to update PC:', error);
        throw error;
      }
    },

    deletePc: async (id) => {
      try {
        const { error } = await supabase
          .from('pcs')
          .delete()
          .eq('id', id);

        if (error) throw error;

        set((state) => {
          const newPcs = state.pcs.filter((pc) => pc.id !== id);
          const newSessions = state.sessions.map((session) => ({
            ...session,
            pcIds: session.pcIds.filter((pcId) => pcId !== id),
          }));
          return { pcs: newPcs, sessions: newSessions };
        });
      } catch (error) {
        console.warn('Failed to delete PC:', error);
        throw error;
      }
    },

    getPcById: (id) => get().pcs.find((pc) => pc.id === id),

    // ===== Twist Methods =====
    addTwist: async (data: TwistInput) => {
      try {
        const { error } = await supabase
          .from('twists')
          .insert([{ ...data, created_at: now(), updated_at: now() }]);

        if (error) throw error;

        // Refresh data after insert
        const { data: twists, error: fetchError } = await supabase.from('twists').select('*');
        if (fetchError) throw fetchError;

        set({ twists: twists as Twist[] });
      } catch (error) {
        console.warn('Failed to add Twist:', error);
        throw error;
      }
    },

    updateTwist: async (id, data) => {
      try {
        const { error } = await supabase
          .from('twists')
          .update({ ...data, updated_at: now() })
          .eq('id', id);

        if (error) throw error;

        // Refresh data after update
        const { data: twists, error: fetchError } = await supabase.from('twists').select('*');
        if (fetchError) throw fetchError;

        set({ twists: twists as Twist[] });
      } catch (error) {
        console.warn('Failed to update Twist:', error);
        throw error;
      }
    },

    deleteTwist: async (id) => {
      try {
        const { error } = await supabase
          .from('twists')
          .delete()
          .eq('id', id);

        if (error) throw error;

        set((state) => {
          const newTwists = state.twists.filter((twist) => twist.id !== id);
          const newSessions = state.sessions.map((session) => ({
            ...session,
            twistIds: session.twistIds.filter((twistId) => twistId !== id),
          }));
          return { twists: newTwists, sessions: newSessions };
        });
      } catch (error) {
        console.warn('Failed to delete Twist:', error);
        throw error;
      }
    },

    getTwistById: (id) => get().twists.find((twist) => twist.id === id),

    // ===== Session Methods =====
    addSession: async (data) => {
      try {
        const { error } = await supabase
          .from('sessions')
          .insert([{ ...data, created_at: now(), updated_at: now() }]);

        if (error) throw error;

        // Refresh data after insert
        const { data: sessions, error: fetchError } = await supabase.from('sessions').select('*');
        if (fetchError) throw fetchError;

        set({ sessions: sessions as Session[] });
      } catch (error) {
        console.warn('Failed to add Session:', error);
        throw error;
      }
    },

    updateSession: async (id, data) => {
      try {
        const { error } = await supabase
          .from('sessions')
          .update({ ...data, updated_at: now() })
          .eq('id', id);

        if (error) throw error;

        // Refresh data after update
        const { data: sessions, error: fetchError } = await supabase.from('sessions').select('*');
        if (fetchError) throw fetchError;

        set({ sessions: sessions as Session[] });
      } catch (error) {
        console.warn('Failed to update Session:', error);
        throw error;
      }
    },

    deleteSession: async (id) => {
      try {
        const { error } = await supabase
          .from('sessions')
          .delete()
          .eq('id', id);

        if (error) throw error;

        set((state) => ({
          sessions: state.sessions.filter((session) => session.id !== id),
        }));
      } catch (error) {
        console.warn('Failed to delete Session:', error);
        throw error;
      }
    },

    getSessionById: (id) => get().sessions.find((session) => session.id === id),

    // ===== Utility Methods =====
    loadFromSupabase: async () => {
      try {
        const [pcsRes, npcsRes, twistsRes, sessionsRes] = await Promise.all([
          supabase.from('pcs').select('*'),
          supabase.from('npcs').select('*'),
          supabase.from('twists').select('*'),
          supabase.from('sessions').select('*'),
        ]);

        if (pcsRes.error) throw pcsRes.error;
        if (npcsRes.error) throw npcsRes.error;
        if (twistsRes.error) throw twistsRes.error;
        if (sessionsRes.error) throw sessionsRes.error;

        set({
          pcs: (pcsRes.data || []) as PC[],
          npcs: (npcsRes.data || []) as NPC[],
          twists: (twistsRes.data || []) as Twist[],
          sessions: (sessionsRes.data || []) as Session[],
        });
      } catch (error) {
        console.warn('Failed to load data from Supabase:', error);
      }
    },

    clearAll: async () => {
      try {
        await Promise.all([
          supabase.from('pcs').delete().neq('id', ''),
          supabase.from('npcs').delete().neq('id', ''),
          supabase.from('twists').delete().neq('id', ''),
          supabase.from('sessions').delete().neq('id', ''),
        ]);

        set(initialState);
      } catch (error) {
        console.warn('Failed to clear all data:', error);
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
            description: npc.role || npc.location || 'NPC',
            matchedField: 'name',
          });
        } else if (
          npc.role?.toLowerCase().includes(normalizedQuery) ||
          npc.location?.toLowerCase().includes(normalizedQuery) ||
          npc.appearance?.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            id: npc.id,
            name: npc.name,
            type: 'npc',
            description: npc.role || npc.location || 'NPC',
            matchedField: 'role',
          });
        }
      });

      // Search Twists
      state.twists.forEach((twist) => {
        if (twist.title.toLowerCase().includes(normalizedQuery)) {
          results.push({
            id: twist.id,
            name: twist.title,
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
            name: twist.title,
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
