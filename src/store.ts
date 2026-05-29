import { create } from 'zustand';
import { StoreState, NPC, PC, Twist, Session, SearchResult, InventoryItem, StatusEffect } from './types';
import { TwistInput } from './types';
import { supabase } from './supabaseClient';

// Utility: get current timestamp
const now = (): string => new Date().toISOString();

const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error('User not authenticated');

  return user;
};

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
        const user = await getCurrentUser();

        const { error } = await supabase
          .from('npcs')
          .insert([{ ...data, user_id: user.id, created_at: now(), updated_at: now() }]);

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
            npc_ids: session.npc_ids.filter((npcId) => npcId !== id),
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
        const user = await getCurrentUser();

        const { error } = await supabase
          .from('pcs')
          .insert([{ ...data, user_id: user.id, created_at: now(), updated_at: now() }]);

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
            pc_ids: session.pc_ids.filter((pcId) => pcId !== id),
          }));
          return { pcs: newPcs, sessions: newSessions };
        });
      } catch (error) {
        console.warn('Failed to delete PC:', error);
        throw error;
      }
    },

    getPcById: (id) => get().pcs.find((pc) => pc.id === id),

    // ===== Inventory Methods =====
    addInventoryItem: async (pcId: string, item: Partial<InventoryItem>) => {
      try {
        const user = await getCurrentUser();

        // Generate ID for new item
        const itemId = crypto.randomUUID();
        
        const { error } = await supabase
          .from('inventory')
          .insert([{
            id: itemId,
            user_id: user.id,
            pc_id: pcId,
            item_name: item.item_name,
            quantity: item.quantity || 1,
            description: item.description,
            created_at: now(),
          }]);

        if (error) throw error;

        // Update local state: add item to PC's inventory
        set((state) => {
          const newPcs = state.pcs.map((pc) => {
            if (pc.id === pcId) {
              const newInventory = [
                ...(pc.inventory || []),
                {
                  id: itemId,
                  pc_id: pcId,
                  item_name: item.item_name,
                  quantity: item.quantity || 1,
                  description: item.description,
                  created_at: now(),
                } as InventoryItem,
              ];
              return { ...pc, inventory: newInventory };
            }
            return pc;
          });
          return { pcs: newPcs };
        });
      } catch (error) {
        console.warn('Failed to add inventory item:', error);
        throw error;
      }
    },

    deleteInventoryItem: async (itemId: string) => {
      try {
        const { error } = await supabase
          .from('inventory')
          .delete()
          .eq('id', itemId);

        if (error) throw error;

        // Update local state: remove item from PC's inventory
        set((state) => {
          const newPcs = state.pcs.map((pc) => ({
            ...pc,
            inventory: (pc.inventory || []).filter((item) => item.id !== itemId),
          }));
          return { pcs: newPcs };
        });
      } catch (error) {
        console.warn('Failed to delete inventory item:', error);
        throw error;
      }
    },

    loadInventoryForPc: async (pcId: string) => {
      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .eq('pc_id', pcId);

        if (error) throw error;

        // Update local state: set PC's inventory
        set((state) => {
          const newPcs = state.pcs.map((pc) => {
            if (pc.id === pcId) {
              return { ...pc, inventory: (data || []) as InventoryItem[] };
            }
            return pc;
          });
          return { pcs: newPcs };
        });
      } catch (error) {
        console.warn('Failed to load inventory for PC:', error);
        throw error;
      }
    },

    // ===== Status Effect Methods =====
    addStatus: async (pcId: string, statusData: Partial<StatusEffect>) => {
      try {
        const user = await getCurrentUser();

        // Generate ID for new status
        const statusId = crypto.randomUUID();

        const { error } = await supabase
          .from('status_effects')
          .insert([{
            id: statusId,
            user_id: user.id,
            pc_id: pcId,
            name: statusData.name || 'Новый статус',
            description: statusData.description,
            is_active: statusData.is_active !== undefined ? statusData.is_active : true,
            created_at: now(),
            updated_at: now(),
          }]);

        if (error) throw error;

        // Update local state: add status to PC's statuses
        set((state) => {
          const newPcs = state.pcs.map((pc) => {
            if (pc.id === pcId) {
              const newStatuses = [
                ...(pc.statuses || []),
                {
                  id: statusId,
                  pc_id: pcId,
                  name: statusData.name || 'Новый статус',
                  description: statusData.description,
                  is_active: statusData.is_active !== undefined ? statusData.is_active : true,
                  created_at: now(),
                  updated_at: now(),
                } as StatusEffect,
              ];
              return { ...pc, statuses: newStatuses };
            }
            return pc;
          });
          return { pcs: newPcs };
        });
      } catch (error) {
        console.warn('Failed to add status effect:', error);
        throw error;
      }
    },

    deleteStatus: async (statusId: string) => {
      try {
        const { error } = await supabase
          .from('status_effects')
          .delete()
          .eq('id', statusId);

        if (error) throw error;

        // Update local state: remove status from PC's statuses
        set((state) => {
          const newPcs = state.pcs.map((pc) => ({
            ...pc,
            statuses: (pc.statuses || []).filter((status) => status.id !== statusId),
          }));
          return { pcs: newPcs };
        });
      } catch (error) {
        console.warn('Failed to delete status effect:', error);
        throw error;
      }
    },

    // ===== Twist Methods =====
    addTwist: async (data: TwistInput) => {
      try {
        const user = await getCurrentUser();

        const { error } = await supabase
          .from('twists')
          .insert([{ ...data, user_id: user.id, created_at: now(), updated_at: now() }]);

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
            twist_ids: session.twist_ids.filter((twistId) => twistId !== id),
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
        const user = await getCurrentUser();

        const { error } = await supabase
          .from('sessions')
          .insert([{ ...data, user_id: user.id, created_at: now(), updated_at: now() }]);

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
        const [pcsRes, npcsRes, twistsRes, sessionsRes, inventoryRes, statusesRes] = await Promise.all([
          supabase.from('pcs').select('*'),
          supabase.from('npcs').select('*'),
          supabase.from('twists').select('*'),
          supabase.from('sessions').select('*'),
          supabase.from('inventory').select('*'),
          supabase.from('status_effects').select('*'),
        ]);

        if (pcsRes.error) throw pcsRes.error;
        if (npcsRes.error) throw npcsRes.error;
        if (twistsRes.error) throw twistsRes.error;
        if (sessionsRes.error) throw sessionsRes.error;
        // Note: inventoryRes.error and statusesRes.error are optional - tables might not exist yet

        // Build inventory map: pc_id -> inventory items
        const inventoryMap = new Map<string, InventoryItem[]>();
        if (inventoryRes.data) {
          (inventoryRes.data as InventoryItem[]).forEach((item) => {
            if (!inventoryMap.has(item.pc_id)) {
              inventoryMap.set(item.pc_id, []);
            }
            inventoryMap.get(item.pc_id)!.push(item);
          });
        }

        // Build status map: pc_id -> status effects
        const statusMap = new Map<string, StatusEffect[]>();
        if (statusesRes.data) {
          (statusesRes.data as StatusEffect[]).forEach((status) => {
            if (!statusMap.has(status.pc_id)) {
              statusMap.set(status.pc_id, []);
            }
            statusMap.get(status.pc_id)!.push(status);
          });
        }

        // Attach inventory and statuses to each PC
        const pcsWithRelations = (pcsRes.data || []).map((pc: PC) => ({
          ...pc,
          inventory: inventoryMap.get(pc.id) || [],
          statuses: statusMap.get(pc.id) || [],
        }));

        set({
          pcs: pcsWithRelations as PC[],
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
            description: `${pc.class || 'Character'}${pc.player_name ? ` (${pc.player_name})` : ''}`,
            matchedField: 'name',
          });
        } else if (
          pc.class?.toLowerCase().includes(normalizedQuery) ||
          pc.race?.toLowerCase().includes(normalizedQuery) ||
          pc.player_name?.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            id: pc.id,
            name: pc.name,
            type: 'pc',
            description: `${pc.class || 'Character'}${pc.player_name ? ` (${pc.player_name})` : ''}`,
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
