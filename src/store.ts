import { create } from 'zustand';
import { StoreState, NPC, PC, Twist, Session, SearchResult, InventoryItem, StatusEffect, Location, LocationInput, NPCTwistConnection, NPCConnectionType, TimelineEvent } from './types';
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

const calculateTwistReadiness = (twist: Twist) => {
  const conditions = twist.conditions || [];
  return conditions.length > 0 && conditions.every((condition) => condition.isMet);
};

const ensureTwistReadyState = (twist: Twist): Twist => {
  return {
    ...twist,
    isReady: calculateTwistReadiness(twist),
  };
};

// Initial empty state
const initialState = {
  npcs: [] as NPC[],
  pcs: [] as PC[],
  twists: [] as Twist[],
  sessions: [] as Session[],
  events: [] as TimelineEvent[],
  timelineEventsLoaded: false,
  npcTwistConnections: [] as NPCTwistConnection[],
  locations: [] as Location[],
  selectedDate: new Date().toISOString().slice(0, 10),
  calendarMonth: new Date().getMonth(),
  calendarYear: new Date().getFullYear(),
  eventSearchQuery: '',
  isEventModalOpen: false,
  editingEvent: null as TimelineEvent | null,
  showHotkeysHelp: false,
  showCharacterForm: false,
  characterFormType: 'pc' as 'pc' | 'npc',
  showTwistForm: false,
  showSessionForm: false,
};

export const useStore = create<StoreState>((set, get) => {
  return {
    ...initialState,

    // ===== Calendar Event State =====
    fetchEvents: async () => {
      try {
        const user = await getCurrentUser();

        const { data, error } = await supabase
          .from('timeline_events')
          .select('*')
          .eq('user_id', user.id)
          .order('event_date', { ascending: false });

        if (error) throw error;

        set({ events: (data || []) as TimelineEvent[], timelineEventsLoaded: true });
      } catch (error) {
        console.warn('Failed to fetch timeline events:', error);
        throw error;
      }
    },

    addEvent: async (eventData: Omit<TimelineEvent, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      try {
        const user = await getCurrentUser();

        const { data: insertedEvent, error } = await supabase
          .from('timeline_events')
          .insert({
            ...eventData,
            user_id: user.id,
          })
          .select('*')
          .single();

        if (error) throw error;
        if (!insertedEvent) throw new Error('Event creation returned no record');

        set((state) => ({
          ...state,
          events: [...state.events, insertedEvent as TimelineEvent],
        }));

        return insertedEvent as TimelineEvent;
      } catch (error) {
        console.warn('Failed to add timeline event:', error);
        throw error;
      }
    },

    updateEvent: async (id: string, data: Partial<Omit<TimelineEvent, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => {
      try {
        const { data: updatedEvent, error } = await supabase
          .from('timeline_events')
          .update({ ...data, updated_at: now() })
          .eq('id', id)
          .select('*')
          .single();

        if (error) throw error;
        if (!updatedEvent) throw new Error('Event update returned no record');

        set((state) => ({
          ...state,
          events: state.events.map((event) =>
            event.id === id ? (updatedEvent as TimelineEvent) : event
          ),
        }));
      } catch (error) {
        console.warn('Failed to update timeline event:', error);
        throw error;
      }
    },

    deleteEvent: async (id: string) => {
      try {
        const { error } = await supabase
          .from('timeline_events')
          .delete()
          .eq('id', id);

        if (error) throw error;

        set((state) => ({
          ...state,
          events: state.events.filter((event) => event.id !== id),
        }));
      } catch (error) {
        console.warn('Failed to delete timeline event:', error);
        throw error;
      }
    },

    setSelectedDate: (date: string) => set({ selectedDate: date }),

    changeCalendarMonth: (offset: -1 | 1) =>
      set((state) => {
        let month = state.calendarMonth + offset;
        let year = state.calendarYear;

        if (month > 11) {
          month = 0;
          year += 1;
        }

        if (month < 0) {
          month = 11;
          year -= 1;
        }

        return { calendarMonth: month, calendarYear: year };
      }),

    setEventSearchQuery: (query: string) => set({ eventSearchQuery: query }),

    openEventModal: (event?: TimelineEvent) =>
      set({ isEventModalOpen: true, editingEvent: event ?? null }),

    closeEventModal: () =>
      set({ isEventModalOpen: false, editingEvent: null }),

    filteredEventsByDate: (): TimelineEvent[] => {
      const { events, selectedDate, eventSearchQuery } = get();
      const normalizedQuery = eventSearchQuery.trim().toLowerCase();

      return events.filter((event) => {
        const matchesDate = event.event_date === selectedDate;
        if (!matchesDate) return false;

        if (!normalizedQuery) return true;

        const title = event.title?.toLowerCase() || '';
        const description = event.description?.toLowerCase() || '';

        const matchesSearch =
          title.includes(normalizedQuery) || description.includes(normalizedQuery);

        return matchesDate && matchesSearch;
      });
    },

    // ===== NPC Methods =====
    addNpc: async (data) => {
      try {
        const user = await getCurrentUser();

        const { data: insertedNpc, error } = await supabase
          .from('npcs')
          .insert([{ ...data, user_id: user.id, created_at: now(), updated_at: now() }])
          .select('*')
          .single();

        if (error) throw error;
        if (!insertedNpc) throw new Error('NPC creation returned no record');

        // Refresh data after insert
        const { data: npcs, error: fetchError } = await supabase.from('npcs').select('*');
        if (fetchError) throw fetchError;

        set({ npcs: npcs as NPC[] });
        return insertedNpc as NPC;
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

    addNPCTwistConnection: async (
      npcId: string,
      twistId: string,
      connectionType: NPCConnectionType,
      description?: string
    ) => {
      try {
        const connectionId = crypto.randomUUID();
        const payload = {
          id: connectionId,
          npc_id: npcId,
          twist_id: twistId,
          connection_type: connectionType,
          description,
          created_at: now(),
        };

        const { data, error } = await supabase
          .from('npc_twist_connections')
          .insert([payload])
          .select('*')
          .single();

        if (error) throw error;

        const newConnection = data as NPCTwistConnection;

        set((state) => ({
          npcTwistConnections: [...state.npcTwistConnections, newConnection],
          npcs: state.npcs.map((npc) =>
            npc.id === npcId
              ? {
                  ...npc,
                  twist_connections: [...(npc.twist_connections || []), newConnection],
                }
              : npc
          ),
          twists: state.twists.map((twist) =>
            twist.id === twistId
              ? {
                  ...twist,
                  connected_npcs: [...(twist.connected_npcs || []), newConnection],
                }
              : twist
          ),
        }));

        return newConnection;
      } catch (error) {
        console.warn('Failed to add NPC-Twist connection:', error);
        throw error;
      }
    },

    removeNPCTwistConnection: async (connectionId: string) => {
      try {
        const { error } = await supabase
          .from('npc_twist_connections')
          .delete()
          .eq('id', connectionId);

        if (error) throw error;

        set((state) => ({
          npcTwistConnections: state.npcTwistConnections.filter((connection) => connection.id !== connectionId),
          npcs: state.npcs.map((npc) => ({
            ...npc,
            twist_connections: (npc.twist_connections || []).filter((connection) => connection.id !== connectionId),
          })),
          twists: state.twists.map((twist) => ({
            ...twist,
            connected_npcs: (twist.connected_npcs || []).filter((connection) => connection.id !== connectionId),
          })),
        }));
      } catch (error) {
        console.warn('Failed to remove NPC-Twist connection:', error);
        throw error;
      }
    },

    loadTwistConnections: async (twistId: string) => {
      try {
        const { data, error } = await supabase
          .from('npc_twist_connections')
          .select('*, npc: npcs(*)')
          .eq('twist_id', twistId);

        if (error) throw error;

        return (data || []) as NPCTwistConnection[];
      } catch (error) {
        console.warn('Failed to load twist connections:', error);
        throw error;
      }
    },

    loadNPCConnections: async (npcId: string) => {
      try {
        const { data, error } = await supabase
          .from('npc_twist_connections')
          .select('*, twist: twists(*)')
          .eq('npc_id', npcId);

        if (error) throw error;

        return (data || []) as NPCTwistConnection[];
      } catch (error) {
        console.warn('Failed to load NPC connections:', error);
        throw error;
      }
    },

    addNPCItem: async (npcId: string, itemName: string, description?: string) => {
      try {
        const payload = {
          npc_id: npcId,
          item_name: itemName,
          description,
          created_at: now(),
        };

        const { error } = await supabase
          .from('npc_items')
          .insert([payload])
          .select('*')
          .single();

        if (error) {
          const errorMessage = (error.message || '').toLowerCase();
          if (errorMessage.includes('npc_items') && errorMessage.includes('does not exist')) {
            set((state) => ({
              npcs: state.npcs.map((npc) =>
                npc.id === npcId
                  ? {
                      ...npc,
                      owned_items: [...(npc.owned_items || []), itemName],
                    }
                  : npc
              ),
            }));
            return;
          }
          throw error;
        }

        set((state) => ({
          npcs: state.npcs.map((npc) =>
            npc.id === npcId
              ? {
                  ...npc,
                  owned_items: [...(npc.owned_items || []), itemName],
                }
              : npc
          ),
        }));
      } catch (error) {
        console.warn('Failed to add NPC item:', error);
        throw error;
      }
    },

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

    openCharacterForm: (type) => set({ showCharacterForm: true, characterFormType: type }),
    closeCharacterForm: () => set({ showCharacterForm: false, characterFormType: 'pc' }),
    openTwistForm: () => set({ showTwistForm: true }),
    closeTwistForm: () => set({ showTwistForm: false }),
    openSessionForm: () => set({ showSessionForm: true }),
    closeSessionForm: () => set({ showSessionForm: false }),
    openHotkeysHelp: () => set({ showHotkeysHelp: true }),
    closeHotkeysHelp: () => set({ showHotkeysHelp: false }),
    toggleHotkeysHelp: () => set((state) => ({ showHotkeysHelp: !state.showHotkeysHelp })),

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
        const { isReady, ...payload } = data as any;
        const twistData = {
          title: payload.title,
          description: payload.description,
          trigger_condition: payload.trigger_condition,
          status: payload.status,
          type: payload.type,
          consequence: payload.consequence,
          conditions: payload.conditions ?? [],
          campaign_id: payload.campaign_id,
          user_id: user.id,
          created_at: now(),
          updated_at: now(),
        };

        const { error } = await supabase
          .from('twists')
          .insert([twistData]);

        if (error) throw error;

        const { data: twists, error: fetchError } = await supabase.from('twists').select('*');
        if (fetchError) throw fetchError;

        set({ twists: (twists as Twist[]).map(ensureTwistReadyState) });
      } catch (error) {
        console.warn('Failed to add Twist:', error);
        throw error;
      }
    },

    updateTwist: async (id, data) => {
      try {
        const { isReady, ...payload } = data as any;
        const updatePayload: any = {
          updated_at: now(),
        };

        if (payload.title !== undefined) updatePayload.title = payload.title;
        if (payload.description !== undefined) updatePayload.description = payload.description;
        if (payload.trigger_condition !== undefined) updatePayload.trigger_condition = payload.trigger_condition;
        if (payload.status !== undefined) updatePayload.status = payload.status;
        if (payload.type !== undefined) updatePayload.type = payload.type;
        if (payload.consequence !== undefined) updatePayload.consequence = payload.consequence;
        if (payload.conditions !== undefined) updatePayload.conditions = payload.conditions;
        if (payload.campaign_id !== undefined) updatePayload.campaign_id = payload.campaign_id;

        const { error } = await supabase
          .from('twists')
          .update(updatePayload)
          .eq('id', id);

        if (error) throw error;

        const { data: twists, error: fetchError } = await supabase.from('twists').select('*');
        if (fetchError) throw fetchError;

        set({ twists: (twists as Twist[]).map(ensureTwistReadyState) });
      } catch (error) {
        console.warn('Failed to update Twist:', error);
        throw error;
      }
    },

    addCondition: async (twistId, condition) => {
      try {
        const twist = get().getTwistById(twistId);
        if (!twist) throw new Error('Twist not found');

        const newCondition = {
          ...condition,
          id: crypto.randomUUID(),
        };
        const conditions = [...(twist.conditions || []), newCondition];
        const isReady = calculateTwistReadiness({ ...twist, conditions });

        const { error } = await supabase
          .from('twists')
          .update({ conditions, updated_at: now() })
          .eq('id', twistId);

        if (error) throw error;

        set((state) => ({
          twists: state.twists.map((item) =>
            item.id === twistId ? { ...item, conditions, isReady } : item
          ),
        }));
      } catch (error) {
        console.warn('Failed to add twist condition:', error);
        throw error;
      }
    },

    toggleCondition: async (twistId, conditionId) => {
      try {
        const twist = get().getTwistById(twistId);
        if (!twist) throw new Error('Twist not found');

        const conditions = (twist.conditions || []).map((condition) =>
          condition.id === conditionId ? { ...condition, isMet: !condition.isMet } : condition
        );
        const isReady = calculateTwistReadiness({ ...twist, conditions });

        const { error } = await supabase
          .from('twists')
          .update({ conditions, updated_at: now() })
          .eq('id', twistId);

        if (error) throw error;

        set((state) => ({
          twists: state.twists.map((item) =>
            item.id === twistId ? { ...item, conditions, isReady } : item
          ),
        }));
      } catch (error) {
        console.warn('Failed to toggle twist condition:', error);
        throw error;
      }
    },

    checkTwistStatus: async (twistId) => {
      try {
        const twist = get().getTwistById(twistId);
        if (!twist) throw new Error('Twist not found');

        const isReady = calculateTwistReadiness(twist);

        set((state) => ({
          twists: state.twists.map((item) =>
            item.id === twistId ? { ...item, isReady } : item
          ),
        }));
      } catch (error) {
        console.warn('Failed to check twist status:', error);
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

    // ===== Location Methods =====
    addLocation: async (data: LocationInput) => {
      try {
        const user = await getCurrentUser();

        const { error } = await supabase
          .from('locations')
          .insert([{ ...data, user_id: user.id, created_at: now() }]);

        if (error) throw error;

        await get().loadLocations();
      } catch (error) {
        console.warn('Failed to add Location:', error);
        throw error;
      }
    },

    deleteLocation: async (id) => {
      try {
        const { error } = await supabase
          .from('locations')
          .delete()
          .eq('id', id);

        if (error) throw error;

        set((state) => ({ locations: state.locations.filter((location) => location.id !== id) }));
      } catch (error) {
        console.warn('Failed to delete Location:', error);
        throw error;
      }
    },

    loadLocations: async () => {
      try {
        await getCurrentUser();

        const { data, error } = await supabase.from('locations').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        set({ locations: (data || []) as Location[] });
      } catch (error) {
        console.warn('Failed to load Locations:', error);
        throw error;
      }
    },

    // ===== Utility Methods =====
    loadFromSupabase: async () => {
      try {
        const [pcsRes, npcsRes, twistsRes, sessionsRes, inventoryRes, statusesRes, locationsRes, connectionsRes] = await Promise.all([
          supabase.from('pcs').select('*'),
          supabase.from('npcs').select('*'),
          supabase.from('twists').select('*'),
          supabase.from('sessions').select('*'),
          supabase.from('inventory').select('*'),
          supabase.from('status_effects').select('*'),
          supabase.from('locations').select('*'),
          supabase.from('npc_twist_connections').select('*'),
        ]);

        if (pcsRes.error) throw pcsRes.error;
        if (npcsRes.error) throw npcsRes.error;
        if (twistsRes.error) throw twistsRes.error;
        if (sessionsRes.error) throw sessionsRes.error;
        if (locationsRes.error) throw locationsRes.error;
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
          twists: (twistsRes.data || [])
            .map((twist) => ensureTwistReadyState(twist as Twist)) as Twist[],
          sessions: (sessionsRes.data || []) as Session[],
          locations: (locationsRes.data || []) as Location[],
          npcTwistConnections: (connectionsRes.data || []) as NPCTwistConnection[],
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
          supabase.from('locations').delete().neq('id', ''),
          supabase.from('npc_twist_connections').delete().neq('id', ''),
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

      // Search Locations
      state.locations.forEach((location) => {
        if (
          location.name.toLowerCase().includes(normalizedQuery) ||
          location.description?.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            id: location.id,
            name: location.name,
            type: 'locations',
            description: location.description || 'Location',
            matchedField: 'name',
          });
        }
      });

      return results;
    },
  };
});
